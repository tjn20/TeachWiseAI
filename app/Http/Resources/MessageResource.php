<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $decoded_message = json_decode(json_decode($this->history));
        return [
            'id'=>$this->id,
            'type'=>$decoded_message->type,
            'content'=>$decoded_message->data->content,
        ];
    }
}
