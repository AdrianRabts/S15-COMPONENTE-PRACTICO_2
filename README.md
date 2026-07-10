# Gestor de Tareas

Aplicacion de gestion de tareas construida con Node.js, Express y SQLite, ahora con:

- Login y registro.
- Roles de `admin` y `user`.
- Control de usuarios para administracion.
- Tareas asociadas al usuario autenticado.
- Dashboard personal o global por usuario.
- Frontend separado en HTML, CSS y JS, con variables de color centralizadas.

## Estructura

```text
src/
  app.js
  controllers/
  db/
  middlewares/
  models/
  routes/
  utils/
public/
  index.html
  css/
  js/
tests/
```

## Variables de entorno

```bash
PORT=3000
DB_PATH=./tareas.db
ADMIN_EMAIL=admin@local
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador
JOEL_EMAIL=joel@local
JOEL_PASSWORD=joel123
JOEL_NAME=joel
```

## Inicio rapido

```bash
npm install
npm start
```

La app queda disponible en `http://localhost:3000`.

## Credenciales iniciales

Si la base de datos no tiene usuarios, el sistema crea automaticamente un administrador inicial usando `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
Tambien crea una segunda cuenta admin para `joel` usando `JOEL_EMAIL` y `JOEL_PASSWORD`.

## Endpoints principales

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Usuarios

- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id/status`
- `DELETE /api/users/:id`

### Tareas

- `GET /api/tareas`
- `POST /api/tareas`
- `GET /api/tareas/buscar?titulo=...`
- `GET /api/tareas/reporte`
- `PATCH /api/tareas/:id`
- `PATCH /api/tareas/:id/completar`
- `PATCH /api/tareas/:id/subtareas/:index`
- `DELETE /api/tareas/:id`

### Analiticas

- `GET /api/analytics/resumen`
- `GET /api/analytics/por-dia`
- `GET /api/analytics/por-prioridad`
- `GET /api/analytics/racha`

Los endpoints de tareas, usuarios y analiticas requieren autenticacion. Los administradores pueden consultar el total general o filtrar por usuario con `?userId=`.

## Frontend

El frontend vive en `public/index.html` y carga:

- `/css/variables.css`
- `/css/styles.css`
- `/js/app.js`

La paleta principal es clara:

- Fondo principal: `#F8FAFC`
- Fondo secundario: `#F1F5F9`
- Superficie: `#FFFFFF`

## Tests

```bash
node ./node_modules/jest/bin/jest.js --runInBand
```
