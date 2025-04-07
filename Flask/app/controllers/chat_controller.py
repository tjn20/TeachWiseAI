from flask import jsonify
from services.chat_service import ChatService

def send_message(request):
    message = request.json.get('message')
    course = request.json.get("course")
    user_id = request.headers.get('User-ID')
    conversation_id = request.json.get("conversation_id")
    if not message or not conversation_id or not user_id:
        return jsonify({"error": "Message is required"}), 400
    
    chat = ChatService()
    return jsonify({"content":chat.ask(message,course,conversation_id,user_id),"type":"ai"})
    
    

    
