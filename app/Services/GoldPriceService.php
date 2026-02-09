<?php

namespace App\Services;

use App\Models\GoldPrice;
use DateTime;
use Illuminate\Support\Facades\Cache;

class GoldPriceService
{
    public function __construct(
        private readonly NbpApiService $nbpApiService,
    ) {}

    public function getLastDaysForChart(int $days = 10): array
    {
        $lockKey = "gold_prices:last:{$days}";

        $cachedPrices = Cache::lock($lockKey, 10)->block(2, function () use ($days) {
            $cachedPrices = GoldPrice::query()->lastDays($days)->get();

            $latestCached = $cachedPrices->first();
            $shouldRefresh = ! $latestCached
                || (! $latestCached->effective_date->isToday()
                    && ! $latestCached->effective_date->isYesterday());

            if (! $shouldRefresh && $cachedPrices->count() >= $days) {
                return $cachedPrices;
            }

            $apiPrices = $this->nbpApiService->getGoldPrices($days);
            if ($apiPrices->isEmpty()) {
                return $cachedPrices;
            }

            $now = now();

            GoldPrice::upsert(
                $apiPrices->map(fn ($priceData) => [
                    'effective_date' => $priceData->effectiveDate->format('Y-m-d'),
                    'price' => $priceData->price,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all(),
                ['effective_date'],
                ['price', 'updated_at']
            );

            return GoldPrice::query()->lastDays($days)->get();
        });

        return $cachedPrices
            ->map(fn (GoldPrice $price) => [
                'price' => (float) $price->price,
                'date' => $price->effective_date->format('Y-m-d'),
            ])
            ->sortBy('date')
            ->values()
            ->all();
    }

    public function getLookupResult(string $date): array
    {
        $price = $this->getOrFetchForDate($date);

        if (! $price) {
            return [
                'result' => null,
                'error' => __('app.no_gold_price_available'),
            ];
        }

        return [
            'result' => [
                'date' => $price->effective_date->format('Y-m-d'),
                'price' => (float) $price->price,
            ],
            'error' => null,
        ];
    }

    public function getTrend(string $startDate, string $endDate): array
    {
        $cachedPrices = GoldPrice::query()
            ->inDateRange($startDate, $endDate)
            ->orderBy('effective_date')
            ->get();

        // Calculate expected number of business days (approx 5/7 of total days)
        $start = new DateTime($startDate);
        $end = new DateTime($endDate);
        $totalDays = max(1, $start->diff($end)->days + 1);
        $expectedBusinessDays = (int) ceil($totalDays * 5 / 7);

        // Only use cache if we have at least 70% coverage of expected business days
        $hasSufficientCoverage = $cachedPrices->count() >= ($expectedBusinessDays * 0.7);

        if ($cachedPrices->isNotEmpty() && $hasSufficientCoverage) {
            return [
                'data' => $cachedPrices->map(fn (GoldPrice $price) => [
                    'date' => $price->effective_date->format('Y-m-d'),
                    'value' => (float) $price->price,
                ])->values()->all(),
                'fromCache' => true,
            ];
        }

        $lockKey = "gold_prices:range:{$startDate}:{$endDate}";

        $success = Cache::lock($lockKey, 10)->block(2, function () use ($startDate, $endDate, $expectedBusinessDays) {
            $cachedPrices = GoldPrice::query()
                ->inDateRange($startDate, $endDate)
                ->get();

            // Only skip API call if we have sufficient coverage
            if ($cachedPrices->count() >= ($expectedBusinessDays * 0.7)) {
                return true;
            }

            $apiPrices = $this->nbpApiService->getGoldPricesInRange($startDate, $endDate);
            if ($apiPrices->isEmpty()) {
                return false;
            }

            $now = now();
            GoldPrice::upsert(
                $apiPrices->map(fn ($priceData) => [
                    'effective_date' => $priceData->effectiveDate->format('Y-m-d'),
                    'price' => $priceData->price,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all(),
                ['effective_date'],
                ['price', 'updated_at']
            );

            return true;
        });

        if (! $success) {
            return [
                'error' => __('app.no_data_available_for_date_range'),
            ];
        }

        $cachedPrices = GoldPrice::query()
            ->inDateRange($startDate, $endDate)
            ->orderBy('effective_date')
            ->get();

        return [
            'data' => $cachedPrices->map(fn (GoldPrice $price) => [
                'date' => $price->effective_date->format('Y-m-d'),
                'value' => (float) $price->price,
            ])->values()->all(),
            'fromCache' => false,
        ];
    }

    public function getSingle(string $date): array
    {
        $price = GoldPrice::query()->forDate($date)->first();

        if ($price) {
            return [
                'value' => (float) $price->price,
                'date' => $price->effective_date->format('Y-m-d'),
                'fromCache' => true,
            ];
        }

        $price = $this->getOrFetchForDate($date);

        if (! $price) {
            return [
                'error' => __('app.no_gold_price_available'),
            ];
        }

        return [
            'value' => (float) $price->price,
            'date' => $price->effective_date->format('Y-m-d'),
            'fromCache' => false,
        ];
    }

    private function getOrFetchForDate(string $date): ?GoldPrice
    {
        $cachedPrice = GoldPrice::query()->forDate($date)->first();
        if ($cachedPrice) {
            return $cachedPrice;
        }

        $lockKey = "gold_prices:date:{$date}";

        return Cache::lock($lockKey, 10)->block(2, function () use ($date) {
            $cachedPrice = GoldPrice::query()->forDate($date)->first();
            if ($cachedPrice) {
                return $cachedPrice;
            }

            $priceData = $this->nbpApiService->getGoldPriceOnDate($date);
            if (! $priceData) {
                return null;
            }

            GoldPrice::updateOrCreate(
                ['effective_date' => $priceData->effectiveDate->format('Y-m-d')],
                ['price' => $priceData->price]
            );

            return GoldPrice::query()->forDate($priceData->effectiveDate->format('Y-m-d'))->first();
        });
    }
}
