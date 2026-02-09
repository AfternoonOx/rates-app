<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class CurrencyData extends Data
{
    public function __construct(
        public string $code,
        public string $name,
        public string $tableType = 'A',
    ) {}
}
