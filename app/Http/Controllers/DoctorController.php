<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDoctorRequest;
use App\Models\Doctor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    public function index(Request $request): Response
    {
        $doctors = $request->user()
            ->doctors()
            ->orderBy('name')
            ->get(['id', 'name', 'mobile', 'email', 'hospital']);

        return Inertia::render('doctors/index', [
            'doctors' => $doctors,
        ]);
    }

    public function store(StoreDoctorRequest $request): RedirectResponse
    {
        $request->user()->doctors()->create($request->validated());

        return back()->with([
            'status' => 'Doctor added successfully.',
            'status_type' => 'success',
        ]);
    }

    public function update(StoreDoctorRequest $request, Doctor $doctor): RedirectResponse
    {
        abort_unless((int) $doctor->user_id === (int) $request->user()->id, 403);

        $doctor->update($request->validated());

        return back()->with([
            'status' => 'Doctor updated successfully.',
            'status_type' => 'success',
        ]);
    }
}
