const PRIORIDADES_VALIDAS = ['alta', 'media', 'baja'];

function validarCrearTarea(req, res, next) {
  const { titulo, prioridad } = req.body;

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
    return res.status(400).json({ error: 'El campo "titulo" es obligatorio y debe ser texto.' });
  }

  if (prioridad !== undefined && !PRIORIDADES_VALIDAS.includes(prioridad)) {
    return res.status(400).json({ error: 'El campo "prioridad" debe ser alta, media o baja.' });
  }

  next();
}

function validarId(req, res, next) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'El parametro "id" debe ser un numero valido.' });
  }

  next();
}

function validarEstadoUsuario(req, res, next) {
  const { activo } = req.body;

  if (typeof activo !== 'boolean') {
    return res.status(400).json({ error: 'El campo "activo" debe ser booleano.' });
  }

  next();
}

module.exports = {
  validarCrearTarea,
  validarId,
  validarEstadoUsuario,
};
