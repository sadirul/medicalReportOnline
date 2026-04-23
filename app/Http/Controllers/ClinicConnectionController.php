<?php

namespace App\Http\Controllers;

use App\Http\Requests\Clinic\CreateClinicAccountRequest;
use App\Models\ClinicConnection;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Throwable;
use Inertia\Inertia;
use Inertia\Response;

class ClinicConnectionController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = (int) $request->user()->id;

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

        $connectedClinics = User::query()
            ->whereIn('id', $connectedIds)
            ->orderBy('clinic_name')
            ->get([
                'id',
                'unique_clinic_id',
                'clinic_name',
                'full_name',
                'mobile',
                'email',
                'address',
            ]);

        return Inertia::render('clinics/other-clinic', [
            'connectedClinics' => $connectedClinics,
            'myClinicUniqueId' => $request->user()->unique_clinic_id,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'clinic_unique_id' => ['required', 'string', 'max:32'],
        ]);

        $currentUser = $request->user();
        $target = User::query()
            ->where('unique_clinic_id', strtoupper(trim($validated['clinic_unique_id'])))
            ->first();

        if (! $target) {
            return back()->with([
                'status' => 'Clinic ID not found.',
                'status_type' => 'error',
            ]);
        }

        if ($target->id === $currentUser->id) {
            return back()->with([
                'status' => 'You cannot connect your own clinic.',
                'status_type' => 'error',
            ]);
        }

        [$leftId, $rightId] = [(int) min($currentUser->id, $target->id), (int) max($currentUser->id, $target->id)];

        $exists = ClinicConnection::query()
            ->where('clinic_user_id', $leftId)
            ->where('connected_clinic_user_id', $rightId)
            ->exists();

        if ($exists) {
            return back()->with([
                'status' => 'This clinic is already connected.',
                'status_type' => 'error',
            ]);
        }

        ClinicConnection::query()->create([
            'clinic_user_id' => $leftId,
            'connected_clinic_user_id' => $rightId,
        ]);

        return back()->with([
            'status' => 'Clinic connected successfully.',
            'status_type' => 'success',
        ]);
    }

    public function createAccountAndConnect(CreateClinicAccountRequest $request): RedirectResponse
    {
        $currentUser = $request->user();
        $validated = $request->validated();

        try {
            DB::transaction(function () use ($validated, $currentUser): void {
                $newClinic = User::query()->create([
                    'full_name' => $validated['full_name'],
                    'clinic_name' => $validated['clinic_name'],
                    'mobile' => $validated['mobile'],
                    'email' => $validated['email'],
                    'address' => $validated['address'],
                    'password' => Hash::make($validated['password']),
                    'is_verified' => true,
                    'email_verified_at' => now(),
                    'expiry_datetime' => now()->subDay(),
                ]);

                [$leftId, $rightId] = [(int) min($currentUser->id, $newClinic->id), (int) max($currentUser->id, $newClinic->id)];

                ClinicConnection::query()->firstOrCreate([
                    'clinic_user_id' => $leftId,
                    'connected_clinic_user_id' => $rightId,
                ]);
            });
        } catch (Throwable) {
            return back()->with([
                'status' => 'Unable to create clinic account right now. Please try again.',
                'status_type' => 'error',
            ]);
        }

        return back()->with([
            'status' => 'Clinic account created and connected successfully.',
            'status_type' => 'success',
        ]);
    }
}
