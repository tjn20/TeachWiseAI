<?php

namespace Database\Seeders;

use App\Models\University;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        University::create(['name'=>"Al Ain University",'domain'=>"aau.ac.ae"]);
        Role::create(["name"=>'student']);
        Role::create(["name"=>'instructor']);

    }
}
