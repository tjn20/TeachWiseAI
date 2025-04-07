<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnrolledStudentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $email = $this->email;
        $studentUniversityId = substr($email, 0, strpos($email, '@'));
        return [
            'id'=>$this->id,
            'student_university_id'=>$studentUniversityId,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
        ];
    }
}
