<?php

namespace App\Http\Controllers\Auth;

use App\Events\Registered;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): Response
    {
        $request->authenticate();
        
        $user = Auth::user();
        if(!$user->hasVerifiedEmail())
        {
            event(new Registered($user));
            return response(null,409);
        }
        $request->session()->regenerate();

        return response()->noContent();
    }

    /**
     * Handle an incoming authentication request check.
     */
    public function getUser(Request $request): Response
    {
        $user = $request->user();

        if (!$user) 
            return abort(401, 'Unauthorized');
        return response(new UserResource($user));
    }


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
