import { pool } from '../db.js';

export const cargarEstudiantes = async (req, res) => {
  const estudiantesData = req.body; // Obtenemos los datos del CSV

  // Verificar que hay datos para procesar
  if (!estudiantesData || estudiantesData.length === 0) {
      console.error('No se recibieron datos para procesar.');
      return res.status(400).json({ success: false, message: 'No se recibieron datos para procesar.' });
  }

      function convertirFecha(fechaStr) {
        if (!fechaStr || typeof fechaStr !== 'string') {
            return null; // Si no es una cadena válida
        }

        // Separar fecha y hora, si está presente
        const partesFechaHora = fechaStr.split(' ');
        const partesFecha = partesFechaHora[0].split('/');

        if (partesFecha.length !== 3) {
            return null; // Si el formato no es el esperado
        }

        let [dia, mes, año] = partesFecha;

        // Asegurarse de que el día y el mes tengan dos dígitos
        dia = dia.length === 1 ? '0' + dia : dia;
        mes = mes.length === 1 ? '0' + mes : mes;

        // Crear un objeto Date con el formato adecuado
        const fecha = new Date(`${año}-${mes}-${dia}`);

        // Verificar si la fecha es válida
        if (isNaN(fecha.getTime())) {
            return null;
        }

        // Retornar solo la fecha en formato YYYY-MM-DD
        return fecha.toISOString().split('T')[0];
    }
    function obtenerPeriodo(fechaStr) {
      if (!fechaStr || typeof fechaStr !== 'string') {
          return null; // Si no es una cadena válida
      }
  
      // Separar la fecha y la hora
      const partesFechaHora = fechaStr.split(' ');
      const partesFecha = partesFechaHora[0].split('/');
  
      if (partesFecha.length !== 3) {
          return null; // Si el formato no es el esperado
      }
  
      let [dia, mes, año] = partesFecha;
  
      // Convertir a número para facilitar comparaciones
      mes = parseInt(mes, 10);
      año = parseInt(año, 10);
  
      // Determinar el periodo con base en el mes
      if (mes >= 1 && mes <= 3) {
          // Enero a marzo
          return `${año}-1`; // Primer semestre del mismo año
      } else if (mes >= 4 && mes <= 8) {
          // Abril a agosto
          return `${año}-2`; // Segundo semestre del mismo año
      } else if (mes >= 9 && mes <= 12) {
          // Septiembre a diciembre
          return `${año + 1}-1`; // Primer semestre del siguiente año
      }
  
      return null; // En caso de que no sea un mes válido
  }

  try {
    let carreraId = null; // Inicializamos fuera del loop para la segunda fase
    let periodo_matricula = null; // Variable para el periodo actual

    // Recorrer los datos de estudiantes
    for (const estudiante of estudiantesData) {
        const {
            PENG_PRIMERNOMBRE,
            PENG_SEGUNDONOMBRE,
            PENG_PRIMERAPELLIDO,
            PENG_SEGUNDOAPELLIDO,
            PEGE_DOCUMENTOIDENTIDAD,
            PEGE_MAIL,
            PEGE_TELEFONOCELULAR,
            PEGE_TELEFONO,
            ESTP_FECHAINGRESO,
            PROG_NOMBRE,
            PROG_CODIGOICFES,
            ESTP_ID,
            FRAN_DESCRIPCION,
            UNID_NOMBRE,
            PERIODO,
            MAAC_PROMEDIO,
            ESTP_PROMEDIOGENERAL,
            TIPOPROGRAMA,
        } = estudiante;

        const nombre = PENG_PRIMERNOMBRE + ' ' + PENG_SEGUNDONOMBRE;
        const apellido = PENG_PRIMERAPELLIDO + ' ' + PENG_SEGUNDOAPELLIDO;
        const numero_documento = PEGE_DOCUMENTOIDENTIDAD;
        const correo_electronico = PEGE_MAIL;
        const celular = PEGE_TELEFONOCELULAR || PEGE_TELEFONO;
        const codigo_matricula = ESTP_ID;
        const fecha_ingreso = convertirFecha(ESTP_FECHAINGRESO);
        const periodo_inicio = obtenerPeriodo(ESTP_FECHAINGRESO);
        const estado_academico = 'Activo';
        const jornada = FRAN_DESCRIPCION;
        const sede = UNID_NOMBRE;
        const nombre_programa = PROG_NOMBRE;
        const codigo_programa = PROG_CODIGOICFES;
        const tipo_programa = TIPOPROGRAMA;

        if (!PERIODO) {
          console.error(`PERIODO no definido para estudiante ${numero_documento}`);
          continue; // O lanzar un error si prefieres
      }
        periodo_matricula = PERIODO; // Guardamos el periodo de matrícula actual
        console.log(`PERIODO para estudiante ${numero_documento}: ${PERIODO}`);
        const promedio_semestral = MAAC_PROMEDIO ? parseFloat(MAAC_PROMEDIO.replace(',', '.')) : null;
        const promedio_general = ESTP_PROMEDIOGENERAL ? parseFloat(ESTP_PROMEDIOGENERAL.replace(',', '.')) : null;

        const tipo_documento = estudiante.tipodocumento;
        const fecha_nacimiento = convertirFecha(estudiante.fechanacimiento);
        const sexo = estudiante.genero;
        const periodo_desercion = convertirFecha(estudiante.periododesercion);
        const fecha_graduacion = convertirFecha(estudiante.fechagraduacion);

          // Validar los datos de la carrera
          if (!nombre_programa || !codigo_programa || !tipo_programa) {
            console.error(`Datos inválidos para carrera en estudiante ${numero_documento}: ${JSON.stringify(estudiante)}`);
            continue; // O puedes lanzar un error si prefieres
        }

        // 1. Insertar en la tabla 'carrera'
        carreraId = await insertarCarrera(nombre_programa, codigo_programa, tipo_programa);

        // 2. Insertar en la tabla 'estudiante' o actualizar si ya existe
        const estudianteId = await insertarEstudiante(nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, sexo, correo_electronico, celular);

        // 3. Insertar en la tabla 'estudiante_carrera'
        await insertarEstudianteCarrera(estudianteId, carreraId, codigo_matricula, fecha_ingreso, periodo_inicio, periodo_desercion, fecha_graduacion, estado_academico, jornada, sede);

        // 4. Insertar el historial de matrícula del estudiante
        await insertarHistoricoMatricula(estudianteId, carreraId, periodo_matricula, promedio_semestral, promedio_general);
    }
      console.log(carreraId)
      console.log(periodo_matricula)

    // Fase 2: Cambiar estado académico si existe un periodo anterior

    

    if (carreraId && periodo_matricula) {
        await verificarYActualizarGraduacion(carreraId, periodo_matricula);

        await cambiarEstadoAcademicoSegunMatriculas(carreraId, periodo_matricula);

        await procesarCambioEstadoRetenido(carreraId, periodo_matricula)
    }

    

    return res.status(200).json({ success: true, message: 'Todos los datos han sido procesados correctamente y los estados académicos han sido actualizados.' });
} catch (error) {
    console.error('Error en el procesamiento de datos:', error);
    return res.status(500).json({ success: false, message: 'Error en el procesamiento de datos.' });
}
};




