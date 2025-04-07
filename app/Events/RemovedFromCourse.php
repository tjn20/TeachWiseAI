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

class RemovedFromCourse implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    protected $course;
    protected $studentIds;
    private $broadcastingUserId;
    public function __construct($course,$studentIds)
    {
        $this->course = $course;
        $this->studentIds = $studentIds;
    }

    public function broadcastWith()
    {
        return ['message'=>"You have been removed from {$this->course->title} course."
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
            $channels[] = new PrivateChannel("course.removed.student.{$studentId}");
        }
        return $channels;
    }
}
