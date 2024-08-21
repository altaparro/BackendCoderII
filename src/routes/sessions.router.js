import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post("/register", passport.authenticate("register", {
    failureRedirect: "failed"
}), async (req, res) => {
    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email
    };
    req.session.login = true;

    // Generación de token JWT con los datos del usuario
    const token = jwt.sign({ usuario: req.user.first_name, rol: req.user.age }, "backendDos", { expiresIn: "1h" });

    // Configuración de la cookie para almacenar el token
    res.cookie("tokenCookie", token, {
        maxAge: 3600000, // 1 hora en milisegundos
        httpOnly: true
    });

    // Redirección al perfil del usuario tras el registro exitoso
    res.redirect("/api/sessions/profile");
});

// Ruta para iniciar sesión
router.post("/login", passport.authenticate("login", {
    failureRedirect: "failed"
}), async (req, res) => {
    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email
    };
    req.session.login = true;

    // Redirección al perfil del usuario tras el inicio de sesión exitoso
    res.redirect("/api/sessions/profile");
});

// Ruta para cerrar sesión y destruir la sesión actual
router.get("/logout", (req, res) => {
    if (req.session.login) {
        req.session.destroy();
    }
    res.redirect("/");
});

// Ruta para manejar errores de autenticación
router.get("/failed", (req, res) => {
    res.render("failed");
});

// Ruta para verificar el estado actual del usuario autenticado mediante JWT
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
    if (req.user) {
        // Renderiza la vista "home" con la información del usuario
        res.render("home", { usuario: req.user.usuario });
    } else {
        // En caso de no estar autorizado, devuelve un error 401
        res.status(401).send("No autorizado");
    }
});

// Ruta para autenticarse con GitHub
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => {});

// Callback de autenticación de GitHub
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
    req.session.user = req.user;
    req.session.login = true;

    // Redirección al perfil del usuario tras autenticarse con GitHub
    res.redirect("/api/sessions/profile");
});

export default router;
