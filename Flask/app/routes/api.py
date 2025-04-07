from flask import Blueprint,request, jsonify
from controllers.chat_controller import send_message
from controllers.course_controller import create_course , delete_course_material, delete_course
# Initialize the blueprint
api_routes = Blueprint('api_routes', __name__)

# Course routes
@api_routes.route('/course/create', methods=['POST'])
def create_course_route():
    return  create_course(request)

# Chat routes
@api_routes.route('/chat/message', methods=['POST'])
def send_message_route():
    return send_message(request)

@api_routes.route('/course/<id>/material',methods=['DELETE'])
def delete_course_material_route(id):
    return delete_course_material(id,request)

@api_routes.route('/course/<id>',methods=['DELETE'])
def delete_course_route(id):
    return delete_course(id)