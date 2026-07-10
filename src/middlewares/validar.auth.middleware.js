const ROLES_VALIDOS = ['admin', 'user'];

function validarRegistro(req, res, next) {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio y debe ser texto.' });
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({ error: 'El campo "email" es obligatorio y debe ser texto.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'El campo "password" es obligatorio y debe tener al menos 6 caracteres.' });
  }

  if (rol !== undefined && !ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: 'El campo "rol" debe ser admin o user.' });
  }

  next();
}

function validarLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({ error: 'El campo "email" es obligatorio y debe ser texto.' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'El campo "password" es obligatorio.' });
  }

  next();
}

module.exports = {
  validarRegistro,
  validarLogin,
};
