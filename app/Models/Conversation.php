<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Conversation extends Model
{
    protected $keyType = 'string'; 
    public $incrementing = false; 

    protected $fillable = [
        'user_id',
        'course_id'
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = Str::uuid(); 
            }
        });
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
    
    public function course()
    {
        return $this->belongsTo(Course::class);
    }


}
