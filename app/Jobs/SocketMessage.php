<?php

namespace App\Jobs;

use App\Events\MessageReceived;
use App\Events\MessageSocketFailed;
use App\Http\Controllers\MessageController;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SocketMessage implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public $user,public $message,public $conversation)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try
        {
        $response = Http::timeout(0)->withHeaders([
            'User-ID'=>$this->user->id
        ])->post('http://127.0.0.1:5000/api/chat/message', [
            'message' => $this->message,
            'course' => 'course_' . $this->conversation->course_id . '_materials',
            'conversation_id'=>$this->conversation->id
        ]);
    
        if ($response->successful()) {
            $aiResponse = $response->json();
            
            $message = Message::where('user_id', $this->user->id)
            ->where('conversation_id', $this->conversation->id)
            ->orderBy('id', 'desc')
            ->first();
            broadcast(new MessageReceived($message,$this->conversation->id));
        }
        else
        {
            throw new Exception("Failed to  send to send message in  {$this->conversation->id} conversation");
        }
        }
        catch(\Exception $e)
        {
            broadcast(new MessageSocketFailed("Oops! Something went wrong while processing your request. Please try again.",$this->conversation->id));
        }
        
    }
}
