<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaitlistedStudent extends Model
{
    protected $fillable = [
        'course_id',
        'student_email'
    ];
}
