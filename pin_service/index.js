require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const pinRoutes = require('./routes/pin.routes');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/pins', pinRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión con Postgres exitosa (Pin Service).');

        if (process.env.IS_REPLICA !== 'true') {
            await sequelize.sync({ force: false });
            console.log('🔄 Tabla de Pines sincronizada.');
        } else {
            console.log('🔄 Modo réplica: Omitiendo sincronización.');
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Pin Service running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
    }
};

startServer();