<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    protected $userId;

    public function __construct($resource, $userId = null)
    {
        parent::__construct($resource);
        $this->userId = $userId;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $userId = $request->user() ? $request->user()->id : $this->userId;

        
        return [
            'id' => $this->id,
            'title' => ucfirst($this->title),
            'slug'=> $this->slug,
            'instructor'=>\Illuminate\Support\Str::title("{$this->instructor->first_name} {$this->instructor->last_name}"),
            'description' => $this->description,
            'enrolled_students_count' => $this->enrolled_students_count,
            'url' => optional($this->userConversation($userId)->first())->id          
       ];
    }
}
