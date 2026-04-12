const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { response } = require("express");

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

router.post("/login", async(req, res)=>{
    try{
        // Captura de email y contraseña del cuerpo
        const {email, password} = req.body;
        // Buscamos si el usuario existe
        const user = await User.findOne({where: {email}});
        // Si no se ecnuentra el usuario
        if (!user) return res.status(400).json({
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