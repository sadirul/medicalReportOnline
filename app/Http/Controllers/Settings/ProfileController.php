<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        unset($validated['logo'], $validated['report_header_image'], $validated['report_footer_image'], $validated['signature_image']);

        $user->fill($validated);

        if ($request->hasFile('logo')) {
            if ($user->logo && Storage::disk('public')->exists($user->logo)) {
                Storage::disk('public')->delete($user->logo);
            }

            $user->logo = $request->file('logo')->store('logos', 'public');
        }

        if ($request->hasFile('report_header_image')) {
            if ($user->report_header_image && Storage::disk('public')->exists($user->report_header_image)) {
                Storage::disk('public')->delete($user->report_header_image);
            }

            $user->report_header_image = $request->file('report_header_image')->store('report-assets', 'public');
        }

        if ($request->hasFile('report_footer_image')) {
            if ($user->report_footer_image && Storage::disk('public')->exists($user->report_footer_image)) {
                Storage::disk('public')->delete($user->report_footer_image);
            }

            $user->report_footer_image = $request->file('report_footer_image')->store('report-assets', 'public');
        }

        if ($request->hasFile('signature_image')) {
            if ($user->signature_image && Storage::disk('public')->exists($user->signature_image)) {
                Storage::disk('public')->delete($user->signature_image);
            }

            $user->signature_image = $request->file('signature_image')->store('signatures', 'public');
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
