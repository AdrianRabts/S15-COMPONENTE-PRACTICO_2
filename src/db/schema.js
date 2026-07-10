const db = require('./database');
const { crearHashPassword } = require('../utils/security');

function ejecutarMigraciones() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'user',
      activo INTEGER NOT NULL DEFAULT 1,
      creado_en TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS auth_tokens (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      creado_en TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      completada INTEGER NOT NULL DEFAULT 0,
      creada_en TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const userColumns = db.prepare('PRAGMA table_info(users)').all().map((col) => col.name);
  const tareaColumns = db.prepare('PRAGMA table_info(tareas)').all().map((col) => col.name);

  if (!userColumns.includes('rol')) {
    db.exec("ALTER TABLE users ADD COLUMN rol TEXT NOT NULL DEFAULT 'user'");
  }

  if (!userColumns.includes('activo')) {
    db.exec('ALTER TABLE users ADD COLUMN activo INTEGER NOT NULL DEFAULT 1');
  }

  if (!userColumns.includes('creado_en')) {
    db.exec("ALTER TABLE users ADD COLUMN creado_en TEXT NOT NULL DEFAULT (datetime('now'))");
  }

  if (!tareaColumns.includes('prioridad')) {
    db.exec("ALTER TABLE tareas ADD COLUMN prioridad TEXT NOT NULL DEFAULT 'media'");
  }

  if (!tareaColumns.includes('fecha_limite')) {
    db.exec('ALTER TABLE tareas ADD COLUMN fecha_limite TEXT');
  }

  if (!tareaColumns.includes('subtareas')) {
    db.exec('ALTER TABLE tareas ADD COLUMN subtareas TEXT');
  }

  if (!tareaColumns.includes('fecha_completado')) {
    db.exec('ALTER TABLE tareas ADD COLUMN fecha_completado TEXT');
  }

  if (!tareaColumns.includes('user_id')) {
    db.exec('ALTER TABLE tareas ADD COLUMN user_id INTEGER');
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminNombre = process.env.ADMIN_NAME || 'Administrador';
  const joelName = process.env.JOEL_NAME || 'joel';
  const joelEmail = process.env.JOEL_EMAIL || 'joel@local';
  const joelPassword = process.env.JOEL_PASSWORD || 'joel123';

  function asegurarAdmin({ nombre, email, password }) {
    const existente = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    const { salt, hash } = crearHashPassword(password);

    if (!existente) {
      const info = db
        .prepare('INSERT INTO users (nombre, email, password_hash, password_salt, rol, activo) VALUES (?, ?, ?, ?, ?, ?)')
        .run(nombre, email, hash, salt, 'admin', 1);

      return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    }

    db.prepare('UPDATE users SET nombre = ?, password_hash = ?, password_salt = ?, rol = ?, activo = 1 WHERE email = ?')
      .run(nombre, hash, salt, 'admin', email);

    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  const admin = asegurarAdmin({ nombre: adminNombre, email: adminEmail, password: adminPassword });
  asegurarAdmin({ nombre: joelName, email: joelEmail, password: joelPassword });

  db.prepare('UPDATE tareas SET user_id = ? WHERE user_id IS NULL').run(admin.id);
}

ejecutarMigraciones();

module.exports = db;
