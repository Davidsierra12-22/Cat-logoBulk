const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El codigo es obligatorio'],
      trim: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    duracion: {
      type: Number,
      required: [true, 'La duracion es obligatoria'],
      min: [1, 'La duracion debe ser mayor a 0'],
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Curso', cursoSchema);
