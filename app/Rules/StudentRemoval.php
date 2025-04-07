<?php

namespace App\Rules;

use App\Models\Course;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Log;

class StudentRemoval implements ValidationRule
{
    protected $course;
    public function __construct($course)
    {
        $this->course = $course;
    }
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {        
        $removedEnrolledStudents = count(request()->input('students.removedEnrolledStudentIds', []));
        $removedWaitlistedStudents = count(request()->input('students.removedWaitlistedStudentIds', []));
        $totalCourseStudents = $this->course->enrolled_students_count + $this->course->waitlisted_students_count;
        $totalRemovedStudents = $removedWaitlistedStudents + $removedEnrolledStudents;
        if($totalCourseStudents === $totalRemovedStudents)
        {
            if(!request()->hasFile('students.file') && empty(request()->input('students.studentsId',[])))
            {
                $fail("You must upload either a file or provide student IDs when all students are removed.");
            }
        }
    }
}
