<?php

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;


// add policies to them later
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversations.{conversationId}', function (User $user, $conversationId) {
   $authUser = Auth::user();
   return $authUser->conversations->contains('id',$conversationId); 
});

// Instructor Channels
Broadcast::channel('course.created.instructor.{id}',function (User $user,$id){
    return (int) $user->id === (int) $id;
});

Broadcast::channel('course-operation-failure.instructor.{id}',function (User $user,$id){
    return (int) $user->id === (int) $id;
});


Broadcast::channel('course.edited.instructor.{id}',function (User $user,$id){
    return (int) $user->id === (int) $id;
});
Broadcast::channel('course.locked.instructor.{id}',function (User $user,$id){
    return (int) $user->id === (int) $id;
});

// Student Channels
Broadcast::channel('course.created.student.{id}',function (User $user,$id){
    return (int) $user->id === (int) $id;
});

Broadcast::channel('course.edited.student.{id}',function (User $user,$id){
    return (int) $user->id === (int) $id;
});

Broadcast::channel('course.locked.student.{id}',function (User $user,$id){
    return (int) $user->id === (int) $id;
});
Broadcast::channel('course.removed.student.{id}',function (User $user,$id){
    return (int) $user->id === (int) $id;
});
Broadcast::channel('course.added.student.{id}',function (User $user,$id){
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversations-message-failed.{conversationId}',function(User $user,$conversationId){
    return $user->conversations()->where('id', $conversationId)->exists();
});