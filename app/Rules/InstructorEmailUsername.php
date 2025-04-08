<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class InstructorEmailUsername implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $username = substr($value, 0, strpos($value, '@'));

        $pattern = '/^[A-Za-z.]+$/';
        if(!preg_match($pattern,$username))
        $fail('The :attribute may contain only letters and periods.');
    }
}
