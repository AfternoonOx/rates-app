<?php

use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Home Route - Redirect based on authentication state
|--------------------------------------------------------------------------
| Authenticated users are redirected to the dashboard.
| Unauthenticated users are redirected to the login page.
*/
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::get('sitemap.xml', SitemapController::class)->name('sitemap');

Route::post('locale', LocaleController::class)->name('locale.update');

Route::get('dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::get('history', [HistoryController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('history');

/*
|--------------------------------------------------------------------------
| History API Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('history/exchange-rate-trend', [HistoryController::class, 'getExchangeRateTrend'])
        ->name('history.exchange-rate-trend');
    Route::get('history/gold-price-trend', [HistoryController::class, 'getGoldPriceTrend'])
        ->name('history.gold-price-trend');
    Route::get('history/exchange-rate', [HistoryController::class, 'getSingleExchangeRate'])
        ->name('history.exchange-rate');
    Route::get('history/gold-price', [HistoryController::class, 'getSingleGoldPrice'])
        ->name('history.gold-price');
});

/*
|--------------------------------------------------------------------------
| Currency Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    // User's watchlist page
    Route::get('watchlist', [CurrencyController::class, 'userCurrencies'])
        ->name('watchlist');

    // Add currency to watchlist
    Route::post('user/currencies', [CurrencyController::class, 'store'])
        ->name('currencies.store');

    // Remove currency from watchlist
    Route::delete('user/currencies/{code}', [CurrencyController::class, 'destroy'])
        ->name('currencies.destroy');
});

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('settings/profile/password', [ProfileController::class, 'updatePassword'])
        ->middleware('throttle:6,1')
        ->name('profile.password.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

