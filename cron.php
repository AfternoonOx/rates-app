#!/usr/bin/env php
<?php

/**
 * Laravel Scheduler Cron Entry Point
 * 
 * Add this to your server's crontab to run Laravel's scheduler every minute:
 * 
 * * * * * * cd /root/rates && /usr/bin/php cron.php >> /dev/null 2>&1
 * 
 * Or with logging:
 * * * * * * cd /root/rates && /usr/bin/php cron.php >> storage/logs/cron.log 2>&1
 */

define('LARAVEL_START', microtime(true));

// Register the Composer autoloader
require __DIR__.'/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__.'/bootstrap/app.php';

// Get the Artisan kernel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Run the scheduler
$status = $kernel->call('schedule:run');

// Exit with the command status
exit($status);