async function insertarCarrera(nombre_Programa, codigo_Programa, tipo_Programa) {
  try {
     
      // Verificar si la carrera ya existe
      const [existing] = await pool.query('SELECT * FROM carreras WHERE codigo_programa = ?', [codigo_Programa]);

      if (existing.length > 0) {
          console.log(`La carrera con el código ${codigo_Programa} ya existe. Actualizando en lugar de insertar.`);

          // Intentar actualizar la carrera existente
          try {
              await pool.query(
                  'UPDATE carreras SET nombre_programa = ?, tipo_programa = ? WHERE codigo_programa = ?',
                  [nombre_Programa, tipo_Programa, codigo_Programa]
              );
              // Retornar el ID de la carrera existente
              return existing[0].id_carrera;
          } catch (updateError) {
              console.error('Error al actualizar la carrera:', updateError);
              // Ignorar el error y continuar
          }
      } else {
          // Intentar insertar nueva carrera
          try {
              const [result] = await pool.query(
                  `INSERT INTO carreras (nombre_programa, codigo_programa, tipo_programa)
                   VALUES (?, ?, ?)`,
                  [nombre_Programa, codigo_Programa, tipo_Programa]
              );
              // Retornar el ID de la carrera insertada
              return result.insertId;
          } catch (insertError) {
              console.error('Error al insertar nueva carrera:', insertError);
              // Ignorar el error y continuar
          }
      }
  } catch (error) {
      console.error('Error general al insertar/actualizar carreras:', error);
      // Ignorar el error y continuar
  }
}




export const insertarEstudiante = async (nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, sexo, correo_electronico, celular) => {
  try {
      // Verificar si el estudiante ya existe
      const [existing] = await pool.query('SELECT * FROM estudiantes WHERE numero_documento = ?', [numero_documento]);

      if (existing.length > 0) {
          // Actualizar si ya existe
          console.log(`Actualizando el estudiante con el número de documento ${numero_documento}.`);

          // Solo actualizamos los campos si no son null o vacíos
          const updates = [
              nombre,
              apellido,
              (tipo_documento && tipo_documento.trim() !== '') ? tipo_documento : existing[0].tipo_documento,
              (fecha_nacimiento && fecha_nacimiento.trim() !== '') ? fecha_nacimiento : existing[0].fecha_nacimiento,
              (sexo && sexo.trim() !== '') ? sexo : existing[0].sexo,
              correo_electronico,
              celular
          ];

          await pool.query(
              'UPDATE estudiantes SET nombre = ?, apellido = ?, tipo_documento = ?, fecha_nacimiento = ?, sexo = ?, correo_electronico = ?, celular = ? WHERE numero_documento = ?',
              [...updates, numero_documento]
          );
          return existing[0].id_estudiante; // Retornar el ID del estudiante existente
      }

      // Si no existe, insertar nuevo estudiante
      const [result] = await pool.query(
          'INSERT INTO estudiantes (nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, sexo, correo_electronico, celular) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, sexo, correo_electronico, celular]
      );

      return result.insertId; // Retornar el nuevo ID del estudiante insertado
  } catch (error) {
      console.error('Error al insertar/actualizar estudiante:', error);
      throw error; // Propagar el error para ser manejado más arriba
  }
};

