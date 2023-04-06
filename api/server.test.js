const request = require('supertest');
const server = require('./server.js');
const /** @type {import('knex').Knex}*/ db = require('../data/dbConfig.js');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db('users').truncate();
});

// Write your tests here
test('sanity', () => {
  expect(true).toBe(true);
});

describe('server.js', () => {
  describe('[GET] /', () => {
    it('should return 200 OK, and a JSON object from the index route', async () => {
      const expectedBody = { api: 'up' };
      const response = await request(server).get('/');
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toEqual(expectedBody);
    });
  });

  describe('[POST] /api/auth/register', () => {
    const user = {
      username: 'Captain Marvel',
      password: 'foobar',
    };

    const url = '/api/auth/register';

    it('it should reject a req with no username or password', async () => {
      let response = await request(server).post(url);
      expect(response.status).toBe(400);
      expect(response.type).toBe('application/json');
      expect(response.body).toEqual({ message: 'username and password required' });

      response = await request(server).post(url).send({ username: 'Captain Marvel' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'username and password required' });

      response = await request(server).post(url).send({ password: 'foobar' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'username and password required' });
    });

    it('should return 201 OK, and a JSON object from the register route', async () => {
      const response = await request(server).post(url).send(user);
      expect(response.status).toBe(201);
      expect(response.type).toBe('application/json');
      expect(response.body).toMatchObject({ id: 1, username: 'Captain Marvel' });
    });
  });

  describe('[POST] /api/auth/login', () => {
    const credentials = {
      username: 'Captain Marvel',
      password: 'foobar',
    };

    beforeEach(async () => {
      await request(server).post('/api/auth/register').send(credentials);
    });

    const url = '/api/auth/login';

    it('should reject a req with no username or password', async () => {
      let response = await request(server).post(url);
      expect(response.status).toBe(400);
      expect(response.type).toBe('application/json');
      expect(response.body).toEqual({ message: 'username and password required' });

      response = await request(server).post(url).send({ username: 'Captain Marvel' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'username and password required' });

      response = await request(server).post(url).send({ password: 'foobar' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'username and password required' });

      response = await request(server).post(url).send({ username: 'Captain Marvel', password: 'wrong' });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'invalid credentials' });

      response = await request(server).post(url).send({ username: 'wrong', password: 'foobar' });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'invalid credentials' });
    });

    it('should return 200 OK, and a JSON object from the login route', async () => {
      const response = await request(server).post(url).send(credentials);
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toMatchObject({ message: 'welcome, Captain Marvel' });
    });
  });
});
