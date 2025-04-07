<?php

namespace App\Jobs;

use App\Models\WaitlistedStudent;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class RemoveWaitlistedStudents implements ShouldQueue
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
                WaitlistedStudent::destroy($this->studentIds);
                $this->course->decrement("waitlisted_students_count",count($this->studentIds));
            });   
            
        
    }
}
