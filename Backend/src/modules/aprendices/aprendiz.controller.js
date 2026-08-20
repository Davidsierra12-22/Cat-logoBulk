const Aprendiz = require('./aprendiz.model');
const Curso = require('../cursos/curso.model');

const aprendizCtrl = {};

aprendizCtrl.registerAprendiz = async (req, res, next) => {
  try {
    const { documento, nombre, email, curso } = req.body;
    const newAprendiz = new Aprendiz({
      documento: documento.trim(),
      nombre: nombre.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      curso,
    });
    await newAprendiz.save();
    res.json({ msg: 'Aprendiz registrado correctamente' });
  } catch (error) {
    next(error);
  }
};

aprendizCtrl.getAprendices = async (req, res, next) => {
  try {
    const { status } = req.query;
    const aprendices = await Aprendiz.find(status ? { status } : {})
      .populate('curso')
      .sort({ createdAt: -1 });
    res.json(aprendices);
  } catch (error) {
    next(error);
  }
};

aprendizCtrl.getAprendizId = async (req, res, next) => {
  try {
    const aprendiz = await Aprendiz.findById(req.params.id).populate('curso');
    res.json(aprendiz);
  } catch (error) {
    next(error);
  }
};

aprendizCtrl.getAprendicesByCurso = async (req, res, next) => {
  try {
    const { curso } = req.params;
    const aprendices = await Aprendiz.find({ curso, status: 0 }).populate('curso');
    res.json(aprendices);
  } catch (error) {
    next(error);
  }
};

aprendizCtrl.updateAprendiz = async (req, res, next) => {
  try {
    const { documento, nombre, email, curso } = req.body;
    await Aprendiz.findByIdAndUpdate(req.params.id, {
      documento: documento.trim(),
      nombre: nombre.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      curso,
    });
    res.json({ msg: 'Aprendiz actualizado correctamente' });
  } catch (error) {
    next(error);
  }
};

aprendizCtrl.activeAprendiz = async (req, res, next) => {
  try {
    await Aprendiz.findByIdAndUpdate(req.params.id, { status: 0 });
    res.json({ msg: 'Aprendiz activado correctamente' });
  } catch (error) {
    next(error);
  }
};

aprendizCtrl.inactiveAprendiz = async (req, res, next) => {
  try {
    await Aprendiz.findByIdAndUpdate(req.params.id, { status: 1 });
    res.json({ msg: 'Aprendiz desactivado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = aprendizCtrl;
