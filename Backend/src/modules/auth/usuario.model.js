const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Email con formato inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false,
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
    rol: {
      type: String,
      enum: ['ADMIN', 'USER', 'admin', 'user'],
      default: 'USER',
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

usuarioSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Usuario', usuarioSchema);
