<?php

namespace App\Events;

use App\Http\Resources\CourseResource;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CourseCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    protected $message;
    protected $studentIds;
    protected $course;
    private $broadcastingUserId;
    public function __construct($message,$course)
    {
        $this->message = $message;
        $this->course = $course->load('enrolled_students'); 
        $this->studentIds = $this->course->enrolled_students->pluck('id')->toArray();

    }

    public function broadcastWith()
    {
        return ['course'=> new CourseResource($this->course,$this->broadcastingUserId)];
    }


    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];

        $instructorId = $this->course->user_id;
        $this->broadcastingUserId = $instructorId;
        $channels[] = new PrivateChannel("course.created.instructor.{$instructorId}");

        foreach ($this->studentIds as $studentId) {
            $this->broadcastingUserId = $studentId;
            $channels[] = new PrivateChannel("course.created.student.{$studentId}");
        }

        return $channels;
    }
}
