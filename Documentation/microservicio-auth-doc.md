# Documentación Técnica - Microservicio de Autenticación

## Tabla de Contenidos

| Sección | Descripción |
|---------|-------------|
| [Visión General](#visión-general) | Propósito y alcance del microservicio |
| [Stack Tecnológico](#stack-tecnológico) | Tecnologías y versiones utilizadas |
| [Estructura del Proyecto](#estructura-del-proyecto) | Organización de carpetas y archivos |
| [Configuración Inicial](#configuración-inicial) | Variables de entorno y setup requerido |
| [Modelo de Bases de Datos](#modelo-de-bases-de-datos) | Esquema y validaciones |
| [Endpoints REST](#endpoints-rest) | API completa con ejemplos |
| [Sistema de Autenticación JWT](#sistema-de-autenticación-jwt) | Tokens y seguridad |
| [Códigos de Respuesta](#códigos-de-respuesta) | HTTP status codes |
| [Docker y Despliegue](#docker-y-despliegue) | Containerización y orquestación |
| [Desarrollo Local](#desarrollo-local) | Setup para desarrollo |
| [Testing Funcional](#testing-funcional) | Pruebas con herramientas |
| [Troubleshooting](#troubleshooting) | Errores comunes y soluciones |
| [Referencias](#referencias) | Documentación externa |

---

## Visión General

### Propósito
Microservicio responsable de:
- Registro de nuevos usuários con validación de email
- Autenticación y generación de tokens JWT
- Gestión segura de contraseñas con hashing bcrypt
- Interfaz REST para otros microservicios

### Alcance
- **Gestión de Usuarios**: Creación de registros individuales
- **Autenticación**: Validación de credenciales y emisión de tokens
- **Seguridad**: Cifrado de contraseñas y validación de tokens
- **Escalabilidad**: Configurado para dos instancias (primaria + réplica)

---

## Stack Tecnológico

### Dependencias Principales

| Librería | Versión | Propósito |
|----------|---------|----------|
| express | ^5.2.1 | Framework HTTP |
| sequelize | ^6.35.2 | ORM para PostgreSQL |
| pg | ^8.11.3 | Driver PostgreSQL |
| pg-hstore | ^2.3.4 | Serializador JSON para Sequelize |
| jsonwebtoken | ^9.0.3 | Firmado y verificación de JWT |
| bcrypt | ^6.0.0 | Hashing seguro de contraseñas |
| cors | ^2.8.6 | Control de acceso cross-origin |
| dotenv | ^17.3.1 | Gestión de variables de entorno |
| nodemon | ^3.1.14 | Recarga automática en desarrollo |

### Infraestructura

```
Runtime:        Node.js v18.20.8
Base de Datos:  PostgreSQL v17.9
Contenedor:     Docker (node:18)
Orquestación:   Docker Compose
Réplicas:       2 instancias (puertos 3000, 3001)
```

---

## Estructura del Proyecto

### Árbol de Directorios

```
microservicioAuth/
│
├── index.js                          # Punto de entrada principal
├── package.json                      # Configuración y dependencias
├── package-lock.json                 # Lock de versiones
│
├── config/
│   └── database.js                   # Conexión a PostgreSQL con Sequelize
│
├── models/
│   └── User.js                       # Modelo de usuario con validaciones
│
└── routes/
    └── auth.route.js                 # Endpoints POST /register, /login
```

### Descripción de Archivos

**index.js**
- Inicialización de Express
- Configuración de middleware (JSON, CORS)
- Sincronización con base de datos
- Inicio del servidor en puerto 3000

**config/database.js**
- Nueva instancia de Sequelize
- Pool de conexiones optimizado
- Configuración PostgreSQL

**models/User.js**
- Definición de tabla Users
- Validaciones de email y password
- Tipos de datos y restricciones

**routes/auth.route.js**
- POST /register: Crear nuevos usuarios
- POST /login: Autenticar y generar JWT

---

## Configuración Inicial

### Variables de Entorno (.env)

Crear archivo `.env` en la raíz del proyecto:

```bash
# Base de Datos PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_contraseña
URL_CONNECT_P1=postgresql://postgres:tu_contraseña@database1:5432/postgres

# Tokens JWT
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=24h
```

### Recomendaciones de Seguridad

| Variable | Requisito | Ejemplo |
|----------|-----------|---------|
| JWT_SECRET | 32+ caracteres aleatorios | `$(openssl rand -base64 32)` |
| POSTGRES_PASSWORD | Fuerte, sin caracteres especiales conflictivos | `SegurA2024Pass!` |
| JWT_EXPIRES_IN | Formato ISO o segundos | `24h`, `7d`, `3600` |

### Proceso de Setup

```bash
# 1. Instalar dependencias
cd microservicioAuth
npm install

# 2. Configurar .env en raíz del proyecto
touch .env
# Editar valores en .env

# 3. Iniciar con Docker
docker compose up
```

---

## Modelo de Bases de Datos

### Esquema de Tabla Users

```sql
CREATE TABLE "Users" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON "Users"(email);
```

### Definición Sequelize

```javascript
const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,              // Validación email
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
```

### Validaciones Implementadas

| Campo | Validación | Descripción |
|-------|-----------|-------------|
| email | STRING, UNIQUE | No duplicados, formato email válido |
| email | isEmail | Validator incorporado de Sequelize |
| password | STRING | Almacenado como hash bcrypt (salt: 12) |
| ambas | NOT NULL | Ambos campos obligatorios |

### Ciclo de Vida

```
Crear Usuario
├── Email validado (formato)
├── Email verificado único
├── Password hasheado (bcrypt, rounds=12)
└── Registro insertado en BD

Timestamps automáticos
├── createdAt: Al inserta
└── updatedAt: Última modificación
```

---

## Endpoints REST

### 1. Prueba de Salud

```http
GET /
```

**Propósito:** Verificar disponibilidad del servidor

**Headers:** (ninguno requerido)

**Respuesta (200 OK):**
```json
{
  "message": "Si funciono"
}
```

**Código Ejemplo:**
```javascript
app.get("/", (req, res) => res.json({message: "Si funciono"}));
```

---

### 2. Registro de Usuario

```http
POST /users/register
Content-Type: application/json
```

**Propósito:** Crear nueva cuenta de usuario

**Headers Requeridos:**
```
Content-Type: application/json
```

**Body (Request):**
```json
{
  "email": "usuario@example.com",
  "password": "MiContraseña123"
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "password": "$2b$12$abcdefghijklmnopqrstuvwxyz...",
  "createdAt": "2026-04-12T21:35:00.000Z",
  "updatedAt": "2026-04-12T21:35:00.000Z"
}
```

**Respuesta Error (400 Bad Request):**
```json
{
  "message": "Usuario no encontrado, User not found"
}
```

**Procesos Internos:**
1. Extrae email y password del body
2. Valida formato de email
3. Verifica email no está duplicado
4. Hashea password con bcrypt (12 rounds)
5. Inserta registro en base de datos
6. Retorna usuario creado sin exponer detalles del hash

**Validaciones:**
- Email debe ser válido y único
- Password debe estar presente
- Sequelize triggera excepciones si validaciones fallan

---

### 3. Inicio de Sesión

```http
POST /users/login
Content-Type: application/json
```

**Propósito:** Autenticar usuario y generar token JWT

**Headers Requeridos:**
```
Content-Type: application/json
```

**Body (Request):**
```json
{
  "email": "usuario@example.com",
  "password": "MiContraseña123"
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c3VhcmlvQGV4YW1wbGUuY29tIiwiaWF0IjoxNzEyOTc2MDAwLCJleHAiOjE3MTI5NzY3MjB9.signature..."
}
```

**Respuesta Error - Usuario no existe (400 Bad Request):**
```json
{
  "message": "Usuario no encontrado, User not found"
}
```

**Respuesta Error - Contraseña incorrecta (401 Unauthorized):**
```json
{
  "message": "Usuario o contraseña incorrecto"
}
```

**Respuesta Error - Error interno (500 Internal Server Error):**
```json
{
  "message": "Descripción del error ocurrido"
}
```

**Procesos Internos:**
```
1. Verificar existencia del usuario por email
   ├─ Si no existe: return 400
   └─ Si existe: continue

2. Comparar password proporcionado vs hash BD
   ├─ bcrypt.compare() retorna true/false
   ├─ Si false: return 401
   └─ Si true: continue

3. Generar token JWT
   ├─ Payload: {id, email}
   ├─ Secret: JWT_SECRET
   └─ Expiry: JWT_EXPIRES_IN

4. Retornar token firmado
```

**Seguridad:**
- No expone datos de usuario en respuesta exitosa
- Solo retorna token opaco
- Diferencia entre usuario no encontrado vs contraseña incorrecta (información mínima)

---

## Sistema de Autenticación JWT

### Estructura del Token

**Formato:** `header.payload.signature`

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "iat": 1712976000,
  "exp": 1712979600
}
```

**Signature:**
```
HMACSHA256(
  base64(header) + "." + base64(payload),
  JWT_SECRET
)
```

### Parámetros de Configuración

```javascript
const token = jwt.sign(
  {id: user.id, email: user.email},      // Payload
  process.env.JWT_SECRET,                 // Clave de firma
  {expiresIn: process.env.JWT_EXPIRES_IN} // Tiempo de expiración
);
```

| Parámetro | Tipo | Rango | Recomendación |
|-----------|------|-------|---------------|
| JWT_SECRET | string | 32-256 caracteres | Generar con crypto seguro |
| JWT_EXPIRES_IN | string/number | "1h" a "30d" | "24h" para sesiones cortas |
| Algorithm | enum | HS256, HS384, HS512 | HS256 (default, suficiente) |

### Uso del Token

**Primera Autenticación:**
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass"}'

# Respuesta: {"token": "eyJhbGc..."}
```

**Requests Posteriores (otros microservicios):**
```bash
curl http://localhost:3001/protected-resource \
  -H "Authorization: Bearer eyJhbGc..."
```

**Validación en Backend:**
```javascript
const token = req.headers.authorization?.split(" ")[1];
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded); // {id, email, iat, exp}
} catch (err) {
  res.status(401).json({message: "Token inválido o expirado"});
}
```

---

## Códigos de Respuesta

### Tabla de HTTP Status Codes

| Código | Nombre | Escenario | Acción Cliente |
|--------|--------|-----------|-----------------|
| 200 | OK | Login exitoso, token generado | Guardar token, autenticado |
| 201 | Created | Usuario registrado correctamente | Redirigir a login |
| 400 | Bad Request | Email duplicado, validación fallida, usuario no encontrado | Mostrar error, reintentar |
| 401 | Unauthorized | Contraseña incorrecta | Mostrar error específico |
| 500 | Internal Server Error | Error no capturado en servidor | Mostrar error genérico, contactar soporte |

### Flujo de Manejo de Errores

```
Try Block
├── Email/Password extracción
├── Búsqueda de usuario
├── Comparación de contraseña
└── Generación de token
    │
    └─ Excepción → Catch Block
        ├── Validación Sequelize → Status 400
        ├── Contraseña inválida → Status 401
        └── Error del sistema → Status 500
```

---

## Docker y Despliegue

### Configuración Docker Compose

**Servicio Primario (microservicioAuth):**
```yaml
microservicioAuth:
  image: node:18
  container_name: microservicioAuth
  working_dir: /app
  ports:
    - "3000:3000"
  command: sh -c "npm install && npm start"
  depends_on:
    - database1
  environment:
    JWT_SECRET: ${JWT_SECRET}
    JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
    URL_CONNECT_P1: ${URL_CONNECT_P1}
  volumes:
    - ./microservicioAuth:/app
```

**Servicio Réplica (microservicioAuth_replica):**
```yaml
microservicioAuth_replica:
  <<: *micro1_base              # Hereda configuración
  container_name: microservicioAuth_replica
  ports:
    - "3001:3000"              # Puerto diferente
```

**Servicio de Base de Datos (database1):**
```yaml
database1:
  image: postgres:17
  container_name: database1
  environment:
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  volumes:
    - ./postgres_data_1:/var/lib/postgresql/data
  ports:
    - "5432:5432"
```

### Comandos de Despliegue

```bash
# Levantar todos los servicios
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f microservicioAuth

# Parar servicios
docker compose stop

# Eliminar contenedores y volúmenes
docker compose down
```

### Verificación de Salud

```bash
# Dentro del contenedor
docker exec microservicioAuth curl http://localhost:3000/

# Verificar conectividad a BD
docker exec microservicioAuth psql $URL_CONNECT_P1 -c "SELECT 1;"

# Ver logs específicos
docker logs microservicioAuth_replica --tail 50 -f
```

---

## Desarrollo Local

### Setup Inicial

```bash
# Navegar al directorio
cd microservicioAuth

# Instalar dependencias
npm install

# Crear archivo .env en raíz del proyecto
cat > ../.env << EOF
POSTGRES_USER=postgres
POSTGRES_PASSWORD=dev_password_123
URL_CONNECT_P1=postgresql://postgres:dev_password_123@localhost:5432/postgres
JWT_SECRET=development_secret_key_32_chars_minimum_here
JWT_EXPIRES_IN=24h
EOF
```

### Modo Desarrollo

**Con nodemon (recarga automática):**
```bash
npm run dev

# Output esperado:
# > nodemon .
# [nodemon] watching extensions: js,json
# Conexión física con Postgres exitosa.
# Tablas sincronizadas correctamente.
# Servidor corriendo en puerto 3000
```

**Cambios captados automáticamente:**
- Modificación en archivos `.js`
- Reinicio automático del servidor
- Ideal para desarrollo iterativo

### Modo Producción

```bash
npm start

# Ejecuta: node .
# Una sola vez, sin recarga
```

### Estructura de Desarrollo

```
Ciclo de Desarrollo:
1. Editar código (models, routes, config)
2. nodemon detecta cambio
3. Servidor reinicia automáticamente
4. Probar en Postman o curl
5. Ver logs en terminal
6. Repeat
```

---

## Testing Funcional

### Opción 1: cURL desde Terminal

```bash
# Test de salud
curl -i http://localhost:3000/

# Registrar usuario
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123"
  }'

# Login y obtener token
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123"
  }'

# Usar token en request (ejemplo)
curl -H "Authorization: Bearer TOKEN_AQUI" \
  http://localhost:3000/protected
```

### Opción 2: Postman

1. **Crear nueva collection**: File → New → Collection
2. **Agregar requests:**
   - GET: `{{base_url}}/`
   - POST: `{{base_url}}/users/register`
   - POST: `{{base_url}}/users/login`
3. **Configurar variable:**
   - Variable: `base_url`
   - Valor: `http://localhost:3000`
4. **Usar token en headers:**
   - Key: `Authorization`
   - Value: `Bearer {{token}}`

### Opción 3: Base de Datos (Consultar Directamente)

```bash
# Acceder a PostgreSQL
docker exec -it database1 psql -U postgres -d postgres

# Dentro de psql:
\dt                                    # Listar tablas
SELECT * FROM "Users";                # Ver todos los usuarios
SELECT email, "createdAt" FROM "Users" ORDER BY "createdAt" DESC;
DELETE FROM "Users" WHERE email='test@example.com';  # Limpiar para reintentar
\q                                    # Salir
```

### Script de Prueba Automatizada

Crear archivo `test.js`:
```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function test() {
  try {
    console.log('1. Test de salud...');
    const health = await axios.get(`${BASE_URL}/`);
    console.log('   OK:', health.data);

    console.log('\n2. Registrando usuario...');
    const register = await axios.post(`${BASE_URL}/users/register`, {
      email: 'automation@test.com',
      password: 'TestPass123'
    });
    console.log('   OK:', register.data.email);

    console.log('\n3. Haciendo login...');
    const login = await axios.post(`${BASE_URL}/users/login`, {
      email: 'automation@test.com',
      password: 'TestPass123'
    });
    console.log('   Token recibido:', login.data.token.substring(0, 20) + '...');

  } catch (err) {
    console.error('ERROR:', err.response?.data || err.message);
  }
}

test();
```

Ejecutar:
```bash
node test.js
```

---

## Troubleshooting

### Error: "Cannot find module 'sequelize'"

**Síntomas:**
```
Error: Cannot find module 'sequelize'
  at Module._resolveFilename
```

**Causa:**
Las dependencias no están instaladas correctamente

**Soluciones:**
```bash
# En el contenedor
npm install

# O en desarrollo local
cd microservicioAuth && npm install

# Verificar package.json contiene sequelize
grep sequelize package.json
```

---

### Error: "Port 3000 already in use"

**Síntomas:**
```
EADDRINUSE: address already in use :::3000
```

**Causa:**
Otro proceso ocupa el puerto o anterior no se cerró completamente

**Soluciones:**
```bash
# Opción 1: Limpiar Docker
docker compose down
docker compose up

# Opción 2: Matar proceso en puerto
lsof -i :3000        # Listar procesos
kill -9 <PID>        # Matar proceso específico

# Opción 3: Usar puerto diferente temporalmente
PORT=3002 npm start
```

---

### Error: "Connection refused at 0.0.0.0:5432"

**Síntomas:**
```
Error: connect ECONNREFUSED 0.0.0.0:5432
```

**Causa:**
PostgreSQL no está corriendo o URL_CONNECT_P1 es incorrecta

**Soluciones:**
```bash
# Verificar PostgreSQL está corriendo
docker ps | grep database1

# Iniciar si no está activo
docker compose up -d database1

# Revisar URL_CONNECT_P1 en .env
# Debe ser: postgresql://user:pass@database1:5432/postgres
# NO: postgresql://user:pass@localhost:5432/postgres

# Verificar logs de BD
docker logs database1
```

---

### Error: "ECONNREFUSED postgres"

**Síntomas:**
```
Error: getaddrinfo ENOTFOUND postgres
```

**Causa:**
Hostname incorrecto en URL_CONNECT_P1 (probablemente usando 'postgres' en lugar de 'database1')

**Solución:**
En Docker Compose, el nombre del servicio DEBE usarse como hostname:
```
Correcto:   postgresql://user:pass@database1:5432/postgres
Incorrecto: postgresql://user:pass@postgres:5432/postgres
```

---

### Error: "Email already exists"

**Síntomas:**
```
Status 400: "Usuario no encontrado, User not found"
```

**Causa:**
El email ya está registrado (violación de constraintunique)

**Solución:**
```bash
# Usar otro email o eliminar usuario existente
DELETE FROM "Users" WHERE email='anterior@test.com';

# Luego reintentar con nuevo email
```

---

### Error: "JWT malformed" en cliente

**Síntomas:**
Token no valida en otros microservicios

**Causa:**
JWT_SECRET diferente entre servicios o token expirado

**Verificar:**
```bash
# Decodificar token en jwt.io
# Comparar JWT_SECRET en ambos servicios
echo $JWT_SECRET

# Verificar expiración
date +%s  # timestamp actual
# Token exp debe ser mayor
```

---

## Referencias

### Documentación Oficial

- [Express.js Documentation](https://expressjs.com)
- [Sequelize ORM Guide](https://sequelize.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT Introduction](https://jwt.io)
- [bcrypt npm package](https://www.npmjs.com/package/bcrypt)
- [Docker Compose Reference](https://docs.docker.com/compose)

### Recursos Útiles

- JWT Debugger: https://jwt.io
- HTTP Status Codes: https://httpwg.org/specs/rfc7231.html#status.codes
- OWASP Password Rules: https://owasp.org/www-community/password-guidelines
- PostgreSQL Connection String: https://www.postgresql.org/docs/current/libpq-connect.html

---

**Versión:** 1.0  
**Actualizado:** 12 de abril de 2026  
**Autor:** PinBoard Development Team  
**Estado:** Documentación Completa y Actualizada
