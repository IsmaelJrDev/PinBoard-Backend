import os
from flask import Flask
from config.config import Config
from routes.routes import api

def create_app():
    app = Flask(__name__)

    # Configurar la aplicación
    app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH
    
    # Registrar el Blueprint de la API
    app.register_blueprint(api, url_prefix='/')

    # Crear el directorio de subidas si no existe
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=Config.PORT, debug=True)

