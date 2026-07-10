import { api } from './api.js';
import { state } from './state.js';
import { els } from './dom.js';
import { scopeUserId } from './tasks.js';

function destroyChart(chartKey) {
  if (state.charts[chartKey]) {
    state.charts[chartKey].destroy();
    state.charts[chartKey] = null;
  }
}

function color(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function updateMetrics(resumen, racha) {
  const total = resumen.completadas + resumen.pendientes;
  const rate = total > 0 ? Math.round((resumen.completadas / total) * 100) : 0;

  els.statTotal.textContent = total;
  els.statCompleted.textContent = resumen.completadas;
  els.statOverdue.textContent = resumen.vencidas;
  els.taskProgressFill.style.width = `${rate}%`;
  els.taskProgressLabel.textContent = `${rate}%`;

  els.dashTotal.textContent = resumen.total;
  els.dashCompleted.textContent = resumen.completadas;
  els.dashPending.textContent = resumen.pendientes;
  els.dashOverdue.textContent = resumen.vencidas;
  els.dashRate.textContent = `${resumen.tasaCompletado}%`;
  els.dashStreak.textContent = String(racha.racha);
  els.progressRingLabel.textContent = `${resumen.tasaCompletado}%`;
}

function renderCharts(dayData, priorityData, resumen) {
  destroyChart('day');
  destroyChart('priority');
  destroyChart('progress');

  state.charts.day = new Chart(els.chartDay, {
    type: 'bar',
    data: {
      labels: dayData.map((item) => item.fecha.slice(8, 10)),
      datasets: [{
        label: 'Completadas',
        data: dayData.map((item) => item.completadas),
        backgroundColor: color('--accent'),
        borderRadius: 12,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  });

  state.charts.priority = new Chart(els.chartPriority, {
    type: 'doughnut',
    data: {
      labels: priorityData.map((item) => item.prioridad),
      datasets: [{
        data: priorityData.map((item) => item.cantidad),
        backgroundColor: [color('--danger'), color('--warning'), '#64748b'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: { legend: { position: 'bottom' } },
    },
  });

  state.charts.progress = new Chart(els.chartProgress, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: resumen.total > 0 ? [resumen.completadas, resumen.pendientes] : [1],
        backgroundColor: resumen.total > 0
          ? [color('--success'), '#cbd5e1']
          : ['#cbd5e1'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: { legend: { display: false } },
    },
  });
}

export async function loadDashboard() {
  const params = new URLSearchParams();
  const userId = scopeUserId();
  if (userId) {
    params.set('userId', userId);
  }

  const query = params.toString();
  const [resumen, porDia, porPrioridad, racha] = await Promise.all([
    api(`/api/analytics/resumen${query ? `?${query}` : ''}`),
    api(`/api/analytics/por-dia${query ? `?${query}` : ''}`),
    api(`/api/analytics/por-prioridad${query ? `?${query}` : ''}`),
    api(`/api/analytics/racha${query ? `?${query}` : ''}`),
  ]);

  updateMetrics(resumen, racha);
  renderCharts(porDia, porPrioridad, resumen);
}
