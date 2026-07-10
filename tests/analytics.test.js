process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../src/app');

describe('API de analíticas', () => {
  test('GET /api/analytics/resumen no rompe con la base vacía', async () => {
    const res = await request(app).get('/api/analytics/resumen');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.tasaCompletado).toBe(0);
    expect(res.body.tiempoPromedioHoras).toBeNull();
  });

  test('GET /api/analytics/por-dia devuelve 7 días aunque no haya tareas', async () => {
    const res = await request(app).get('/api/analytics/por-dia');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(7);
    expect(res.body.every((dia) => dia.completadas === 0)).toBe(true);
  });

  test('GET /api/analytics/por-prioridad y /racha reflejan una tarea completada', async () => {
    const creada = await request(app).post('/api/tareas').send({ titulo: 'Tarea analítica', prioridad: 'alta' });
    await request(app).patch(`/api/tareas/${creada.body.id}/completar`).send({ completada: true });

    const porPrioridad = await request(app).get('/api/analytics/por-prioridad');
    const racha = await request(app).get('/api/analytics/racha');
    const resumen = await request(app).get('/api/analytics/resumen');

    expect(porPrioridad.body.find((p) => p.prioridad === 'alta').cantidad).toBe(1);
    expect(racha.body.racha).toBe(1);
    expect(resumen.body.completadas).toBe(1);
    expect(resumen.body.tasaCompletado).toBe(100);
  });
});
