const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'tareas.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    completada INTEGER NOT NULL DEFAULT 0,
    creada_en TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const columnas = db.prepare("PRAGMA table_info(tareas)").all().map((col) => col.name);

if (!columnas.includes('prioridad')) {
  db.exec("ALTER TABLE tareas ADD COLUMN prioridad TEXT NOT NULL DEFAULT 'media'");
}

module.exports = db;
