<?php

namespace App\Http\Requests;

use App\Models\Currency;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCurrencyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'currency_code' => [
                'required',
                'string',
                'size:3',
                Rule::exists(Currency::class, 'code'),
                Rule::unique('user_currencies', 'currency_code')
                    ->where('user_id', $this->user()->id),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'currency_code.required' => __('validation.required', ['attribute' => __('app.currency_code')]),
            'currency_code.exists' => __('app.the_selected_currency_is_not_available'),
            'currency_code.unique' => __('app.you_are_already_following_this_currency'),
        ];
    }
}
