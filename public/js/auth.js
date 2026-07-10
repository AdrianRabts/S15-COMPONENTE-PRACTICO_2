import { api } from './api.js';
import { state } from './state.js';
import { els } from './dom.js';
import { selectedScopeLabel } from './utils.js';

export function setSession(user, token) {
  state.user = user;
  state.token = token;
  localStorage.setItem('auth_token', token);
}

export function clearSession() {
  state.user = null;
  state.token = '';
  localStorage.removeItem('auth_token');
}

export function renderSession() {
  const loggedIn = Boolean(state.user);
  els.authView.hidden = loggedIn;
  els.appView.hidden = !loggedIn;
  els.logoutBtn.hidden = !loggedIn;
  els.sessionRole.textContent = loggedIn
    ? `${state.user.nombre} - ${state.user.rol}`
    : 'sesion cerrada';
  els.userGreeting.textContent = loggedIn ? `Hola, ${state.user.nombre}` : 'Bienvenido';
  els.userContext.textContent = loggedIn
    ? 'Usa la vista de tareas y el dashboard para seguir el progreso.'
    : 'Inicia sesion para administrar tareas y usuarios.';
  els.adminPanel.hidden = !loggedIn || state.user.rol !== 'admin';
}

export function setAuthMode(mode = 'login') {
  els.authStage.classList.toggle('is-register', mode === 'register');
}

export function resetAuthMode() {
  setAuthMode('login');
}

export function renderScopeLabels() {
  const label = selectedScopeLabel(state);
  els.taskScopeLabel.textContent = label;
  els.dashboardScopeLabel.textContent = label;
}

export async function bootstrapSession() {
  if (!state.token) {
    resetAuthMode();
    renderSession();
    return;
  }

  try {
    const data = await api('/api/auth/me');
    state.user = data.user;
    renderSession();
    renderScopeLabels();
  } catch (error) {
    clearSession();
    resetAuthMode();
    renderSession();
  }
}
