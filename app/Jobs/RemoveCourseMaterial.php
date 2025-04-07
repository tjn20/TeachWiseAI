<?php

namespace App\Jobs;

use App\Events\CourseOperationFailed;
use App\Models\File;
use Exception;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class RemoveCourseMaterial implements ShouldQueue
{
    use Queueable,Batchable;

    /**
     * Create a new job instance.
     */
    protected $course;
    protected $removedFileIds;
    public function __construct($course,$removedFileIds)
    {
        $this->course = $course;
        $this->removedFileIds = $removedFileIds;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try
        {
            

            $response = Http::timeout(0)->delete("http://127.0.0.1:5000/api/course/{$this->course->id}/material", [
                'files'=>array_map('intval', $this->removedFileIds)
            ]);
            
            if($response->successful())
            {
                foreach($this->removedFileIds as $removedFileId)
                {
                    $file = File::find($removedFileId);
                    Storage::disk('local')->delete($file->path);
                    $file->delete();
                }  
            }
            else
            {
                throw new Exception("Something Went Wrong!");

            }
        }
        catch (\Exception $e) {
            Event::dispatch(new CourseOperationFailed("Something went wrong while removing {$this->course->title} material. Please try again later.",$this->course->user_id));

        }
    }
}