export const insertarEstudianteCarrera = async (id_estudiante, codigo_carrera, codigo_matricula, fecha_ingreso, periodo_inicio, periodo_desercion, fecha_graduacion, estado_academico, jornada, sede) => {
  try {
      // Obtener el id_carrera a partir del codigo_carrera
      const [carrera] = await pool.query('SELECT id_carrera FROM carreras WHERE id_carrera = ?', [codigo_carrera]);
      const id_carrera = carrera.length > 0 ? carrera[0].id_carrera : null;

      if (!id_carrera) {
          throw new Error(`No se encontró la carrera para el código: ${codigo_carrera}`);
      }

      // Verificar si la relación ya existe
      const [existing] = await pool.query('SELECT * FROM estudiantes_carreras WHERE id_estudiante = ? AND id_carrera = ?', [id_estudiante, id_carrera]);

      if (existing.length > 0) {
          // Actualizar si ya existe y el estudiante sigue en la misma carrera
          console.log(`Actualizando la relación entre estudiante ${id_estudiante} y carrera ${id_carrera}.`);

          // Solo actualizamos los campos si no son null o vacíos
          const updates = [
              codigo_matricula,
              fecha_ingreso,
              periodo_inicio,
              (periodo_desercion && periodo_desercion.trim() !== '') ? periodo_desercion : existing[0].periodo_desercion,
              (fecha_graduacion && fecha_graduacion.trim() !== '') ? fecha_graduacion : existing[0].fecha_graduacion,
              estado_academico,
              jornada,
              sede,
              id_estudiante,
              id_carrera
          ];

          await pool.query(
              'UPDATE estudiantes_carreras SET codigo_matricula = ?, fecha_ingreso = ?, periodo_inicio = ?, periodo_desercion = ?, fecha_graduacion = ?, estado_academico = ?, jornada = ?, sede = ? WHERE id_estudiante = ? AND id_carrera = ?',
              updates
          );
      } else {
          // Insertar nueva relación
          const [result] = await pool.query(
              'INSERT INTO estudiantes_carreras (id_estudiante, id_carrera, codigo_matricula, fecha_ingreso, periodo_inicio, periodo_desercion, fecha_graduacion, estado_academico, jornada, sede) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [id_estudiante, id_carrera, codigo_matricula, fecha_ingreso, periodo_inicio, periodo_desercion, fecha_graduacion, estado_academico, jornada, sede]
          );
          return result.insertId; // Retorna el ID de la relación insertada
      }
  } catch (error) {
      console.error('Error al insertar/actualizar estudiante en carrera:', error);
      throw error; // Propagar el error para ser manejado más arriba
  }
};

      // Función para insertar datos en la tabla 'historico_matriculas'
      async function insertarHistoricoMatricula(id_estudiante, id_carrera, periodo_matricula, promedio_semestral, promedio_general) {
        try {
          // Verificar si ya existe un registro en historico_matriculas para este estudiante y período
          const [existingRecord] = await pool.query(
              `SELECT * FROM historico_matriculas 
               WHERE id_estudiante = ? AND id_carrera = ? AND periodo_matricula = ?`,
              [id_estudiante, id_carrera, periodo_matricula]
          );
  
          if (existingRecord.length > 0) {
              // Actualizar el registro existente
              await pool.query(
                  `UPDATE historico_matriculas 
                   SET promedio_semestral = ?, promedio_general = ? 
                   WHERE id_estudiante = ? AND id_carrera = ? AND periodo_matricula = ?`,
                  [promedio_semestral, promedio_general, id_estudiante, id_carrera, periodo_matricula]
              );
              console.log(`Registro actualizado en historico_matriculas para el estudiante ${id_estudiante} en el período ${periodo_matricula}.`);
          } else {
              // Insertar un nuevo registro
              await pool.query(
                  `INSERT INTO historico_matriculas (id_estudiante, id_carrera, periodo_matricula, promedio_semestral, promedio_general) 
                   VALUES (?, ?, ?, ?, ?)`,
                  [id_estudiante, id_carrera, periodo_matricula, promedio_semestral, promedio_general]
              );
              console.log(`Registro insertado en historico_matriculas para el estudiante ${id_estudiante} en el período ${periodo_matricula}.`);
          }
      } catch (error) {
          console.error('Error al insertar o actualizar en historico_matriculas:', error);
          throw error; // Lanza el error para que se maneje más arriba
      }
  }
