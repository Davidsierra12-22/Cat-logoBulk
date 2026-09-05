/**
 * @fileoverview /api/index.js
 * Punto de entrada para Vercel (Serverless Functions).
 *
 * Vercel no mantiene un proceso Node vivo como Railway: invoca esta funcion
 * por cada peticion HTTP en una instancia efimera. Por eso la conexion a
 * MongoDB se abre una sola vez por instancia fria (se cachea la promesa) y
 * se reutiliza mientras la instancia siga caliente.
 *
 * El despacho real de cada ruta lo hace la app Express de ../src/app.js:
 * aqui solo se garantiza que Mongo este arriba antes de delegar.
 */
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// En Vercel el cwd no es la raiz del proyecto: apunta el .env a la raiz real.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('../src/app');
const env = require('../src/config/env');
const { asegurarCategorias, asegurarActivoProductos } = require('../src/config/seed');

let promesaConexion = null;

function garantizarConexion() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();

  if (!promesaConexion) {
    promesaConexion = (async () => {
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
        // Una sola conexion compartida: en serverless cada instancia es un proceso.
        maxPoolSize: 1,
      });
      await asegurarCategorias();
      await asegurarActivoProductos();
    })().catch((err) => {
      // Si falla, se limpia la promesa para reintentar en la siguiente peticion.
      promesaConexion = null;
      throw err;
    });
  }

  return promesaConexion;
}

module.exports = async (req, res) => {
  try {
    await garantizarConexion();
  } catch (err) {
    // Sin conexion la app responde /health en 503 y el resto con error 500:
    // mucho mejor que estallar la instancia.
    console.error('[serverless] Error de conexion a MongoDB:', err.message);
  }
  return app(req, res);
};