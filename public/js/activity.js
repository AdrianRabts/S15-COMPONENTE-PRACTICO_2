import { state } from './state.js';
import { els } from './dom.js';

export function registerActivity(action, title) {
  state.activity.unshift({
    action,
    title,
    time: Date.now(),
  });
  state.activity = state.activity.slice(0, 4);
  renderActivity();
}

export function renderActivity() {
  if (state.activity.length === 0) {
    els.activityLog.innerHTML = '<div class="muted">Las acciones recientes apareceran aqui.</div>';
    return;
  }

  els.activityLog.innerHTML = state.activity
    .map((item) => {
      const minutes = Math.max(0, Math.floor((Date.now() - item.time) / 60000));
      const when = minutes < 1 ? 'ahora' : `hace ${minutes}m`;
      return `<div><strong>${item.action}</strong> "${item.title}" <span class="muted">${when}</span></div>`;
    })
    .join('');
}
