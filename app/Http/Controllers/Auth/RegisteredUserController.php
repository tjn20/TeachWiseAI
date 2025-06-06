<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\University;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(RegisterRequest $request): Response
    {
        $data=$request->validated();

        $emailDomain = substr(strrchr($data['email'],"@"),1);
        $university = University::where('domain',$emailDomain)->first(); 
        $user = User::create([
            'first_name'=>$data['first_name'],
            'last_name'=>$data['last_name'],
            'email'=>$data['email'],
            'password'=>bcrypt($data['password']),
            'university_id'=>$university->id
        ]);
        $user->assignRole($data['role']);

        event(new Registered($user));

        Auth::login($user);

        return response()->noContent();
    }
}
