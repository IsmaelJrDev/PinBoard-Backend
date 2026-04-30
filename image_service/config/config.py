import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env en la raíz del proyecto
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

class Config:
    # --- JWT ---
    JWT_SECRET = os.getenv('JWT_SECRET')

    # --- MongoDB ---
    MONGO_URI = os.getenv('MONGO_URI')

    # --- Image Uploads ---
    # Apuntar a una carpeta 'uploads' en la raíz del servicio, no dentro de 'config'
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    MAX_IMAGE_SIZE_MB = 5  # Tamaño máximo en MB
    MAX_CONTENT_LENGTH = MAX_IMAGE_SIZE_MB * 1024 * 1024  # En bytes
    MAX_IMAGE_DIMENSION = 1920  # Dimensión máxima (ancho o alto) en píxeles

    # --- Server ---
    PORT = 3000
