const express = require('express');
const tareasController = require('../controllers/tareas.controller');
const { validarCrearTarea, validarId } = require('../middlewares/validar.middleware');

const router = express.Router();

router.get('/', tareasController.listar);
router.get('/buscar', tareasController.buscar);
router.get('/reporte', tareasController.reporte);
router.post('/', validarCrearTarea, tareasController.crear);
router.patch('/:id/completar', validarId, tareasController.completar);
router.delete('/:id', validarId, tareasController.eliminar);

module.exports = router;
