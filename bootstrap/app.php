<?php

use App\Http\Middleware\EnsureSubscriptionActive;
use App\Http\Middleware\AuthenticateSuperadmin;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'subscription.active' => EnsureSubscriptionActive::class,
            'superadmin.auth' => AuthenticateSuperadmin::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'razorpay/webhook',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (ThrottleRequestsException $exception, \Illuminate\Http\Request $request) {
            if ($request->is('forgot-password*')) {
                return back()
                    ->withInput()
                    ->withErrors([
                        'mobile' => __('Too many requests. Please wait a moment and try again.'),
                    ]);
            }

            return null;
        });
    })->create();
