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

  test('DELETE /api/tareas/:id elimina una tarea', async () => {
    const creada = await request(app).post('/api/tareas').send({ titulo: 'Tarea a eliminar' });
    const res = await request(app).delete(`/api/tareas/${creada.body.id}`);

    expect(res.status).toBe(204);
  });

  test('POST /api/tareas sin titulo devuelve error 400', async () => {
    const res = await request(app).post('/api/tareas').send({ descripcion: 'sin titulo' });
    expect(res.status).toBe(400);
  });

  test('GET /api/tareas/buscar encuentra tareas por título', async () => {
    await request(app).post('/api/tareas').send({ titulo: 'Comprar leche' });
    const res = await request(app).get('/api/tareas/buscar?titulo=leche');

    expect(res.status).toBe(200);
    expect(res.body.some((tarea) => tarea.titulo.includes('leche'))).toBe(true);
  });
});
