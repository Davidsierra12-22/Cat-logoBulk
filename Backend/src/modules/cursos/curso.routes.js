const express = require('express');
const cursoCtrl = require('./curso.controller');

const router = express.Router();

router.get('/', cursoCtrl.getCursos);
router.get('/:id', cursoCtrl.getCursoId);
router.post('/register', cursoCtrl.registerCurso);
router.put('/update/:id', cursoCtrl.updateCurso);
router.put('/active/:id', cursoCtrl.activeCurso);
router.put('/inactive/:id', cursoCtrl.inactiveCurso);

module.exports = router;
