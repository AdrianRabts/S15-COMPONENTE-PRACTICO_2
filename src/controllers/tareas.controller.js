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

function completar(req, res) {
  const { id } = req.params;
  const completada = req.body.completada !== undefined ? req.body.completada : true;
  const tarea = tareaModel.marcarCompletada(id, completada);

  if (!tarea) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  res.json(tarea);
}

module.exports = {
  listar,
  crear,
  completar,
};
