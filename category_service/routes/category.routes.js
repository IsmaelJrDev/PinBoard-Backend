const express = require('express');
const { body, param, validationResult } = require('express-validator');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Lo que más usará el Frontend
router.get('/', categoryController.getAllCategories);
router.get('/:id', [
    param('id').isInt().withMessage('ID debe ser un número entero'),
    validate
], categoryController.getCategoryById);

// Para crear nuevas categorías
router.post('/', [
    body('name').isString().notEmpty().isLength({ max: 50 }),
    body('description').optional().isString().isLength({ max: 255 }),
    body('cover_image_url').optional().isString(),
    validate
], categoryController.createCategory);

module.exports = router;