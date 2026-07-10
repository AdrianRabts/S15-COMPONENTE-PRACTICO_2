function validarCrearTarea(req, res, next) {
  const { titulo } = req.body;

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
    return res.status(400).json({ error: 'El campo "titulo" es obligatorio y debe ser texto.' });
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

module.exports = {
  validarCrearTarea,
  validarId,
};
