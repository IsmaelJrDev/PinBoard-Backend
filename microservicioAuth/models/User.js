const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define("User", {
    // Definicion de campos o clumnas
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = User;