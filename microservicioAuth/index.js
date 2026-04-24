const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const sequelize = require('./config/database.js')
const User = require('./models/User.js')
const rutasUsuario = require('./routes/auth.route.js')
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

// Para poder leer nuestras variables de entorno
dotenv.config();
// Creamos nuestra instancia de express
const app = express();
// Para que acepte archivos json nuestro servidor
app.use(express.json());
app.use(cors());

// --- Configuración de Swagger ---
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'PinBoard - Microservicio de Autenticación',
            version: '1.0.0',
            description: 'Documentación de la API para el microservicio de autenticación, responsable del registro y login de usuarios.',
            contact: {
                name: 'Equipo de Desarrollo PinBoard'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de Desarrollo'
            }
        ]
    },
    apis: ['./index.js', './routes/*.js'] // Archivos que contienen las anotaciones para Swagger
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- Anotaciones de Swagger para los Endpoints ---

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: API para la gestión de usuarios y autenticación
 *   - name: Health
 *     description: Verificación de estado del servicio
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID autogenerado del usuario.
 *           example: 1
 *         email:
 *           type: string
 *           description: El correo electrónico del usuario.
 *           example: usuario@example.com
 */

// Rutas de URL 
app.use("/users", rutasUsuario);

// Endpoint de prueba
/**
 * @swagger
 * /:
 *   get:
 *     summary: Endpoint de prueba de salud del servidor
 *     tags: [Health]
 *     responses:
 *       '200':
 *         description: El servidor está funcionando correctamente.
 */
app.get("/", (req, res) => res.json({ message: "Servidor Funcional" }));


// Conexion a la base de datos
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("Conexión física con Postgres exitosa.");

        if (process.env.IS_REPLICA !== true) {
            await sequelize.sync({ force: false });
            console.log("Tablas sincronizadas correctamente.");
        } else {
            console.log("Omitiendo sincronización de tablas")
        }

        app.listen(3000, "0.0.0.0", () => {
            console.log("Servidor corriendo");
        });
    } catch (err) {
        console.error("Error crítico al iniciar el servidor:" + err);
    }
};

startServer();
