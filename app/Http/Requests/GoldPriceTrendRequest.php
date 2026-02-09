<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class GoldPriceTrendRequest extends FormRequest
{
    private const int MAX_RANGE_DAYS = 93;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'from' => [
                'required',
                'date',
                'date_format:Y-m-d',
                'before_or_equal:today',
                'after:2002-01-01',
            ],
            'to' => [
                'required',
                'date',
                'date_format:Y-m-d',
                'before_or_equal:today',
                'after_or_equal:from',
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->hasAny(['from', 'to'])) {
                return;
            }

            $from = Carbon::parse($this->input('from'))->startOfDay();
            $to = Carbon::parse($this->input('to'))->startOfDay();
            $rangeDays = $from->diffInDays($to) + 1;

            if ($rangeDays > self::MAX_RANGE_DAYS) {
                $validator->errors()->add('to', __('app.date_range_too_large'));
            }
        });
    }
}
