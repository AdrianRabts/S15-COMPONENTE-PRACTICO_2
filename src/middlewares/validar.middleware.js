function validarCrearTarea(req, res, next) {
  const { titulo } = req.body;

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
    return res.status(400).json({ error: 'El campo "titulo" es obligatorio y debe ser texto.' });
  }

  next();
}

module.exports = {
  validarCrearTarea,
};
