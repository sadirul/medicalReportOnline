<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    public const SESSION_VERIFIED_USER_ID = 'password_reset_verified_user_id';

    /**
     * Show the password reset page (after OTP verification).
     */
    public function create(Request $request): RedirectResponse|Response
    {
        $userId = $request->session()->get(self::SESSION_VERIFIED_USER_ID);

        if (! $userId) {
            return to_route('password.request')->withErrors([
                'mobile' => __('Please verify your mobile with OTP first.'),
            ]);
        }

        /** @var User|null $user */
        $user = User::query()->find($userId);

        if (! $user || ! $user->is_verified) {
            $request->session()->forget(self::SESSION_VERIFIED_USER_ID);

            return to_route('password.request');
        }

        return Inertia::render('auth/reset-password', [
            'mobile' => $user->mobile,
        ]);
    }

    /**
     * Store the new password.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $userId = $request->session()->get(self::SESSION_VERIFIED_USER_ID);

        if (! $userId) {
            throw ValidationException::withMessages([
                'password' => __('Please verify your mobile with OTP first.'),
            ]);
        }

        /** @var User|null $user */
        $user = User::query()->find($userId);

        if (! $user || ! $user->is_verified) {
            $request->session()->forget(self::SESSION_VERIFIED_USER_ID);

            throw ValidationException::withMessages([
                'password' => __('Session expired. Please start again.'),
            ]);
        }

        $user->forceFill([
            'password' => $request->string('password')->toString(),
            'remember_token' => Str::random(60),
        ])->save();

        $request->session()->forget(self::SESSION_VERIFIED_USER_ID);

        event(new PasswordReset($user));

        return to_route('login')->with([
            'status' => __('Your password has been reset.'),
            'status_type' => 'success',
        ]);
    }
}
