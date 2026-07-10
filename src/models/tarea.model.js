const db = require('../db/database');

function obtenerTodas() {
  return db.prepare('SELECT * FROM tareas ORDER BY id DESC').all();
}

function obtenerPorId(id) {
  return db.prepare('SELECT * FROM tareas WHERE id = ?').get(id);
}

function crear({ titulo, descripcion, prioridad }) {
  const info = db
    .prepare('INSERT INTO tareas (titulo, descripcion, prioridad) VALUES (?, ?, ?)')
    .run(titulo, descripcion || null, prioridad || 'media');
  return obtenerPorId(info.lastInsertRowid);
}

function marcarCompletada(id, completada) {
  const info = db
    .prepare('UPDATE tareas SET completada = ? WHERE id = ?')
    .run(completada ? 1 : 0, id);
  if (info.changes === 0) return null;
  return obtenerPorId(id);
}

function buscarPorTitulo(texto) {
  const textoEscapado = texto.replace(/[%_]/g, '\\$&');
  return db
    .prepare("SELECT * FROM tareas WHERE titulo LIKE ? ESCAPE '\\' ORDER BY id DESC")
    .all(`%${textoEscapado}%`);
}

function contarPorEstado() {
  const filas = db
    .prepare('SELECT completada, COUNT(*) AS total FROM tareas GROUP BY completada')
    .all();

  const completadas = filas.find((f) => f.completada === 1)?.total || 0;
  const pendientes = filas.find((f) => f.completada === 0)?.total || 0;

  return { completadas, pendientes };
}

function eliminar(id) {
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
  eliminar,
};
