<?php

namespace App\Http\Controllers;

use App\Helpers\WhatsAppHelper;
use App\Http\Requests\StoreReportRequest;
use App\Models\Investigation;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $patientName = trim($request->string('patient_name')->toString());
        $patientAddress = trim($request->string('patient_address')->toString());
        $fromDate = trim($request->string('from_date')->toString());
        $toDate = trim($request->string('to_date')->toString());
        $status = trim($request->string('status')->toString());

        $reportsQuery = $request->user()
            ->reports()
            ->withCount([
                'items as incomplete_results_count' => function ($query): void {
                    $query->where(function ($inner): void {
                        $inner->whereNull('value')
                            ->orWhere('value', '');
                    });
                },
            ])
            ->latest();

        if ($patientName !== '') {
            $reportsQuery->where('patient_name', 'like', '%'.$patientName.'%');
        }

        if ($patientAddress !== '') {
            $reportsQuery->where('patient_address', 'like', '%'.$patientAddress.'%');
        }

        if (in_array($status, ['released', 'unpublished'], true)) {
            $reportsQuery->where('publication_status', $status);
        } else {
            $status = '';
        }

        if ($fromDate !== '') {
            $reportsQuery->whereDate('report_date', '>=', $fromDate);
        }

        if ($toDate !== '') {
            $reportsQuery->whereDate('report_date', '<=', $toDate);
        }

        $reports = $reportsQuery->get();
        $reports->each(function (Report $report): void {
            if (! $report->uuid) {
                $report->forceFill([
                    'uuid' => (string) Str::uuid(),
                ])->save();
            }
        });

        return Inertia::render('reports/all-report', [
            'reports' => $reports,
            'filters' => [
                'patient_name' => $patientName,
                'patient_address' => $patientAddress,
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'status' => $status,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $departments = $request->user()
            ->departments()
            ->with('investigations')
            ->orderBy('name')
            ->get();

        $investigations = Investigation::query()
            ->whereHas('department', fn ($query) => $query->where('user_id', $request->user()->id))
            ->with('department:id,name')
            ->orderBy('name')
            ->get();

        return Inertia::render('reports/create-report', [
            'departments' => $departments,
            'investigations' => $investigations,
            'report' => null,
        ]);
    }

    public function edit(Request $request, Report $report): Response
    {
        abort_unless($report->user_id === $request->user()->id, 403);

        $departments = $request->user()
            ->departments()
            ->with('investigations')
            ->orderBy('name')
            ->get();

        $investigations = Investigation::query()
            ->whereHas('department', fn ($query) => $query->where('user_id', $request->user()->id))
            ->with('department:id,name')
            ->orderBy('name')
            ->get();

        $report->load('items.investigation.department');

        return Inertia::render('reports/create-report', [
            'departments' => $departments,
            'investigations' => $investigations,
            'report' => $report,
        ]);
    }

    public function store(StoreReportRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $investigationAmounts = Investigation::query()
            ->whereIn('id', collect($validated['items'])->pluck('investigation_id')->filter()->unique()->values())
            ->whereHas('department', fn ($query) => $query->where('user_id', $request->user()->id))
            ->pluck('amount', 'id');
        $departmentNames = $request->user()
            ->departments()
            ->whereIn('id', collect($validated['items'])->pluck('department_id')->filter()->unique()->values())
            ->pluck('name')
            ->unique()
            ->values();

        $resolvedDepartment = match (true) {
            $departmentNames->count() === 1 => $departmentNames->first(),
            $departmentNames->count() > 1 => 'MULTIPLE DEPARTMENTS',
            default => null,
        };

        /** @var Report $report */
        $report = DB::transaction(function () use ($request, $resolvedDepartment, $validated, $investigationAmounts) {
            DB::table('users')
                ->where('id', $request->user()->id)
                ->lockForUpdate()
                ->first();

            $lastReport = $request->user()
                ->reports()
                ->select('memo_sequence')
                ->orderByDesc('memo_sequence')
                ->lockForUpdate()
                ->first();
            $nextMemoSequence = ($lastReport?->memo_sequence ?? 0) + 1;

            $report = $request->user()->reports()->create([
                'patient_id' => null,
                'patient_name' => $validated['patient_name'],
                'memo_sequence' => $nextMemoSequence,
                'publication_status' => 'unpublished',
                'released_at' => null,
                'patient_v_id' => null,
                'patient_age' => $validated['patient_age'],
                'patient_sex' => $validated['patient_sex'],
                'patient_address' => $validated['patient_address'] ?? null,
                'patient_referred_by' => $validated['patient_referred_by'] ?? null,
                'patient_whatsapp_number' => $validated['patient_whatsapp_number'] ?? null,
                'billing_date' => $validated['billing_date'],
                'collection_date' => $validated['collection_date'],
                'report_date' => $validated['report_date'],
                'include_header_footer' => (bool) ($validated['include_header_footer'] ?? false),
                'department' => $resolvedDepartment,
                'sample_note' => $validated['sample_note'] ?? null,
                'equipment_note' => $validated['equipment_note'] ?? null,
                'interpretation_note' => $validated['interpretation_note'] ?? null,
            ]);

            foreach ($validated['items'] as $index => $item) {
                $investigationId = (int) ($item['investigation_id'] ?? 0);
                $report->items()->create([
                    'investigation_id' => $item['investigation_id'] ?? null,
                    'parameter_name' => $item['parameter_name'],
                    'method' => $item['method'] ?? null,
                    'value' => $item['value'] ?? null,
                    'unit' => $item['unit'] ?? null,
                    'bio_ref_interval' => $item['bio_ref_interval'] ?? null,
                    'amount' => (float) ($investigationAmounts[$investigationId] ?? 0),
                    'display_order' => $index,
                ]);
            }

            $report->memo_number = str_pad((string) $nextMemoSequence, 9, '0', STR_PAD_LEFT);
            $report->save();

            return $report;
        });

        return to_route('reports.show', $report)->with([
            'status' => 'Report created successfully.',
            'status_type' => 'success',
        ]);
    }

    public function release(Request $request, Report $report): RedirectResponse
    {
        abort_unless($report->user_id === $request->user()->id, 403);

        $hasEmptyResultValue = $report->items()
            ->where(function ($query): void {
                $query->whereNull('value')
                    ->orWhere('value', '');
            })
            ->exists();

        if ($hasEmptyResultValue) {
            return back()->with([
                'status' => 'Fill all result values before releasing this report.',
                'status_type' => 'error',
            ]);
        }

        if ($report->publication_status !== 'released') {
            $report->update([
                'publication_status' => 'released',
                'released_at' => now(),
            ]);
        }

        return back()->with([
            'status' => 'Report released successfully.',
            'status_type' => 'success',
        ]);
    }

    public function update(StoreReportRequest $request, Report $report): RedirectResponse
    {
        abort_unless($report->user_id === $request->user()->id, 403);

        $validated = $request->validated();
        $investigationAmounts = Investigation::query()
            ->whereIn('id', collect($validated['items'])->pluck('investigation_id')->filter()->unique()->values())
            ->whereHas('department', fn ($query) => $query->where('user_id', $request->user()->id))
            ->pluck('amount', 'id');
        $departmentNames = $request->user()
            ->departments()
            ->whereIn('id', collect($validated['items'])->pluck('department_id')->filter()->unique()->values())
            ->pluck('name')
            ->unique()
            ->values();

        $resolvedDepartment = match (true) {
            $departmentNames->count() === 1 => $departmentNames->first(),
            $departmentNames->count() > 1 => 'MULTIPLE DEPARTMENTS',
            default => null,
        };

        DB::transaction(function () use ($report, $resolvedDepartment, $validated, $investigationAmounts): void {
            $report->update([
                'patient_name' => $validated['patient_name'],
                'patient_age' => $validated['patient_age'],
                'patient_sex' => $validated['patient_sex'],
                'patient_address' => $validated['patient_address'] ?? null,
                'patient_referred_by' => $validated['patient_referred_by'] ?? null,
                'patient_whatsapp_number' => $validated['patient_whatsapp_number'] ?? null,
                'billing_date' => $validated['billing_date'],
                'collection_date' => $validated['collection_date'],
                'report_date' => $validated['report_date'],
                'include_header_footer' => (bool) ($validated['include_header_footer'] ?? false),
                'department' => $resolvedDepartment,
                'sample_note' => $validated['sample_note'] ?? null,
                'equipment_note' => $validated['equipment_note'] ?? null,
                'interpretation_note' => $validated['interpretation_note'] ?? null,
            ]);

            $report->items()->delete();

            foreach ($validated['items'] as $index => $item) {
                $investigationId = (int) ($item['investigation_id'] ?? 0);
                $report->items()->create([
                    'investigation_id' => $item['investigation_id'] ?? null,
                    'parameter_name' => $item['parameter_name'],
                    'method' => $item['method'] ?? null,
                    'value' => $item['value'] ?? null,
                    'unit' => $item['unit'] ?? null,
                    'bio_ref_interval' => $item['bio_ref_interval'] ?? null,
                    'amount' => (float) ($investigationAmounts[$investigationId] ?? 0),
                    'display_order' => $index,
                ]);
            }
        });

        return to_route('reports.show', $report)->with([
            'status' => 'Report updated successfully.',
            'status_type' => 'success',
        ]);
    }

    public function sendWhatsApp(Request $request, Report $report): RedirectResponse
    {
        abort_unless($report->user_id === $request->user()->id, 403);

        if ($report->publication_status !== 'released') {
            return back()->with([
                'status' => 'Only released reports can be sent to WhatsApp.',
                'status_type' => 'error',
            ]);
        }

        $patientWhatsAppNumber = (string) ($report->patient_whatsapp_number ?? '');
        if ($patientWhatsAppNumber === '') {
            return back()->with([
                'status' => 'Please update patient mobile number.',
                'status_type' => 'error',
            ]);
        }

        if (! preg_match('/^\d{10}$/', $patientWhatsAppNumber)) {
            return back()->with([
                'status' => 'Patient WhatsApp number must be exactly 10 digits.',
                'status_type' => 'error',
            ]);
        }

        if (! $report->uuid) {
            $report->forceFill(['uuid' => (string) Str::uuid()])->save();
        }

        $balanceReserved = DB::transaction(function () use ($request): bool {
            $lockedUser = User::query()
                ->whereKey($request->user()->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedUser || $lockedUser->sms_balance <= 0) {
                return false;
            }

            $lockedUser->decrement('sms_balance', 1);

            return true;
        });

        if (! $balanceReserved) {
            return back()->with([
                'status' => "You dont have SMS balance to send.",
                'status_type' => 'error',
            ]);
        }

        $hasUploadedHeaderFooterAssets = ! empty($request->user()->report_header_image)
            || ! empty($request->user()->report_footer_image);

        $pdfUrl = route('reports.pdf', [
            'report' => $report->uuid,
            ...($hasUploadedHeaderFooterAssets ? ['header-footer' => 'true'] : []),
        ]);

        $response = WhatsAppHelper::sendWithMedia(
            '91'.$patientWhatsAppNumber,
            [$report->patient_name, $request->user()->clinic_name],
            $pdfUrl,
            'report-'.($report->memo_number ?? $report->id).'.pdf'
        );

        $success = (bool) ($response['status'] ?? $response['return'] ?? false);

        if (! $success) {
            User::query()->whereKey($request->user()->id)->increment('sms_balance', 1);

            Log::warning('Failed sending report via WhatsApp.', [
                'report_id' => $report->id,
                'mobile' => $patientWhatsAppNumber,
                'response' => $response,
            ]);

            return back()->with([
                'status' => 'Failed to send report to WhatsApp. Please try again.',
                'status_type' => 'error',
            ]);
        }

        return back()->with([
            'status' => 'Report sent to WhatsApp successfully.',
            'status_type' => 'success',
        ]);
    }

    public function show(Request $request, Report $report): Response
    {
        abort_unless($report->user_id === $request->user()->id, 403);

        if (! $report->uuid) {
            $report->forceFill([
                'uuid' => (string) Str::uuid(),
            ])->save();
        }

        $report->load(['items.investigation.department']);

        return Inertia::render('reports/show-report', [
            'report' => $report,
        ]);
    }
}
