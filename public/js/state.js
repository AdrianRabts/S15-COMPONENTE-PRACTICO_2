export const state = {
  token: localStorage.getItem('auth_token') || '',
  user: null,
  users: [],
  tasks: [],
  selectedUserId: 'all',
  search: '',
  order: 'reciente',
  priority: '',
  charts: {},
  activity: [],
};
