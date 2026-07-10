process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../src/app');

describe('API de tareas', () => {
  test('POST /api/tareas crea una tarea nueva', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .send({ titulo: 'Comprar pan', descripcion: 'Del panaderia de la esquina' });

    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe('Comprar pan');
    expect(res.body.completada).toBe(0);
  });

  test('GET /api/tareas lista las tareas creadas', async () => {
    await request(app).post('/api/tareas').send({ titulo: 'Tarea de prueba' });
    const res = await request(app).get('/api/tareas');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('PATCH /api/tareas/:id/completar marca una tarea como completada', async () => {
    const creada = await request(app).post('/api/tareas').send({ titulo: 'Tarea a completar' });
    const res = await request(app).patch(`/api/tareas/${creada.body.id}/completar`).send({ completada: true });

    expect(res.status).toBe(200);
    expect(res.body.completada).toBe(1);
  });
});
