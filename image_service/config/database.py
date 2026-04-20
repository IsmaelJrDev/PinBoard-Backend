from pymongo import MongoClient
from config.config import Config

# Inicializar el cliente de MongoDB una sola vez
client = MongoClient(Config.MONGO_URI)

# Seleccionar la base de datos
db = client.pinboard_db

# Crear una colección para los metadatos de las imágenes
images_collection = db.images

