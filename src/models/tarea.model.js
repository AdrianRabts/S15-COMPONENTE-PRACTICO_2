const db = require('../db/database');

function mapearTarea(fila) {
  if (!fila) return fila;
  return { ...fila, subtareas: fila.subtareas ? JSON.parse(fila.subtareas) : [] };
}

function obtenerTodas() {
  return db.prepare('SELECT * FROM tareas ORDER BY id DESC').all().map(mapearTarea);
}

function obtenerPorId(id) {
  return mapearTarea(db.prepare('SELECT * FROM tareas WHERE id = ?').get(id));
}

function crear({ titulo, descripcion, prioridad, fecha_limite: fechaLimite, subtareas }) {
  const info = db
    .prepare('INSERT INTO tareas (titulo, descripcion, prioridad, fecha_limite, subtareas) VALUES (?, ?, ?, ?, ?)')
    .run(titulo, descripcion || null, prioridad || 'media', fechaLimite || null, JSON.stringify(subtareas || []));
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
    .all(`%${textoEscapado}%`)
    .map(mapearTarea);
}

function contarPorEstado() {
  const filas = db
    .prepare('SELECT completada, COUNT(*) AS total FROM tareas GROUP BY completada')
    .all();

  const completadas = filas.find((f) => f.completada === 1)?.total || 0;
  const pendientes = filas.find((f) => f.completada === 0)?.total || 0;
  const vencidas = db
    .prepare("SELECT COUNT(*) AS total FROM tareas WHERE completada = 0 AND fecha_limite IS NOT NULL AND fecha_limite < date('now')")
    .get().total;

  return { completadas, pendientes, vencidas };
}

function actualizar(id, { titulo, fecha_limite: fechaLimite }) {
  const actual = obtenerPorId(id);
  if (!actual) return null;

  const nuevoTitulo = titulo !== undefined ? titulo : actual.titulo;
  const nuevaFechaLimite = fechaLimite !== undefined ? fechaLimite : actual.fecha_limite;

  db.prepare('UPDATE tareas SET titulo = ?, fecha_limite = ? WHERE id = ?').run(nuevoTitulo, nuevaFechaLimite, id);
  return obtenerPorId(id);
}

function toggleSubtarea(id, index) {
  const tarea = obtenerPorId(id);
  if (!tarea || !tarea.subtareas[index]) return null;

  tarea.subtareas[index].completada = !tarea.subtareas[index].completada;
  db.prepare('UPDATE tareas SET subtareas = ? WHERE id = ?').run(JSON.stringify(tarea.subtareas), id);
  return obtenerPorId(id);
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
  actualizar,
  toggleSubtarea,
  eliminar,
};
