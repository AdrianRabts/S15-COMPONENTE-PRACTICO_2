import { api } from './api.js';
import { state } from './state.js';
import { els } from './dom.js';
import { renderScopeLabels } from './auth.js';

export async function loadUsers() {
  if (state.user?.rol !== 'admin') {
    state.users = [];
    renderScopeLabels();
    return;
  }

  state.users = await api('/api/users');
  if (state.selectedUserId !== 'all' && !state.users.some((user) => String(user.id) === String(state.selectedUserId))) {
    state.selectedUserId = 'all';
  }
  renderUsers();
  renderScopeOptions();
}

export function renderUsers() {
  if (state.user?.rol !== 'admin') {
    els.usersTableBody.innerHTML = '';
    return;
  }

  els.usersTableBody.innerHTML = state.users
    .map((user) => {
      const badgeClass = user.rol === 'admin' ? 'admin' : 'user';
      const statusClass = user.activo ? 'user' : 'inactive';
      return `
        <tr>
          <td>${user.nombre}</td>
          <td>${user.email}</td>
          <td><span class="tag ${badgeClass}">${user.rol}</span></td>
          <td><span class="tag ${statusClass}">${user.activo ? 'activo' : 'deshabilitado'}</span></td>
          <td>${user.total_tareas || 0}</td>
          <td>
            <div class="task-actions">
              <button type="button" data-action="toggle-user" data-id="${user.id}">
                ${user.activo ? 'Deshabilitar' : 'Habilitar'}
              </button>
              <button type="button" data-action="delete-user" data-id="${user.id}" ${user.rol === 'admin' ? 'disabled' : ''}>
                Eliminar
              </button>
              <button type="button" data-action="scope-user" data-id="${user.id}">Ver</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

export function renderScopeOptions() {
  const options = [];

  if (state.user?.rol === 'admin') {
    options.push('<option value="all">Todos los usuarios</option>');
    state.users.forEach((user) => {
      options.push(`<option value="${user.id}">${user.nombre} (${user.email})${user.activo ? '' : ' - inactivo'}</option>`);
    });
  } else if (state.user) {
    options.push(`<option value="${state.user.id}">${state.user.nombre}</option>`);
  }

  els.scopeSelect.innerHTML = options.join('');
  els.scopeSelect.value = state.user?.rol === 'admin' ? state.selectedUserId : String(state.user?.id || '');
  renderScopeLabels();
}
