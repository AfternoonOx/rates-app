<?php

namespace App\Http\Responses;

use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\LockoutResponse as LockoutResponseContract;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\LoginRateLimiter;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;

class LockoutResponse implements LockoutResponseContract
{
    protected LoginRateLimiter $limiter;

    public function __construct(LoginRateLimiter $limiter)
    {
        $this->limiter = $limiter;
    }

    public function toResponse($request): int|ResponseAlias
    {
        return with($this->limiter->availableIn($request), function ($seconds) {
            throw ValidationException::withMessages([
                Fortify::username() => [
                    trans('app.auth.throttle', [
                        'seconds' => $seconds,
                        'minutes' => ceil($seconds / 60),
                    ]),
                ],
            ])->status(ResponseAlias::HTTP_TOO_MANY_REQUESTS);
        });
    }
}
