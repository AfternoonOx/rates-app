<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExchangeRate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'currency_code',
        'rate',
        'table_type',
        'effective_date',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rate' => 'decimal:4',
            'effective_date' => 'date',
        ];
    }

    /**
     * Get the currency that this rate belongs to.
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_code', 'code');
    }

    /**
     * Scope a query to only include rates for a specific currency.
     */
    public function scopeForCurrency(Builder $query, string $currencyCode): Builder
    {
        return $query->where('currency_code', $currencyCode);
    }

    /**
     * Scope a query to only include rates for a specific date.
     */
    public function scopeForDate(Builder $query, string $date): Builder
    {
        return $query->where('effective_date', $date);
    }

    /**
     * Scope a query to get the latest rate.
     */
    public function scopeLatestRate(Builder $query): Builder
    {
        return $query->orderByDesc('effective_date');
    }

    /**
     * Scope a query to only include rates within a date range.
     */
    public function scopeInDateRange(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('effective_date', [$startDate, $endDate]);
    }
}
