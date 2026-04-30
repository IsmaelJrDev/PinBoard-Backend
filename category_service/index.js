require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const categoryRoutes = require('./routes/category.routes');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/categories', categoryRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión física con Postgres exitosa.');

        if (process.env.IS_REPLICA !== 'true') {
            await sequelize.sync({ force: false });
            console.log('🔄 Tablas de categorías sincronizadas correctamente.');
        } else {
            console.log('🔄 Modo réplica: Omitiendo sincronización de tablas.');
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Category Service running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error crítico al iniciar el servidor:', error);
    }
};

startServer();