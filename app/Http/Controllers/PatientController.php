<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        $patients = $request->user()
            ->patients()
            ->latest()
            ->get();

        return Inertia::render('reports/patients', [
            'patients' => $patients,
        ]);
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        $request->user()->patients()->create($request->validated());

        return back()->with([
            'status' => 'Patient added successfully.',
            'status_type' => 'success',
        ]);
    }

    public function update(StorePatientRequest $request, Patient $patient): RedirectResponse
    {
        abort_unless($patient->user_id === $request->user()->id, 403);

        $patient->update($request->validated());

        return back()->with([
            'status' => 'Patient updated successfully.',
            'status_type' => 'success',
        ]);
    }
}
