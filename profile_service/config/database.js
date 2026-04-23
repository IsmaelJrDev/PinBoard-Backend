const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'pinboard_profiles',
    process.env.POSTGRES_USER || 'root',
    process.env.POSTGRES_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'database1',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: process.env.DB_SSL === 'true' ? {
            ssl: { require: true, rejectUnauthorized: false }
        } : {}
    }
);

module.exports = sequelize;