// Función para verificar la fecha de graduación y restaurar el estado a 'Graduado' sin duplicados en historico_estado
async function verificarYActualizarGraduacion(carreraId, periodoActual) {
  try {
      // Obtener los estudiantes matriculados en el periodo actual
      const [estudiantesMatriculados] = await pool.query(
          `SELECT id_estudiante FROM historico_matriculas
           WHERE id_carrera = ? AND periodo_matricula = ?`,
          [carreraId, periodoActual]
      );

      // Extraer los IDs de los estudiantes
      const estudianteIds = estudiantesMatriculados.map(e => e.id_estudiante);

      if (estudianteIds.length === 0) {
          console.log(`No hay estudiantes matriculados en el periodo ${periodoActual}.`);
          return; // Si no hay estudiantes, salir
      }

      // 1. Consultar la información del estudiante para ver si tiene una fecha de graduación
      const [estudiantes] = await pool.query(
          `SELECT ec.id_estudiante, ec.estado_academico, ec.fecha_graduacion 
           FROM estudiantes_carreras ec
           WHERE ec.id_estudiante IN (?) AND ec.id_carrera = ?`,
          [estudianteIds, carreraId]
      );

      // 2. Procesar cada estudiante
      for (const estudiante of estudiantes) {
          const estudianteId = estudiante.id_estudiante;

          // Verificar si el estudiante tiene fecha de graduación
          if (!estudiante.fecha_graduacion) {
              console.log(`Estudiante ${estudianteId} no tiene fecha de graduación registrada.`);
              continue; // Si no tiene fecha de graduación, continuar con el siguiente
          }

          // 3. Verificar si el estudiante ya tiene el estado académico 'Graduado'
          if (estudiante.estado_academico === 'Graduado') {
              console.log(`Estudiante ${estudianteId} ya está graduado y no será actualizado.`);
              continue; // Si ya está graduado, no hacer nada más
          }

          // 4. Verificar si ya existe un registro de graduación en cualquier periodo en historico_estado
          const [registroGraduacionPrevio] = await pool.query(
              `SELECT * FROM historico_estado
               WHERE id_estudiante = ? AND id_carrera = ? AND estado_nuevo = 'Graduado'`,
              [estudianteId, carreraId]
          );

          if (registroGraduacionPrevio.length > 0) {
              console.log(`El estudiante ${estudianteId} ya tiene un registro de graduación en el histórico en un periodo anterior.`);
              continue; // Evitar registrar duplicados si ya existe un registro de graduación en cualquier periodo
          }

          // 5. Actualizar el estado académico del estudiante a 'Graduado' en la tabla 'estudiantes_carreras'
          await pool.query(
              `UPDATE estudiantes_carreras SET estado_academico = ? 
               WHERE id_estudiante = ? AND id_carrera = ?`,
              ['Graduado', estudianteId, carreraId]
          );

          // 6. Registrar el cambio en la tabla 'historico_estado' solo si no existe un registro previo de 'Graduado'
          await pool.query(
              `INSERT INTO historico_estado (id_estudiante, id_carrera, estado_anterior, estado_nuevo, fecha_cambio, periodo_cambio)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [estudianteId, carreraId, estudiante.estado_academico, 'Graduado', new Date(), periodoActual]
          );

          console.log(`Estudiante ${estudianteId} ha sido marcado como 'Graduado' para el periodo ${periodoActual}.`);
      }
  } catch (error) {
      console.error('Error al verificar y actualizar la graduación:', error);
      throw error;
  }
}


async function cambiarEstadoAcademicoSegunMatriculas(carreraId, periodoActual) {
  try {
    // Obtener todos los estudiantes de la carrera
    const [todosEstudiantes] = await pool.query(
        `SELECT id_estudiante FROM estudiantes_carreras WHERE id_carrera = ?`,
        [carreraId]
    );

    console.log('Todos los estudiantes de la carrera:', todosEstudiantes);

    // Obtener los estudiantes matriculados en el periodo actual
    const [estudiantesMatriculadosActual] = await pool.query(
        `SELECT id_estudiante FROM historico_matriculas
         WHERE id_carrera = ? AND periodo_matricula = ?`,
        [carreraId, periodoActual]
    );

    // Verifica si la consulta ha devuelto resultados
    if (!estudiantesMatriculadosActual || estudiantesMatriculadosActual.length === 0) {
        console.error('Error: La consulta de estudiantes matriculados actuales no devolvió resultados válidos.');
        return; // Si no hay estudiantes matriculados en el periodo actual, no hacemos nada
    }

    // Obtener los IDs de los estudiantes matriculados en el periodo actual
    const idsEstudiantesMatriculadosActual = estudiantesMatriculadosActual.map(e => e.id_estudiante);

    // Iterar sobre todos los estudiantes registrados en la carrera
    for (const { id_estudiante } of todosEstudiantes) {
        // Si el estudiante no está en el periodo actual
        if (!idsEstudiantesMatriculadosActual.includes(id_estudiante)) {
            
            // Hacer una consulta para obtener el estado_academico actual del estudiante
            const [resultado] = await pool.query(
                `SELECT estado_academico FROM estudiantes_carreras
                WHERE id_estudiante = ? AND id_carrera = ?`,
                [id_estudiante, carreraId]
            );
            
            if (!resultado || resultado.length === 0) {
                console.error(`No se encontró estado académico para el estudiante ${id_estudiante}`);
                continue; // Si no se encuentra el estado, pasamos al siguiente estudiante
            }
            
            const estadoActual = resultado[0].estado_academico;

              // Si el estado es 'Graduado' o 'Desertor', no se hacen cambios
              if (estadoActual === 'Graduado' || estadoActual === 'Desertor') {
                console.log(`El estudiante ${id_estudiante} tiene estado '${estadoActual}', no se realizan cambios.`);
                continue; // No hacemos nada, pasamos al siguiente estudiante
            }

            // Verificar si el estado es 'Activo' o 'Retenido'
            if (estadoActual === 'Activo' || estadoActual === 'Retenido') {
                // Cambiar el estado a 'Inactivo'
                await cambiarEstadoAcademico(id_estudiante, carreraId, 'Inactivo', estadoActual, periodoActual);
                console.log(`Estudiante ${id_estudiante} ha sido marcado como 'Inactivo' para el periodo ${periodoActual}`);
            } 
            // Verificar si el estudiante ya estaba 'Inactivo'
            else if (estadoActual === 'Inactivo') {
                // Cambiar el estado a 'Desertor'
                await cambiarEstadoAcademico(id_estudiante, carreraId, 'Desertor', estadoActual, periodoActual);
                console.log(`Estudiante ${id_estudiante} ha sido marcado como 'Desertor' para el periodo ${periodoActual}`);
            } else {
                console.log(`El estado del estudiante ${id_estudiante} es '${estadoActual}', no se realizaron cambios.`);
            }
        }
    }

} catch (error) {
    console.error('Error al cambiar el estado académico:', error);
    throw error;
}
}



// Función para cambiar el estado académico y actualizar el registro en historico_estado
async function cambiarEstadoAcademico(estudianteId, carreraId, nuevoEstado, estadoAnterior, periodoActual) {
  try {
      // 1. Actualizar el estado en la tabla 'estudiante_carrera'
      await pool.query(
          `UPDATE estudiantes_carreras SET estado_academico = ?
           WHERE id_estudiante = ? AND id_carrera = ?`,
          [nuevoEstado, estudianteId, carreraId]
      );

      // 2. Verificar si ya existe un registro con el mismo estudiante, carrera y periodo en 'historico_estado'
      const [resultado] = await pool.query(
          `SELECT id_historial FROM historico_estado
           WHERE id_estudiante = ? AND id_carrera = ? AND periodo_cambio = ?`,
          [estudianteId, carreraId, periodoActual]
      );

      if (resultado.length > 0) {
          console.log(`Ya existe un registro en historico_estado para el estudiante ${estudianteId}, carrera ${carreraId}, periodo ${periodoActual}.`);
          return; // Si ya existe, no insertamos un nuevo registro
      }

      // 3. Insertar el cambio en la tabla 'historico_estado' si no existe un registro duplicado
      await pool.query(
          `INSERT INTO historico_estado (id_estudiante, id_carrera, estado_anterior, estado_nuevo, fecha_cambio, periodo_cambio)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [estudianteId, carreraId, estadoAnterior, nuevoEstado, new Date(), periodoActual]
      );

      console.log(`Se ha insertado el cambio de estado para el estudiante ${estudianteId}, carrera ${carreraId}, periodo ${periodoActual}.`);
  } catch (error) {
      console.error('Error al cambiar el estado académico en la base de datos:', error);
      throw error;
  }
}

// Función para obtener el periodo actual en formato YYYY-S
const obtenerPeriodoActual = () => {
  const fechaActual = new Date();
  const añoActual = fechaActual.getFullYear();
  const semestreActual = fechaActual.getMonth() < 6 ? 1 : 2; // Primer semestre: enero-junio; Segundo semestre: julio-diciembre
  return `${añoActual}-${semestreActual}`;
};

async function procesarCambioEstadoRetenido() {
  try {
      // Obtener el periodo actual
      const periodoActual = obtenerPeriodoActual();
      console.log('Periodo actual:', periodoActual); // Muestra el periodo actual calculado

      // Paso 1: Filtrar estudiantes a procesar
      const [estudiantesActivos] = await pool.query(
          `SELECT ec.id_estudiante, ec.id_carrera, ec.periodo_inicio, ec.estado_academico
          FROM estudiantes_carreras ec
          WHERE ec.estado_academico = 'Activo'`
      );

      // Paso 2: Procesar cada estudiante activo
      for (const estudiante of estudiantesActivos) {
          const { id_estudiante, id_carrera, periodo_inicio } = estudiante;

          // Convertir el periodo_inicio a año y semestre
          const [yearInicio, semestreInicio] = periodo_inicio.split('-').map(Number);
          // Obtener el tipo de carrera
          const [carrera] = await pool.query('SELECT tipo_programa FROM carreras WHERE id_carrera = ?', [id_carrera]);
          const tipo_programa = carrera.length > 0 ? carrera[0].tipo_programa : null;

          // Calcular el periodo máximo de graduación
          let maxSemestres;

          if (tipo_programa === 'Tecnologia') {
              maxSemestres = 6;
          } else if (tipo_programa === 'Profesional') {
              maxSemestres = 4;
          } else {
              console.log(`Tipo de programa desconocido para el estudiante ${id_estudiante}.`);
              continue; // Si el tipo de programa no es válido, continuar
          }

          // Calcular el periodo tope para la graduación
          let yearTope = yearInicio;
          let semestreTope = semestreInicio;

          for (let i = 0; i < maxSemestres-1; i++) {
              if (semestreTope === 2) {
                  semestreTope = 1; // Cambiar a primer semestre
                  yearTope++; // Avanzar al siguiente año
              } else {
                  semestreTope = 2; // Cambiar a segundo semestre
              }
          }

          const periodoTope = `${yearTope}-${semestreTope}`; // Formato YYYY-S
          console.log(`Procesando estudiante ${id_estudiante} con periodo de inicio ${periodo_inicio}`);
          console.log(`Periodo tope calculado para estudiante ${id_estudiante}: ${periodoTope}`);
          console.log(`Periodo actual: ${periodoActual}`); // Muestra el periodo actual calculado

          // Comparar el periodo actual con el periodo tope
          if (periodoTope < periodoActual) {
              // Verificar si no ha graduado
              const [graduacion] = await pool.query(
                  `SELECT fecha_graduacion FROM estudiantes_carreras 
                  WHERE id_estudiante = ? AND id_carrera = ?`,
                  [id_estudiante, id_carrera]
              );

              if (graduacion.length === 0 || !graduacion[0].fecha_graduacion) {
                  console.log(`Actualizando el estado del estudiante ${id_estudiante} a 'Retenido'.`);

                  // Paso 4: Registro en historico_estado
                  await pool.query(
                      `INSERT INTO historico_estado (id_estudiante, id_carrera, estado_anterior, estado_nuevo, fecha_cambio, periodo_cambio)
                      VALUES (?, ?, ?, ?, ?, ?)`,
                      [id_estudiante, id_carrera, 'Activo', 'Retenido', new Date(), periodoActual]
                  );

                  // Paso 5: Actualización del estado
                  await pool.query(
                      `UPDATE estudiantes_carreras 
                      SET estado_academico = 'Retenido' 
                      WHERE id_estudiante = ? AND id_carrera = ?`,
                      [id_estudiante, id_carrera]
                  );
              }
          }
      }
  } catch (error) {
      console.error('Error al procesar el cambio de estado a "Retenido":', error);
      throw error; // Lanza el error para que se maneje más arriba
  }
}





























































export const traerProgramas = async (req, res) => {
  try {
      const [rows] = await pool.query('SELECT * FROM carreras');
      res.json(rows);
  } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error al obtener datos' });
  }
};




