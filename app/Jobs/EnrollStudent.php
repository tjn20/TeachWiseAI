<?php

namespace App\Jobs;

use App\Events\AddedToCourse;
use App\Models\Course;
use App\Models\Enrollement;
use App\Models\WaitlistedStudent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;

class EnrollStudent implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    protected $student;
    public function __construct($student)
    {
        $this->student = $student;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $courses = Course::join('waitlisted_students','courses.id','=','waitlisted_students.course_id')
            ->where('waitlisted_students.student_email',$this->student->email)
            ->select('courses.*')
            ->get();
        foreach($courses as $course)
        {
            Enrollement::create([
                'user_id'=>$this->student->id,
                'course_id'=>$course->id
            ]);            
            $this->student->conversations()->create([
                'course_id' => $course->id,
                'user_id' => $this->student->id
            ]);
            $course->decrement('waitlisted_students_count');
            $course->increment('enrolled_students_count');

            WaitlistedStudent::where('student_email',$this->student->email)
            ->where('course_id',$course->id)
            ->delete();

            Event::dispatch(new AddedToCourse("",$course,[$this->student->id]));  // to make addToCourse better
        }
    }
}
