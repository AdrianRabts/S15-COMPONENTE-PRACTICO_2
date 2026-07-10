# Gestor de Tareas

![CI](https://github.com/OWNER/gestor-tareas/actions/workflows/ci.yml/badge.svg)

Aplicación simple de gestión de tareas (To-Do List) construida con Node.js, Express y SQLite.

Proyecto final de la materia "Gestión de la Configuración de Software". Grupo: Joel, Joseph, Josue y Alan.

Este proyecto se usa como demo en vivo de: control de cambios, versionamiento con Git, integración continua, despliegue continuo, reutilización de código y variabilidad (V1 vs V2).

## Reutilización de código

- `src/middlewares/validar.middleware.js`: middleware de validación reutilizado en varias rutas (crear tarea, validar id).
- `src/middlewares/manejarErrores.middleware.js`: manejador de errores centralizado para toda la app.
- `src/models/tarea.model.js`: acceso a datos separado del controller (patrón repository).

## Gestión del cambio

Ver [`docs/gestion-cambios.md`](docs/gestion-cambios.md) para el registro del cambio de V1 a V2.

## Instalación local

```bash
npm install
npm start
```

La app corre por defecto en `http://localhost:3000`.

## Tests

```bash
npm test
```

## V1 vs V2

- **V1** (`v1.0.0`): CRUD básico de tareas — crear, listar, completar y eliminar.
- **V2** (`v2.0.0`, rama `feature/busqueda-y-reportes`): todo lo de V1, más:
  - Búsqueda de tareas por título (`GET /api/tareas/buscar?titulo=...` o `GET /api/tareas?buscar=...`)
  - Prioridad (`alta` / `media` / `baja`) al crear una tarea
  - Reporte de tareas completadas vs pendientes (`GET /api/tareas/reporte`)

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/tareas` | Lista todas las tareas (o filtra con `?buscar=`) |
| POST | `/api/tareas` | Crea una tarea (`titulo`, `descripcion`, `prioridad`) |
| GET | `/api/tareas/buscar?titulo=` | Busca tareas por título |
| GET | `/api/tareas/reporte` | Cuenta tareas completadas vs pendientes |
| PATCH | `/api/tareas/:id/completar` | Marca una tarea como completada |
| DELETE | `/api/tareas/:id` | Elimina una tarea |

## Integración Continua

Cada `push` y `pull request` a `main` dispara el workflow definido en `.github/workflows/ci.yml`, que instala dependencias, corre el linter (ESLint) y ejecuta los tests (Jest).

## Despliegue en Render

1. Crear una cuenta en [Render](https://render.com) y conectar el repositorio de GitHub.
2. Crear un nuevo **Web Service** apuntando a este repositorio (Render detecta `render.yaml` automáticamente).
3. Build command: `npm install`. Start command: `npm start`.
4. Configurar las variables de entorno de `.env.example` en el panel de Render (Environment).
5. Cada push a `main` dispara un nuevo deploy automático.

**Link al despliegue:** _pendiente de agregar una vez creado el servicio en Render._

## Licencia

MIT
