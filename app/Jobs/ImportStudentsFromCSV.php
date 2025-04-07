<?php

namespace App\Jobs;

use App\Events\CourseOperationFailed;
use App\Imports\StudentsEnrollmentImport;
use Exception;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class ImportStudentsFromCSV implements ShouldQueue
{
    use Queueable,Batchable;

    public $course;
    public $instructor;
    public $filePath;

    public function __construct($course, $instructor, $filePath)
    {
        $this->course = $course;
        $this->instructor = $instructor;
        $this->filePath = $filePath;
    }

    public function handle()
    {
        try {
            Excel::import(new StudentsEnrollmentImport($this->course, $this->instructor), $this->filePath);

        } catch (Exception $e) {
            Event::dispatch(new CourseOperationFailed("Something went wrong while importing students. Please try again later.",$this->instructor->id));
        } finally {
            Storage::disk('local')->delete($this->filePath);
        }
    }
}
