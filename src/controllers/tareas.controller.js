const tareaModel = require('../models/tarea.model');

function listar(req, res) {
  const tareas = tareaModel.obtenerTodas();
  res.json(tareas);
}

function crear(req, res) {
  const { titulo, descripcion } = req.body;
  const tarea = tareaModel.crear({ titulo: titulo.trim(), descripcion });
  res.status(201).json(tarea);
}

module.exports = {
  listar,
  crear,
};
