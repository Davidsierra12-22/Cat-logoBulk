const request = require('supertest');
const app = require('../src/app');
const { conectarBD, limpiarBD, desconectarBD } = require('./helpers');

beforeAll(conectarBD);
afterAll(desconectarBD);
beforeEach(limpiarBD);

describe('Auth', () => {
  it('registra un admin y devuelve msg de exito', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Admin Test', email: 'admin@demo.com', password: 'secreta123', rol: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.msg).toBeDefined();
  });

  it('email duplicado devuelve 409 tipado', async () => {
    await request(app).post('/api/auth/register').send({ nombre: 'User', email: 'a@a.com', password: '123456' });
    const res = await request(app).post('/api/auth/register').send({ nombre: 'User2', email: 'a@a.com', password: '123456' });

    expect(res.status).toBe(409);
    expect(res.body.codigo).toBeDefined();
  });

  it('email con formato invalido devuelve 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'User', email: 'no-es-email', password: '123456' });

    expect(res.status).toBe(400);
  });

  it('login correcto devuelve 200 con token y usuario', async () => {
    await request(app).post('/api/auth/register').send({ nombre: 'Admin', email: 'admin@demo.com', password: 'secreta123', rol: 'admin' });
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@demo.com', password: 'secreta123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario).toBeDefined();
    expect(res.body.usuario.email).toBe('admin@demo.com');
    expect(res.body.usuario.password).toBeUndefined();
  });

  it('login con password incorrecta devuelve 400', async () => {
    await request(app).post('/api/auth/register').send({ nombre: 'Admin', email: 'admin@demo.com', password: '123456' });
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@demo.com', password: 'incorrecta' });

    expect(res.status).toBe(400);
  });

  it('ruta protegida sin token devuelve 401', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(401);
  });
});
