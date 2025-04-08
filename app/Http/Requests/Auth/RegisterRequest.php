<?php

namespace App\Http\Requests\Auth;

use App\Rules\EmailDomain;
use App\Rules\InstructorEmailUsername;
use App\Rules\StudentEmailUsername;
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
        $validator->sometimes('email', $this->roleBasedEmailRule(), fn($input) => $input->role);
    }

    private function roleBasedEmailRule()
    {
        return match(request()->role) {
            'student'    => new StudentEmailUsername(),
            'instructor' => new InstructorEmailUsername(),
            default      => null,
        };
    }

}

