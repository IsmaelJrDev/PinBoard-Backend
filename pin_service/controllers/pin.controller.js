const Pin = require('../models/Pin');

// Obtener todos los pines (Feed principal)
const getAllPins = async (req, res) => {
    try {
        const pins = await Pin.findAll({
            order: [['created_at', 'DESC']] // Los más recientes primero
        });
        res.status(200).json(pins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un pin específico
const getPinById = async (req, res) => {
    try {
        const { id } = req.params;
        const pin = await Pin.findByPk(id);
        if (!pin) return res.status(404).json({ message: 'Pin no encontrado' });
        res.status(200).json(pin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener pines por Categoría
const getPinsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const pins = await Pin.findAll({ where: { category_id: categoryId } });
        res.status(200).json(pins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener pines de un Usuario (Para su perfil)
const getPinsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const pins = await Pin.findAll({ where: { user_id: userId } });
        res.status(200).json(pins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un Pin
const createPin = async (req, res) => {
    try {
        const { title, description, image_url, external_link, user_id, category_id } = req.body;

        const pin = await Pin.create({
            title, description, image_url, external_link, user_id, category_id
        });

        res.status(201).json(pin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un Pin
const deletePin = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Pin.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ message: 'Pin no encontrado' });
        res.status(200).json({ message: 'Pin eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllPins, getPinById, getPinsByCategory, getPinsByUser, createPin, deletePin
};