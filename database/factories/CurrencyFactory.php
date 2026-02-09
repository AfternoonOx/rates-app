<?php

namespace Database\Factories;

use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Currency>
 */
class CurrencyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('???')),
            'name' => fake()->country().' '.fake()->randomElement(['Dollar', 'Euro', 'Pound', 'Yen', 'Franc']),
            'table_type' => 'A',
        ];
    }

    /**
     * Indicate that the currency is from table B.
     */
    public function tableB(): static
    {
        return $this->state(fn (array $attributes) => [
            'table_type' => 'B',
        ]);
    }
}
