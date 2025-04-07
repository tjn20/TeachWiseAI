<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $messages = $this->messages()
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->cursorPaginate(4); // to come back
        return [
            'id'=>$this->id,
            'course_id'=>$this->course_id,
            'course_title'=> $this->course->title,
            'course_instructor' => \Illuminate\Support\Str::title("{$this->course->instructor->first_name} {$this->course->instructor->last_name}"),
            'messages' => MessageResource::collection($messages->getCollection()->reverse()),
            'nextCursor' => $messages?->nextCursor()?->encode()
        ];
    }
}