export const traerCortesIniciales = async (req, res) => {
  try {
      // Consulta para obtener los cortes iniciales únicos, ordenados y que sigan el formato 'YYYY-MM'
      const [rows] = await pool.query(`
          SELECT DISTINCT periodo_inicio
          FROM estudiantes_carreras
          WHERE periodo_inicio IS NOT NULL
          AND periodo_inicio REGEXP '^[0-9]{4}-(01|02)$'
          ORDER BY periodo_inicio
      `);

      // Extraer solo los valores de "periodo_inicio" en un array simple
      const periodos = rows.map(row => row.periodo_inicio);

      res.json(periodos);
  } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error al obtener datos' });
  }
};

export const buscarEstudiantes = async (req, res) => {
  const { search } = req.query;
  console.log('Parámetro de búsqueda recibido:', search); // Verifica que 'search' no esté undefined

  try {
    // Verifica que los nombres de las columnas coincidan con tu base de datos
    const sql = `SELECT * FROM estudiantes WHERE nombre LIKE ? OR apellido LIKE ?`;

    // Asegúrate de que el parámetro 'search' esté correctamente formateado
    const params = [`%${search}%`, `%${search}%`];

    const [rows] = await pool.query(sql, params);
    console.log('Filas obtenidas:', rows); // Aquí verificas qué devuelve la consulta
    res.json(rows);
  } catch (error) {
    console.error('Error al buscar estudiantes:', error);
    res.status(500).json({ error: 'Error al obtener datos de estudiantes' });
  }
};

