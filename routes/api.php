<?php

use App\Http\Controllers\ConversationController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth','verified'])->group(function(){
    Route::get('/sanctum/csrf-cookie',function(){
        return response()->noContent();
    });
    
    // Both Roles Routes
    Route::middleware(['role:instructor|student'])->group(function(){
        Route::get('/courses',[CourseController::class,'index']);
        Route::get('/conversations',[CourseController::class,'coursesConversation']);
        Route::get('/conversations/{conversation:id}',[ConversationController::class,'show']);
        Route::post('/conversations/{conversation:id}/messages',[MessageController::class,'store']);
        Route::get('/conversations/{id}/messages',[ConversationController::class,'getMessages']);
        Route::delete('/conversations/{conversation:id}',[ConversationController::class,'destroy']);
        Route::get('/messages/{message:id}/export/pdf',[MessageController::class,'downloadResponse']);
    });
    
    // Instructor Routes 
    Route::middleware('role:instructor')->group(function(){
        Route::post('/courses/create',[CourseController::class,'store']);
        Route::get('/course/{slug}',[CourseController::class,'show']);
        Route::put('/course/{course:id}',[CourseController::class,'update']);
        Route::delete('/courses/{course:id}',[CourseController::class,'destroy']);
    });    
});





require __DIR__.'/auth.php';
