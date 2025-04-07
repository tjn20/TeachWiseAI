<?php

namespace App\Jobs;

use App\Models\File;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class DeleteCourseMaterial implements ShouldQueue
{
    use Queueable,Batchable;

    /**
     * Create a new job instance.
     */
    protected $course;
    public function __construct($course)
    {
        $this->course = $course;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try
        {
            

            $response = Http::timeout(0)->delete("http://127.0.0.1:5000/api/course/{$this->course->id}", [
            ]);
            
            if($response->successful())
            {
                foreach($this->course->files as $removedFileId)
                {
                    $file = File::find($removedFileId);
                    Storage::disk('local')->delete($file->path);
                    $file->delete();
                }   
            }
        }
        catch (\Exception $e) {

        }
    }
}
