<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReportRequest;
use App\Models\Investigation;
use App\Models\Patient;
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
            ->with('patient')
            ->latest()
            ->get();

        return Inertia::render('reports/all-report', [
            'reports' => $reports,
        ]);
    }

    public function create(Request $request): Response
    {
        $patient = null;

        if ($request->filled('patient')) {
            $patient = $request->user()
                ->patients()
                ->findOrFail((int) $request->input('patient'));
        }

        $patients = $request->user()
            ->patients()
            ->orderBy('name')
            ->get(['id', 'name', 'v_id', 'age', 'sex', 'address', 'referred_by']);

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
            'patient' => $patient,
            'patients' => $patients,
            'departments' => $departments,
            'investigations' => $investigations,
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
            $report = $request->user()->reports()->create([
                'patient_id' => $validated['patient_id'],
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

            return $report;
        });

        return to_route('reports.show', $report)->with('status', 'Report created successfully.');
    }

    public function show(Request $request, Report $report): Response
    {
        abort_unless($report->user_id === $request->user()->id, 403);

        $report->load(['patient', 'items.investigation.department']);

        return Inertia::render('reports/show-report', [
            'report' => $report,
        ]);
    }
}
