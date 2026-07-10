const tareaModel = require('../models/tarea.model');

function listar(req, res) {
  const tareas = tareaModel.obtenerTodas();
  res.json(tareas);
}

module.exports = {
  listar,
};
