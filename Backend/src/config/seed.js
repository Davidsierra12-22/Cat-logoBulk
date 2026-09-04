const Categoria = require('../modules/categorias/categoria.model');

const CATEGORIAS_POR_DEFECTO = [
  'perifericos',
  'monitores',
  'laptops',
  'audio',
  'impresoras',
  'accesorios',
  'oficina',
];

/**
 * Inserta las categorias por defecto si la coleccion esta vacia.
 * Se ejecuta al arrancar el servidor para que cualquier despliegue
 * (Railway, Render, VPS...) quede completo sin pasos manuales.
 */
async function asegurarCategorias() {
  try {
    const total = await Categoria.countDocuments();
    if (total > 0) {
      console.log(`[seed] Categorias ya sembradas (${total}). Nada que hacer.`);
      return;
    }
    const docs = CATEGORIAS_POR_DEFECTO.map((slug) => ({
      nombre: slug,
      slug,
      descripcion: null,
    }));
    await Categoria.insertMany(docs);
    console.log(`[seed] ${docs.length} categorias por defecto insertadas.`);
  } catch (err) {
    console.warn(`[seed] No se pudieron sembrar categorias: ${err.message}`);
  }
}

module.exports = { asegurarCategorias };