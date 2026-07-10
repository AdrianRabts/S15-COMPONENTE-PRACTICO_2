const tareaModel = require('../models/tarea.model');

function listar(req, res) {
  const { buscar } = req.query;

  if (buscar) {
    return res.json(tareaModel.buscarPorTitulo(buscar));
  }

  const tareas = tareaModel.obtenerTodas();
  res.json(tareas);
}

function buscar(req, res) {
  const { titulo } = req.query;

  if (!titulo) {
    return res.status(400).json({ error: 'El parámetro "titulo" es obligatorio para buscar.' });
  }

  res.json(tareaModel.buscarPorTitulo(titulo));
}

function crear(req, res) {
  const { titulo, descripcion, prioridad } = req.body;
  const tarea = tareaModel.crear({ titulo: titulo.trim(), descripcion, prioridad });
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

function eliminar(req, res) {
  const { id } = req.params;
  const eliminada = tareaModel.eliminar(id);

  if (!eliminada) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  res.status(204).send();
}

module.exports = {
  listar,
  crear,
  completar,
  eliminar,
  buscar,
};
