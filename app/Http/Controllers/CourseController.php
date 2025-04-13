<?php

namespace App\Http\Controllers;

use App\Events\AddedToCourse;
use App\Events\CourseCreated;
use App\Events\CourseEdited;
use App\Events\CourseLocked;
use App\Events\CourseOperationFailed;
use App\Events\RemovedFromCourse;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Http\Resources\CourseDetailResource;
use App\Http\Resources\CourseResource;
use App\Imports\StudentsEnrollmentImport;
use App\Jobs\CleanUpFailedUploadedMaterial;
use App\Jobs\DeleteCourseMaterial;
use App\Jobs\ImportStudents;
use App\Jobs\ImportStudentsFromCSV;
use App\Jobs\RemoveCourseMaterial;
use App\Jobs\RemoveEnrolledStudents;
use App\Jobs\RemoveWaitlistedStudents;
use App\Jobs\UploadCourseMaterial;
use App\Models\Course;
use App\Models\File;
use Faker\Provider\Uuid;
use Illuminate\Bus\Batch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;
use Throwable;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $courses = null;
        if($user->hasRole('instructor'))
            $courses = $user->myCourses()->orderByDesc('updated_at')->get();
        else if($user->hasRole('student'))
            $courses = $user->enrolledCourses()->orderByDesc('updated_at')->get();

        return CourseResource::collection($courses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseRequest $request)
    {
            $data = $request->validated();
            $instructor = $request->user();
        
            $course = Course::create([
                'title' => $data['title'],
                'description' => $data['description'],
                'user_id' => $instructor->id,
                'locked_at'=>now()
            ]);
        
            $instructor->conversations()->create([
                'course_id' => $course->id,
                'user_id' => $instructor->id
            ]);
        
            $courseMaterialFiles = [];
            if ($request->hasFile('courseFiles')) {
                $directory = 'materials/' . Str::uuid();
                Storage::disk('local')->makeDirectory($directory);
        
                foreach ($request->file('courseFiles') as $file) {
                    $path = $file->store($directory, 'local');
        
                    $fileRecord = File::create([
                        'name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'mime' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'course_id' => $course->id
                    ]);
                    $courseMaterialFiles[] = $fileRecord;
                }
            }

       $batchJobs = [new UploadCourseMaterial($course, $courseMaterialFiles)];
        if (!empty($data['students']['studentsId'])) {
            $batchJobs[] = new ImportStudents($instructor, $course, $data['students']['studentsId']);
        }
        
        if ($request->hasFile('students.file')) {
            $filePath = $request->file('students.file')->store('temp_files','local');
            $batchJobs[] = new ImportStudentsFromCSV($course, $instructor, $filePath);
        }

        Bus::batch($batchJobs)
            ->then(function (Batch $batch) use ($course) {
                if ($batch->finished()) { 
                    $course->update([
                        'updated_at' => now(),
                        'locked_at' => null
                    ]);
                    Event::dispatch(new CourseCreated("hi", $course));
                } 
            })
            ->catch(function (Batch $batch, Throwable $e) use ($course) {
                $batch->cancel(); 
                broadcast(new CourseOperationFailed(
                    "The course '{$course->title}' could not be created. Please try again later.",
                    $course->user_id
                ));
            })
            ->dispatch();

            return response()->json([
                'message' => "course is being created! You'll be notified once it's ready.",
                'course_title' => $course->title,
            ], 202);
                
        
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request,string $slug)
    {
        $user = $request->user();
        $course = Course::with(['waitlisted_students', 'enrolled_students', 'files'])
            ->where('slug', $slug)
            ->whereNull('locked_at')
            ->where('user_id',$user->id)
            ->firstOrFail();

        $this->authorize('viewCourse', $course);

    return new CourseDetailResource($course);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseRequest $request, Course $course)
    {
        $this->authorize('editCourse',$course);
        $data = $request->validated();
        $instructor = $course->instructor;
        
        $batchJobs = [];
        $courseMaterialFiles = [];
        if(isset($request['courseFiles']))
        {
            if($request->hasFile('courseFiles.files'))    
            {
                $directory =  File::where('course_id',$course->id)->first();
                preg_match('/^([^\/]+\/[^\/]+)/', $directory->path, $matches);
                $directory = $matches[1];

                foreach ($request->file('courseFiles.files') as $file) {
                    $path = $file->store($directory, 'local');
        
                    $fileRecord = File::create([
                        'name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'mime' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'course_id' => $course->id
                    ]);
                    $courseMaterialFiles [] = $fileRecord;
                    }
                    $batchJobs[] = new UploadCourseMaterial($course, $courseMaterialFiles);
            }
            }
        
        if(!empty($data['courseFiles']['removedFileIds']))
            {
                $batchJobs[] = new RemoveCourseMaterial($course,$data['courseFiles']['removedFileIds']);
            }

        
        $existingStudents = $course->enrolled_students()->pluck('user_id')->toArray();
        $removedStudents = [];
        if (!empty($data['students']['studentsId'])) 
        {

            $batchJobs[] = new ImportStudents($instructor, $course, $data['students']['studentsId']);
        }
        
        if ($request->hasFile('students.file')) 
        {
            $filePath = $request->file('students.file')->store('temp_files','local');
            $batchJobs[] = new ImportStudentsFromCSV($course, $instructor, $filePath);
        }

        if(!empty($data['students']['removedEnrolledStudentIds']))
        {
            $removedStudents = $data['students']['removedEnrolledStudentIds'];
            $batchJobs[] = new RemoveEnrolledStudents($course,$data['students']['removedEnrolledStudentIds']);
        }

        if(!empty($data['students']['removedWaitlistedStudentIds']))
        {
            $batchJobs[] = new RemoveWaitlistedStudents($course,$data['students']['removedWaitlistedStudentIds']);
        }
        if(!empty($batchJobs))
        {
        $courseTitle = $data['title'];
        $courseDescription = $data['description'];
        $course->update([
            'locked_at'=>now()
        ]);
        broadcast(new CourseLocked("course will be available again shortly!",$course));
        Bus::batch($batchJobs)
            ->catch(function (Batch $batch, Throwable $e) use ($course,$courseMaterialFiles) {
                $uploadedFilesId = array_map(fn($file) => $file->id, $courseMaterialFiles);
                dispatch(new RemoveCourseMaterial($course,$uploadedFilesId));
            })
            ->finally(function(Batch $batch) use ($course,$courseTitle,$courseDescription,$removedStudents,$existingStudents) {
                $course->update([
                    'title'=>$courseTitle,
                    'description' =>$courseDescription,
                    'updated_at' => now(),
                    'locked_at' =>null
                ]);
                if(!empty($removedStudents))
                {
                    Event::dispatch(new RemovedFromCourse($course,$removedStudents));
                    $remainingStudents = array_diff($existingStudents,$removedStudents);
                    Event::dispatch(new CourseEdited($course,$remainingStudents));
                }
                else
                {
                    Event::dispatch(new CourseEdited($course,$existingStudents));
                }
                $addedStudents = array_diff($course->enrolled_students()->pluck('user_id')->toArray(),$existingStudents);
                if($addedStudents)
                    Event::dispatch(new AddedToCourse("hi",$course,$addedStudents));
            })
            ->dispatch();

            return response()->json([
                'message' => "course is currently being edited. You'll be notified as soon as it's ready!",
                'course_title' => $course->title
            ], 202);
        }
        else
        {
            $course->update([
                'title'=>$data['title'],
                'description' =>$data['description'],
                'updated_at' => now(),
            ]);

            return response()->json([
                'message' => "course has been successfully edited!",
                'course_title' => $course->title
            ], 202);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        $this->authorize('deleteCourse',$course);
        $course->update([
            'locked_at'=>now()
        ]);
        broadcast(new CourseLocked("Course has been deleted!",$course));
        $batchJobs = [
            new RemoveEnrolledStudents($course,$course->enrolled_students),
            new RemoveWaitlistedStudents($course,$course->waitlisted_students),
            new DeleteCourseMaterial($course) 
        ];

        Bus::batch($batchJobs)
            ->then(function (Batch $batch) use ($course) {
                if ($batch->finished()) { 
                    $course->delete();
                }    
            })
            ->dispatch();
         
        return response()->json([
            'message' => "course has been deleted!",
            'course_title' => $course->title
        ],200);    

    }

   
    public function coursesConversation(Request $request)
    {
        $user = $request->user();
        $courses = null;
        if($user->hasRole('instructor'))
            $courses = $user->myCourses;
        else if($user->hasRole('student'))
            $courses = $user->enrolledCourses;

        return CourseResource::collection($courses);
    }
}
