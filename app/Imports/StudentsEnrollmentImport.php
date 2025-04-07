<?php

namespace App\Imports;

use App\Models\Enrollement;
use App\Models\User;
use App\Models\WaitlistedStudent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\ImportFailed;
class StudentsEnrollmentImport implements ToCollection,WithHeadingRow,WithChunkReading
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    private $course,$instructor;
    public function __construct($course,$instructor)
    {
        $this->course = $course;
        $this->instructor = $instructor;
    }

    public function collection(Collection $rows)
    {
        $instructorUniversity = $this->instructor->university;
    
    foreach ($rows as $row) {
        if ($row instanceof \Illuminate\Support\Collection) {
            $row = $row->toArray();
        }

        if (!isset($row['id'])) {
            continue;
        }
        $data = Validator::make( // to make better
            $row, 
            [
                'id' => 'required|min:7|numeric'
            ]
        )->validate();

        $studentEmail = $data['id'] . '@' . $instructorUniversity->domain;

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
    }

    public function chunkSize(): int
    {
        return 100;
    }

    
}
