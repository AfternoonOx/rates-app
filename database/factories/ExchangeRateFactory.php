<?php

namespace Database\Factories;

use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExchangeRate>
 */
class ExchangeRateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'currency_code' => Currency::factory(),
            'rate' => fake()->randomFloat(4, 0.5, 10.0),
            'table_type' => 'A',
            'effective_date' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }

    /**
     * Set a specific currency code.
     */
    public function forCurrency(string $code): static
    {
        return $this->state(fn (array $attributes) => [
            'currency_code' => $code,
        ]);
    }
}
