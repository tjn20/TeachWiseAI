<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class StoreCourseRequest extends FormRequest
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
        $MAX_COURSE_FILE_SIZE = 20 * 1024 * 1024;
        $MAX_STUDENT_FILE_SIZE = 7 * 1024 * 1024;

        $user = Auth::user();
        $slug = Str::slug($this->input('title'));
        

        return [
            'title' => [
                'required',
                'max:30',
                'min:5',
                'regex:/^[A-Za-z0-9-&]+(\s[A-Za-z0-9-&]+)*$/',
                Rule::unique('courses', 'title')
                    ->where('user_id', $user->id)
                    ->where('locked_at')
                    ->where(fn($query) => $query->where('slug', $slug))
            ],
            'description'=>"nullable|string|min:10|max:255",
            'courseFiles'=> "required|array|min:1|max:7",
            'courseFiles.*'=>["file","mimes:pdf","max:{$MAX_COURSE_FILE_SIZE}"],
            "students"=>'required|array',
            "students.file" => ["nullable","sometimes","required_without:students.studentsId","file", "mimes:csv,txt", "max:{$MAX_STUDENT_FILE_SIZE}"],
            "students.studentsId" => ["sometimes", "array", "min:1", "required_without:students.file"],
            "students.studentsId.*"=>"numeric|digits_between:7,12"
        ]; 
    }


    public function messages(): array
    {
        return 
        [
            'title.unique'=>"You already have a course with this name.",
        ];        
    }
}
