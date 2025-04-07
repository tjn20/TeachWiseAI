<?php

namespace App\Jobs;

use App\Events\Registered;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendEmailVerification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    protected $user;
    public function __construct($user)
    {
        $this->user = $user;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        event(new Registered($this->user));
    }
}
