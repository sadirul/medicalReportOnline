<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $superadmin = $request->user('superadmin');
        $superadmin->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with([
            'status' => 'Password updated successfully.',
            'status_type' => 'success',
        ]);
    }
}
