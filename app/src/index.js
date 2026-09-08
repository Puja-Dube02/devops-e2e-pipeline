const express = require('express');
const client = require('prom-client');
const tasks = require('./tasks');

const app = express();
app.use(express.json());

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/api/tasks', (req, res) => {
  res.status(200).json(tasks.listTasks());
});

app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required' });
  }
  const task = tasks.addTask(title);
  res.status(201).json(task);
});

app.post('/api/tasks/:id/complete', (req, res) => {
  const task = tasks.completeTask(Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'task not found' });
  res.status(200).json(task);
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`devops-e2e-pipeline app listening on port ${PORT}`);
  });
}

module.exports = app;
