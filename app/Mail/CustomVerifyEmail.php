<?php

namespace App\Mail;

use App\Helpers\FrontendSignedUrl;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\InteractsWithTime;

class CustomVerifyEmail extends VerifyEmail
{
    use InteractsWithTime;
    protected function verificationUrl($notifiable)
    {
        if (static::$createUrlCallback) {
            return call_user_func(static::$createUrlCallback, $notifiable);
        }

        $sha1 = sha1($notifiable->email);
        $id = $notifiable->getKey();
        $baseUrl = env('frontend_url')."/verify-email/{$id}/{$sha1}";

        $signedUrl = (new FrontendSignedUrl())->customSignedUrl($baseUrl, [
                'id' => $id,
                'hash' => $sha1
            ],
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60))
        );

        return $signedUrl;

    }
}
