<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExchangeRateTrendRequest;
use App\Http\Requests\GoldPriceTrendRequest;
use App\Http\Requests\SingleExchangeRateRequest;
use App\Http\Requests\SingleGoldPriceRequest;
use App\Models\Currency;
use App\Services\ExchangeRateService;
use App\Services\GoldPriceService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class HistoryController extends Controller
{
    public function __construct(
        private readonly ExchangeRateService $exchangeRateService,
        private readonly GoldPriceService    $goldPriceService,
    ) {}

    /**
     * Display the history page.
     */
    public function index(): Response
    {
        $currencies = Currency::orderBy('code')->get();

        return Inertia::render('history', [
            'currencies' => $currencies,
        ]);
    }

    /**
     * Get exchange rate trend for a date range.
     */
    public function getExchangeRateTrend(ExchangeRateTrendRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $currency = Currency::where('code', strtoupper($validated['currency']))->first();
        if (! $currency) {
            return response()->json(['error' => __('app.currency_not_found')], 404);
        }

        $startDate = $validated['from'];
        $endDate = $validated['to'];

        $payload = $this->exchangeRateService->getTrend($currency, $startDate, $endDate);

        if (isset($payload['error'])) {
            return response()->json(['error' => $payload['error']], 404);
        }

        return response()->json($payload);
    }

    /**
     * Get gold price trend for a date range.
     */
    public function getGoldPriceTrend(GoldPriceTrendRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $payload = $this->goldPriceService->getTrend($validated['from'], $validated['to']);

        if (isset($payload['error'])) {
            return response()->json(['error' => $payload['error']], 404);
        }

        return response()->json($payload);
    }

    /**
     * Get exchange rate for a single date.
     */
    public function getSingleExchangeRate(SingleExchangeRateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $currency = Currency::where('code', strtoupper($validated['currency']))->first();
        if (! $currency) {
            return response()->json(['error' => __('app.currency_not_found')], 404);
        }

        $payload = $this->exchangeRateService->getSingle($currency, $validated['date']);
        if (isset($payload['error'])) {
            return response()->json(['error' => $payload['error']], 404);
        }

        return response()->json($payload);
    }

    /**
     * Get gold price for a single date.
     */
    public function getSingleGoldPrice(SingleGoldPriceRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $payload = $this->goldPriceService->getSingle($validated['date']);
        if (isset($payload['error'])) {
            return response()->json(['error' => $payload['error']], 404);
        }

        return response()->json($payload);
    }
}
