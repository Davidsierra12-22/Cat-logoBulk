const AppError = require('../../errors/AppError');
const bcrypt = require('bcryptjs');
const Usuario = require('../auth/usuario.model');

const SALT_ROUNDS = 10;

async function listar({ page, limit, rol, busqueda, activo }) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const filtro = {};
  if (rol) filtro.rol = rol;
  if (activo !== undefined) filtro.activo = activo === 'true';
  if (busqueda) {
    filtro.email = { $regex: String(busqueda).trim(), $options: 'i' };
  }

  const [total, docs] = await Promise.all([
    Usuario.countDocuments(filtro),
    Usuario.find(filtro).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
  ]);

  return { data: docs, page: pageNum, limit: limitNum, total };
}

async function buscarPorId(id) {
  const usuario = await Usuario.findById(id);
  if (!usuario) {
    throw new AppError(404, 'Usuario no encontrado', 'USUARIO_NO_ENCONTRADO');
  }
  return usuario;
}

async function actualizar(id, datos, usuarioActualId) {
  await buscarPorId(id);

  const aActualizar = {};
  if (datos.activo !== undefined) {
    aActualizar.activo = datos.activo === true || datos.activo === 'true';
    if (aActualizar.activo === false) {
      if (String(id) === String(usuarioActualId)) {
        throw new AppError(400, 'No puedes desactivar tu propia cuenta', 'NO_DESACTIVAR_MISMO');
      }
      const objetivo = await Usuario.findById(id);
      if (objetivo.rol === 'admin') {
        const adminsActivos = await Usuario.countDocuments({ rol: 'admin', activo: true });
        if (adminsActivos <= 1) {
          throw new AppError(400, 'No se puede desactivar al ultimo admin activo', 'ULTIMO_ADMIN_ACTIVO');
        }
      }
    }
  }
  if (datos.email !== undefined) aActualizar.email = String(datos.email).trim().toLowerCase();
  if (datos.rol !== undefined) aActualizar.rol = datos.rol;
  if (datos.password !== undefined) {
    if (String(datos.password).length < 6) {
      throw new AppError(400, 'La contraseña debe tener al menos 6 caracteres', 'PASSWORD_CORTO');
    }
    aActualizar.password = await bcrypt.hash(datos.password, SALT_ROUNDS);
  }

  return Usuario.findByIdAndUpdate(id, aActualizar, { returnDocument: 'after', runValidators: true });
}

async function eliminar(id) {
  const desactivado = await Usuario.findByIdAndUpdate(id, { activo: false }, { returnDocument: 'after' });
  if (!desactivado) {
    throw new AppError(404, 'Usuario no encontrado', 'USUARIO_NO_ENCONTRADO');
  }
  return desactivado;
}

module.exports = { listar, buscarPorId, actualizar, eliminar };
