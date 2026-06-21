<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class NgrokMiddleware
{
    /**
     * Handle an incoming request.
     * Adds the ngrok-skip-browser-warning header to all responses
     * so ngrok does not show its browser warning page on mobile devices.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('ngrok-skip-browser-warning', '1');

        return $response;
    }
}