export const obtenerDetalles = async (req, res) => {
  const { id } = req.params; // Obtener el id del estudiante desde los parámetros de la URL

  console.log('ID del estudiante recibido:', id);

  try {
    // Consulta para obtener todos los datos del estudiante y las carreras en las que está inscrito
    const sql = `
      SELECT 
        e.*,  -- Selecciona todos los campos de la tabla estudiante
        ec.*,  -- Selecciona todos los campos de la tabla estudiante_carrera
        c.nombre_programa  -- Nombre del programa en la tabla carrera
      FROM 
        estudiantes e
      LEFT JOIN 
        estudiantes_carreras ec ON e.id_estudiante = ec.id_estudiante  -- Unión con estudiante_carrera
      LEFT JOIN 
        carreras c ON ec.id_carrera = c.id_carrera  -- Unión con carrera
      WHERE 
        e.id_estudiante = ?
    `;

    const [rows] = await pool.query(sql, [id]); // Ejecutar la consulta con el id

    if (rows.length > 0) {
      // Extraer los detalles del estudiante
      const estudiante = {
        id_estudiante: rows[0].id_estudiante,
        nombre: rows[0].nombre,
        apellido: rows[0].apellido,
        tipo_documento: rows[0].tipo_documento,
        numero_documento: rows[0].numero_documento,
        fecha_nacimiento: rows[0].fecha_nacimiento,
        sexo: rows[0].sexo,
        correo_electronico: rows[0].correo_electronico,
        celular: rows[0].celular
      };

      // Extraer las carreras
      const carreras = rows.map(row => ({
        id_carrera: row.id_carrera,
        codigo_matricula: row.codigo_matricula,
        fecha_ingreso: row.fecha_ingreso,
        periodo_inicio: row.periodo_inicio,
        periodo_desercion: row.periodo_desercion,
        fecha_graduacion: row.fecha_graduacion,
        estado_academico: row.estado_academico,
        jornada: row.jornada,
        sede: row.sede,
        nombre_programa: row.nombre_programa
      }));

      // Enviar la respuesta
      res.json([estudiante, ...carreras]); // Respuesta como un array con el objeto estudiante seguido de las carreras
      console.log( [estudiante, ...carreras] )
    } else {
      res.status(404).json({ error: 'Estudiante no encontrado' }); // Error si no se encuentra el estudiante
    }
  } catch (error) {
    console.error('Error al obtener detalles del estudiante:', error);
    res.status(500).json({ error: 'Error al obtener detalles del estudiante' });
  }
};
















