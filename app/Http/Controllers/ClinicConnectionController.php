<?php

namespace App\Http\Controllers;

use App\Models\ClinicConnection;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            return back()->with('status', 'Clinic ID not found.');
        }

        if ($target->id === $currentUser->id) {
            return back()->with('status', 'You cannot connect your own clinic.');
        }

        [$leftId, $rightId] = [(int) min($currentUser->id, $target->id), (int) max($currentUser->id, $target->id)];

        $exists = ClinicConnection::query()
            ->where('clinic_user_id', $leftId)
            ->where('connected_clinic_user_id', $rightId)
            ->exists();

        if ($exists) {
            return back()->with('status', 'This clinic is already connected.');
        }

        ClinicConnection::query()->create([
            'clinic_user_id' => $leftId,
            'connected_clinic_user_id' => $rightId,
        ]);

        return back()->with('status', 'Clinic connected successfully.');
    }
}
