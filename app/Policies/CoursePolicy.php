<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    /**
     * Create a new policy instance.
     */
    
    public function viewCourse(User $user,Course $course)
    {
        return $course->user_id === $user->id;
    }

    public function deleteCourse(User $user,Course $course)
    {
        return $course->user_id === $user->id;
    }

    public function editCourse(User $user, Course $course)
    {
        return $course->user_id === $user->id && $course->locked_at === null;
    }
}
