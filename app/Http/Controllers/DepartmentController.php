<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\StoreInvestigationRequest;
use App\Models\Department;
use App\Models\Investigation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(Request $request): Response
    {
        $departments = $request->user()
            ->departments()
            ->with('investigations')
            ->orderBy('name')
            ->get();

        return Inertia::render('departments/index', [
            'departments' => $departments,
        ]);
    }

    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        $request->user()->departments()->create($request->validated());

        return back()->with('status', 'Department added successfully.');
    }

    public function update(StoreDepartmentRequest $request, Department $department): RedirectResponse
    {
        abort_unless($department->user_id === $request->user()->id, 403);

        $department->update($request->validated());

        return back()->with('status', 'Department updated successfully.');
    }

    public function storeInvestigation(StoreInvestigationRequest $request, Department $department): RedirectResponse
    {
        abort_unless($department->user_id === $request->user()->id, 403);

        $payload = $request->validated();
        $department->investigations()->create([
            'name' => $payload['name'],
            'unit' => $payload['unit'] ?? null,
            'bio_ref_interval' => $payload['bio_ref_interval'] ?? null,
        ]);

        return back()->with('status', 'Investigation added successfully.');
    }

    public function updateInvestigation(StoreInvestigationRequest $request, Investigation $investigation): RedirectResponse
    {
        $investigation->loadMissing('department');
        abort_unless($investigation->department && $investigation->department->user_id === $request->user()->id, 403);

        $payload = $request->validated();
        $investigation->update([
            'department_id' => $payload['department_id'],
            'name' => $payload['name'],
            'unit' => $payload['unit'] ?? null,
            'bio_ref_interval' => $payload['bio_ref_interval'] ?? null,
        ]);

        return back()->with('status', 'Investigation updated successfully.');
    }
}
