<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
/*         $userId = $request->user()->id();
 */        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => ucfirst($this->title),
            'description' => $this->description,
            'enrolled_students_count' => $this->enrolled_students_count,
            'waitlisted_students_count'=>$this->waitlisted_students_count,
            'enrolled_students' => EnrolledStudentResource::collection($this->whenLoaded('enrolled_students')),
            'waitlisted_students' => WaitlistedStudentResource::collection($this->whenLoaded('waitlisted_students')),
            'files' => FileResource::collection($this->whenLoaded('files')),
            'url' => optional($this->userConversation($this->user_id)->first())->id          
       ];
    }
}
