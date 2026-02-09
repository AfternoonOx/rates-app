<?php

namespace App\Services;

use App\Models\Currency;
use App\Models\ExchangeRate;
use Illuminate\Contracts\Auth\Authenticatable;

class WatchlistService
{
    public function __construct(
        private readonly NbpApiService       $nbpApiService,
        private readonly ExchangeRateService $exchangeRateService,
    ) {}

    public function seedCurrenciesIfEmpty(): void
    {
        if ((new \App\Models\Currency)->count() !== 0) {
            return;
        }

        $nbpCurrencies = $this->nbpApiService->getAvailableCurrencies();
        foreach ($nbpCurrencies as $currencyData) {
            Currency::firstOrCreate(
                ['code' => $currencyData->code],
                [
                    'name' => $currencyData->name,
                    'table_type' => 'A',
                ]
            );
        }
    }

    public function getWatchlistCards(Authenticatable $user): array
    {
        $currencies = $user->currencies()->orderBy('code')->get();

        return $currencies->map(function (Currency $currency) {
            $currentRate = $this->getCurrentRate($currency);

            $startDate = now()->subDays(14)->format('Y-m-d');
            $endDate = now()->format('Y-m-d');

            $history = ExchangeRate::query()
                ->forCurrency($currency->code)
                ->inDateRange($startDate, $endDate)
                ->orderBy('effective_date')
                ->get();

            if ($history->count() < 2) {
                $this->hydrateHistory($currency, $startDate, $endDate);

                $history = ExchangeRate::query()
                    ->forCurrency($currency->code)
                    ->inDateRange($startDate, $endDate)
                    ->orderBy('effective_date')
                    ->get();
            }

            $sparklineData = $history->map(fn ($rate) => [
                'date' => $rate->effective_date->format('M j'),
                'value' => (float) $rate->rate,
            ])->values()->toArray();

            $change = 0.0;

            if ($history->count() >= 2) {
                $firstRate = $history->first()->rate;
                $lastRate = $history->last()->rate;
                $change = $firstRate > 0
                    ? (($lastRate - $firstRate) / $firstRate) * 100
                    : 0;
            }

            return [
                'code' => $currency->code,
                'name' => $currency->name,
                'rate' => $currentRate['rate'],
                'effectiveDate' => $currentRate['effectiveDate'],
                'change' => round($change, 2),
                'sparklineData' => $sparklineData,
                'error' => $currentRate['error'] ?? false,
            ];
        })->all();
    }

    private function hydrateHistory(Currency $currency, string $startDate, string $endDate): void
    {
        $this->exchangeRateService->hydrateRange($currency, $startDate, $endDate);
    }

    private function getCurrentRate(Currency $currency): array
    {
        return $this->exchangeRateService->getCurrentRateForWatchlist($currency);
    }
}
