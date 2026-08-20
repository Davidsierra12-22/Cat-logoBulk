const Redis = require('ioredis');
const env = require('./env');

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  console.error(`[redis] Error de conexión: ${err.message}`);
});

async function pingRedis() {
  try {
    const respuesta = await redis.ping();
    return respuesta === 'PONG' ? 'up' : 'down';
  } catch (err) {
    return 'down';
  }
}

module.exports = { redis, pingRedis };
