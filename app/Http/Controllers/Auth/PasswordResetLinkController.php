<?php

namespace App\Http\Controllers\Auth;

use App\Helpers\SmsPriorityHelper;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    private const OTP_SESSION_USER_ID = 'password_reset_otp_user_id';

    private const OTP_EXPIRY_MINUTES = 5;

    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Send OTP to the user's mobile for password reset.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'mobile' => ['required', 'digits:10'],
        ]);

        $request->session()->forget('registration_otp_user_id');

        /** @var User|null $user */
        $user = User::query()
            ->where('mobile', $request->string('mobile')->toString())
            ->where('is_verified', true)
            ->first();

        if ($user === null) {
            throw ValidationException::withMessages([
                'mobile' => __('No verified account found for this mobile number.'),
            ]);
        }

        $otp = (string) random_int(100000, 999999);
        $user->otp_hash = Hash::make($otp);
        $user->otp_expires_at = now()->addMinutes(self::OTP_EXPIRY_MINUTES);
        $user->save();

        $smsResult = SmsPriorityHelper::sendOtp($user->mobile, $otp, 'whatsapp');

        if (! ($smsResult['status'] ?? false)) {
            $user->otp_hash = null;
            $user->otp_expires_at = null;
            $user->save();

            throw ValidationException::withMessages([
                'mobile' => __('Unable to send OTP right now. Please try again.'),
            ]);
        }

        $request->session()->put(self::OTP_SESSION_USER_ID, $user->id);

        return to_route('password.reset.otp.page')
            ->with([
                'status' => __('OTP sent successfully to your mobile number.'),
                'status_type' => 'success',
            ]);
    }

    /**
     * Show OTP verification page for password reset.
     */
    public function showVerifyOtp(Request $request): RedirectResponse|Response
    {
        $userId = $request->session()->get(self::OTP_SESSION_USER_ID);

        if (! $userId) {
            return to_route('password.request');
        }

        /** @var User|null $user */
        $user = User::query()->find($userId);

        if (! $user || ! $user->is_verified) {
            $request->session()->forget(self::OTP_SESSION_USER_ID);

            return to_route('password.request');
        }

        return Inertia::render('auth/forgot-password-verify-otp', [
            'mobile' => $user->mobile,
        ]);
    }

    /**
     * Resend OTP for password reset.
     *
     * @throws ValidationException
     */
    public function resendOtp(Request $request): RedirectResponse
    {
        $user = $this->getPasswordResetUserFromSession($request);

        $otp = (string) random_int(100000, 999999);
        $user->otp_hash = Hash::make($otp);
        $user->otp_expires_at = now()->addMinutes(self::OTP_EXPIRY_MINUTES);
        $user->save();

        $smsResult = SmsPriorityHelper::sendOtp($user->mobile, $otp, 'whatsapp');

        if (! ($smsResult['status'] ?? false)) {
            throw ValidationException::withMessages([
                'otp' => __('Unable to send OTP right now. Please try again.'),
            ]);
        }

        return back()->with([
            'status' => __('OTP resent successfully.'),
            'status_type' => 'success',
        ]);
    }

    /**
     * Verify OTP and allow choosing a new password.
     *
     * @throws ValidationException
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => ['required', 'digits:6'],
        ]);

        $user = $this->getPasswordResetUserFromSession($request);

        if ($user->otp_expires_at === null || $user->otp_expires_at->isPast()) {
            throw ValidationException::withMessages([
                'otp' => __('OTP expired. Please resend OTP.'),
            ]);
        }

        if (! Hash::check($request->string('otp')->toString(), $user->otp_hash ?? '')) {
            throw ValidationException::withMessages([
                'otp' => __('Invalid OTP entered.'),
            ]);
        }

        $user->otp_hash = null;
        $user->otp_expires_at = null;
        $user->save();

        $request->session()->forget(self::OTP_SESSION_USER_ID);
        $request->session()->put(NewPasswordController::SESSION_VERIFIED_USER_ID, $user->id);

        return to_route('password.reset');
    }

    /**
     * @throws ValidationException
     */
    private function getPasswordResetUserFromSession(Request $request): User
    {
        $userId = $request->session()->get(self::OTP_SESSION_USER_ID);

        if (! $userId) {
            throw ValidationException::withMessages([
                'otp' => __('Please request a password reset first.'),
            ]);
        }

        /** @var User|null $user */
        $user = User::query()->find($userId);

        if (! $user || ! $user->is_verified) {
            $request->session()->forget(self::OTP_SESSION_USER_ID);

            throw ValidationException::withMessages([
                'otp' => __('Session expired. Please start again.'),
            ]);
        }

        return $user;
    }
}
