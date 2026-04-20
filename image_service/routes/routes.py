import os
from flask import Blueprint, request, jsonify, g, send_from_directory
from flasgger import swag_from
from middleware.auth import token_required
from services import process_and_save_image, get_image_metadata_by_id, delete_image_by_id, update_image
from config.config import Config

api = Blueprint('api', __name__)

@api.route('/health', methods=['GET'])
def health_check():
    """
    Verifica el estado del servicio.
    ---
    tags:
      - Health
    summary: Health check del servicio
    responses:
      200:
        description: El servicio está funcionando correctamente.
        schema:
          type: object
          properties:
            status:
              type: string
              example: ok
            service:
              type: string
              example: image_service
    """
    return jsonify({"status": "ok", "service": "image_service"}), 200

@api.route('/upload', methods=['POST'])
@token_required
def upload_image():
    """
    Sube una nueva imagen.
    Requiere autenticación JWT. El archivo debe venir en un campo 'image' de un multipart/form-data.
    ---
    tags:
      - Image
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: image
        type: file
        required: true
        description: El archivo de imagen a subir.
    responses:
      201:
        description: Imagen subida exitosamente. Devuelve los metadatos de la imagen.
      400:
        description: Petición incorrecta (falta el archivo o no se seleccionó).
    security:
      - Bearer: []
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
    Obtiene los metadatos de una imagen.
    ---
    tags:
      - Image
    parameters:
      - name: image_id
        in: path
        type: string
        required: true
        description: ID de la imagen.
    responses:
      200:
        description: Metadatos de la imagen.
      404:
        description: Imagen no encontrada.
    security:
      - Bearer: []
    """
    metadata = get_image_metadata_by_id(image_id)
    if not metadata:
        return jsonify({'message': 'Imagen no encontrada.'}), 404
    
    return jsonify(metadata), 200

@api.route('/images/<string:image_id>', methods=['DELETE'])
@token_required
def delete_image(image_id):
    """
    Elimina una imagen.
    Solo el propietario de la imagen puede realizar esta acción.
    ---
    tags:
      - Image
    parameters:
      - name: image_id
        in: path
        type: string
        required: true
        description: ID de la imagen a eliminar.
    responses:
      200:
        description: Imagen eliminada exitosamente.
      403:
        description: Prohibido (no es el propietario de la imagen).
      404:
        description: Imagen no encontrada.
    security:
      - Bearer: []
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
    ---
    tags:
      - Image
    produces:
      - image/*
    parameters:
      - name: filename
        in: path
        type: string
        required: true
        description: Nombre del archivo de la imagen.
    responses:
      200:
        description: El archivo de la imagen.
      404:
        description: Archivo no encontrado.
    """
    try:
        return send_from_directory(Config.UPLOAD_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({'message': 'Archivo no encontrado.'}), 404
    
@api.route('/images/<string:image_id>', methods=['PUT'])
@token_required
def update_image_route(image_id):
    """
    Actualiza una imagen existente.
    Solo el propietario puede actualizarla.
    ---
    tags:
      - Image
    consumes:
      - multipart/form-data
    parameters:
      - name: image_id
        in: path
        type: string
        required: true
        description: ID de la imagen a actualizar.
      - in: formData
        name: image
        type: file
        required: true
        description: El nuevo archivo de imagen.
    responses:
      200:
        description: Imagen actualizada exitosamente. Devuelve los nuevos metadatos.
      400:
        description: Petición incorrecta (falta el archivo).
      404:
        description: Imagen no encontrada o sin permiso.
    security:
      - Bearer: []
    """
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