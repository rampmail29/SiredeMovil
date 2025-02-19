import { Router } from 'express';
import { 
    buscarEstudiantes, 
    traerProgramas,
    traerCortesIniciales, 
    traerPeriodosMatriculas,
    obtenerEstudiantesPorCorte, 
    obtenerDetallesEstudiante,
    obtenerDetalles,
    procesarEstadisticasPdf,
    cargarEstudiantes,
    cargarGraduados,
    obtenerEstudiantesPorMatricula,
    obtenerMatriculadosPorPeriodos,
    obtenerCarrerasRelacionadas,
    obtenerDetallesGraduadosRelacionados
 } from '../controllers/estadisticas.controller.js';

const router = Router();

router.get('/programas', traerProgramas);
router.get('/cortes-iniciales/:id_carrera', traerCortesIniciales);
router.get('/periodos/:id_carrera', traerPeriodosMatriculas);
router.get('/estudiantes', buscarEstudiantes);
router.get('/obtener/:id', obtenerDetalles);
router.get('/carreras-relacionadas/:idSeleccionado', obtenerCarrerasRelacionadas);
router.post('/detalles-graduados-relacionados', obtenerDetallesGraduadosRelacionados);
router.post('/estudiantes/:documento', obtenerDetallesEstudiante);
router.post('/estudiantes-por-corte', obtenerEstudiantesPorCorte);
router.post('/estudiantes-por-matricula', obtenerEstudiantesPorMatricula);
router.post('/matriculados-por-periodos', obtenerMatriculadosPorPeriodos);
router.post('/estadisticasPdf', procesarEstadisticasPdf);
router.post('/cargageneral', cargarEstudiantes);
router.post('/cargagraduados', cargarGraduados);

export default router;
