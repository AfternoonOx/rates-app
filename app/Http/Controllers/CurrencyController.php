<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCurrencyRequest;
use App\Models\Currency;
use App\Services\ExchangeRateService;
use App\Services\WatchlistService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyController extends Controller
{
    public function __construct(
        private readonly ExchangeRateService $exchangeRateService,
        private readonly WatchlistService    $watchlistService,
    ) {}

    /**
     * Display a listing of all available currencies with user's watchlist and rates.
     */
    public function index(Request $request): Response
    {
        $currencies = Currency::query()
            ->orderBy('code')
            ->get();

        $user = $request->user();
        $userCurrencies = $user->currencies()->orderBy('code')->get();

        $userCurrencyCodes = $userCurrencies->pluck('code')->toArray();

        $rates = $this->exchangeRateService->getCurrentRatesForCurrencies($userCurrencies);

        return Inertia::render('currencies/index', [
            'currencies' => $currencies,
            'userCurrencyCodes' => $userCurrencyCodes,
            'rates' => $rates,
        ]);
    }

    /**
     * Display the user's followed currencies with their current rates and sparkline data.
     */
    public function userCurrencies(Request $request): Response
    {
        $user = $request->user();

        // Seed currencies if empty
        $this->watchlistService->seedCurrenciesIfEmpty();

        $allCurrencies = Currency::orderBy('code')->get();

        $watchlist = $this->watchlistService->getWatchlistCards($user);

        return Inertia::render('watchlist', [
            'watchlist' => $watchlist,
            'allCurrencies' => $allCurrencies,
        ]);
    }

    /**
     * Add a currency to the user's watchlist.
     */
    public function store(StoreCurrencyRequest $request): RedirectResponse
    {
        $user = $request->user();
        $currencyCode = $request->validated('currency_code');

        $user->currencies()->syncWithoutDetaching([$currencyCode]);

        return back()->with('success', __('app.currency_added'));
    }

    /**
     * Remove a currency from the user's watchlist.
     */
    public function destroy(Request $request, string $code): RedirectResponse
    {
        $user = $request->user();

        $user->currencies()->detach($code);

        return back()->with('success', __('app.currency_removed'));
    }
}
