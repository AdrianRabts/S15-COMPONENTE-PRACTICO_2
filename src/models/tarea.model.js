const db = require('../db/database');

function mapearTarea(fila) {
  if (!fila) return fila;
  return { ...fila, subtareas: fila.subtareas ? JSON.parse(fila.subtareas) : [] };
}

function construirFiltroUsuario(usuario, userIdFiltro) {
  if (usuario && usuario.rol === 'admin') {
    if (userIdFiltro) {
      return {
        where: 'WHERE user_id = ?',
        params: [Number(userIdFiltro)],
      };
    }

    return { where: '', params: [] };
  }

  return {
    where: 'WHERE user_id = ?',
    params: [usuario.id],
  };
}

function obtenerTodas(usuario, userIdFiltro = null) {
  const filtro = construirFiltroUsuario(usuario, userIdFiltro);
  const select = usuario && usuario.rol === 'admin' && !userIdFiltro
    ? 'SELECT t.*, u.nombre AS owner_nombre, u.email AS owner_email FROM tareas t LEFT JOIN users u ON u.id = t.user_id'
    : 'SELECT * FROM tareas';

  return db.prepare(`${select} ${filtro.where} ORDER BY id DESC`).all(...filtro.params).map(mapearTarea);
}

function obtenerPorId(id) {
  return mapearTarea(db.prepare('SELECT * FROM tareas WHERE id = ?').get(id));
}

function puedeAccederTarea(tarea, usuario) {
  if (!tarea) return false;
  return usuario.rol === 'admin' || tarea.user_id === usuario.id;
}

function crear({ titulo, descripcion, prioridad, fecha_limite: fechaLimite, subtareas, user_id: userId }) {
  const info = db
    .prepare('INSERT INTO tareas (titulo, descripcion, prioridad, fecha_limite, subtareas, user_id) VALUES (?, ?, ?, ?, ?, ?)')
    .run(titulo, descripcion || null, prioridad || 'media', fechaLimite || null, JSON.stringify(subtareas || []), userId);
  return obtenerPorId(info.lastInsertRowid);
}

function marcarCompletada(id, completada, usuario) {
  const actual = obtenerPorId(id);
  if (!puedeAccederTarea(actual, usuario)) return null;

  const fechaCompletado = completada ? new Date().toISOString() : null;
  const info = db
    .prepare('UPDATE tareas SET completada = ?, fecha_completado = ? WHERE id = ?')
    .run(completada ? 1 : 0, fechaCompletado, id);
  if (info.changes === 0) return null;
  return obtenerPorId(id);
}

function buscarPorTitulo(texto, usuario, userIdFiltro = null) {
  const textoEscapado = texto.replace(/[%_]/g, '\\$&');
  const filtro = construirFiltroUsuario(usuario, userIdFiltro);
  const select = usuario && usuario.rol === 'admin' && !userIdFiltro
    ? 'SELECT t.*, u.nombre AS owner_nombre, u.email AS owner_email FROM tareas t LEFT JOIN users u ON u.id = t.user_id'
    : 'SELECT * FROM tareas';
  return db
    .prepare(`${select} ${filtro.where ? `${filtro.where} AND` : 'WHERE'} titulo LIKE ? ESCAPE '\\' ORDER BY id DESC`)
    .all(...filtro.params, `%${textoEscapado}%`)
    .map(mapearTarea);
}

function contarPorEstado(usuario, userIdFiltro = null) {
  const filtro = construirFiltroUsuario(usuario, userIdFiltro);
  const filas = db
    .prepare(`SELECT completada, COUNT(*) AS total FROM tareas ${filtro.where} GROUP BY completada`)
    .all(...filtro.params);

  const completadas = filas.find((f) => f.completada === 1)?.total || 0;
  const pendientes = filas.find((f) => f.completada === 0)?.total || 0;
  const filaVencidas = db
    .prepare(`SELECT COUNT(*) AS total FROM tareas ${filtro.where ? `${filtro.where} AND` : 'WHERE'} completada = 0 AND fecha_limite IS NOT NULL AND fecha_limite < date('now')`)
    .get(...filtro.params);
  const vencidas = filaVencidas?.total || 0;

  return { completadas, pendientes, vencidas };
}

function actualizar(id, { titulo, fecha_limite: fechaLimite }, usuario) {
  const actual = obtenerPorId(id);
  if (!puedeAccederTarea(actual, usuario)) return null;

  const nuevoTitulo = titulo !== undefined ? titulo : actual.titulo;
  const nuevaFechaLimite = fechaLimite !== undefined ? fechaLimite : actual.fecha_limite;

  db.prepare('UPDATE tareas SET titulo = ?, fecha_limite = ? WHERE id = ?').run(nuevoTitulo, nuevaFechaLimite, id);
  return obtenerPorId(id);
}

function toggleSubtarea(id, index, usuario) {
  const tarea = obtenerPorId(id);
  if (!puedeAccederTarea(tarea, usuario)) return null;
  if (!tarea || !tarea.subtareas[index]) return null;

  tarea.subtareas[index].completada = !tarea.subtareas[index].completada;
  db.prepare('UPDATE tareas SET subtareas = ? WHERE id = ?').run(JSON.stringify(tarea.subtareas), id);
  return obtenerPorId(id);
}

function eliminar(id, usuario) {
  const tarea = obtenerPorId(id);
  if (!puedeAccederTarea(tarea, usuario)) return false;

  const info = db.prepare('DELETE FROM tareas WHERE id = ?').run(id);
  return info.changes > 0;
}

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  marcarCompletada,
  buscarPorTitulo,
  contarPorEstado,
  actualizar,
  toggleSubtarea,
  eliminar,
};
