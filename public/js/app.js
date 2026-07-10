import { api } from './api.js';
import { state } from './state.js';
import { els } from './dom.js';
import { clearMessages, setMessage } from './utils.js';
import { registerActivity, renderActivity } from './activity.js';
import {
  bootstrapSession,
  clearSession,
  resetAuthMode,
  renderScopeLabels,
  renderSession,
  setAuthMode,
  setSession,
} from './auth.js';
import { loadUsers, renderScopeOptions } from './users.js';
import { loadTasks, renderTasks } from './tasks.js';
import { loadDashboard } from './dashboard.js';

function refreshTasksAndDashboard() {
  return Promise.all([loadTasks(), loadDashboard()]);
}

async function afterAuth() {
  if (state.user?.rol === 'admin') {
    await loadUsers();
  } else {
    renderScopeOptions();
  }

  renderScopeLabels();
  await refreshTasksAndDashboard();
}

els.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessages([els.loginMessage, els.registerMessage, els.userMessage, els.taskMessage]);

  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
      }),
    });

    els.loginForm.reset();
    setSession(data.user, data.token);
    renderSession();
    resetAuthMode();
    await afterAuth();
  } catch (error) {
    setMessage(els.loginMessage, error.message, true);
  }
});

els.registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessages([els.loginMessage, els.registerMessage, els.userMessage, els.taskMessage]);

  try {
    await api('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
      }),
    });

    els.registerForm.reset();
    clearSession();
    resetAuthMode();
    setMessage(els.loginMessage, 'Cuenta creada correctamente. Ahora inicia sesion.');
    renderSession();
    els.loginForm.reset();
    document.getElementById('login-email').focus();
  } catch (error) {
    setMessage(els.registerMessage, error.message, true);
  }
});

els.logoutBtn.addEventListener('click', async () => {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    // Ignored on purpose so we can still clear the local session.
  }

  clearSession();
  state.users = [];
  state.tasks = [];
  state.selectedUserId = 'all';
  resetAuthMode();
  renderSession();
  renderScopeOptions();
  renderTasks();
  renderActivity();
});

els.showRegister.addEventListener('click', () => {
  setAuthMode('register');
});

els.showLogin.addEventListener('click', () => {
  setAuthMode('login');
});

els.refreshBtn.addEventListener('click', async () => {
  if (state.user?.rol === 'admin') {
    await loadUsers();
  }
  renderScopeLabels();
  await refreshTasksAndDashboard();
});

els.scopeSelect.addEventListener('change', async (event) => {
  state.selectedUserId = event.target.value;
  renderScopeLabels();
  await refreshTasksAndDashboard();
  if (state.user?.rol === 'admin') {
    await loadUsers();
  }
});

els.taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessages([els.loginMessage, els.registerMessage, els.userMessage, els.taskMessage]);

  try {
    const subtareas = document.getElementById('task-subtasks').value
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((texto) => ({ texto, completada: false }));

    const tarea = await api('/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: document.getElementById('task-title').value,
        descripcion: document.getElementById('task-description').value,
        prioridad: document.getElementById('task-priority').value,
        fecha_limite: document.getElementById('task-date').value || undefined,
        subtareas,
      }),
    });

    registerActivity('creaste', tarea.titulo);
    els.taskForm.reset();
    await refreshTasksAndDashboard();
  } catch (error) {
    setMessage(els.taskMessage, error.message, true);
  }
});

els.userForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessages([els.loginMessage, els.registerMessage, els.userMessage, els.taskMessage]);

  try {
    await api('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        rol: document.getElementById('user-role').value,
      }),
    });

    els.userForm.reset();
    setMessage(els.userMessage, 'Usuario creado correctamente.');
    await loadUsers();
    renderScopeLabels();
    await refreshTasksAndDashboard();
  } catch (error) {
    setMessage(els.userMessage, error.message, true);
  }
});

els.usersTableBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === 'toggle-user') {
    const user = state.users.find((item) => String(item.id) === String(id));
    if (!user) return;

    await api(`/api/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !Boolean(user.activo) }),
    });
    await loadUsers();
    renderScopeLabels();
    await refreshTasksAndDashboard();
    return;
  }

  if (action === 'delete-user') {
    await api(`/api/users/${id}`, { method: 'DELETE' });
    if (String(state.selectedUserId) === String(id)) {
      state.selectedUserId = 'all';
    }
    await loadUsers();
    renderScopeLabels();
    await refreshTasksAndDashboard();
    return;
  }

  if (action === 'scope-user') {
    state.selectedUserId = String(id);
    els.scopeSelect.value = state.selectedUserId;
    renderScopeLabels();
    await refreshTasksAndDashboard();
  }
});

els.taskList.addEventListener('click', async (event) => {
  const taskNode = event.target.closest('.task-item');
  if (!taskNode) return;

  const taskId = taskNode.dataset.id;
  const action = event.target.dataset.action;
  const task = state.tasks.find((item) => String(item.id) === String(taskId));
  if (!task) return;

  if (action === 'toggle-complete') {
    const completed = !Boolean(task.completada);
    await api(`/api/tareas/${taskId}/completar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completada: completed }),
    });
    if (completed) {
      registerActivity('completaste', task.titulo);
    }
    await refreshTasksAndDashboard();
    return;
  }

  if (action === 'delete-task') {
    await api(`/api/tareas/${taskId}`, { method: 'DELETE' });
    registerActivity('eliminaste', task.titulo);
    await refreshTasksAndDashboard();
    return;
  }

  if (action === 'edit-task') {
    const nextTitle = window.prompt('Nuevo titulo', task.titulo);
    if (nextTitle && nextTitle.trim() && nextTitle.trim() !== task.titulo) {
      await api(`/api/tareas/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: nextTitle.trim() }),
      });
      registerActivity('editaste', task.titulo);
      await refreshTasksAndDashboard();
    }
    return;
  }

  const checklistItem = event.target.closest('.task-checklist li');
  if (checklistItem) {
    await api(`/api/tareas/${taskId}/subtareas/${checklistItem.dataset.index}`, { method: 'PATCH' });
    await refreshTasksAndDashboard();
  }
});

els.taskSearch.addEventListener('input', async (event) => {
  state.search = event.target.value;
  await loadTasks();
});

els.taskOrder.addEventListener('change', () => {
  state.order = els.taskOrder.value;
  renderTasks();
});

els.chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    state.priority = chip.dataset.priority || '';
    els.chips.forEach((item) => item.classList.toggle('active', item === chip));
    if (!state.priority) {
      els.chips[0].classList.add('active');
    }
    renderTasks();
  });
});

async function init() {
  await bootstrapSession();

  if (!state.token) {
    els.chips[0].classList.add('active');
    renderActivity();
    return;
  }

  await afterAuth();
  els.chips[0].classList.add('active');
  renderActivity();
}

init();
