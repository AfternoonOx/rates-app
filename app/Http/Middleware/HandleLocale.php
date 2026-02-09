<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supportedLocales = ['en', 'pl'];

        $sessionLocale = $request->session()->get('locale');
        $cookieLocale = $request->cookie('locale');

        $locale = null;

        if (is_string($sessionLocale) && in_array($sessionLocale, $supportedLocales, true)) {
            $locale = $sessionLocale;
        }

        if (! $locale && is_string($cookieLocale) && in_array($cookieLocale, $supportedLocales, true)) {
            $locale = $cookieLocale;
        }

        if (! $locale) {
            $preferred = $request->getPreferredLanguage($supportedLocales);
            $locale = $preferred ?: config('app.locale');
        }

        if (! in_array($locale, $supportedLocales, true)) {
            $locale = config('app.locale');
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
