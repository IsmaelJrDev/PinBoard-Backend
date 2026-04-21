const { Sequelize } = require('sequelize');
const dotenv = require('dotenv')

// Para poder leer nuestras variables de entorno
dotenv.config();

// Conexión a la base de datos
const sequelize = new Sequelize(process.env.URL_CONNECT, {
    dialect: 'postgres',
    logging: false,
    pool: {max: 5, min: 0, acquire: 30000, idle: 10000}
});

module.exports = sequelize; 