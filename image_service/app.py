import os
from flask import Flask
from flasgger import Swagger
from routes.routes import api
from config.config import Config

def create_app():
    """Crea y configura una instancia de la aplicación Flask."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configuración de Swagger
    template = {
        "swagger": "2.0",
        "info": {
            "title": "Image Service API",
            "description": "API para subir, gestionar y servir imágenes para PinBoard.",
            "version": "1.0.0"
        },
        # "host" se omite para que sea dinámico y funcione en cualquier entorno.
        "basePath": "/",
        "schemes": [
            "http",
            "https"
        ],
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT Authorization header usando el esquema Bearer. Ejemplo: \"Authorization: Bearer {token}\""
            }
        }
    }

    # Inicializar Swagger
    Swagger(app, template=template)

    app.register_blueprint(api, url_prefix='/')

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get("PORT", 3002))
    app.run(debug=True, host='0.0.0.0', port=port)