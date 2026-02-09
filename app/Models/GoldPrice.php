<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoldPrice extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'price',
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
            'price' => 'decimal:4',
            'effective_date' => 'date',
        ];
    }

    /**
     * Scope a query to get the last N days of gold prices.
     */
    public function scopeLastDays(Builder $query, int $days = 10): Builder
    {
        return $query->orderByDesc('effective_date')->limit($days);
    }

    /**
     * Scope a query to get prices for a specific date.
     */
    public function scopeForDate(Builder $query, string $date): Builder
    {
        return $query->where('effective_date', $date);
    }

    /**
     * Scope a query to only include prices within a date range.
     */
    public function scopeInDateRange(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('effective_date', [$startDate, $endDate]);
    }
}
