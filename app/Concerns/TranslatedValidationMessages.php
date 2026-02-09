<?php

namespace App\Concerns;

trait TranslatedValidationMessages
{
    protected function validationMessages(): array
    {
        return [
            'required' => trans('app.validation.required'),
            'string' => trans('app.validation.string'),
            'email' => trans('app.validation.email'),
            'unique' => trans('app.validation.unique'),
            'alpha_dash' => trans('app.validation.alpha_dash'),
            'confirmed' => trans('app.validation.confirmed'),
            'current_password' => trans('app.validation.current_password'),

            'min.string' => trans('app.validation.min.string'),
            'max.string' => trans('app.validation.max.string'),

            'password.letters' => trans('app.validation.password.letters'),
            'password.mixed' => trans('app.validation.password.mixed'),
            'password.numbers' => trans('app.validation.password.numbers'),
            'password.symbols' => trans('app.validation.password.symbols'),
            'password.uncompromised' => trans('app.validation.password.uncompromised'),

            'image' => trans('app.validation.image'),
            'mimes' => trans('app.validation.mimes'),
            'max.file' => trans('app.validation.max.file'),
        ];
    }

    protected function validationAttributes(): array
    {
        return [
            'avatar' => trans('app.change_avatar'),
            'current_password' => trans('app.current_password'),
            'email' => trans('app.email_address'),
            'first_name' => trans('app.first_name'),
            'last_name' => trans('app.last_name'),
            'nickname' => trans('app.nickname'),
            'password' => trans('app.password'),
            'password_confirmation' => trans('app.password_confirmation'),
        ];
    }
}
