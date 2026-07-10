const db = require('../db/database');

const PRIORIDADES = ['alta', 'media', 'baja'];

function resumen() {
  const filas = db.prepare('SELECT completada, COUNT(*) AS total FROM tareas GROUP BY completada').all();
  const completadas = filas.find((f) => f.completada === 1)?.total || 0;
  const pendientes = filas.find((f) => f.completada === 0)?.total || 0;
  const total = completadas + pendientes;

  const vencidas = db
    .prepare("SELECT COUNT(*) AS total FROM tareas WHERE completada = 0 AND fecha_limite IS NOT NULL AND fecha_limite < date('now')")
    .get().total;

  const tasaCompletado = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const { promedio } = db
    .prepare(`
      SELECT AVG((julianday(fecha_completado) - julianday(creada_en)) * 24) AS promedio
      FROM tareas
      WHERE completada = 1 AND fecha_completado IS NOT NULL
    `)
    .get();

  return {
    total,
    completadas,
    pendientes,
    vencidas,
    tasaCompletado,
    tiempoPromedioHoras: promedio !== null ? Math.round(promedio * 10) / 10 : null,
  };
}

function porDia() {
  const dias = [];
  for (let i = 6; i >= 0; i -= 1) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    dias.push(fecha.toISOString().slice(0, 10));
  }

  const filas = db
    .prepare(`
      SELECT date(fecha_completado) AS fecha, COUNT(*) AS total
      FROM tareas
      WHERE fecha_completado IS NOT NULL AND date(fecha_completado) >= date('now', '-6 days')
      GROUP BY date(fecha_completado)
    `)
    .all();

  const mapa = new Map(filas.map((f) => [f.fecha, f.total]));
  return dias.map((fecha) => ({ fecha, completadas: mapa.get(fecha) || 0 }));
}

function porPrioridad() {
  const filas = db.prepare('SELECT prioridad, COUNT(*) AS cantidad FROM tareas GROUP BY prioridad').all();
  const mapa = new Map(filas.map((f) => [f.prioridad, f.cantidad]));
  return PRIORIDADES.map((prioridad) => ({ prioridad, cantidad: mapa.get(prioridad) || 0 }));
}

function racha() {
  const filas = db
    .prepare('SELECT DISTINCT date(fecha_completado) AS fecha FROM tareas WHERE fecha_completado IS NOT NULL')
    .all();
  const fechasCompletadas = new Set(filas.map((f) => f.fecha));

  let diasConsecutivos = 0;
  const cursor = new Date();

  while (fechasCompletadas.has(cursor.toISOString().slice(0, 10))) {
    diasConsecutivos += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return diasConsecutivos;
}

module.exports = {
  resumen,
  porDia,
  porPrioridad,
  racha,
};
