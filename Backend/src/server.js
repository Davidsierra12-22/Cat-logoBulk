const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { asegurarCategorias, asegurarActivoProductos } = require('./config/seed');

async function iniciar() {
  await connectDB();
  await asegurarCategorias();
  await asegurarActivoProductos();

  app.listen(env.PORT, () => {
    console.log(`[server] API escuchando en http://localhost:${env.PORT}`);
  });
}

iniciar().catch((err) => {
  console.error('[server] Error fatal al arrancar:', err);
  process.exit(1);
});
