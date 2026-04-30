const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pin = sequelize.define('Pin', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false // Un pin sin imagen no es un pin
    },
    external_link: {
        type: DataTypes.STRING,
        allowNull: true // El usuario puede enlazar su pin a una web
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false // Quién lo creó
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false // A qué categoría pertenece
    }
}, {
    tableName: 'pins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Pin;