export function setMessage(target, message, error = false) {
  target.textContent = message || '';
  target.style.color = error ? 'var(--danger)' : 'var(--success)';
}

export function clearMessages(nodes) {
  nodes.forEach((node) => {
    node.textContent = '';
  });
}

export function formatDate(value) {
  if (!value) return 'Sin fecha';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function priorityWeight(priority) {
  return { alta: 0, media: 1, baja: 2 }[priority] ?? 1;
}

export function priorityBadgeClass(priority) {
  return { alta: 'high', media: 'medium', baja: 'low' }[priority] || 'medium';
}

export function selectedScopeLabel(state) {
  if (state.user?.rol !== 'admin') {
    return `${state.user?.nombre || 'Usuario'} - vista personal`;
  }

  if (state.selectedUserId === 'all') {
    return 'Todos los usuarios';
  }

  const user = state.users.find((item) => String(item.id) === String(state.selectedUserId));
  return user ? `${user.nombre} - ${user.email}` : 'Vista personalizada';
}
