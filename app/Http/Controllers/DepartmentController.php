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
    public function create(Request $request): Response
    {
        $departments = $request->user()
            ->departments()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('departments/create-department', [
            'departments' => $departments,
        ]);
    }

    public function index(Request $request): Response
    {
        $departments = $request->user()
            ->departments()
            ->orderBy('name')
            ->withCount('investigations')
            ->get();

        return Inertia::render('departments/all-department', [
            'departments' => $departments,
        ]);
    }

    public function show(Request $request, Department $department): Response
    {
        abort_unless($department->user_id === $request->user()->id, 403);

        $department->load('investigations');

        return Inertia::render('departments/show-department', [
            'department' => $department,
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
            'amount' => $payload['amount'] ?? null,
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
            'amount' => $payload['amount'] ?? null,
        ]);

        return back()->with('status', 'Investigation updated successfully.');
    }
}
