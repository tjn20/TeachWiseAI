<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('waitlisted_students', function (Blueprint $table) {
            $table->id();
            $table->string('student_email');
            $table->foreignId("course_id")->constrained()->onUpdate('cascade');
            $table->timestamps();
            $table->unique(['course_id','student_email']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waitlisted_students');
    }
};
