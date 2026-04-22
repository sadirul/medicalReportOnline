<?php

namespace App\Http\Controllers\Auth;

use App\Helpers\SmsPriorityHelper;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    private const OTP_SESSION_USER_ID = 'registration_otp_user_id';

    private const OTP_EXPIRY_MINUTES = 5;

    private const REPLACE_UNVERIFIED_AFTER_MINUTES = 5;

    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Save registration data and send OTP.
     *
     * @throws ValidationException
     */
    public function sendOtp(Request $request): RedirectResponse
    {
        $request->session()->forget('password_reset_otp_user_id');
        $request->session()->forget(NewPasswordController::SESSION_VERIFIED_USER_ID);

        $payload = $this->validateRegistrationPayload($request);

        $user = User::query()->where('mobile', $payload['mobile'])->first();

        if ($user?->is_verified) {
            throw ValidationException::withMessages([
                'mobile' => __('Mobile number already exists.'),
            ]);
        }

        $emailConflictQuery = User::query()
            ->where('email', $payload['email'])
            ->where('is_verified', true);

        if ($user !== null) {
            $emailConflictQuery->where('id', '!=', $user->id);
        }

        if ($emailConflictQuery->exists()) {
            throw ValidationException::withMessages([
                'email' => __('Email already exists.'),
            ]);
        }

        if (
            $user !== null
            && ! $user->is_verified
            && $user->updated_at !== null
            && $user->updated_at->gt(now()->subMinutes(self::REPLACE_UNVERIFIED_AFTER_MINUTES))
        ) {
            throw ValidationException::withMessages([
                'mobile' => __('This number is pending verification. Please retry after few minutes.'),
            ]);
        }

        if ($user === null) {
            $user = new User;
        }

        $user->fill([
            'unique_clinic_id' => $user->unique_clinic_id ?: User::generateUniqueClinicId(),
            'full_name' => $payload['full_name'],
            'clinic_name' => $payload['clinic_name'],
            'mobile' => $payload['mobile'],
            'email' => $payload['email'],
            'password' => Hash::make($payload['password']),
            'address' => $payload['address'],
            'is_verified' => false,
        ]);

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

        return to_route('register.otp.verify.page')
            ->with([
                'status' => __('OTP sent successfully to your mobile number.'),
                'status_type' => 'success',
            ]);
    }

    /**
     * Show OTP verification page.
     */
    public function showVerifyOtp(Request $request): RedirectResponse|Response
    {
        $userId = $request->session()->get(self::OTP_SESSION_USER_ID);

        if (! $userId) {
            return to_route('register');
        }

        /** @var User|null $user */
        $user = User::query()->find($userId);

        if (! $user || $user->is_verified) {
            $request->session()->forget(self::OTP_SESSION_USER_ID);

            return to_route('register');
        }

        return Inertia::render('auth/verify-otp', [
            'mobile' => $user->mobile,
        ]);
    }

    /**
     * Resend OTP for pending registration.
     *
     * @throws ValidationException
     */
    public function resendOtp(Request $request): RedirectResponse
    {
        $user = $this->getPendingUserFromSession($request);

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
     * Verify OTP and complete registration.
     *
     * @throws ValidationException
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => ['required', 'digits:6'],
        ]);

        $user = $this->getPendingUserFromSession($request);

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

        $user->is_verified = true;
        $user->otp_hash = null;
        $user->otp_expires_at = null;
        $user->save();

        $request->session()->forget(self::OTP_SESSION_USER_ID);

        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');
    }

    /**
     * @return array{
     *     full_name:string,
     *     clinic_name:string,
     *     mobile:string,
     *     email:string,
     *     password:string,
     *     address:string
     * }
     */
    private function validateRegistrationPayload(Request $request): array
    {
        /** @var array{
         *     full_name:string,
         *     clinic_name:string,
         *     mobile:string,
         *     email:string,
         *     password:string,
         *     address:string
         * } $validated
         */
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'clinic_name' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'digits:10'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'address' => ['required', 'string', 'max:1000'],
        ]);

        return $validated;
    }

    /**
     * @throws ValidationException
     */
    private function getPendingUserFromSession(Request $request): User
    {
        $userId = $request->session()->get(self::OTP_SESSION_USER_ID);

        if (! $userId) {
            throw ValidationException::withMessages([
                'otp' => __('Please sign up first.'),
            ]);
        }

        /** @var User|null $user */
        $user = User::query()->find($userId);

        if (! $user || $user->is_verified) {
            $request->session()->forget(self::OTP_SESSION_USER_ID);

            throw ValidationException::withMessages([
                'otp' => __('Account already verified or not found. Please sign up again.'),
            ]);
        }

        return $user;
    }
}
