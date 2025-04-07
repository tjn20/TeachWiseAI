<?php

namespace App\Rules;

use App\Models\File;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Log;

class UploadedCourseMaterial implements ValidationRule
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

        $existingFilesCount = $this->course->files()->count();
        $removedFilesCount = count(request()->input('courseFiles.removedFileIds',[]));
        $addedFilesCount = count(request()->file('courseFiles.files',[]));
        $totalFiles = $existingFilesCount - $removedFilesCount + $addedFilesCount;
        Log::info('files',[
            "existing"=>$existingFilesCount,
            "removedFilesCount"=>$removedFilesCount,
            "added" => $addedFilesCount
        ]);
        if ($totalFiles < 1 || $totalFiles > 7) {
            $fail("You must have between 1 and 7 files.");
        }
    }
}
