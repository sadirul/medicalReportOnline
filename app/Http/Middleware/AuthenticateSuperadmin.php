<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateSuperadmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('superadmin')->check()) {
            return redirect()->route('superadmin.login');
        }

        Auth::shouldUse('superadmin');

        return $next($request);
    }
}
