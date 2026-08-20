const express = require('express');
const aprendizCtrl = require('./aprendiz.controller');

const router = express.Router();

router.get('/', aprendizCtrl.getAprendices);
router.get('/curso/:curso', aprendizCtrl.getAprendicesByCurso);
router.get('/:id', aprendizCtrl.getAprendizId);
router.post('/register', aprendizCtrl.registerAprendiz);
router.put('/update/:id', aprendizCtrl.updateAprendiz);
router.put('/active/:id', aprendizCtrl.activeAprendiz);
router.put('/inactive/:id', aprendizCtrl.inactiveAprendiz);

module.exports = router;
