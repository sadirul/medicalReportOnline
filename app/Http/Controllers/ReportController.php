<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReportRequest;
use App\Models\Investigation;
use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $reports = $request->user()
            ->reports()
            ->latest()
            ->get();

        return Inertia::render('reports/all-report', [
            'reports' => $reports,
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
        $report = DB::transaction(function () use ($request, $resolvedDepartment, $validated) {
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
                'patient_v_id' => null,
                'patient_age' => $validated['patient_age'],
                'patient_sex' => $validated['patient_sex'],
                'patient_address' => $validated['patient_address'] ?? null,
                'patient_referred_by' => $validated['patient_referred_by'] ?? null,
                'billing_date' => $validated['billing_date'],
                'collection_date' => $validated['collection_date'],
                'report_date' => $validated['report_date'],
                'department' => $resolvedDepartment,
                'sample_note' => $validated['sample_note'] ?? null,
                'equipment_note' => $validated['equipment_note'] ?? null,
                'interpretation_note' => $validated['interpretation_note'] ?? null,
            ]);

            foreach ($validated['items'] as $index => $item) {
                $report->items()->create([
                    'investigation_id' => $item['investigation_id'] ?? null,
                    'parameter_name' => $item['parameter_name'],
                    'method' => $item['method'] ?? null,
                    'value' => $item['value'] ?? null,
                    'unit' => $item['unit'] ?? null,
                    'bio_ref_interval' => $item['bio_ref_interval'] ?? null,
                    'display_order' => $index,
                ]);
            }

            $report->memo_number = str_pad((string) $nextMemoSequence, 9, '0', STR_PAD_LEFT);
            $report->save();

            return $report;
        });

        return to_route('reports.show', $report)->with('status', 'Report created successfully.');
    }

    public function update(StoreReportRequest $request, Report $report): RedirectResponse
    {
        abort_unless($report->user_id === $request->user()->id, 403);

        $validated = $request->validated();
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

        DB::transaction(function () use ($report, $resolvedDepartment, $validated): void {
            $report->update([
                'patient_name' => $validated['patient_name'],
                'patient_age' => $validated['patient_age'],
                'patient_sex' => $validated['patient_sex'],
                'patient_address' => $validated['patient_address'] ?? null,
                'patient_referred_by' => $validated['patient_referred_by'] ?? null,
                'billing_date' => $validated['billing_date'],
                'collection_date' => $validated['collection_date'],
                'report_date' => $validated['report_date'],
                'department' => $resolvedDepartment,
                'sample_note' => $validated['sample_note'] ?? null,
                'equipment_note' => $validated['equipment_note'] ?? null,
                'interpretation_note' => $validated['interpretation_note'] ?? null,
            ]);

            $report->items()->delete();

            foreach ($validated['items'] as $index => $item) {
                $report->items()->create([
                    'investigation_id' => $item['investigation_id'] ?? null,
                    'parameter_name' => $item['parameter_name'],
                    'method' => $item['method'] ?? null,
                    'value' => $item['value'] ?? null,
                    'unit' => $item['unit'] ?? null,
                    'bio_ref_interval' => $item['bio_ref_interval'] ?? null,
                    'display_order' => $index,
                ]);
            }
        });

        return to_route('reports.show', $report)->with('status', 'Report updated successfully.');
    }

    public function show(Request $request, Report $report): Response
    {
        abort_unless($report->user_id === $request->user()->id, 403);

        $report->load(['items.investigation.department']);

        return Inertia::render('reports/show-report', [
            'report' => $report,
        ]);
    }
}
