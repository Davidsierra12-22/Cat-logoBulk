const express = require('express');
const { pingRedis } = require('./config/redis');
const { getMongoStatus } = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/health', async (req, res) => {
  const [mongo, redis] = await Promise.all([getMongoStatus(), pingRedis()]);
  if (mongo === 'up' && redis === 'up') {
    return res.status(200).json({ status: 'ok', mongo, redis });
  }
  return res.status(503).json({ status: 'error', mongo, redis });
});

app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    mensaje: 'Ruta no encontrada',
    codigo: 'RUTA_NO_ENCONTRADA',
  });
});

app.use(errorHandler);

module.exports = app;
