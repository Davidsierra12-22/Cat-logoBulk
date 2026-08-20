const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../../errors/AppError');
const env = require('../../config/env');
const Usuario = require('./usuario.model');

const SALT_ROUNDS = 10;

async function registrar({ nombre, email, password, rol }) {
  const yaExiste = await Usuario.findOne({ email: email.toLowerCase() });
  if (yaExiste) {
    throw new AppError(409, 'El email ya está registrado', 'EMAIL_YA_REGISTRADO');
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  await Usuario.create({ nombre, email, password: hash, rol });

  return { msg: 'Usuario registrado correctamente' };
}

async function loguear({ email, password }) {
  const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+password');
  if (!usuario) {
    throw new AppError(400, 'Usuario o contraseña incorrectos', 'CREDENCIALES_INVALIDAS');
  }

  if (usuario.status !== 0) {
    throw new AppError(400, 'El usuario esta inactivo', 'USUARIO_INACTIVO');
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    throw new AppError(400, 'Usuario o contraseña incorrectos', 'CREDENCIALES_INVALIDAS');
  }

  const token = jwt.sign(
    { uid: usuario._id.toString(), rol: usuario.rol },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return { usuario: usuario.toJSON(), token };
}

module.exports = { registrar, loguear };
