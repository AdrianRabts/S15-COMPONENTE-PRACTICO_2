const db = require('../db/database');
const { crearHashPassword, verificarPassword, crearTokenSeguro } = require('../utils/security');

function mapearUsuario(fila) {
  if (!fila) return null;

  return {
    id: fila.id,
    nombre: fila.nombre,
    email: fila.email,
    rol: fila.rol,
    activo: fila.activo,
    creado_en: fila.creado_en,
  };
}

function obtenerPorId(id) {
  return mapearUsuario(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
}

function obtenerPorEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
}

function obtenerTodos() {
  return db
    .prepare(`
      SELECT u.*, COUNT(t.id) AS total_tareas
      FROM users u
      LEFT JOIN tareas t ON t.user_id = u.id
      GROUP BY u.id
      ORDER BY u.rol = 'admin' DESC, u.nombre ASC
    `)
    .all()
    .map((fila) => ({
      ...mapearUsuario(fila),
      total_tareas: fila.total_tareas,
    }));
}

function crear({ nombre, email, password, rol = 'user', activo = 1 }) {
  const correo = email.toLowerCase().trim();
  const existe = obtenerPorEmail(correo);

  if (existe) {
    const error = new Error('El correo ya esta registrado.');
    error.codigo = 'EMAIL_DUPLICADO';
    throw error;
  }

  const { salt, hash } = crearHashPassword(password);
  const info = db
    .prepare('INSERT INTO users (nombre, email, password_hash, password_salt, rol, activo) VALUES (?, ?, ?, ?, ?, ?)')
    .run(nombre.trim(), correo, hash, salt, rol, activo ? 1 : 0);

  return obtenerPorId(info.lastInsertRowid);
}

function autenticar(email, password) {
  const usuario = obtenerPorEmail(email);
  if (!usuario || usuario.activo === 0) return null;
  if (!verificarPassword(password, usuario.password_salt, usuario.password_hash)) return null;
  return mapearUsuario(usuario);
}

function crearSesion(userId) {
  const token = crearTokenSeguro();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  db.prepare('INSERT INTO auth_tokens (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);

  return { token, expiresAt };
}

function cerrarSesion(token) {
  return db.prepare('DELETE FROM auth_tokens WHERE token = ?').run(token);
}

function obtenerUsuarioPorToken(token) {
  const fila = db
    .prepare(`
      SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.creado_en, t.token
      FROM auth_tokens t
      INNER JOIN users u ON u.id = t.user_id
      WHERE t.token = ? AND datetime(t.expires_at) > datetime('now')
    `)
    .get(token);

  if (!fila || fila.activo === 0) return null;
  return { ...mapearUsuario(fila), token: fila.token };
}

function cambiarEstado(id, activo) {
  const info = db.prepare('UPDATE users SET activo = ? WHERE id = ?').run(activo ? 1 : 0, id);
  return info.changes > 0 ? obtenerPorId(id) : null;
}

function eliminar(id) {
  const info = db.prepare('DELETE FROM users WHERE id = ? AND rol != "admin"').run(id);
  return info.changes > 0;
}

module.exports = {
  obtenerPorId,
  obtenerPorEmail,
  obtenerTodos,
  crear,
  autenticar,
  crearSesion,
  cerrarSesion,
  obtenerUsuarioPorToken,
  cambiarEstado,
  eliminar,
};
