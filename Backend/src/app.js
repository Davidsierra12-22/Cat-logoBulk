const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { pingRedis } = require('./config/redis');
const { getMongoStatus } = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.get('/health', async (req, res) => {
  const [mongo, redis] = await Promise.all([getMongoStatus(), pingRedis()]);
  if (mongo === 'up' && redis === 'up') {
    return res.status(200).json({ status: 'ok', mongo, redis });
  }
  return res.status(503).json({ status: 'error', mongo, redis });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authRoutes = require('./modules/auth/auth.routes');
const productoRoutes = require('./modules/productos/producto.routes');
const proveedorRoutes = require('./modules/proveedores/proveedor.routes');
const categoriaRoutes = require('./modules/categorias/categoria.routes');
const cursoRoutes = require('./modules/cursos/curso.routes');
const aprendizRoutes = require('./modules/aprendices/aprendiz.routes');
const auth = require('./middlewares/auth');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/cursos', auth, cursoRoutes);
app.use('/api/aprendices', auth, aprendizRoutes);

app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    mensaje: 'Ruta no encontrada',
    codigo: 'RUTA_NO_ENCONTRADA',
  });
});

app.use(errorHandler);

module.exports = app;
