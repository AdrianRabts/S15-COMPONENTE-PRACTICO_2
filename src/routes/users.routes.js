const express = require('express');
const usersController = require('../controllers/users.controller');
const { autenticar, exigirAdmin } = require('../middlewares/auth.middleware');
const { validarCrearUsuario } = require('../middlewares/validar.users.middleware');
const { validarEstadoUsuario, validarId } = require('../middlewares/validar.middleware');

const router = express.Router();

router.use(autenticar, exigirAdmin);

router.get('/', usersController.listar);
router.post('/', validarCrearUsuario, usersController.crear);
router.patch('/:id/status', validarId, validarEstadoUsuario, usersController.cambiarEstado);
router.delete('/:id', validarId, usersController.eliminar);

module.exports = router;
