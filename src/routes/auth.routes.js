const express = require('express');
const authController = require('../controllers/auth.controller');
const { autenticar } = require('../middlewares/auth.middleware');
const { validarRegistro, validarLogin } = require('../middlewares/validar.auth.middleware');

const router = express.Router();

router.post('/register', validarRegistro, authController.registrar);
router.post('/login', validarLogin, authController.iniciarSesion);
router.get('/me', autenticar, authController.me);
router.post('/logout', autenticar, authController.cerrarSesion);

module.exports = router;
