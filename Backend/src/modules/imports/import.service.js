const XLSX = require('xlsx');
const fs = require('fs');
const AppError = require('../../errors/AppError');
const Producto = require('../productos/producto.model');
const Proveedor = require('../proveedores/proveedor.model');
const Categoria = require('../categorias/categoria.model');
const importRepository = require('./import.repository');
const env = require('../../config/env');

function parsearArchivo(ruta) {
  const workbook = XLSX.readFile(ruta);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new AppError(400, 'El archivo no tiene hojas de datos', 'ARCHIVO_VACIO');
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
}

function validarFila(fila, index) {
  const errores = [];

  if (!fila.sku || String(fila.sku).trim() === '') {
    errores.push({ fila: index, sku: null, motivo: 'SKU vacio' });
  }
  if (!fila.nombre || String(fila.nombre).trim() === '') {
    errores.push({ fila: index, sku: fila.sku || null, motivo: 'Nombre vacio' });
  }
  if (fila.precio === undefined || fila.precio === null || Number(fila.precio) < 0) {
    errores.push({ fila: index, sku: fila.sku || null, motivo: 'Precio invalido' });
  }
  if (fila.stock === undefined || fila.stock === null || Number(fila.stock) < 0) {
    errores.push({ fila: index, sku: fila.sku || null, motivo: 'Stock invalido' });
  }

  return errores;
}

function normalizarProducto(fila, proveedorId) {
  return {
    sku: String(fila.sku).trim().toUpperCase(),
    nombre: String(fila.nombre).trim(),
    precio: Math.round(Number(fila.precio) * 100) / 100,
    stock: Math.trunc(Number(fila.stock)),
    categoria: String(fila.categoria || 'sin-categoria').trim().toLowerCase(),
    proveedorId,
    descripcion: fila.descripcion ? String(fila.descripcion).trim() : null,
    imagenUrl: fila.imagenUrl && /^https?:\/\/.+/.test(String(fila.imagenUrl).trim())
      ? String(fila.imagenUrl).trim()
      : null,
  };
}

async function procesarImportacion(jobId) {
  const job = await importRepository.buscarPorId(jobId);
  if (!job) throw new AppError(404, 'Job no encontrado', 'JOB_NO_ENCONTRADO');

  await importRepository.actualizar(jobId, {
    estado: 'processing',
    startedAt: new Date(),
  });

  try {
    const filas = parsearArchivo(job.archivoRuta);

    if (filas.length === 0) {
      await importRepository.actualizar(jobId, {
        estado: 'completed',
        total: 0,
        procesados: 0,
        exitosos: 0,
        fallidos: 0,
        finishedAt: new Date(),
      });
      fs.unlinkSync(job.archivoRuta);
      return;
    }

    const total = filas.length;
    let exitosos = 0;
    let fallidos = 0;
    const todosErrores = [];

    for (let i = 0; i < filas.length; i += env.BATCH_SIZE) {
      const lote = filas.slice(i, i + env.BATCH_SIZE);

      for (let j = 0; j < lote.length; j++) {
        const filaNum = i + j + 2;
        const fila = lote[j];

        const erroresFila = validarFila(fila, filaNum);
        if (erroresFila.length > 0) {
          todosErrores.push(...erroresFila);
          fallidos++;
          continue;
        }

        try {
          const datos = normalizarProducto(fila, job.proveedorId);

          const existente = await Producto.findOne({ sku: datos.sku });
          if (existente) {
            todosErrores.push({
              fila: filaNum,
              sku: datos.sku,
              motivo: 'SKU duplicado en catalogo existente',
            });
            fallidos++;
            continue;
          }

          await Producto.create(datos);
          exitosos++;

          let cat = await Categoria.findOne({ slug: datos.categoria });
          if (!cat) {
            cat = await Categoria.create({ slug: datos.categoria, nombre: datos.categoria });
          }
        } catch (err) {
          todosErrores.push({
            fila: filaNum,
            sku: fila.sku || null,
            motivo: err.message || 'Error al crear producto',
          });
          fallidos++;
        }
      }

      await importRepository.actualizar(jobId, {
        procesados: Math.min(i + env.BATCH_SIZE, total),
        exitosos,
        fallidos,
        errores: todosErrores.slice(-env.IMPORT_ERRORS_CAP),
      });
    }

    await importRepository.actualizar(jobId, {
      estado: 'completed',
      total,
      procesados: total,
      exitosos,
      fallidos,
      errores: todosErrores.slice(-env.IMPORT_ERRORS_CAP),
      finishedAt: new Date(),
    });
  } catch (err) {
    await importRepository.actualizar(jobId, {
      estado: 'failed',
      motivoFallo: err.message || 'Error desconocido',
      finishedAt: new Date(),
    });
  } finally {
    try {
      if (fs.existsSync(job.archivoRuta)) fs.unlinkSync(job.archivoRuta);
    } catch (_) {}
  }
}

async function crearImportacion({ usuarioId, proveedorId, archivo }) {
  const proveedor = await Proveedor.findById(proveedorId);
  if (!proveedor) throw new AppError(404, 'Proveedor no encontrado', 'PROVEEDOR_NO_EXISTE');

  const job = await importRepository.crear({
    usuarioId,
    proveedorId,
    archivoNombre: archivo.originalname,
    archivoRuta: archivo.path,
    estado: 'pending',
  });

  return job;
}

module.exports = { crearImportacion, procesarImportacion };
