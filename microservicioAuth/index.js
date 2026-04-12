const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const sequelize = require('./config/database.js')
const User = require('./models/User.js')
const rutasUsuario = require('./routes/auth.route.js')

// Para poder leer nuestras variables de entorno
dotenv.config();
// Creamos nuestra instancia de express
const app = express();
// Para que acepte archivos json nuestro servidor
app.use(express.json());
app.use(cors());
// Rutas de URL 
app.use("/users", rutasUsuario);
// Endpoint de prueba
app.get("/", (req, res) => res.json({message: "Servidor Funcional"}));


// Conexion a la base de datos
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("Conexión física con Postgres exitosa.");

        await sequelize.sync({ force: false });
        console.log("Tablas sincronizadas correctamente.");

        app.listen(3000, "0.0.0.0", () => {
            console.log("Servidor corriendo");
        });
    } catch (err) {
        console.error("Error crítico al iniciar el servidor:" + err);
    }
};

startServer();
