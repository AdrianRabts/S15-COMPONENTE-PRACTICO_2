# Gestor de Tareas

Aplicación simple de gestión de tareas (To-Do List) construida con Node.js, Express y SQLite.

Proyecto final de la materia "Gestión de la Configuración de Software".

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

## Integración Continua

Cada `push` y `pull request` a `main` dispara el workflow definido en `.github/workflows/ci.yml`, que instala dependencias, corre el linter (ESLint) y ejecuta los tests (Jest).

## Despliegue en Render

1. Crear una cuenta en [Render](https://render.com) y conectar el repositorio de GitHub.
2. Crear un nuevo **Web Service** apuntando a este repositorio (Render detecta `render.yaml` automáticamente).
3. Build command: `npm install`. Start command: `npm start`.
4. Configurar las variables de entorno de `.env.example` en el panel de Render (Environment).
5. Cada push a `main` dispara un nuevo deploy automático.

**Link al despliegue:** _pendiente de agregar una vez creado el servicio en Render._
