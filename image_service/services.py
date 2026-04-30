import os
import uuid
from datetime import datetime
from PIL import Image
from werkzeug.utils import secure_filename
from config.config import Config
from config.database import images_collection

def is_allowed_file(filename):
    """Verifica si la extensión del archivo es válida."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def process_and_save_image(file, user_id):
    """
    Valida, redimensiona y guarda una imagen. Luego, guarda sus metadatos en MongoDB.
    Retorna los metadatos de la imagen o un mensaje de error.
    """
    if not is_allowed_file(file.filename):
        return None, "Tipo de archivo no permitido."

    original_filename = secure_filename(file.filename)
    file_ext = original_filename.rsplit('.', 1)[1].lower()
    
    # Generar un ID único para la imagen que también servirá para el nombre de archivo
    image_id = str(uuid.uuid4())
    unique_filename = f"{image_id}.{file_ext}"
    filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)

    # Calcular el tamaño del archivo de forma eficiente sin cargarlo todo a memoria
    file.seek(0)
    file.seek(0, os.SEEK_END)
    original_size_bytes = file.tell()
    file.seek(0)

    # Procesar con Pillow
    try:
        with Image.open(file.stream) as img:
            width, height = img.size

            # Redimensionar si excede las dimensiones máximas
            if width > Config.MAX_IMAGE_DIMENSION or height > Config.MAX_IMAGE_DIMENSION:
                img.thumbnail((Config.MAX_IMAGE_DIMENSION, Config.MAX_IMAGE_DIMENSION))
            
            # Guardar la imagen procesada
            img.save(filepath)
            final_width, final_height = img.size

    except Exception as e:
        return None, f"Error al procesar la imagen: {str(e)}"

    # Crear metadatos para MongoDB
    image_metadata = {
        "image_id": image_id,
        "filename": unique_filename,
        "url": f"/uploads/{unique_filename}",
        "mimetype": file.mimetype,
        "size_bytes": original_size_bytes,
        "width": final_width,
        "height": final_height,
        "uploaded_by": user_id,
        "created_at": datetime.utcnow()
    }

    # Insertar en MongoDB
    try:
        images_collection.insert_one(image_metadata)
    except Exception as e:
        # Si la inserción en la BD falla, intentamos eliminar el archivo que acabamos de guardar
        # para no dejar archivos huérfanos.
        try:
            os.remove(filepath)
        except OSError:
            # Si la eliminación del archivo también falla, lo registramos, pero el error principal es el de la BD.
            pass 
        return None, f"Error al guardar metadatos en la base de datos: {str(e)}"

    # No devolver el _id de Mongo
    image_metadata.pop('_id')

    return image_metadata, None

def get_image_metadata_by_id(image_id):
    """Busca los metadatos de una imagen por su image_id."""
    metadata = images_collection.find_one({"image_id": image_id}, {'_id': 0})
    return metadata

def delete_image_by_id(image_id, user_id):
    """
    Elimina una imagen y sus metadatos de forma atómica, 
    verificando que el usuario sea el propietario.
    """
    # find_one_and_delete es una operación atómica.
    # Busca un documento que coincida con el image_id Y el user_id, y si lo encuentra, lo elimina.
    metadata = images_collection.find_one_and_delete({
        "image_id": image_id,
        "uploaded_by": user_id
    })

    if not metadata:
        # Verificamos si la imagen existe pero pertenece a otro usuario para dar un error más específico.
        exists = images_collection.find_one({"image_id": image_id})
        if exists:
            return False, "forbidden"  # La imagen existe, pero no tienes permiso.
        else:
            return False, "not_found"  # La imagen no existe en absoluto.

    # Si la eliminación fue exitosa, procedemos a borrar el archivo físico.
    filename = metadata.get('filename')
    if filename:
        filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except OSError as e:
                print(f"Error borrando archivo físico: {e}")

    return True, "Imagen eliminada correctamente."

def update_image(image_id, user_id, new_file):
    """Reemplaza una imagen existente por una nueva."""
    # 1. Buscar metadatos actuales
    old_metadata = images_collection.find_one({"image_id": image_id, "uploaded_by": user_id})
    if not old_metadata:
        return None, "not_found"

    # 2. Borrar archivo físico anterior
    old_path = os.path.join(Config.UPLOAD_FOLDER, old_metadata['filename'])
    if os.path.exists(old_path):
        os.remove(old_path)

    # 3. Procesar nueva imagen (reutilizamos tu lógica de guardado)
    # Nota: podrías refactorizar process_and_save para separar el guardado del insert
    new_metadata, error = process_and_save_image(new_file, user_id)
    
    if error:
        return None, error

    # 4. Actualizar en Mongo (manteniendo el mismo image_id)
    images_collection.update_one(
        {"image_id": image_id},
        {"$set": new_metadata}
    )
    
    return new_metadata, None