<?php

namespace App\Http\Controllers;

use App\Events\MessageReceived;
use App\Jobs\SocketMessage;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use League\CommonMark\CommonMarkConverter;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use League\CommonMark\Extension\Table\TableExtension;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request,Conversation $conversation)
    {
        $data = $request->validate([
            'message'=>'string|max:1500'
        ]);
        $user =  $request->user();
        if($conversation->user_id !== $user->id)
        abort(403,"Unauthorized action");
        dispatch(new SocketMessage($user,$data['message'],$conversation));
        return response()->noContent();
    
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function downloadResponse(Message $message)
    {
        $decodedMessage = json_decode(json_decode($message->history));
        
        $config = [
            'html_input' => 'allow', // Allows inline HTML inside Markdown
        ];

        $converter = new CommonMarkConverter($config);
        $converter->getEnvironment()->addExtension(new TableExtension()); // Enable table support
        $htmlContent = $converter->convert($decodedMessage->data->content);

      // Wrap the HTML for PDF formatting
    $htmlContent = "
    <html>
    <head>
        <style>
            body { font-family: sans-serif; }
            
            /* Table Styling */
            table { 
                border-collapse: collapse; 
                width: 100%; /* Ensure table fits within the page */
                table-layout: fixed; /* Prevents table from expanding beyond the page */
                word-wrap: break-word; /* Ensures text inside cells wraps properly */
            }
            
            th, td { 
                border: 1px solid black; 
                padding: 8px; 
                text-align: left; 
                word-wrap: break-word;
                overflow-wrap: break-word;
            }
            
            th {
            text-align:center;
            }

            pre, code {
                white-space: pre-wrap; /* Wraps long lines */
                word-wrap: break-word;
                background: #f4f4f4;
                overflow-wrap: break-word;
            }
        </style>
    </head>
    <body>{$htmlContent}</body>
    </html>";

    // Generate PDF
    $pdf = Pdf::loadHTML($htmlContent)->setPaper('A4', 'portrait');
    $fileName = 'document_' . time() . '.pdf';
    $filePath = "pdfs/{$fileName}";

    Storage::put($filePath, $pdf->output());

    return response()->download(storage_path("app/private/{$filePath}"))->deleteFileAfterSend(true);
    }
}
