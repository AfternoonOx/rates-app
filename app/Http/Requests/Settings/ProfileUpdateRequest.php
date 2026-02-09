<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use App\Concerns\TranslatedValidationMessages;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules, TranslatedValidationMessages;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = $this->profileRules($this->user()->id);

        // Add avatar validation rule
        $rules['avatar'] = ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'];

        return $rules;
    }

    public function messages(): array
    {
        return $this->validationMessages();
    }

    public function attributes(): array
    {
        return $this->validationAttributes();
    }
}
