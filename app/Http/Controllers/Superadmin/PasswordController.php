<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('superadmin/settings/password');
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password:superadmin'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        Auth::guard('superadmin')->logoutOtherDevices($validated['current_password']);

        $superadmin = $request->user('superadmin');
        $superadmin->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with([
            'status' => 'Password updated successfully.',
            'status_type' => 'success',
        ]);
    }

    public function destroyOtherSessions(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password:superadmin'],
        ]);

        Auth::guard('superadmin')->logoutOtherDevices($validated['current_password']);

        return back()->with([
            'status' => 'Logged out from other devices.',
            'status_type' => 'success',
        ]);
    }
}
