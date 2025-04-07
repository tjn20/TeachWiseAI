<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Mail\CustomVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable,HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'university_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class)
                   /*  ->whereHas('course', function ($query) {
                        $query->whereNull('locked_at');
                    }) */; // to see later
    }



    public function myCourses()
    {
        return $this->hasMany(Course::class)->whereNull('locked_at');
    }


    public function enrolledCourses()
    {
        return $this->belongsToMany(Course::class, 'enrollements')->whereNull('locked_at'); // Ensure the table name is correct
    }
    
    

    public function university()
    {
        return $this->belongsTo(University::class);
    }

  

    /* public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail);
    } */

  
}
