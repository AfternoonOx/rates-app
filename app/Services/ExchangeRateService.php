<?php

namespace App\Services;

use App\Data\ExchangeRateData;
use App\Models\Currency;
use App\Models\ExchangeRate;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class ExchangeRateService
{
    public function __construct(
        private readonly NbpApiService $nbpApiService,
    ) {}

    public function getCurrentRatesForCurrencies(Collection $currencies): array
    {
        $codes = $currencies->pluck('code')->all();
        $latestCachedRates = $this->getLatestCachedRatesByCurrencyCode($codes);

        return $currencies->map(function (Currency $currency) use ($latestCachedRates) {
            $cachedRate = $latestCachedRates->get($currency->code);

            if ($cachedRate && $cachedRate->effective_date->isToday()) {
                return [
                    'currencyCode' => $currency->code,
                    'currencyName' => $currency->name,
                    'rate' => (float) $cachedRate->rate,
                    'effectiveDate' => $cachedRate->effective_date->format('Y-m-d'),
                    'fromCache' => true,
                ];
            }

            $refreshed = $this->refreshCurrentRate($currency);

            if ($refreshed) {
                return [
                    'currencyCode' => $currency->code,
                    'currencyName' => $currency->name,
                    'rate' => (float) $refreshed->rate,
                    'effectiveDate' => $refreshed->effective_date->format('Y-m-d'),
                    'fromCache' => false,
                ];
            }

            return [
                'currencyCode' => $currency->code,
                'currencyName' => $currency->name,
                'rate' => $cachedRate ? (float) $cachedRate->rate : null,
                'effectiveDate' => $cachedRate?->effective_date?->format('Y-m-d'),
                'error' => true,
            ];
        })->all();
    }

    public function getOrFetchOnDate(Currency $currency, string $date): ?ExchangeRate
    {
        $cachedRate = ExchangeRate::query()
            ->forCurrency($currency->code)
            ->forDate($date)
            ->first();

        if ($cachedRate) {
            return $cachedRate;
        }

        $lockKey = "exchange_rates:date:{$currency->table_type}:{$currency->code}:{$date}";

        return Cache::lock($lockKey, 10)->block(2, function () use ($currency, $date) {
            $cachedRate = ExchangeRate::query()
                ->forCurrency($currency->code)
                ->forDate($date)
                ->first();

            if ($cachedRate) {
                return $cachedRate;
            }

            $rateData = $this->nbpApiService->getExchangeRateOnDate(
                $currency->code,
                $date,
                $currency->table_type ?? 'A'
            );

            if (! $rateData) {
                return null;
            }

            ExchangeRate::updateOrCreate(
                [
                    'currency_code' => $rateData->currencyCode,
                    'effective_date' => $rateData->effectiveDate->format('Y-m-d'),
                ],
                [
                    'rate' => $rateData->rate,
                    'table_type' => $rateData->tableType,
                ]
            );

            return ExchangeRate::query()
                ->forCurrency($rateData->currencyCode)
                ->forDate($rateData->effectiveDate->format('Y-m-d'))
                ->first();
        });
    }

    public function getTrend(Currency $currency, string $startDate, string $endDate): array
    {
        $cachedRates = ExchangeRate::query()
            ->forCurrency($currency->code)
            ->inDateRange($startDate, $endDate)
            ->orderBy('effective_date')
            ->get();

        // Calculate expected number of business days (approx 5/7 of total days)
        $start = new \DateTime($startDate);
        $end = new \DateTime($endDate);
        $totalDays = max(1, $start->diff($end)->days + 1);
        $expectedBusinessDays = (int) ceil($totalDays * 5 / 7);

        // Only use cache if we have at least 70% coverage of expected business days
        $hasSufficientCoverage = $cachedRates->count() >= ($expectedBusinessDays * 0.7);

        if ($cachedRates->isNotEmpty() && $hasSufficientCoverage) {
            return [
                'data' => $cachedRates->map(fn (ExchangeRate $rate) => [
                    'date' => $rate->effective_date->format('Y-m-d'),
                    'value' => (float) $rate->rate,
                    'tableNo' => null,
                ])->values()->all(),
                'currency' => $currency->code,
                'fromCache' => true,
            ];
        }

        $lockKey = "exchange_rates:range:{$currency->table_type}:{$currency->code}:{$startDate}:{$endDate}";

        $success = Cache::lock($lockKey, 10)->block(2, function () use ($currency, $startDate, $endDate, $expectedBusinessDays) {
            $cachedRates = ExchangeRate::query()
                ->forCurrency($currency->code)
                ->inDateRange($startDate, $endDate)
                ->get();

            // Only skip API call if we have sufficient coverage
            if ($cachedRates->count() >= ($expectedBusinessDays * 0.7)) {
                return true;
            }

            $apiRates = $this->nbpApiService->getExchangeRatesInRange(
                $currency->code,
                $startDate,
                $endDate,
                $currency->table_type ?? 'A'
            );

            if ($apiRates->isEmpty()) {
                return false;
            }

            $now = now();
            ExchangeRate::upsert(
                $apiRates->map(fn ($rateData) => [
                    'currency_code' => $rateData->currencyCode,
                    'effective_date' => $rateData->effectiveDate->format('Y-m-d'),
                    'rate' => $rateData->rate,
                    'table_type' => $rateData->tableType,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all(),
                ['currency_code', 'effective_date'],
                ['rate', 'table_type', 'updated_at']
            );

            return true;
        });

        if (! $success) {
            return [
                'error' => __('app.no_data_available_for_date_range'),
            ];
        }

        $cachedRates = ExchangeRate::query()
            ->forCurrency($currency->code)
            ->inDateRange($startDate, $endDate)
            ->orderBy('effective_date')
            ->get();

        return [
            'data' => $cachedRates->map(fn (ExchangeRate $rate) => [
                'date' => $rate->effective_date->format('Y-m-d'),
                'value' => (float) $rate->rate,
                'tableNo' => null,
            ])->values()->all(),
            'currency' => $currency->code,
            'fromCache' => false,
        ];
    }

    public function getSingle(Currency $currency, string $date): array
    {
        $cachedRate = ExchangeRate::query()
            ->forCurrency($currency->code)
            ->forDate($date)
            ->first();

        if ($cachedRate) {
            return [
                'value' => (float) $cachedRate->rate,
                'date' => $cachedRate->effective_date->format('Y-m-d'),
                'currency' => $currency->code,
                'tableNo' => null,
                'fromCache' => true,
            ];
        }

        $rate = $this->getOrFetchOnDate($currency, $date);
        if (! $rate) {
            return [
                'error' => __('app.no_rate_available'),
            ];
        }

        return [
            'value' => (float) $rate->rate,
            'date' => $rate->effective_date->format('Y-m-d'),
            'currency' => $currency->code,
            'tableNo' => null,
            'fromCache' => false,
        ];
    }

    public function hydrateRange(Currency $currency, string $startDate, string $endDate): void
    {
        $rates = $this->nbpApiService->getExchangeRatesInRange(
            $currency->code,
            $startDate,
            $endDate,
            $currency->table_type
        );

        if ($rates->isEmpty()) {
            return;
        }

        $now = now();
        ExchangeRate::upsert(
            $rates->map(fn ($rateData) => [
                'currency_code' => $rateData->currencyCode,
                'effective_date' => $rateData->effectiveDate->format('Y-m-d'),
                'rate' => $rateData->rate,
                'table_type' => $rateData->tableType,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all(),
            ['currency_code', 'effective_date'],
            ['rate', 'table_type', 'updated_at']
        );
    }

    public function getCurrentRateForWatchlist(Currency $currency): array
    {
        $cachedRate = ExchangeRate::query()
            ->forCurrency($currency->code)
            ->latestRate()
            ->first();

        if ($cachedRate && $cachedRate->effective_date->isToday()) {
            return [
                'rate' => (float) $cachedRate->rate,
                'effectiveDate' => $cachedRate->effective_date->format('Y-m-d'),
            ];
        }

        $refreshed = $this->refreshCurrentRate($currency);

        if (! $refreshed) {
            return [
                'rate' => $cachedRate ? (float) $cachedRate->rate : null,
                'effectiveDate' => $cachedRate?->effective_date?->format('Y-m-d'),
                'error' => true,
            ];
        }

        return [
            'rate' => (float) $refreshed->rate,
            'effectiveDate' => $refreshed->effective_date->format('Y-m-d'),
        ];
    }

    private function getLatestCachedRatesByCurrencyCode(array $currencyCodes): Collection
    {
        if ($currencyCodes === []) {
            return collect();
        }

        $latestDates = ExchangeRate::query()
            ->selectRaw('currency_code, MAX(effective_date) as max_effective_date')
            ->whereIn('currency_code', $currencyCodes)
            ->groupBy('currency_code');

        return ExchangeRate::query()
            ->select('exchange_rates.*')
            ->joinSub($latestDates, 'latest', function ($join) {
                $join->on('exchange_rates.currency_code', '=', 'latest.currency_code')
                    ->on('exchange_rates.effective_date', '=', 'latest.max_effective_date');
            })
            ->get()
            ->keyBy('currency_code');
    }

    private function refreshCurrentRate(Currency $currency): ?ExchangeRate
    {
        $lockKey = "exchange_rates:current:{$currency->table_type}:{$currency->code}";

        return Cache::lock($lockKey, 10)->block(2, function () use ($currency) {
            $cachedRate = ExchangeRate::query()
                ->forCurrency($currency->code)
                ->latestRate()
                ->first();

            if ($cachedRate && $cachedRate->effective_date->isToday()) {
                return $cachedRate;
            }

            $rate = $this->nbpApiService->getCurrentExchangeRate(
                $currency->code,
                $currency->table_type
            );

            if (! $rate) {
                return null;
            }

            ExchangeRate::updateOrCreate(
                [
                    'currency_code' => $rate->currencyCode,
                    'effective_date' => $rate->effectiveDate->format('Y-m-d'),
                ],
                [
                    'rate' => $rate->rate,
                    'table_type' => $rate->tableType,
                ]
            );

            return ExchangeRate::query()
                ->forCurrency($rate->currencyCode)
                ->forDate($rate->effectiveDate->format('Y-m-d'))
                ->first();
        });
    }
}
