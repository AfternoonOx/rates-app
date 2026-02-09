<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SingleExchangeRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'currency' => ['required', 'string', 'size:3'],
            'date' => [
                'required',
                'date',
                'date_format:Y-m-d',
                'before_or_equal:today',
                'after:2002-01-01',
            ],
        ];
    }
}
