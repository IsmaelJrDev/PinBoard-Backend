from functools import wraps
from flask import request, jsonify, g
import jwt
from config.config import Config

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # El token se espera en el header 'Authorization' como 'Bearer <token>'
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token malformado.'}), 401

        if not token:
            return jsonify({'message': 'Token no encontrado.'}), 401

        try:
            # Decodificar el token usando el secreto
            data = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            # Guardar los datos del usuario en el contexto de la petición (g)
            g.current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'El token ha expirado.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido.'}), 401

        return f(*args, **kwargs)
    return decorated

