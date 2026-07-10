const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { autenticar } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(autenticar);

router.get('/resumen', analyticsController.resumen);
router.get('/por-dia', analyticsController.porDia);
router.get('/por-prioridad', analyticsController.porPrioridad);
router.get('/racha', analyticsController.racha);

module.exports = router;
