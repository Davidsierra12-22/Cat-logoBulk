const Curso = require('./curso.model');

const cursoCtrl = {};

cursoCtrl.registerCurso = async (req, res, next) => {
  try {
    const { codigo, nombre, duracion } = req.body;
    const newCurso = new Curso({
      codigo: codigo.toUpperCase().trim(),
      nombre: nombre.toUpperCase().trim(),
      duracion,
    });
    await newCurso.save();
    res.json({ msg: 'Curso registrado correctamente' });
  } catch (error) {
    next(error);
  }
};

cursoCtrl.getCursos = async (req, res, next) => {
  try {
    const { status } = req.query;
    const cursos = await Curso.find(status ? { status } : {}).sort({ createdAt: -1 });
    res.json(cursos);
  } catch (error) {
    next(error);
  }
};

cursoCtrl.getCursoId = async (req, res, next) => {
  try {
    const curso = await Curso.findById(req.params.id);
    res.json(curso);
  } catch (error) {
    next(error);
  }
};

cursoCtrl.updateCurso = async (req, res, next) => {
  try {
    const { codigo, nombre, duracion } = req.body;
    await Curso.findByIdAndUpdate(req.params.id, {
      codigo: codigo.toUpperCase().trim(),
      nombre: nombre.toUpperCase().trim(),
      duracion,
    });
    res.json({ msg: 'Curso actualizado correctamente' });
  } catch (error) {
    next(error);
  }
};

cursoCtrl.activeCurso = async (req, res, next) => {
  try {
    await Curso.findByIdAndUpdate(req.params.id, { status: 0 });
    res.json({ msg: 'Curso activado correctamente' });
  } catch (error) {
    next(error);
  }
};

cursoCtrl.inactiveCurso = async (req, res, next) => {
  try {
    await Curso.findByIdAndUpdate(req.params.id, { status: 1 });
    res.json({ msg: 'Curso desactivado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = cursoCtrl;
