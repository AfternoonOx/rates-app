<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyPreferencesController extends Controller
{
    public function edit(Request $request): Response
    {
        $currencies = Currency::query()
            ->orderBy('code')
            ->get();

        $userCurrencyCodes = $request->user()
            ->currencies()
            ->pluck('code')
            ->toArray();

        return Inertia::render('settings/currencies', [
            'currencies' => $currencies,
            'userCurrencyCodes' => $userCurrencyCodes,
        ]);
    }
}
