<?php

namespace App\Http\Controllers;

use App\Models\ClinicConnection;
use App\Models\Department;
use App\Models\Investigation;
use App\Models\SharedReport;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class SharedReportController extends Controller
{
    public function createSentReport(Request $request): Response
    {
        return Inertia::render('clinics/sent-report-create', [
            'connectedClinics' => $this->connectedClinics($request->user()),
        ]);
    }

    public function fetchReceiverCatalog(Request $request, User $receiver): JsonResponse
    {
        abort_unless($this->isConnected($request->user()->id, $receiver->id), 403);

        $departments = $receiver->departments()
            ->with('investigations')
            ->orderBy('name')
            ->get(['id', 'name']);

        $investigations = Investigation::query()
            ->whereHas('department', fn ($query) => $query->where('user_id', $receiver->id))
            ->with('department:id,name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'departments' => $departments,
            'investigations' => $investigations,
        ]);
    }

    public function storeSentReport(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'receiver_user_id' => ['required', 'integer', Rule::exists('users', 'id')],
            'patient_name' => ['required', 'string', 'max:255'],
            'patient_age' => ['required', 'integer', 'min:0', 'max:150'],
            'patient_sex' => ['required', Rule::in(['Male', 'Female', 'Other'])],
            'patient_address' => ['nullable', 'string', 'max:1000'],
            'patient_referred_by' => ['nullable', 'string', 'max:255'],
            'billing_date' => ['required', 'date'],
            'collection_date' => ['required', 'date'],
            'report_date' => ['required', 'date'],
            'sample_note' => ['nullable', 'string', 'max:255'],
            'equipment_note' => ['nullable', 'string', 'max:255'],
            'interpretation_note' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.department_id' => ['required', 'integer', Rule::exists('departments', 'id')],
            'items.*.investigation_id' => ['required', 'integer', Rule::exists('investigations', 'id')],
            'items.*.parameter_name' => ['required', 'string', 'max:255'],
            'items.*.method' => ['nullable', 'string', 'max:255'],
            'items.*.unit' => ['nullable', 'string', 'max:100'],
            'items.*.bio_ref_interval' => ['nullable', 'string', 'max:255'],
        ]);

        $sender = $request->user();
        $receiverId = (int) $validated['receiver_user_id'];
        abort_if($sender->id === $receiverId, 422);
        abort_unless($this->isConnected($sender->id, $receiverId), 422);

        $allowedDepartmentIds = Department::query()
            ->where('user_id', $receiverId)
            ->pluck('id');

        $allowedInvestigations = Investigation::query()
            ->whereIn('department_id', $allowedDepartmentIds)
            ->pluck('amount', 'id');

        $departmentNames = Department::query()
            ->whereIn('id', $allowedDepartmentIds)
            ->pluck('name', 'id');

        $report = SharedReport::query()->create([
            'sender_user_id' => $sender->id,
            'receiver_user_id' => $receiverId,
            'status' => 'sent',
            'patient_name' => $validated['patient_name'],
            'patient_age' => $validated['patient_age'],
            'patient_sex' => $validated['patient_sex'],
            'patient_address' => $validated['patient_address'] ?? null,
            'patient_referred_by' => $validated['patient_referred_by'] ?? null,
            'billing_date' => $validated['billing_date'],
            'collection_date' => $validated['collection_date'],
            'report_date' => $validated['report_date'],
            'include_header_footer' => false,
            'sample_note' => $validated['sample_note'] ?? null,
            'equipment_note' => $validated['equipment_note'] ?? null,
            'interpretation_note' => $validated['interpretation_note'] ?? null,
            'sent_at' => now(),
        ]);

        foreach ($validated['items'] as $index => $item) {
            $investigationId = (int) $item['investigation_id'];
            $departmentId = (int) $item['department_id'];
            abort_unless($allowedDepartmentIds->contains($departmentId), 422);
            abort_unless($allowedInvestigations->has($investigationId), 422);

            $report->items()->create([
                'department_id' => $departmentId,
                'investigation_id' => $investigationId,
                'department_name' => $departmentNames[$departmentId] ?? null,
                'parameter_name' => $item['parameter_name'],
                'method' => $item['method'] ?? null,
                'value' => null,
                'unit' => $item['unit'] ?? null,
                'bio_ref_interval' => $item['bio_ref_interval'] ?? null,
                'amount' => (float) ($allowedInvestigations[$investigationId] ?? 0),
                'display_order' => $index,
            ]);
        }

        return to_route('clinics.requested.index')->with('status', 'Report sent successfully.');
    }

    public function requestedIndex(Request $request): Response
    {
        $reports = SharedReport::query()
            ->where('sender_user_id', $request->user()->id)
            ->with('receiver:id,clinic_name,full_name,unique_clinic_id')
            ->withCount([
                'items as incomplete_results_count' => function ($query): void {
                    $query->whereNull('value')->orWhere('value', '');
                },
            ])
            ->latest()
            ->get();

        return Inertia::render('clinics/requested-report', [
            'reports' => $reports,
        ]);
    }

    public function clientIndex(Request $request): Response
    {
        $reports = SharedReport::query()
            ->where('receiver_user_id', $request->user()->id)
            ->with('sender:id,clinic_name,full_name,unique_clinic_id')
            ->withCount([
                'items as incomplete_results_count' => function ($query): void {
                    $query->whereNull('value')->orWhere('value', '');
                },
            ])
            ->latest()
            ->get();

        return Inertia::render('clinics/client-report', [
            'reports' => $reports,
        ]);
    }

    public function editClientReport(Request $request, SharedReport $sharedReport): Response
    {
        abort_unless($sharedReport->receiver_user_id === $request->user()->id, 403);

        if ($sharedReport->status === 'sent') {
            $sharedReport->update([
                'status' => 'received',
                'received_at' => now(),
            ]);
        }

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

        $sharedReport->load('items.investigation.department', 'sender:id,clinic_name,full_name');

        return Inertia::render('clinics/client-report-edit', [
            'report' => $sharedReport,
            'departments' => $departments,
            'investigations' => $investigations,
        ]);
    }

    public function showClientReport(Request $request, SharedReport $sharedReport): Response
    {
        abort_unless($sharedReport->receiver_user_id === $request->user()->id, 403);

        if ($sharedReport->status === 'sent') {
            $sharedReport->update([
                'status' => 'received',
                'received_at' => now(),
            ]);
        }

        $sharedReport->load(['items.investigation.department', 'sender:id,clinic_name,full_name']);

        return Inertia::render('clinics/client-report-show', [
            'report' => $sharedReport,
        ]);
    }

    public function updateClientReport(Request $request, SharedReport $sharedReport): RedirectResponse
    {
        abort_unless($sharedReport->receiver_user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'patient_name' => ['required', 'string', 'max:255'],
            'patient_age' => ['required', 'integer', 'min:0', 'max:150'],
            'patient_sex' => ['required', Rule::in(['Male', 'Female', 'Other'])],
            'patient_address' => ['nullable', 'string', 'max:1000'],
            'patient_referred_by' => ['nullable', 'string', 'max:255'],
            'billing_date' => ['required', 'date'],
            'collection_date' => ['required', 'date'],
            'report_date' => ['required', 'date'],
            'include_header_footer' => ['nullable', 'boolean'],
            'sample_note' => ['nullable', 'string', 'max:255'],
            'equipment_note' => ['nullable', 'string', 'max:255'],
            'interpretation_note' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.department_id' => ['required', 'integer', Rule::exists('departments', 'id')->where('user_id', $request->user()->id)],
            'items.*.investigation_id' => ['required', 'integer', Rule::exists('investigations', 'id')],
            'items.*.parameter_name' => ['required', 'string', 'max:255'],
            'items.*.method' => ['nullable', 'string', 'max:255'],
            'items.*.value' => ['nullable', 'string', 'max:255'],
            'items.*.unit' => ['nullable', 'string', 'max:100'],
            'items.*.bio_ref_interval' => ['nullable', 'string', 'max:255'],
        ]);

        if ($sharedReport->status === 'sent') {
            $sharedReport->status = 'received';
            $sharedReport->received_at = now();
        }

        $investigationAmounts = Investigation::query()
            ->whereIn('id', collect($validated['items'])->pluck('investigation_id')->filter()->unique()->values())
            ->pluck('amount', 'id');

        $departmentNames = Department::query()
            ->whereIn('id', collect($validated['items'])->pluck('department_id')->filter()->unique()->values())
            ->pluck('name', 'id');

        $sharedReport->fill([
            'patient_name' => $validated['patient_name'],
            'patient_age' => $validated['patient_age'],
            'patient_sex' => $validated['patient_sex'],
            'patient_address' => $validated['patient_address'] ?? null,
            'patient_referred_by' => $validated['patient_referred_by'] ?? null,
            'billing_date' => $validated['billing_date'],
            'collection_date' => $validated['collection_date'],
            'report_date' => $validated['report_date'],
            'include_header_footer' => (bool) ($validated['include_header_footer'] ?? false),
            'sample_note' => $validated['sample_note'] ?? null,
            'equipment_note' => $validated['equipment_note'] ?? null,
            'interpretation_note' => $validated['interpretation_note'] ?? null,
        ])->save();

        $sharedReport->items()->delete();
        foreach ($validated['items'] as $index => $item) {
            $investigationId = (int) $item['investigation_id'];
            $departmentId = (int) $item['department_id'];
            $sharedReport->items()->create([
                'department_id' => $departmentId,
                'investigation_id' => $investigationId,
                'department_name' => $departmentNames[$departmentId] ?? null,
                'parameter_name' => $item['parameter_name'],
                'method' => $item['method'] ?? null,
                'value' => $item['value'] ?? null,
                'unit' => $item['unit'] ?? null,
                'bio_ref_interval' => $item['bio_ref_interval'] ?? null,
                'amount' => (float) ($investigationAmounts[$investigationId] ?? 0),
                'display_order' => $index,
            ]);
        }

        return to_route('clinics.client.index')->with('status', 'Client report saved successfully.');
    }

    public function publishClientReport(Request $request, SharedReport $sharedReport): RedirectResponse
    {
        abort_unless($sharedReport->receiver_user_id === $request->user()->id, 403);

        $hasEmptyValues = $sharedReport->items()
            ->where(function ($query): void {
                $query->whereNull('value')->orWhere('value', '');
            })
            ->exists();

        if ($hasEmptyValues) {
            return back()->with('status', 'Fill all result values before publishing this report.');
        }

        $sharedReport->update([
            'status' => 'published',
            'received_at' => $sharedReport->received_at ?? now(),
            'published_at' => now(),
        ]);

        return back()->with('status', 'Client report published successfully.');
    }

    public function downloadPdf(Request $request, SharedReport $sharedReport): HttpResponse
    {
        abort_unless(
            $sharedReport->sender_user_id === $request->user()->id || $sharedReport->receiver_user_id === $request->user()->id,
            403
        );

        if ($sharedReport->status !== 'published') {
            return response()->view('reports.not-released', [
                'message' => 'Report yet not Published',
            ], 403);
        }

        $sharedReport->load(['items.investigation.department', 'receiver']);
        $clinic = $sharedReport->receiver;

        $groupedItems = $sharedReport->items
            ->groupBy(function ($item) {
                return $item->investigation?->department?->name ?: $item->department_name ?: 'DEPARTMENT';
            })
            ->map(function ($items, $departmentName) {
                return [
                    'department' => $departmentName,
                    'items' => $items->values(),
                ];
            })
            ->values();

        $pdf = Pdf::loadView('pdf.report', [
            'report' => $sharedReport,
            'clinic' => $clinic,
            'groupedItems' => $groupedItems,
            'headerImage' => $sharedReport->include_header_footer ? $this->toDataUri($clinic->report_header_image) : null,
            'footerImage' => $sharedReport->include_header_footer ? $this->toDataUri($clinic->report_footer_image) : null,
            'logoImage' => $this->toDataUri($clinic->logo),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('report-'.$sharedReport->uuid.'.pdf');
    }

    public function downloadBill(Request $request, SharedReport $sharedReport): HttpResponse
    {
        abort_unless(
            $sharedReport->sender_user_id === $request->user()->id || $sharedReport->receiver_user_id === $request->user()->id,
            403
        );

        $sharedReport->load(['items.investigation', 'receiver']);
        $clinic = $sharedReport->receiver;

        $lineItems = $sharedReport->items->map(function ($item) {
            $amount = (float) ($item->amount ?? 0);

            return [
                'name' => $item->parameter_name,
                'unit' => $item->unit,
                'amount' => $amount,
            ];
        })->values();

        $subTotal = $lineItems->sum('amount');
        $qrPayload = route('clinics.shared.pdf', ['sharedReport' => $sharedReport->uuid]);

        $pdf = Pdf::loadView('pdf.bill', [
            'report' => $sharedReport,
            'clinic' => $clinic,
            'lineItems' => $lineItems,
            'subTotal' => $subTotal,
            'signatureImage' => $this->toDataUri($clinic->signature_image),
            'qrImage' => $this->generateQrDataUri($qrPayload),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('bill-'.$sharedReport->uuid.'.pdf');
    }

    private function connectedClinics(User $user)
    {
        $userId = (int) $user->id;

        $connectedIds = ClinicConnection::query()
            ->where('clinic_user_id', $userId)
            ->orWhere('connected_clinic_user_id', $userId)
            ->get(['clinic_user_id', 'connected_clinic_user_id'])
            ->map(function (ClinicConnection $connection) use ($userId): int {
                return $connection->clinic_user_id === $userId
                    ? (int) $connection->connected_clinic_user_id
                    : (int) $connection->clinic_user_id;
            })
            ->unique()
            ->values();

        return User::query()
            ->whereIn('id', $connectedIds)
            ->orderBy('clinic_name')
            ->get(['id', 'clinic_name', 'full_name', 'unique_clinic_id']);
    }

    private function isConnected(int $leftUserId, int $rightUserId): bool
    {
        [$leftId, $rightId] = [min($leftUserId, $rightUserId), max($leftUserId, $rightUserId)];

        return ClinicConnection::query()
            ->where('clinic_user_id', $leftId)
            ->where('connected_clinic_user_id', $rightId)
            ->exists();
    }

    private function toDataUri(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        $absolutePath = Storage::disk('public')->path($path);
        $mimeType = mime_content_type($absolutePath) ?: 'image/png';
        $contents = file_get_contents($absolutePath);

        if ($contents === false) {
            return null;
        }

        return sprintf('data:%s;base64,%s', $mimeType, base64_encode($contents));
    }

    private function generateQrDataUri(string $payload): ?string
    {
        $url = 'https://api.qrserver.com/v1/create-qr-code/?size=96x96&data='.rawurlencode($payload);
        $response = Http::timeout(10)->get($url);

        if (! $response->successful()) {
            return null;
        }

        return sprintf('data:image/png;base64,%s', base64_encode($response->body()));
    }
}
