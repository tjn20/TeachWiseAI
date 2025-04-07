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

class AddedToCourse implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    protected $message;
    protected $studentIds;
    protected $course;
    private $broadcastingUserId;
    public function __construct($message,$course,$studentIds)
    {
        $this->message = $message;
        $this->course = $course; 
        $this->studentIds = $studentIds;

    }

    public function broadcastWith()
    {
        return ['course'=> new CourseResource($this->course,$this->broadcastingUserId),
                'message'=> "You have been adeded to {$this->course->title} course."
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
        foreach ($this->studentIds as $studentId) {
            $this->broadcastingUserId = $studentId;
            $channels[] = new PrivateChannel("course.added.student.{$studentId}");
        }

        return $channels;
    }
}
