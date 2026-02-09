<?php

namespace App\Console\Commands;

use App\Models\Currency;
use App\Services\NbpApiService;
use Illuminate\Console\Command;
use Symfony\Component\Console\Command\Command as CommandAlias;

class SyncNbpCurrenciesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nbp:sync-currencies
                            {--table=A : NBP table type (A or B)}
                            {--all : Sync from both tables A and B}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync available currencies from NBP API';

    /**
     * Execute the console command.
     */
    public function handle(NbpApiService $nbpApiService): int
    {
        $this->info('Syncing currencies from NBP API...');

        $tables = $this->option('all') ? ['A', 'B'] : [$this->option('table')];
        $totalSynced = 0;

        foreach ($tables as $tableType) {
            $this->line("Fetching currencies from table {$tableType}...");

            $currencies = $nbpApiService->getAvailableCurrencies($tableType);

            if ($currencies->isEmpty()) {
                $this->warn("No currencies found in table {$tableType} or API error occurred.");

                continue;
            }

            $bar = $this->output->createProgressBar($currencies->count());
            $bar->start();

            foreach ($currencies as $currencyData) {
                Currency::updateOrCreate(
                    ['code' => $currencyData->code],
                    [
                        'name' => $currencyData->name,
                        'table_type' => $currencyData->tableType,
                    ]
                );

                $bar->advance();
                $totalSynced++;
            }

            $bar->finish();
            $this->newLine();
            $this->info("Synced {$currencies->count()} currencies from table {$tableType}.");
        }

        $this->newLine();
        $this->info("Total currencies synced: {$totalSynced}");

        return CommandAlias::SUCCESS;
    }
}
