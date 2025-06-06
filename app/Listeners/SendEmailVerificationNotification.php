<?php

namespace App\Listeners;

use App\Events\Registered;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendEmailVerificationNotification
{
    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        if($event->user instanceof MustVerifyEmail && ! $event->user->hasVerifiedEmail())
        {
            $event->user->sendEmailVerificationNotification();
        }
    }
}
