const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const REQUERIDAS = ['MONGO_URI', 'JWT_SECRET'];

const faltantes = REQUERIDAS.filter((nombre) => !process.env[nombre]);

if (faltantes.length > 0) {
  console.error(`[env] Faltan variables de entorno obligatorias: ${faltantes.join(', ')}`);
  console.error('[env] Cópialas de .env.example a .env o defínelas en el entorno.');
  process.exit(1);
}

const env = {
  PORT: Number(process.env.PORT) || 3000,
  MONGO_URI: process.env.MONGO_URI,
  // Redis es opcional: si no se configura, el backend corre igual.
  REDIS_URL: process.env.REDIS_URL || '',
  REDIS_HOST: process.env.REDIS_HOST || '',
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB) || 50,
  BATCH_SIZE: Number(process.env.BATCH_SIZE) || 500,
  CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS) || 300,
  IMPORT_ERRORS_CAP: Number(process.env.IMPORT_ERRORS_CAP) || 1000,
};

module.exports = env;