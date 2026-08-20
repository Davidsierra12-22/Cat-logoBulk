const mongoose = require('mongoose');

const aprendizSchema = new mongoose.Schema(
  {
    documento: {
      type: String,
      required: [true, 'El documento es obligatorio'],
      trim: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      lowercase: true,
      trim: true,
    },
    curso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso',
      required: [true, 'El curso es obligatorio'],
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Aprendiz', aprendizSchema);
