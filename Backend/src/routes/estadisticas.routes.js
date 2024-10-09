import { Router } from 'express';
import { 
    buscarEstudiantes, 
    traerProgramas,
    traerCortesIniciales, 
    obtenerEstudiantesPorCorte, 
    obtenerDetallesEstudiante,
    obtenerDetalles,
    procesarEstadisticasPdf,
    cargarEstudiantes,
    cargarGraduados
 } from '../controllers/estadisticas.controller.js';

const router = Router();

router.get('/programas', traerProgramas);
router.get('/cortes-iniciales/:id_carrera', traerCortesIniciales);
router.get('/estudiantes', buscarEstudiantes);
router.get('/obtener/:id', obtenerDetalles);
router.post('/estudiantes/:documento', obtenerDetallesEstudiante);
router.post('/estudiantes-por-corte', obtenerEstudiantesPorCorte);
router.post('/estadisticasPdf', procesarEstadisticasPdf);
router.post('/cargageneral', cargarEstudiantes);
router.post('/cargagraduados', cargarGraduados);

export default router;
