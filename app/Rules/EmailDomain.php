<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;

class EmailDomain implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $emailDomain = substr(strrchr($value,"@"),1);

        $domainExists = DB::table('universities')->where('domain',$emailDomain)->exists();

        if(!$domainExists)
        $fail('The :attribute domain is not allowed');
    }
}
