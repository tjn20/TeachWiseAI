from services.document_service import process_files,remove_course_files_from_vectorDB,remove_course_from_vectorDB
from flask import jsonify


def create_course(request):
    files = request.json.get('files')
    course = request.json.get('course')
    process_files(files=files,course=course) 
    return jsonify({"message": "done"})

def delete_course_material(course_id,request):
    file_ids = request.json.get('files')
    course = f"course_{course_id}_materials"
    remove_course_files_from_vectorDB(file_ids=file_ids,course=course)
    return jsonify({"message":"done"})

def delete_course(course_id):
    course = f"course_{course_id}_materials"
    remove_course_from_vectorDB(course=course)
    return jsonify({"message":"done"})
