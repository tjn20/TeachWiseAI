<?php

namespace App\Jobs;

use App\Events\CourseOperationFailed;
use App\Models\Enrollement;
use App\Models\User;
use App\Models\WaitlistedStudent;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;

class ImportStudents implements ShouldQueue
{
    use Queueable,Batchable;

    /**
     * Create a new job instance.
     */
    public function __construct(public $instructor,public $course,public $studentsId)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
    try {
        $instructorUniversity = $this->instructor->university;
        
        foreach ($this->studentsId as $studentId) {
            $studentEmail = $studentId . '@' . $instructorUniversity->domain;
            $student = User::where('email', $studentEmail)->first();
    
            
            $student = User::where('email', $studentEmail)->first();
        if ($student) {
            DB::transaction(function () use ($student) {
                $alreadyEnrolled = Enrollement::where('user_id',$student->id)->where('course_id',$this->course->id)->exists();
                if (!$alreadyEnrolled) {
                    $student->enrolledCourses()->attach($this->course->id);
        
                    $student->conversations()->create([
                        'course_id' => $this->course->id,
                        'user_id' => $student->id
                    ]);
        
                    $this->course->increment('enrolled_students_count');
                }
            });
        } else {
                $waitlistedStudent = WaitlistedStudent::updateOrCreate(
                    ['course_id' => $this->course->id, 'student_email' => $studentEmail],
                    ['updated_at' => now()]
                );
                
                if ($waitlistedStudent->wasRecentlyCreated) {
                    $this->course->increment('waitlisted_students_count');
                }
                
            }
        }
    } catch (\Exception $e) {
        Event::dispatch(new CourseOperationFailed("Something went wrong while importing students. Please try again later.",$this->instructor->id));
    }
    }

}
