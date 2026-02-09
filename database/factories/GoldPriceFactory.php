<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GoldPrice>
 */
class GoldPriceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'price' => fake()->randomFloat(4, 200.0, 350.0),
            'effective_date' => fake()->unique()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
