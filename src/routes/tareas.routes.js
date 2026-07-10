const express = require('express');
const tareasController = require('../controllers/tareas.controller');
const { validarCrearTarea } = require('../middlewares/validar.middleware');

const router = express.Router();

router.get('/', tareasController.listar);
router.post('/', validarCrearTarea, tareasController.crear);

module.exports = router;
