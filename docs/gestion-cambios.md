# Gestión del Cambio

Registro de control de cambios del proyecto Gestor de Tareas, siguiendo el proceso de Gestión de la Configuración de Software.

| Cambio solicitado | Motivo | Responsable | Fecha de aprobación |
|---|---|---|---|
| Agregar búsqueda y reportes de tareas (V2: búsqueda por título, prioridad y reporte de completadas vs pendientes) | El cliente necesita encontrar tareas rápido y ver el progreso general del trabajo pendiente | Joel, Joseph, Josue, Alan | 2026-07-09 |

## Detalle del cambio V1 → V2

- **Rama de trabajo:** `feature/busqueda-y-reportes`
- **Tag base (V1):** `v1.0.0`
- **Tag resultante (V2):** `v2.0.0`
- **Alcance:**
  - Búsqueda de tareas por título (`GET /api/tareas/buscar`)
  - Campo de prioridad (alta/media/baja) al crear una tarea
  - Endpoint de reporte de tareas completadas vs pendientes (`GET /api/tareas/reporte`)
- **Impacto:** cambio aditivo, no rompe la funcionalidad ni los endpoints existentes de V1.
