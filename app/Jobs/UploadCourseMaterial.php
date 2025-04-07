<?php

namespace App\Jobs;

use App\Events\CourseOperationFailed;
use Exception;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UploadCourseMaterial implements ShouldQueue
{
    use Queueable,Batchable;


    /**
     * Create a new job instance.
     */
    public function __construct(public $course,public $files)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // add try catch
        try
        {
            $response = Http::timeout(0)->post('http://127.0.0.1:5000/api/course/create', [
                'course' =>'course_' . $this->course->id . '_materials',
                'files'=>$this->files
            ]);

            if(!$response->successful())
            {
                throw new Exception("Failed to upload course materials for {$this->course->title}");
            }
        }
        catch(\Exception $e)
        {
            Event::dispatch(new CourseOperationFailed("Something went wrong while Uploading {$this->course->title} material. Please try again later.",$this->course->user_id));
            $this->fail($e);
        }
        
    }

  
}
