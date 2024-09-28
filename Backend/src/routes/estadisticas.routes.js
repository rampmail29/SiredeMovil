import { Router } from 'express';
import { 
    buscarEstudiantes, 
    traerProgramas,
    traerCortesIniciales, 
    procesarEstadisticas, 
    obtenerDetallesEstudiante,
    obtenerDetalles,
    procesarEstadisticasPdf,
    cargarEstudiantes
 } from '../controllers/estadisticas.controller.js';

const router = Router();

router.get('/programas', traerProgramas);
router.get('/cortes-iniciales', traerCortesIniciales);
router.get('/estudiantes', buscarEstudiantes);
router.get('/obtener/:id', obtenerDetalles);
router.post('/estudiantes/:documento', obtenerDetallesEstudiante);
router.post('/estadisticas', procesarEstadisticas);
router.post('/estadisticasPdf', procesarEstadisticasPdf);
router.post('/cargageneral', cargarEstudiantes);

export default router;
