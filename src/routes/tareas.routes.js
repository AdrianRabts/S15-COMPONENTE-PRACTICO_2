const express = require('express');
const tareasController = require('../controllers/tareas.controller');

const router = express.Router();

router.get('/', tareasController.listar);

module.exports = router;
