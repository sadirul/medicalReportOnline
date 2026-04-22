<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request): Limit {
            $mobile = Str::lower($request->string('mobile')->toString());

            return Limit::perMinute(6)->by($mobile.'|'.$request->ip());
        });

        RateLimiter::for('otp-send', function (Request $request): Limit {
            $mobile = Str::lower($request->string('mobile')->toString());

            return Limit::perMinute(3)->by($mobile.'|'.$request->ip());
        });

        RateLimiter::for('otp-verify', function (Request $request): Limit {
            $key = $request->session()->get('registration_otp_user_id')
                ?? $request->session()->get('password_reset_otp_user_id')
                ?? 'otp-verify';

            return Limit::perMinute(10)->by($key.'|'.$request->ip());
        });

        RateLimiter::for('otp-resend', function (Request $request): Limit {
            $key = $request->session()->get('registration_otp_user_id')
                ?? $request->session()->get('password_reset_otp_user_id')
                ?? 'otp-resend';

            return Limit::perMinute(3)->by($key.'|'.$request->ip());
        });
    }
}
