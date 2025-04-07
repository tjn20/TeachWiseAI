<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CourseLocked implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    protected $message;
    protected $course;
    protected $studentIds;
    private $broadcastingUserId;
    public function __construct($message,$course)
    {
        $this->message = $message;
        $this->course = $course->load('enrolled_students'); 
        $this->studentIds = $this->course->enrolled_students->pluck('id');
    }

    public function broadcastWith()
    {
        return ['course'=>[
            'id'=>$this->course->id,
            'title'=>$this->course->title,
            
        ],
        'message'=>$this->message
            ];
    }
    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];

      //  $instructorId = $this->course->user_id; // Make Instructor message Later
      //  $this->broadcastingUserId = $instructorId;
      //  $channels[] = new PrivateChannel("course.locked.instructor.{$instructorId}");

        foreach ($this->studentIds as $studentId) {
            $this->broadcastingUserId = $studentId;
            $channels[] = new PrivateChannel("course.locked.student.{$studentId}");
        }

        return $channels;
    }
}
