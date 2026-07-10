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
});
