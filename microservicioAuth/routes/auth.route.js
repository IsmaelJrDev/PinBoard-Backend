const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { response } = require("express");

// Endpoint de Registro de Usuario
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@correo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: MiPassword123
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "64b1f2c3e4d5a6b7c8d9e0f1"
 *                 email:
 *                   type: string
 *                   example: usuario@correo.com
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error en la solicitud (datos inválidos o email duplicado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado, User not found"
 */

router.post("/register", async(req, res)=>{
    try{
        // Captura de email y contraseña del cuerpo
        const {email, password} = req.body;
        // Hasheo de paswword
        const passhash = await bcrypt.hash(password, 12);
        // Crea el usuario usando el modelo creado
        const user = await User.create({
            email,
            password: passhash
        })

        res.status(201).json(user);

    }catch(error){

        res.status(400).json({
            message: "Usuario no encontrado, User not found"
        })
    }
});

// Enpoint de Login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@correo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MiPassword123
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT de acceso
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Credenciales inválidas"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se pudo procesar la solicitud"
 */
router.post("/login", async(req, res)=>{
    try{
        // Captura de email y contraseña del cuerpo
        const {email, password} = req.body;
        // Buscamos si el usuario existe
        const user = await User.findOne({where: {email}});
        // Si no se ecnuentra el usuario
        if (!user) return res.status(401).json({
            message: "Usuario no encontrado, User not found"
        });
        // Comparar contraseñas
        const valid = await bcrypt.compare(password, user.password);
        // Si la contraseña no es valida
        if(!valid) return res.status(401).json({
            message: "Usuario o contraseña incorrecto"
        })
        // Generacion del token si todo marcha bien+
        const token = jwt.sign(
            {id:user.id, email:user.email},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        )
        // Regresamos nuestro token
        res.status(200).json({token});
    }catch(error){
        res.status(500).json({
            message: error.message || "No se pudo procesar la solicitud"
        })
    }
});

module.exports = router;