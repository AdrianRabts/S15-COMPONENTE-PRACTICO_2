const analyticsModel = require('../models/analytics.model');

function resumen(req, res) {
  res.json(analyticsModel.resumen());
}

function porDia(req, res) {
  res.json(analyticsModel.porDia());
}

function porPrioridad(req, res) {
  res.json(analyticsModel.porPrioridad());
}

function racha(req, res) {
  res.json({ racha: analyticsModel.racha() });
}

module.exports = {
  resumen,
  porDia,
  porPrioridad,
  racha,
};
