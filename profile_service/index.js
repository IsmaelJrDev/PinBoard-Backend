require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const profileRoutes = require('./routes/profile.routes');

const app = express();

// Middlewares globales
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));
app.use(express.json()); // Reemplaza a body-parser

// Rutas
app.use('/profiles', profileRoutes);

// Sincronización de BD y arranque del servidor
const PORT = process.env.PORT || 3004;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection to the database has been established successfully.');

        // Sincroniza los modelos con la base de datos, alterando las tablas para que coincidan.
        await sequelize.sync({ alter: true });
        console.log('🔄 Database synchronized.');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Profile Service running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

startServer();