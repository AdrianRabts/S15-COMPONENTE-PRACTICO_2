process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../src/app');

describe('API de tareas', () => {
  test('GET /health responde con status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

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

  test('GET /api/tareas/reporte cuenta tareas completadas vs pendientes', async () => {
    const creada = await request(app).post('/api/tareas').send({ titulo: 'Tarea para reporte' });
    await request(app).patch(`/api/tareas/${creada.body.id}/completar`).send({ completada: true });

    const res = await request(app).get('/api/tareas/reporte');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('completadas');
    expect(res.body).toHaveProperty('pendientes');
    expect(res.body.completadas).toBeGreaterThanOrEqual(1);
  });

  test('POST /api/tareas asigna prioridad "alta" cuando se especifica', async () => {
    const res = await request(app).post('/api/tareas').send({ titulo: 'Tarea urgente', prioridad: 'alta' });

    expect(res.status).toBe(201);
    expect(res.body.prioridad).toBe('alta');
  });

  test('POST /api/tareas asigna prioridad "media" por defecto', async () => {
    const res = await request(app).post('/api/tareas').send({ titulo: 'Tarea sin prioridad' });

    expect(res.status).toBe(201);
    expect(res.body.prioridad).toBe('media');
  });

  test('POST /api/tareas con prioridad inválida devuelve error 400', async () => {
    const res = await request(app).post('/api/tareas').send({ titulo: 'Tarea rara', prioridad: 'urgentisima' });
    expect(res.status).toBe(400);
  });

  test('POST /api/tareas acepta fecha_limite y subtareas opcionales', async () => {
    const res = await request(app).post('/api/tareas').send({
      titulo: 'Tarea con checklist',
      fecha_limite: '2026-08-01',
      subtareas: [{ texto: 'paso 1', completada: false }],
    });

    expect(res.status).toBe(201);
    expect(res.body.fecha_limite).toBe('2026-08-01');
    expect(res.body.subtareas).toEqual([{ texto: 'paso 1', completada: false }]);
  });

  test('PATCH /api/tareas/:id/subtareas/:index togglea una subtarea puntual', async () => {
    const creada = await request(app).post('/api/tareas').send({
      titulo: 'Tarea con checklist 2',
      subtareas: [{ texto: 'paso 1', completada: false }],
    });

    const res = await request(app).patch(`/api/tareas/${creada.body.id}/subtareas/0`);

    expect(res.status).toBe(200);
    expect(res.body.subtareas[0].completada).toBe(true);
  });

  test('PATCH /api/tareas/:id edita el título de una tarea', async () => {
    const creada = await request(app).post('/api/tareas').send({ titulo: 'Título original' });
    const res = await request(app).patch(`/api/tareas/${creada.body.id}`).send({ titulo: 'Título editado' });

    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Título editado');
  });

  test('GET /api/tareas/reporte incluye tareas vencidas', async () => {
    await request(app).post('/api/tareas').send({ titulo: 'Tarea vencida', fecha_limite: '2000-01-01' });
    const res = await request(app).get('/api/tareas/reporte');

    expect(res.status).toBe(200);
    expect(res.body.vencidas).toBeGreaterThanOrEqual(1);
  });
});
