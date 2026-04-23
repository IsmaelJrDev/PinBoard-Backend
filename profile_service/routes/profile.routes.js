const express = require('express');
const { body, param, validationResult } = require('express-validator');
const profileController = require('../controllers/profile.controller');

const router = express.Router();

// Middleware para atrapar errores de validación
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.get('/health/check', profileController.healthCheck);

router.post('/', [
    body('user_id').isUUID().withMessage('user_id must be a valid UUID'),
    body('first_name').isString().isLength({ max: 100 }),
    body('username').isString().isLength({ max: 100 }),
    body('avatar_url').optional().isString(),
    body('role').optional().isString().isLength({ max: 50 }),
    validate
], profileController.createProfile);

router.get('/:user_id', [
    param('user_id').isUUID().withMessage('Invalid UUID'),
    validate
], profileController.getProfile);

router.patch('/:user_id', [
    param('user_id').isUUID().withMessage('Invalid UUID'),
    body('first_name').optional().isString().isLength({ max: 100 }),
    body('username').optional().isString().isLength({ max: 100 }),
    body('avatar_url').optional().isString(),
    body('role').optional().isString().isLength({ max: 50 }),
    validate
], profileController.updateProfile);

router.delete('/:user_id', [
    param('user_id').isUUID().withMessage('Invalid UUID'),
    validate
], profileController.deleteProfile);

module.exports = router;