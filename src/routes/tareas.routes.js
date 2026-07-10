const express = require('express');
const tareasController = require('../controllers/tareas.controller');
const { validarCrearTarea, validarId } = require('../middlewares/validar.middleware');

const router = express.Router();

router.get('/', tareasController.listar);
router.post('/', validarCrearTarea, tareasController.crear);
router.patch('/:id/completar', validarId, tareasController.completar);

module.exports = router;
