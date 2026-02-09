<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'table_type',
    ];

    /**
     * Get the users that are following this currency.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_currencies', 'currency_code', 'user_id', 'code', 'id')
            ->withTimestamps();
    }

    /**
     * Get the exchange rates for this currency.
     */
    public function exchangeRates(): HasMany
    {
        return $this->hasMany(ExchangeRate::class, 'currency_code', 'code');
    }

    /**
     * Get the latest exchange rate for this currency.
     */
    public function latestRate(): ?ExchangeRate
    {
        return $this->exchangeRates()->latest('effective_date')->first();
    }
}
