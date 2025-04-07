<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollement extends Model
{
    protected $fillable = [
        'user_id',
        'course_id'
    ];
}
