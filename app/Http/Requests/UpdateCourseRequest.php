<?php

namespace App\Http\Requests;

use App\Rules\StudentRemoval;
use App\Rules\UploadedCourseMaterial;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateCourseRequest extends FormRequest
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
        $course = $this->route('course');
        return [
            'title' => [
                'required',
                'max:40',
                'min:5',
                'regex:/^[A-Za-z0-9-&]+(\s[A-Za-z0-9-&]+)*$/',
                Rule::unique('courses', 'title')
                ->where('user_id', $user->id)
                ->whereNot('id', $course->id)
                ->whereNull('locked_at')
                ->where('slug', $slug)
            ],
            'description'=>"nullable|string|min:10|max:255",
            'courseFiles'=> ["sometimes","array",new UploadedCourseMaterial($course)],
            "courseFiles.files" => ["sometimes","array"],
            'courseFiles.files.*'=>["file","mimes:pdf","max:{$MAX_COURSE_FILE_SIZE}"],
            "courseFiles.removedFileIds"=> "sometimes|array",
            "courseFiles.removedFileIds.*"=>["integer",Rule::exists('files','id')->where('course_id',$course->id)],
            "students"=>['sometimes','array',new StudentRemoval($course)],
            "students.file" => ["nullable","sometimes","file", "mimes:csv,txt", "max:{$MAX_STUDENT_FILE_SIZE}"],
            "students.studentsId" => ["sometimes", "array"],
            "students.studentsId.*"=>"integer|min:7|max:",
            "students.removedEnrolledStudentIds"=> "sometimes|array",
            "students.removedEnrolledStudentIds.*"=>['integer',Rule::exists('enrollements','user_id')->where('course_id',$course->id)],
            "students.removedWaitlistedStudentIds"=> "sometimes|array",
            "students.removedWaitlistedStudentIds.*"=>["integer",Rule::exists('waitlisted_students','id')->where('course_id',$course->id)],
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
