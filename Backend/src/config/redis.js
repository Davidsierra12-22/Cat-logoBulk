const Redis = require('ioredis');
const env = require('./env');

const redisHabilitado = Boolean(env.REDIS_URL || env.REDIS_HOST);

const opciones = {
  maxRetriesPerRequest: 2,
  retryStrategy(times) {
    if (times > 2) return null;
    return Math.min(times * 200, 1500);
  },
  lazyConnect: true,
};

if (env.REDIS_URL) {
  opciones.host = undefined;
  opciones.port = undefined;
  opciones.path = undefined;
  opciones.options = undefined;
} else {
  opciones.host = env.REDIS_HOST;
  opciones.port = env.REDIS_PORT;
}

const redis = redisHabilitado ? new Redis(env.REDIS_URL || opciones) : null;

if (redis) {
  redis.on('error', (err) => {
    if (err.code !== 'ECONNREFUSED') {
      console.error(`[redis] Error de conexión: ${err.message}`);
    }
  });

  redis.connect().catch(() => {});
}

async function pingRedis() {
  if (!redis) return 'down';
  try {
    const respuesta = await redis.ping();
    return respuesta === 'PONG' ? 'up' : 'down';
  } catch (err) {
    return 'down';
  }
}

module.exports = { redis, pingRedis, redisHabilitado };