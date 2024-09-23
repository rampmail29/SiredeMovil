import { Router } from 'express';
import { 
    buscarEstudiantes, 
    traerProgramas, 
    traerCortesIniciales, 
    procesarEstadisticas, 
    obtenerDetallesEstudiante,
    obtenerDetalles,
    procesarEstadisticasPdf
 } from '../controllers/estadisticas.controller.js';

const router = Router();

router.get('/programas', traerProgramas);
router.get('/cortes-iniciales', traerCortesIniciales);
router.get('/estudiantes', buscarEstudiantes);
router.get('/obtener/:documento', obtenerDetalles);
router.post('/estudiantes/:documento', obtenerDetallesEstudiante);
router.post('/estadisticas', procesarEstadisticas);
router.post('/estadisticasPdf', procesarEstadisticasPdf);

export default router;