export const procesarEstadisticas = async (req, res) => {
  const { programa, corteInicial, corteFinal } = req.body;
  console.log('Datos recibidos:', req.body);

  const cod_prog = programa;
  const [ano1, per1] = corteInicial.split("-").map(Number);
  const [ano, per] = corteFinal.split("-").map(Number);
  let fgrado = per === 1 ? `${ano}-06-30` : `${ano}-12-31`;

  let connection;

  try {
      connection = await pool.getConnection();
      console.log('Conexión a la base de datos establecida.');

      // Total de estudiantes del corte inicial
      const [totalEstpResult] = await connection.query(
          `SELECT COUNT(DISTINCT doc_est) AS cantidad FROM estudiante_prog WHERE ano = ? AND periodo = ? AND cod_prog = ?`,
          [ano1, per1, cod_prog]
      );
      const totalEstp = totalEstpResult[0].cantidad;
      console.log('Total de estudiantes del corte inicial:', totalEstp);

      if (totalEstp <= 0) {
          return res.status(400).json({ error: 'No existen estudiantes para ese año y periodo' });
      }

      // Total de estudiantes graduados
      const [totalGraResult] = await connection.query(
          `SELECT COUNT(gdocumento) AS cantidad FROM graduados 
           WHERE gfechagrado < ? 
           AND gdocumento IN (
             SELECT DISTINCT doc_est FROM estudiante_prog 
             WHERE ano = ? AND periodo = ? AND cod_prog = ?
           )`,
          [fgrado, ano1, per1, cod_prog]
      );
      const totalGra = totalGraResult[0].cantidad;
      console.log('Total de estudiantes graduados:', totalGra);

      // Desglose por sexo de los graduados
      const [graPorSexoResult] = await connection.query(
          `SELECT e.sexo, COUNT(e.documento) AS cantidad 
           FROM graduados g
           JOIN estudiante_prog ep ON g.gdocumento = ep.doc_est
           JOIN estudiantes e ON e.documento = ep.doc_est
           WHERE g.gfechagrado < ? 
             AND ep.ano = ? AND ep.periodo = ? AND ep.cod_prog = ?
           GROUP BY e.sexo`,
          [fgrado, ano1, per1, cod_prog]
      );
      const graPorSexo = {
          Masculino: 0,
          Femenino: 0
      };
      graPorSexoResult.forEach(row => {
          if (row.sexo === 'M') graPorSexo.Masculino = row.cantidad;
          if (row.sexo === 'F') graPorSexo.Femenino = row.cantidad;
      });
      console.log('Graduados por sexo:', graPorSexo);

      // Total de estudiantes retenidos
      const [totalRetResult] = await connection.query(
          `SELECT COUNT(DISTINCT doc_est) AS cantidad FROM estudiante_prog 
           WHERE ano = ? AND periodo = ? AND estado = 'Matriculado' AND cod_prog = ? 
             AND doc_est IN (
               SELECT DISTINCT doc_est FROM estudiante_prog 
               WHERE ano = ? AND periodo = ? AND cod_prog = ?
             )`,
          [ano, per, cod_prog, ano1, per1, cod_prog]
      );
      const totalRet = totalRetResult[0].cantidad;
      console.log('Total de estudiantes retenidos:', totalRet);

      // Desglose por sexo de los retenidos
      const [retPorSexoResult] = await connection.query(
          `SELECT e.sexo, COUNT(e.documento) AS cantidad 
           FROM estudiante_prog ep
           JOIN estudiantes e ON e.documento = ep.doc_est
           WHERE ep.ano = ? AND ep.periodo = ? AND ep.estado = 'Matriculado' AND ep.cod_prog = ? 
             AND ep.doc_est IN (
               SELECT DISTINCT doc_est FROM estudiante_prog 
               WHERE ano = ? AND periodo = ? AND cod_prog = ?
             )
           GROUP BY e.sexo`,
          [ano, per, cod_prog, ano1, per1, cod_prog]
      );
      const retPorSexo = {
          Masculino: 0,
          Femenino: 0
      };
      retPorSexoResult.forEach(row => {
          if (row.sexo === 'M') retPorSexo.Masculino = row.cantidad;
          if (row.sexo === 'F') retPorSexo.Femenino = row.cantidad;
      });
      console.log('Retenidos por sexo:', retPorSexo);

      // Validación de consistencia de datos
      if (totalRet > totalEstp || (totalGra + totalRet) > totalEstp) {
          return res.status(400).json({ error: 'Existen errores en la base de datos de matriculados para este corte de cierre y este programa' });
      }

      // Cálculo de desertores
      const totalDes = totalEstp > 0 ? totalEstp - totalGra - totalRet : 0;
      console.log('Total de estudiantes desertores:', totalDes);
     
        // Si deseas contar desertores por sexo, puedes buscar los que no están en los graduados ni en los retenidos
        const [desPorSexoResult] = await connection.query(
          `SELECT e.sexo, COUNT(e.documento) AS cantidad 
          FROM estudiantes e
          WHERE e.documento IN (
              SELECT DISTINCT ep.doc_est 
              FROM estudiante_prog ep
              WHERE ep.ano = ? AND ep.periodo = ? AND ep.cod_prog = ?
          )
          AND e.documento NOT IN (
              SELECT DISTINCT g.gdocumento FROM graduados g
          )
          AND e.documento NOT IN (
              SELECT DISTINCT ep.doc_est FROM estudiante_prog ep
              WHERE ep.estado = 'Matriculado' AND ep.ano = ? AND ep.periodo = ? AND ep.cod_prog = ?
          )
          GROUP BY e.sexo`,
          [ano1, per1, cod_prog, ano, per, cod_prog]
        );

      const desPorSexo = {
          Masculino: 0,
          Femenino: 0
      };
      desPorSexoResult.forEach(row => {
          if (row.sexo === 'M') desPorSexo.Masculino = row.cantidad;
          if (row.sexo === 'F') desPorSexo.Femenino = row.cantidad;
      });
      console.log('Desertores por sexo:', desPorSexo);

      const response = {
          totalEstp,
          totalGra,
          graPorSexo,
          totalRet,
          retPorSexo,
          totalDes,
          desPorSexo
      };

      console.log('Datos procesados y enviados:', response);
      return res.json(response);

  } catch (error) {
      console.error('Error al realizar las consultas:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
      if (connection) {
          connection.release();
          console.log('Conexión a la base de datos liberada.');
      }
  }
};




  export const obtenerDetallesEstudiante = async (req, res) => {
    const { documento } = req.params;
    const { corteFinal } = req.body; // Obtener los datos del cuerpo de la solicitud
  
    try {
      // Obtener la fecha actual y determinar el año y período actuales
      const fechaActual = new Date();
      const periodoActual = fechaActual.getMonth() < 6 ? 1 : 2;
  
      // Obtener año y periodo de corte inicial y final
      const [ano, per] = corteFinal.split("-").map(Number);
      let fgrado = per === 1 ? `${ano}-06-30` : `${ano}-12-31`;
  
      // Consulta para obtener los detalles del estudiante y su estado
      const sql = `
        SELECT 
          e.documento,
          e.tipo_doc,
          e.cod_estudiante,
          e.apellidos,
          e.nombres,
          e.sexo,
          e.fecha_nacimiento,
          p.programa,
          ep.estado,
          ep.ano AS año_matricula,
          CASE 
            WHEN g.gfechagrado IS NOT NULL THEN 'Graduado'
            WHEN ep2.doc_est IS NOT NULL THEN 'Retenido'
            ELSE 'Desertado'
          END AS estado_estudiante,
          CASE
            WHEN g.gfechagrado IS NOT NULL THEN g.gfechagrado
            ELSE NULL
          END AS fecha_grado
        FROM 
          estudiantes e
        JOIN 
          estudiante_prog ep ON e.documento = ep.doc_est
        JOIN 
          programas p ON ep.cod_prog = p.cod_snies
        LEFT JOIN 
          graduados g ON e.documento = g.gdocumento AND g.gfechagrado <= ? 
        LEFT JOIN 
          estudiante_prog ep2 ON e.documento = ep2.doc_est AND ep2.ano = ? AND ep2.periodo = ? AND ep2.cod_prog = ep.cod_prog
        WHERE 
          e.documento = ?
        LIMIT 1
      `;
  
      const [rows] = await pool.query(sql, [fechaActual, ano, periodoActual, documento]);
  
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ error: 'Estudiante no encontrado' });
      }
    } catch (error) {
      console.error('Error al obtener detalles del estudiante:', error);
      res.status(500).json({ error: 'Error al obtener detalles del estudiante' });
    }
  };
  


