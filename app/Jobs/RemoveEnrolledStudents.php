<?php

namespace App\Jobs;

use App\Events\RemovedFromCourse;
use App\Models\Conversation;
use App\Models\Enrollement;
use App\Models\Message;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

class RemoveEnrolledStudents implements ShouldQueue
{
    use Queueable,Batchable;

    /**
     * Create a new job instance.
     */
    protected $course;
    protected $studentIds;
    public function __construct($course,$studentIds)
    {
        $this->course = $course;
        $this->studentIds = $studentIds;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        DB::transaction(function () {
            foreach ($this->studentIds as $studentId) { 
                $conversation = Conversation::where('user_id', $studentId)
                    ->where('course_id', $this->course->id)
                    ->first(); 
        
                if ($conversation) {
                    $conversation->messages()->delete();
                    $conversation->delete();
                }
    
                Enrollement::where('user_id',$studentId)->delete();
                $this->course->decrement("enrolled_students_count",count($this->studentIds));
            }
        });
}
}