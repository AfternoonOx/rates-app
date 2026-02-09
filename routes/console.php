<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule daily tasks
Schedule::command('nbp:sync-currencies --all')
    ->dailyAt('06:00')
    ->onOneServer()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('nbp:cache-rates')
    ->dailyAt('06:15')
    ->onOneServer()
    ->withoutOverlapping()
    ->runInBackground();
