process.env.DB_PATH = ':memory:';
process.env.ADMIN_EMAIL = 'admin@local';
process.env.ADMIN_PASSWORD = 'admin123';

const request = require('supertest');
const app = require('../src/app');

async function loginAdmin() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@local', password: 'admin123' });

  return res.body.token;
}

describe('API de analiticas', () => {
  let token;

  beforeAll(async () => {
    token = await loginAdmin();
  });

  function authed(method, url) {
    return request(app)[method](url).set('Authorization', `Bearer ${token}`);
  }

  test('GET /api/analytics/resumen no rompe con la base vacia', async () => {
    const res = await authed('get', '/api/analytics/resumen');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.tasaCompletado).toBe(0);
    expect(res.body.tiempoPromedioHoras).toBeNull();
  });

  test('GET /api/analytics/por-dia devuelve 7 dias aunque no haya tareas', async () => {
    const res = await authed('get', '/api/analytics/por-dia');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(7);
    expect(res.body.every((dia) => dia.completadas === 0)).toBe(true);
  });

  test('GET /api/analytics/por-prioridad y /racha reflejan una tarea completada', async () => {
    const creada = await authed('post', '/api/tareas').send({ titulo: 'Tarea analitica', prioridad: 'alta' });
    await authed('patch', `/api/tareas/${creada.body.id}/completar`).send({ completada: true });

    const porPrioridad = await authed('get', '/api/analytics/por-prioridad');
    const racha = await authed('get', '/api/analytics/racha');
    const resumen = await authed('get', '/api/analytics/resumen');

    expect(porPrioridad.body.find((p) => p.prioridad === 'alta').cantidad).toBe(1);
    expect(racha.body.racha).toBe(1);
    expect(resumen.body.completadas).toBe(1);
    expect(resumen.body.tasaCompletado).toBe(100);
  });
});
