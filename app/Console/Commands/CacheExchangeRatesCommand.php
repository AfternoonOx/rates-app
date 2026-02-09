<?php

namespace App\Console\Commands;

use App\Models\Currency;
use App\Models\ExchangeRate;
use App\Services\NbpApiService;
use Illuminate\Console\Command;
use Symfony\Component\Console\Command\Command as CommandAlias;

class CacheExchangeRatesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nbp:cache-rates
                            {--currency= : Specific currency code to cache}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cache current exchange rates from NBP API';

    /**
     * Execute the console command.
     */
    public function handle(NbpApiService $nbpApiService): int
    {
        $this->info('Caching exchange rates from NBP API...');

        $currencyCode = $this->option('currency');

        if ($currencyCode) {
            $currencies = Currency::where('code', strtoupper($currencyCode))->get();

            if ($currencies->isEmpty()) {
                $this->error("Currency {$currencyCode} not found in database.");
                $this->line('Run "php artisan nbp:sync-currencies" first to populate currencies.');

                return CommandAlias::FAILURE;
            }
        } else {
            $currencies = Currency::all();
        }

        if ($currencies->isEmpty()) {
            $this->warn('No currencies found in database.');
            $this->line('Run "php artisan nbp:sync-currencies" first to populate currencies.');

            return CommandAlias::FAILURE;
        }

        $bar = $this->output->createProgressBar($currencies->count());
        $bar->start();

        $cached = 0;
        $failed = 0;

        foreach ($currencies as $currency) {
            $rate = $nbpApiService->getCurrentExchangeRate(
                $currency->code,
                $currency->table_type
            );

            if ($rate) {
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
                $cached++;
            } else {
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Cached {$cached} exchange rates.");

        if ($failed > 0) {
            $this->warn("Failed to fetch {$failed} rates (API errors or unavailable).");
        }

        return CommandAlias::SUCCESS;
    }
}