export const procesarEstadisticasPdf = async (req, res) => {
  const { programa, corteInicial, corteFinal } = req.body;
 
  const cod_prog = programa;
  const [ano1, per1] = corteInicial.split("-").map(Number);
  const [ano, per] = corteFinal.split("-").map(Number);
  let fgrado = per === 1 ? `${ano}-06-30` : `${ano}-12-31`;

  try {
      const connection = await pool.getConnection();
      console.log('Conexión a la base de datos establecida.');

      // Total de estudiantes del corte inicial
      const [totalEstpResult] = await connection.query(
          `SELECT COUNT(DISTINCT doc_est) AS cantidad FROM estudiante_prog WHERE ano = ? AND periodo = ? AND cod_prog = ?`,
          [ano1, per1, cod_prog]
      );
      const totalEstp = totalEstpResult[0].cantidad;
      
      if (totalEstp <= 0) {
          connection.release();
          return res.status(400).json({ error: 'No existen estudiantes para ese año y periodo' });
      }

      // Estudiantes graduados
      const [graduadosResult] = await connection.query(
          `SELECT e.documento, e.nombres, e.apellidos FROM graduados g
           JOIN estudiantes e ON g.gdocumento = e.documento
           WHERE g.gfechagrado < ? 
           AND g.gdocumento IN (
             SELECT DISTINCT doc_est FROM estudiante_prog 
             WHERE ano = ? AND periodo = ? AND cod_prog = ?
           )`,
          [fgrado, ano1, per1, cod_prog]
      );
      const graduados = graduadosResult.map(est => ({ documento: est.documento, nombres: est.nombres, apellidos: est.apellidos }));
      //console.log('Estudiantes graduados:', graduados);

      // Estudiantes retenidos
      const [retenidosResult] = await connection.query(
          `SELECT e.documento, e.nombres, e.apellidos FROM estudiante_prog ep
           JOIN estudiantes e ON ep.doc_est = e.documento
           WHERE ep.ano = ? AND ep.periodo = ? AND ep.estado = 'Matriculado' AND ep.cod_prog = ?
           AND ep.doc_est IN (
             SELECT DISTINCT doc_est FROM estudiante_prog 
             WHERE ano = ? AND periodo = ? AND cod_prog = ?
           )`,
          [ano, per, cod_prog, ano1, per1, cod_prog]
      );
      const retenidos = retenidosResult.map(est => ({ documento: est.documento, nombres: est.nombres, apellidos: est.apellidos }));
      //console.log('Estudiantes retenidos:', retenidos);

      if (retenidos.length > totalEstp || (graduados.length + retenidos.length) > totalEstp) {
          connection.release();
          return res.status(400).json({ error: 'Existen errores en la base de datos de matriculados para este corte de cierre y este programa' });
      }

      // Estudiantes desertores
      const [desertoresResult] = await connection.query(
        `SELECT e.documento, e.nombres, e.apellidos 
         FROM estudiantes e 
         JOIN estudiante_prog ep ON e.documento = ep.doc_est 
         WHERE ep.ano = ? AND ep.periodo = ? AND ep.cod_prog = ? 
         AND e.documento NOT IN (
           SELECT g.gdocumento FROM graduados g WHERE g.gfechagrado < ?
         ) 
         AND e.documento NOT IN (
           SELECT ep2.doc_est FROM estudiante_prog ep2 
           WHERE ep2.ano = ? AND ep2.periodo = ? AND ep2.cod_prog = ?
         )`,
        [ano1, per1, cod_prog, fgrado, ano, per, cod_prog]
    );
    const desertores = desertoresResult.map(est => ({ documento: est.documento, nombres: est.nombres, apellidos: est.apellidos }));
    //console.log('Estudiantes desertores:', desertores);

     // Crear un objeto que contenga todos los estudiantes
     const todos = [...graduados, ...retenidos, ...desertores];
     //console.log(todos);
    
      connection.release();
      console.log('Conexión a la base de datos liberada.');

       

        // Crear el objeto de respuesta con los datos y el nuevo objeto
        const response = {
            graduados,
            retenidos,
            desertores,
            todos
        };
        
      return res.json(response);


  } catch (error) {
      console.error('Error al realizar las consultas:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

