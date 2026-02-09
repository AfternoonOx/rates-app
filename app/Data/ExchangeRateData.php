<?php

namespace App\Data;

use Carbon\Carbon;
use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\LaravelData\Data;

class ExchangeRateData extends Data
{
    public function __construct(
        public string $currencyCode,
        public string $currencyName,
        public float $rate,
        #[WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d')]
        public Carbon $effectiveDate,
        public string $tableType = 'A',
        public ?string $tableNo = null,
    ) {}
}
