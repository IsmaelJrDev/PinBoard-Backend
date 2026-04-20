import os
from flask import Blueprint, request, jsonify, g, send_from_directory
from middleware.auth import token_required
from services import process_and_save_image, get_image_metadata_by_id, delete_image_by_id, update_image
from config.config import Config

api = Blueprint('api', __name__)

@api.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "image_service"}), 200

@api.route('/upload', methods=['POST'])
@token_required
def upload_image():
    """
    Endpoint para subir una imagen. Requiere autenticación JWT.
    El archivo debe venir en un campo 'image' de un multipart/form-data.
    """
    if 'image' not in request.files:
        return jsonify({'message': 'No se encontró el archivo de imagen.'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'message': 'No se seleccionó ningún archivo.'}), 400

    # El user_id se extrae del token JWT validado por el decorador
    user_id = g.current_user['id']

    metadata, error = process_and_save_image(file, user_id)

    if error:
        return jsonify({'message': error}), 400

    return jsonify(metadata), 201

@api.route('/images/<string:image_id>', methods=['GET'])
@token_required
def get_image_metadata(image_id):
    """
    Obtiene los metadatos de una imagen por su ID.
    """
    metadata = get_image_metadata_by_id(image_id)
    if not metadata:
        return jsonify({'message': 'Imagen no encontrada.'}), 404
    
    return jsonify(metadata), 200

@api.route('/images/<string:image_id>', methods=['DELETE'])
@token_required
def delete_image(image_id):
    """
    Elimina una imagen. Solo el propietario puede hacerlo.
    """
    user_id = g.current_user['id']
    success, reason = delete_image_by_id(image_id, user_id)

    if not success:
        if reason == "not_found":
            return jsonify({'message': 'Imagen no encontrada.'}), 404
        elif reason == "forbidden":
            return jsonify({'message': 'No tienes permiso para eliminar esta imagen.'}), 403
        # Fallback para otros posibles errores
        return jsonify({'message': reason}), 400

    return jsonify({'message': reason}), 200

@api.route('/uploads/<string:filename>')
def get_uploaded_file(filename):
    """
    Sirve los archivos de imagen estáticos desde el directorio de subidas.
    Este endpoint es público para que las imágenes se puedan mostrar en el frontend.
    """
    try:
        return send_from_directory(Config.UPLOAD_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({'message': 'Archivo no encontrado.'}), 404
    
@api.route('/images/<string:image_id>', methods=['PUT'])
@token_required
def update_image_route(image_id):
    if 'image' not in request.files:
        return jsonify({'message': 'No se proporcionó nueva imagen.'}), 400
    
    user_id = g.current_user['id']
    file = request.files['image']
    
    metadata, error = update_image(image_id, user_id, file)
    
    if error == "not_found":
        return jsonify({'message': 'Imagen no encontrada o sin permiso.'}), 404
    if error:
        return jsonify({'message': error}), 400
        
    return jsonify(metadata), 200