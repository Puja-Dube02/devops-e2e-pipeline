const request = require('supertest');
const app = require('../src/index');
const tasks = require('../src/tasks');

beforeEach(() => {
  tasks.reset();
});

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /metrics', () => {
  it('exposes prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('http_requests_total');
  });
});

describe('tasks API', () => {
  it('starts with an empty list', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates a task', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'write tests' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'write tests', done: false });
  });

  it('rejects a task without a title', async () => {
    const res = await request(app).post('/api/tasks').send({});
    expect(res.status).toBe(400);
  });

  it('completes a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'ship pipeline' });
    const res = await request(app).post(`/api/tasks/${created.body.id}/complete`);
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  it('404s when completing a missing task', async () => {
    const res = await request(app).post('/api/tasks/999/complete');
    expect(res.status).toBe(404);
  });
});
