<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionActive
{
    /**
     * Paths that remain accessible when the clinic subscription / trial has expired.
     *
     * @var list<string>
     */
    private const ALLOWLIST = [
        'dashboard',
        'dashboard/*',
        'clinics/other-clinic/sent-report/create',
        'clinics/other-clinic/sent-report',
        'clinics/other-clinic/catalog/*',
        'clinics/other-clinic/requested-report',
        'clinics/other-clinic/requested-report/*',
        'settings',
        'settings/*',
        'subscription',
        'subscription/*',
        // Owner report invoice (bill) while subscription expired
        'reports/*/bill',
        // Inter-clinic shared report PDF and bill
        'clinics/other-clinic/shared-report/*/pdf',
        'clinics/other-clinic/shared-report/*/bill',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $user->isSubscriptionExpired()) {
            return $next($request);
        }

        foreach (self::ALLOWLIST as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        return redirect()->route('subscription.index');
    }
}
