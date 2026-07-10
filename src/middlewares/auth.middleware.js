const db = require('../db/database');

function extraerToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }

  return req.headers['x-auth-token'] || null;
}

function autenticar(req, res, next) {
  const token = extraerToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Debes iniciar sesion para continuar.' });
  }

  const fila = db
    .prepare(`
      SELECT u.id, u.nombre, u.email, u.rol, u.activo, t.token
      FROM auth_tokens t
      INNER JOIN users u ON u.id = t.user_id
      WHERE t.token = ? AND datetime(t.expires_at) > datetime('now')
    `)
    .get(token);

  if (!fila || fila.activo === 0) {
    return res.status(401).json({ error: 'Sesion invalida o expirada.' });
  }

  req.user = {
    id: fila.id,
    nombre: fila.nombre,
    email: fila.email,
    rol: fila.rol,
    activo: fila.activo,
    token: fila.token,
  };

  next();
}

function exigirRol(rol) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Debes iniciar sesion para continuar.' });
    }

    if (req.user.rol !== rol) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta accion.' });
    }

    next();
  };
}

function exigirAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Debes iniciar sesion para continuar.' });
  }

  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta accion.' });
  }

  next();
}

module.exports = {
  autenticar,
  exigirAdmin,
  exigirRol,
};
