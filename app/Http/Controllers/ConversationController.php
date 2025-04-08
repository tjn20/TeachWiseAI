<?php

namespace App\Http\Controllers;

use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Course;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Pagination\Cursor;
use Illuminate\Support\Facades\Http;

class ConversationController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request,Conversation $conversation)
    {
        $this->authorize('view',$conversation);
        return new ConversationResource($conversation);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the conversation messages.
     */
    public function destroy(Conversation $conversation)
    {
        $this->authorize('delete',$conversation);
        $conversation->messages()->delete();
        return response()->noContent();
    }

    public function getMessages(Request $request,$conversationId)
    {
         $cursor = $request->query('cursor');
         $nextCursor = $cursor ? Cursor::fromEncoded($cursor) : null; 

        if(!$nextCursor)  return response("Something Went Wrong!",500);
        
        $messages = Message::where('conversation_id',$conversationId)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->cursorPaginate(4,['*'],'cursor',$nextCursor);
        
        return response()->json([
            'data'=>MessageResource::collection($messages->getCollection()->reverse()),
            'nextCursor'=>$messages?->nextCursor()?->encode()
        ]);
        
       
    }
}
