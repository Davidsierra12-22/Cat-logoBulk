const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/catalogobulk';
const SEED_EMAIL = 'admin@sena.edu.co';
const SEED_PASSWORD = '123456';
const SEED_NOMBRE = 'Administrador';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[seed] Conectado a MongoDB');

    const db = mongoose.connection.db;
    const usuarios = db.collection('usuarios');

    const existente = await usuarios.findOne({ email: SEED_EMAIL });
    if (existente) {
      console.log(`[seed] El usuario ${SEED_EMAIL} ya existe. Nada que hacer.`);
      process.exit(0);
    }

    const hash = await bcrypt.hash(SEED_PASSWORD, 10);
    await usuarios.insertOne({
      nombre: SEED_NOMBRE,
      email: SEED_EMAIL,
      password: hash,
      rol: 'ADMIN',
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`[seed] Usuario creado: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('[seed] Error:', err.message);
    process.exit(1);
  }
}

seed();
