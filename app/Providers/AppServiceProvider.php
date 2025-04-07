<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {        
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
        VerifyEmail::toMailUsing(function(object $notifiable,string $url){
            return (new MailMessage)
            ->subject('Verify Your Email Address')
            ->greeting('Hello '.$notifiable->first_name.' '.$notifiable->last_name.',')
            ->line('Thank you for signing up with TeachWiseAI! Please verify your email address to activate your account.')
            ->action('Verify Email', $url)
            ->line('If you did not create an account, no further action is required.')
            ->salutation('Thank you');
        });
        
        VerifyEmail::createUrlUsing(function(object $notifiable){
            $verificationURl = URL::temporarySignedRoute(
                'verification.verify',
                Carbon::now()->addMinutes(Config::get('auth.verification.expire', 15)), // Verification Link expires after 15 minutes
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );
            $verificationURl = preg_replace('/.*?verify-email\//', '', $verificationURl);
            return config('app.frontend_url')."/verify-email/$verificationURl";
        });

        JsonResource::withoutWrapping();
    }
}
