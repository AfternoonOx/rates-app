<?php

namespace App\Services;

use App\Data\CurrencyData;
use App\Data\ExchangeRateData;
use App\Data\GoldPriceData;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NbpApiService
{
    private const string BASE_URL = 'https://api.nbp.pl/api';

    private function normalizeExchangeRateSeriesResponse(
        mixed $data,
        string $tableType,
        string $currencyCode,
    ): ?array {
        if (! is_array($data)) {
            return null;
        }

        $code = $data['code'] ?? null;
        $currencyName = $data['currency'] ?? null;
        $rates = $data['rates'] ?? null;

        if (! is_string($code) || ! is_string($currencyName) || ! is_array($rates)) {
            return null;
        }

        if (strtoupper($code) !== strtoupper($currencyCode)) {
            return null;
        }

        $normalizedRates = collect($rates)
            ->filter(fn ($rate) => is_array($rate))
            ->map(function (array $rate) use ($tableType, $code, $currencyName) {
                $mid = $rate['mid'] ?? null;
                $effectiveDate = $rate['effectiveDate'] ?? null;

                if (! is_numeric($mid) || ! is_string($effectiveDate)) {
                    return null;
                }

                return [
                    'currencyCode' => strtoupper($code),
                    'currencyName' => $currencyName,
                    'rate' => (float) $mid,
                    'effectiveDate' => $effectiveDate,
                    'tableType' => strtoupper($tableType),
                    'tableNo' => isset($rate['no']) && is_string($rate['no']) ? $rate['no'] : null,
                ];
            })
            ->filter()
            ->values();

        return [
            'code' => $code,
            'currency' => $currencyName,
            'rates' => $normalizedRates->all(),
        ];
    }

    private function request(): PendingRequest
    {
        return Http::accept('application/json')
            ->timeout(10)
            ->retry(2, 200);
    }

    /**
     * Get gold prices for the last N days.
     *
     * @return Collection<int, GoldPriceData>
     */
    public function getGoldPrices(int $days = 10): Collection
    {
        try {
            $response = $this->request()
                ->get(self::BASE_URL."/cenyzlota/last/{$days}");

            $response->throw();

            return collect($response->json())
                ->map(fn (array $item) => GoldPriceData::from([
                    'price' => $item['cena'],
                    'effectiveDate' => $item['data'],
                ]))
                ->values();
        } catch (RequestException $e) {
            Log::error('NBP API error fetching gold prices', [
                'days' => $days,
                'status' => $e->response->status(),
            ]);

            return collect();
        }
    }

    /**
     * Get gold price for a specific date.
     */
    public function getGoldPriceOnDate(string $date): ?GoldPriceData
    {
        try {
            $response = $this->request()
                ->get(self::BASE_URL."/cenyzlota/{$date}");

            $response->throw();

            $data = $response->json();

            if (empty($data)) {
                return null;
            }

            return GoldPriceData::from([
                'price' => $data[0]['cena'],
                'effectiveDate' => $data[0]['data'],
            ]);
        } catch (RequestException $e) {
            Log::error('NBP API error fetching gold price for date', [
                'date' => $date,
                'status' => $e->response->status(),
            ]);

            return null;
        }
    }

    /**
     * Get current exchange rate for a specific currency.
     */
    public function getCurrentExchangeRate(string $currencyCode, string $tableType = 'A'): ?ExchangeRateData
    {
        $table = strtolower($tableType);
        $code = strtolower($currencyCode);

        try {
            $response = $this->request()
                ->get(self::BASE_URL."/exchangerates/rates/{$table}/{$code}");

            $response->throw();

            $data = $response->json();
            $normalizedResponse = $this->normalizeExchangeRateSeriesResponse($data, $tableType, $currencyCode);
            if (! $normalizedResponse) {
                Log::warning('NBP API returned unexpected exchange rate payload', [
                    'currencyCode' => $currencyCode,
                    'tableType' => $tableType,
                ]);

                return null;
            }

            $rate = $normalizedResponse['rates'][0] ?? null;
            if (! is_array($rate)) {
                return null;
            }

            return ExchangeRateData::from([
                'currencyCode' => $rate['currencyCode'],
                'currencyName' => $rate['currencyName'],
                'rate' => $rate['rate'],
                'effectiveDate' => $rate['effectiveDate'],
                'tableType' => strtoupper($tableType),
            ]);
        } catch (RequestException $e) {
            Log::error('NBP API error fetching exchange rate', [
                'currencyCode' => $currencyCode,
                'tableType' => $tableType,
                'status' => $e->response->status(),
            ]);

            return null;
        }
    }

    /**
     * Get exchange rate for a specific currency on a specific date.
     */
    public function getExchangeRateOnDate(string $currencyCode, string $date, string $tableType = 'A'): ?ExchangeRateData
    {
        $table = strtolower($tableType);
        $code = strtolower($currencyCode);

        try {
            $response = $this->request()
                ->get(self::BASE_URL."/exchangerates/rates/{$table}/{$code}/{$date}");

            $response->throw();

            $data = $response->json();
            $normalizedResponse = $this->normalizeExchangeRateSeriesResponse($data, $tableType, $currencyCode);
            if (! $normalizedResponse) {
                Log::warning('NBP API returned unexpected exchange rate payload', [
                    'currencyCode' => $currencyCode,
                    'tableType' => $tableType,
                    'date' => $date,
                ]);

                return null;
            }

            $rate = $normalizedResponse['rates'][0] ?? null;
            if (! is_array($rate)) {
                return null;
            }

            return ExchangeRateData::from([
                'currencyCode' => $rate['currencyCode'],
                'currencyName' => $rate['currencyName'],
                'rate' => $rate['rate'],
                'effectiveDate' => $rate['effectiveDate'],
                'tableType' => strtoupper($tableType),
            ]);
        } catch (RequestException $e) {
            Log::error('NBP API error fetching exchange rate for date', [
                'currencyCode' => $currencyCode,
                'date' => $date,
                'status' => $e->response->status(),
            ]);

            return null;
        }
    }

    /**
     * Get exchange rates for a currency within a date range.
     * NBP API supports max 93 days per request.
     *
     * @return Collection<int, ExchangeRateData>
     */
    public function getExchangeRatesInRange(string $currencyCode, string $startDate, string $endDate, string $tableType = 'A'): Collection
    {
        $table = strtolower($tableType);
        $code = strtolower($currencyCode);

        try {
            $response = $this->request()
                ->get(self::BASE_URL."/exchangerates/rates/{$table}/{$code}/{$startDate}/{$endDate}");

            $response->throw();

            $data = $response->json();

            $normalizedResponse = $this->normalizeExchangeRateSeriesResponse($data, $tableType, $currencyCode);
            if (! $normalizedResponse) {
                Log::warning('NBP API returned unexpected exchange rate range payload', [
                    'currencyCode' => $currencyCode,
                    'tableType' => $tableType,
                    'startDate' => $startDate,
                    'endDate' => $endDate,
                ]);

                return collect();
            }

            return collect($normalizedResponse['rates'])
                ->map(fn (array $item) => ExchangeRateData::from($item));
        } catch (RequestException $e) {
            Log::error('NBP API error fetching exchange rates for range', [
                'currencyCode' => $currencyCode,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'status' => $e->response->status(),
            ]);

            return collect();
        }
    }

    /**
     * Get gold prices within a date range.
     * NBP API supports max 93 days per request.
     *
     * @return Collection<int, GoldPriceData>
     */
    public function getGoldPricesInRange(string $startDate, string $endDate): Collection
    {
        try {
            $response = $this->request()
                ->get(self::BASE_URL."/cenyzlota/{$startDate}/{$endDate}");

            $response->throw();

            return collect($response->json())
                ->map(fn (array $item) => GoldPriceData::from([
                    'price' => $item['cena'],
                    'effectiveDate' => $item['data'],
                ]))
                ->values();
        } catch (RequestException $e) {
            Log::error('NBP API error fetching gold prices for range', [
                'startDate' => $startDate,
                'endDate' => $endDate,
                'status' => $e->response->status(),
            ]);

            return collect();
        }
    }

    /**
     * Get all available currencies from NBP table A.
     *
     * @return Collection<int, CurrencyData>
     */
    public function getAvailableCurrencies(string $tableType = 'A'): Collection
    {
        $table = strtolower($tableType);

        try {
            $response = $this->request()
                ->get(self::BASE_URL."/exchangerates/tables/{$table}");

            $response->throw();

            $data = $response->json();

            if (empty($data) || empty($data[0]['rates']) || ! is_array($data[0]['rates'])) {
                return collect();
            }

            return collect($data[0]['rates'])
                ->filter(fn ($item) => is_array($item))
                ->map(fn (array $item) => CurrencyData::from([
                    'code' => isset($item['code']) && is_string($item['code']) ? $item['code'] : null,
                    'name' => isset($item['currency']) && is_string($item['currency']) ? $item['currency'] : null,
                    'tableType' => strtoupper($tableType),
                ]))
                ->filter(fn (CurrencyData $item) => $item->code && $item->name)
                ->values();
        } catch (RequestException $e) {
            Log::error('NBP API error fetching currencies', [
                'tableType' => $tableType,
                'status' => $e->response->status(),
            ]);

            return collect();
        }
    }
}
