const tareaModel = require('../models/tarea.model');

function listar(req, res) {
  const { buscar, userId } = req.query;

  if (buscar) {
    return res.json(tareaModel.buscarPorTitulo(buscar, req.user, userId));
  }

  const tareas = tareaModel.obtenerTodas(req.user, userId);
  res.json(tareas);
}

function buscar(req, res) {
  const { titulo } = req.query;

  if (!titulo) {
    return res.status(400).json({ error: 'El parámetro "titulo" es obligatorio para buscar.' });
  }

  res.json(tareaModel.buscarPorTitulo(titulo, req.user, req.query.userId));
}

function crear(req, res) {
  const { titulo, descripcion, prioridad, fecha_limite: fechaLimite, subtareas } = req.body;
  const tarea = tareaModel.crear({
    titulo: titulo.trim(),
    descripcion,
    prioridad,
    fecha_limite: fechaLimite,
    subtareas,
    user_id: req.user.id,
  });
  res.status(201).json(tarea);
}

function actualizar(req, res) {
  const { id } = req.params;
  const { titulo, fecha_limite: fechaLimite } = req.body;
  const tarea = tareaModel.actualizar(id, { titulo, fecha_limite: fechaLimite }, req.user);

  if (!tarea) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  res.json(tarea);
}

function toggleSubtarea(req, res) {
  const { id, index } = req.params;
  const tarea = tareaModel.toggleSubtarea(id, Number(index), req.user);

  if (!tarea) {
    return res.status(404).json({ error: 'Tarea o subtarea no encontrada' });
  }

  res.json(tarea);
}

function completar(req, res) {
  const { id } = req.params;
  const completada = req.body.completada !== undefined ? req.body.completada : true;
  const tarea = tareaModel.marcarCompletada(id, completada, req.user);

  if (!tarea) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  res.json(tarea);
}

function eliminar(req, res) {
  const { id } = req.params;
  const eliminada = tareaModel.eliminar(id, req.user);

  if (!eliminada) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  res.status(204).send();
}

function reporte(req, res) {
  res.json(tareaModel.contarPorEstado(req.user, req.query.userId));
}

module.exports = {
  listar,
  crear,
  completar,
  eliminar,
  buscar,
  reporte,
  actualizar,
  toggleSubtarea,
};
