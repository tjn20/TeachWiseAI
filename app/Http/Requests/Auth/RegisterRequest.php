<?php

namespace App\Http\Requests\Auth;

use App\Rules\EmailDomain;
use App\Rules\EmailUsername;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name'=>'required|string|max:30|min:2|alpha',
            'last_name'=>'required|string|max:30|min:2|alpha',
            'email'=>['required','email','unique:users,email', new EmailDomain()],
            'role'=>'required|string|in:student,instructor',
            'password'=>[
                'required',
                Password::min(8)
                ->mixedCase()->numbers()->symbols()
            ]
        ];
    }

    public function withValidator($validator)
    {
        $validator->sometimes('email',new EmailUsername(),function($input){
            return $input->role == 'student';
        });
    }
}

