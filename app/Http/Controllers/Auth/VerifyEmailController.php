<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\EnrollStudent;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json('Already Verified');
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
            $user = $request->user();
            if($user->hasRole('student'))
            {
                dispatch(new EnrollStudent($user));
            }
            
        }

        return response()->json('Successfully Verified');

    }
}
