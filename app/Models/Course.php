<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Laravel\Pail\Files;

class Course extends Model
{
    protected $fillable = [
        'title',
        'description',
        'user_id',
        'enrolled_students_count',
        'waitlisted_students_count',
        'locked_at'
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
           $model->slug = Str::slug($model->title);
        });

        static::updating(function ($model) {
            if($model->isDirty('title'))      // laravel keeps track of original instance values as soon as we change any value
                $model->slug = Str::slug($model->title);
         });
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function userConversation($userId) //change name later
    {
        return $this->hasOne(Conversation::class)->where('user_id',$userId);
    }
    
    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function enrolled_students()
    {
        return $this->belongsToMany(User::class,'enrollements'); //fix name later
    }

    public function waitlisted_students()
    {
        return $this->hasMany(WaitlistedStudent::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class,'user_id');
    }
} 
