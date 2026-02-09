<?php

namespace App\Http\Controllers;

use App\Services\GoldPriceService;
use App\Services\WatchlistService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly GoldPriceService $goldPriceService,
        private readonly WatchlistService $watchlistService,
    ) {}

    /**
     * Display the dashboard with gold prices and user currencies.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $goldPrices = $this->goldPriceService->getLastDaysForChart();

        return Inertia::render('dashboard', [
            'goldPrices' => $goldPrices,
            'watchlist' => Inertia::defer(fn () => $this->watchlistService->getWatchlistCards($user)),
        ]);
    }
}
