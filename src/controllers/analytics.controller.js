const analyticsModel = require('../models/analytics.model');

function resumen(req, res) {
  res.json(analyticsModel.resumen(req.user, req.query.userId));
}

function porDia(req, res) {
  res.json(analyticsModel.porDia(req.user, req.query.userId));
}

function porPrioridad(req, res) {
  res.json(analyticsModel.porPrioridad(req.user, req.query.userId));
}

function racha(req, res) {
  res.json({ racha: analyticsModel.racha(req.user, req.query.userId) });
}

module.exports = {
  resumen,
  porDia,
  porPrioridad,
  racha,
};
