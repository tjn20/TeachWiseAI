<?php

use App\Http\Controllers\MessageController;
use App\Models\Course;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::get('/hi',function(){
    $courses = Course::join('waitlisted_students','courses.id','=','waitlisted_students.course_id')
    ->where('waitlisted_students.student_email',"12341234@aau.ac.ae")
    ->select('courses.*')
    ->get();
    return $courses;
});

Route::get('/message/{message:id}',[MessageController::class,"download_message"]);


require __DIR__.'/auth.php';
