import { api } from './api.js';
import { state } from './state.js';
import { els } from './dom.js';
import { formatDate, priorityBadgeClass, priorityWeight } from './utils.js';

export function scopeUserId() {
  if (!state.user) {
    return null;
  }

  if (state.user.rol === 'admin') {
    return state.selectedUserId === 'all' ? null : state.selectedUserId;
  }

  return state.user.id;
}

export function filteredTasks() {
  let tasks = [...state.tasks];

  if (state.priority) {
    tasks = tasks.filter((task) => task.prioridad === state.priority);
  }

  if (state.search.trim()) {
    const query = state.search.trim().toLowerCase();
    tasks = tasks.filter((task) => {
      const subtareas = Array.isArray(task.subtareas) ? task.subtareas : [];
      return [task.titulo, task.descripcion, task.owner_nombre, ...subtareas.map((item) => item.texto)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }

  if (state.order === 'prioridad') {
    tasks.sort((a, b) => priorityWeight(a.prioridad) - priorityWeight(b.prioridad));
  } else if (state.order === 'fecha_limite') {
    tasks.sort((a, b) => {
      if (!a.fecha_limite) return 1;
      if (!b.fecha_limite) return -1;
      return a.fecha_limite.localeCompare(b.fecha_limite);
    });
  } else {
    tasks.sort((a, b) => Number(b.id) - Number(a.id));
  }

  return tasks;
}

export function renderTasks() {
  const tasks = filteredTasks();
  els.taskEmpty.hidden = tasks.length > 0;
  els.taskList.innerHTML = tasks
    .map((task) => {
      const subtareas = Array.isArray(task.subtareas) ? task.subtareas : [];
      const completedSubtasks = subtareas.filter((item) => item.completada).length;
      const owner = task.owner_nombre ? `<span class="badge">${task.owner_nombre}</span>` : '';
      const overdue = task.fecha_limite && !task.completada && task.fecha_limite < new Date().toISOString().slice(0, 10);
      const priorityClass = priorityBadgeClass(task.prioridad);
      return `
        <li class="task-item" data-id="${task.id}">
          <div class="task-main">
            <div class="task-content">
              <div class="task-meta">
                <span class="badge ${priorityClass}">${task.prioridad || 'media'}</span>
                ${owner}
                ${task.fecha_limite ? `<span class="badge ${overdue ? 'high' : ''}">${overdue ? 'Vencida' : formatDate(task.fecha_limite)}</span>` : ''}
                ${subtareas.length ? `<span class="badge">${completedSubtasks}/${subtareas.length} subtareas</span>` : ''}
              </div>
              <div class="task-title ${task.completada ? 'done' : ''}">${task.titulo}</div>
              ${task.descripcion ? `<div class="muted">${task.descripcion}</div>` : ''}
            </div>
            <div class="task-actions">
              <button type="button" data-action="toggle-complete">${task.completada ? 'Marcar pendiente' : 'Completar'}</button>
              <button type="button" data-action="edit-task">Editar</button>
              <button type="button" data-action="delete-task">Eliminar</button>
            </div>
          </div>
          ${
            subtareas.length
              ? `<ul class="task-checklist">
                  ${subtareas
                    .map(
                      (item, index) =>
                        `<li class="${item.completada ? 'done' : ''}" data-index="${index}">${item.completada ? 'x' : '-'} ${item.texto}</li>`,
                    )
                    .join('')}
                </ul>`
              : ''
          }
        </li>
      `;
    })
    .join('');
}

export async function loadTasks() {
  const params = new URLSearchParams();

  if (state.search.trim()) {
    params.set('buscar', state.search.trim());
  }

  const userId = scopeUserId();
  if (userId) {
    params.set('userId', userId);
  }

  state.tasks = await api(`/api/tareas${params.toString() ? `?${params.toString()}` : ''}`);
  renderTasks();
}
