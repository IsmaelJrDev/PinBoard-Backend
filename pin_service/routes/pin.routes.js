const express = require('express');
const { body, param, validationResult } = require('express-validator');
const pinController = require('../controllers/pin.controller');

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.get('/', pinController.getAllPins);
router.get('/:id', [param('id').isInt(), validate], pinController.getPinById);
router.get('/category/:categoryId', [param('categoryId').isInt(), validate], pinController.getPinsByCategory);
router.get('/user/:userId', [param('userId').isInt(), validate], pinController.getPinsByUser);

router.post('/', [
    body('title').isString().notEmpty().isLength({ max: 100 }),
    body('description').optional().isString(),
    body('image_url').isString().notEmpty(),
    body('external_link').optional().isURL().withMessage('Debe ser una URL válida'),
    body('user_id').isInt(),
    body('category_id').isInt(),
    validate
], pinController.createPin);

router.delete('/:id', [param('id').isInt(), validate], pinController.deletePin);

module.exports = router;