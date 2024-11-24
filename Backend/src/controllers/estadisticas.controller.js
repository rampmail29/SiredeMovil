import { pool } from '../db.js';


export const cargarEstudiantes = async (req, res) => {
  const { csvData, selectedOption, selectedCareers } = req.body; // Obtenemos los datos del CSV y el selectedOption
console.log( 'Ids recibidos en el backend:', selectedCareers)
  // Verificar que hay datos para procesar
  if (!csvData || csvData.length === 0) {
      console.error('No se recibieron datos para procesar.');
      return res.status(400).json({ success: false, message: 'No se recibieron datos para procesar.' });
  }

  
      function obtenerPeriodoDesdeMatricula(codigoMatricula, fechaIngreso) {

        // Patrón para verificar el formato 2018-01 o 2018-01-E
       const matriculaPattern = /^[0-9]{4}-[0-9]{2}(?:-E)?$/;

       if (matriculaPattern.test(codigoMatricula)) {
          // Extraemos los primeros 4 caracteres para el año
          const anio = codigoMatricula.substring(0, 4);
          
          // Extraemos el mes (últimos dos dígitos del formato YYYY-MM)
          const mes = codigoMatricula.substring(5, 7);
          
          // Convertimos el mes en el formato esperado (quitamos el cero inicial si existe)
          const semestre = mes === '01' ? '1' : '2';
          
          // Retornamos el formato deseado: YYYY-1 o YYYY-2
          return `${anio}-${semestre}`;
       }else {
          // Si no coincide con el patrón, usamos el periodo basado en la fecha de ingreso
          return obtenerPeriodo(fechaIngreso);
        }
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
    for (const estudiante of csvData) {
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
            CATE_DESCRIPCION,
            ESTP_CODIGOMATRICULA
        } = estudiante;

        const nombre = PENG_PRIMERNOMBRE + ' ' + PENG_SEGUNDONOMBRE;
        const apellido = PENG_PRIMERAPELLIDO + ' ' + PENG_SEGUNDOAPELLIDO;
        const numero_documento = PEGE_DOCUMENTOIDENTIDAD;
        const correo_electronico = PEGE_MAIL;
        const celular = PEGE_TELEFONOCELULAR || PEGE_TELEFONO;
        const codigo_matricula = ESTP_ID;
        const fecha_ingreso = convertirFecha(ESTP_FECHAINGRESO);
       
      // Aquí usamos la nueva función para obtener el periodo de inicio
         const periodo_inicio = obtenerPeriodoDesdeMatricula(ESTP_CODIGOMATRICULA, ESTP_FECHAINGRESO);

        const estado_academico = 'Activo';
        const jornada = FRAN_DESCRIPCION;
        const sede = UNID_NOMBRE;
        const nombre_programa = PROG_NOMBRE;
        const codigo_programa = PROG_CODIGOICFES;
        const tipo_programa = selectedOption;
        const descripcion = CATE_DESCRIPCION;
        const periodo_reingreso = PERIODO;

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
        await insertarEstudianteCarrera(estudianteId, carreraId, codigo_matricula, fecha_ingreso, periodo_inicio, periodo_desercion, fecha_graduacion, estado_academico, jornada, sede, descripcion, periodo_reingreso );

        // 4. Insertar el historial de matrícula del estudiante
        await insertarHistoricoMatricula(estudianteId, carreraId, periodo_matricula, promedio_semestral, promedio_general);
    }
      console.log(carreraId)
      console.log(periodo_matricula)

    // Fase 2: Procesar relaciones de carreras
    if (carreraId && periodo_matricula) {
      await cambiarEstadoAcademicoSegunMatriculas(carreraId, periodo_matricula);
      await procesarCambioEstadoRetenido(carreraId, periodo_matricula);

      if (selectedCareers && selectedCareers.length > 0) {
        await procesarRelacionesCarreras(carreraId, selectedCareers);
      }
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

export const insertarEstudianteCarrera = async (id_estudiante, codigo_carrera, codigo_matricula, fecha_ingreso, periodo_inicio, periodo_desercion, fecha_graduacion, estado_academico, jornada, sede, descripcion, periodo_reingreso) => {
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
          // El estudiante ya tiene una relación con esta carrera
          console.log(`Actualizando la relación entre estudiante ${id_estudiante} y carrera ${id_carrera}.`);

          // Obtener el estado académico actual del estudiante
          const estadoActual = existing[0].estado_academico;

          // Si el estado es retenido o graduado, NO lo cambiamos
          if (estadoActual === 'Retenido' || estadoActual === 'Graduado') {
              estado_academico = estadoActual;
              console.log(`El estado académico actual es ${estadoActual}, no se realizará ningún cambio en el estado.`);
          } 
          // Si es desertado o inactivo, lo cambiamos a activo
          else if (estadoActual === 'Desertado' || estadoActual === 'Inactivo') {
              estado_academico = 'Activo';
              console.log(`El estado académico es ${estadoActual}, será cambiado a Activo.`);
          }
        // Lógica para "Nuevo Reingreso"
        if (descripcion === 'NUEVO REINGRESO') {
          // No actualizamos el periodo_inicio, solo actualizamos el periodo_reingreso
          console.log(`El estudiante ${id_estudiante} es Nuevo Reingreso`);
          const updates = [
            codigo_matricula,
            (periodo_desercion && periodo_desercion.trim() !== '') ? periodo_desercion : existing[0].periodo_desercion,
            (fecha_graduacion && fecha_graduacion.trim() !== '') ? fecha_graduacion : existing[0].fecha_graduacion,
            estado_academico, // Aplicamos la lógica de estado
            jornada,
            sede,
            periodo_reingreso, // Guardamos el nuevo periodo de reingreso
            id_estudiante,
            id_carrera
          ];

          await pool.query(
            'UPDATE estudiantes_carreras SET codigo_matricula = ?, periodo_desercion = ?, fecha_graduacion = ?, estado_academico = ?, jornada = ?, sede = ?, periodo_reingreso = ? WHERE id_estudiante = ? AND id_carrera = ?',
            updates
          );
        } else {
          // Actualización normal sin reingreso
          const updates = [
            codigo_matricula,
            fecha_ingreso,
            periodo_inicio, // Actualizar normalmente el periodo de inicio
            (periodo_desercion && periodo_desercion.trim() !== '') ? periodo_desercion : existing[0].periodo_desercion,
            (fecha_graduacion && fecha_graduacion.trim() !== '') ? fecha_graduacion : existing[0].fecha_graduacion,
            estado_academico, // Aplicamos la lógica de estado
            jornada,
            sede,
            id_estudiante,
            id_carrera
          ];

          await pool.query(
            'UPDATE estudiantes_carreras SET codigo_matricula = ?, fecha_ingreso = ?, periodo_inicio = ?, periodo_desercion = ?, fecha_graduacion = ?, estado_academico = ?, jornada = ?, sede = ? WHERE id_estudiante = ? AND id_carrera = ?',
            updates
          );
        }
      } else {
          // Insertar nueva relación
          console.log(`Insertando nueva relación entre estudiante ${id_estudiante} y carrera ${id_carrera}.`);
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


      // Si el nuevo estado es 'Desertor', actualizar el periodo_desercion
      if (nuevoEstado === 'Desertor') {
        await pool.query(
            `UPDATE estudiantes_carreras 
             SET periodo_desercion = ? 
             WHERE id_estudiante = ? AND id_carrera = ?`,
            [periodoActual, estudianteId, carreraId]
        );
    }

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


async function procesarCambioEstadoRetenido() {
  try {
 
    // Paso 1: Filtrar estudiantes activos a procesar
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

      // Definir el número máximo de semestres dependiendo del tipo de programa
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

      for (let i = 0; i < maxSemestres - 1; i++) {
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

      // Paso 3: Verificar si tiene matrícula posterior al periodo tope
      const [matriculasPosteriores] = await pool.query(
        `SELECT periodo_matricula 
         FROM historico_matriculas 
         WHERE id_estudiante = ? AND id_carrera = ? AND periodo_matricula > ?`,
        [id_estudiante, id_carrera, periodoTope]
      );

      if (matriculasPosteriores.length > 0) {
        console.log(`El estudiante ${id_estudiante} tiene matrículas posteriores al periodo tope.`);


        // Obtener el periodo de matrícula más reciente
        const [periodoReciente] = await pool.query(
          `SELECT periodo_matricula 
           FROM historico_matriculas 
           WHERE id_estudiante = ? AND id_carrera = ?
           ORDER BY periodo_matricula DESC 
           LIMIT 1`,
          [id_estudiante, id_carrera]
        );

        const periodoMatriculaReciente = periodoReciente.length > 0 ? periodoReciente[0].periodo_matricula : null;

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
            [id_estudiante, id_carrera, 'Activo', 'Retenido', new Date(), periodoMatriculaReciente]
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

async function procesarRelacionesCarreras(carreraId, selectedCareers) {
  try {
    if (!carreraId || !Array.isArray(selectedCareers) || selectedCareers.length === 0) {
      console.warn('Datos inválidos para procesar relaciones de carreras.');
      return;
    }

    console.log(`Procesando relaciones para la carrera ID: ${carreraId}`);
    console.log(`Carreras relacionadas: ${selectedCareers.join(', ')}`);

    // Paso 1: Iterar sobre los IDs de las carreras relacionadas
    for (const idCarrera2 of selectedCareers) {
      // Asegurarse de que no se está intentando relacionar la carrera consigo misma
      if (carreraId === idCarrera2) {
        console.warn(`Se omitió la relación entre la misma carrera (ID: ${carreraId}).`);
        continue;
      }

      console.log(`Insertando relación: ${carreraId} - ${idCarrera2}`);

      // Paso 2: Intentar insertar la relación
      await pool.query(
        `INSERT INTO relaciones_carreras (id_carrera1, id_carrera2)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE id_carrera1 = id_carrera1;`, // Evita duplicados sin errores
        [carreraId, idCarrera2]
      );
    }

    console.log('Relaciones de carreras procesadas exitosamente.');
  } catch (error) {
    console.error('Error al procesar relaciones de carreras:', error);
    throw error; // Lanza el error para que el controlador principal lo maneje
  }
}



export const cargarGraduados = async (req, res) => {
  try {
      const graduadosData = req.body; // Datos en formato JSON: [{ documento, carrera, fecha_graduacion }, ...]
      console.log(graduadosData);

      // Validamos que haya datos
      if (!graduadosData || graduadosData.length === 0) {
          return res.status(400).json({
              success: false,
              message: "No se encontraron datos en el archivo de graduados",
          });
      }

      // Función para calcular el periodo en formato YYYY-N
      const calcularPeriodo = (fecha) => {
          const fechaObj = new Date(fecha);
          const año = fechaObj.getFullYear();
          const mes = fechaObj.getMonth(); // 0-11 (0 es enero, 11 es diciembre)
          const periodo = mes < 6 ? '1' : '2'; // Meses 0-5 son primer periodo, 6-11 son segundo periodo
          return `${año}-${periodo}`;
      };

      // Función para convertir la fecha del formato DD/MM/YYYY a YYYY-MM-DD
        const convertirFecha = (fechaStr) => {
            if (!fechaStr || typeof fechaStr !== 'string') {
                return null; // Si no es una cadena válida
            }

            const partesFecha = fechaStr.split('/');
            if (partesFecha.length !== 3) {
                return null; // Si el formato no es el esperado
            }

            let [dia, mes, año] = partesFecha;

            // Asegurarse de que el día y el mes tengan dos dígitos
            dia = dia.length === 1 ? '0' + dia : dia;
            mes = mes.length === 1 ? '0' + mes : mes;

            // Crear la fecha en formato YYYY-MM-DD sin el ajuste de zona horaria
            const fechaISO = `${año}-${mes}-${dia}T00:00:00.000Z`; // Formato ISO estándar para evitar ajustes de zona horaria

            // Crear el objeto Date sin que JS ajuste la zona horaria
            const fecha = new Date(fechaISO);

            // Verificar si la fecha es válida
            if (isNaN(fecha.getTime())) {
                return null; // Fecha inválida
            }

            // Retornar la fecha en formato YYYY-MM-DD
            return fecha.toISOString().split('T')[0];
        };


      // Recorrer los graduados recibidos
      for (const graduado of graduadosData) {
          const { numero_documento, nombre_programa, fecha_graduacion } = graduado;

          // Verificar si faltan datos esenciales
          if (!numero_documento || !nombre_programa || !fecha_graduacion) {
              console.log(`Datos incompletos para el estudiante: documento ${numero_documento}, programa ${nombre_programa}, fecha ${fecha_graduacion}`);
              continue; // Ignorar registros con datos incompletos
          }

          // Convertir fecha de graduación
          const fechaGraduacion = convertirFecha(fecha_graduacion);
         

          // Convertir fecha_graduacion a un objeto Date
          const fechaGraduacionDate = new Date(fechaGraduacion);
          if (isNaN(fechaGraduacionDate)) {
              return res.status(400).json({
                  success: false,
                  message: `Formato de fecha inválido para el graduado con documento ${numero_documento}`,
              });
          }
          

          // 1. Obtener el ID del estudiante basado en el documento
          const [resultEstudiante] = await pool.query(
              `SELECT id_estudiante FROM estudiantes WHERE numero_documento = ?`,
              [numero_documento]
          );
          if (resultEstudiante.length === 0) {
              console.log(`No se encontró el estudiante con documento ${numero_documento}.`);
              continue; // Si no se encuentra el estudiante, continuar con el siguiente
          }
          const estudianteId = resultEstudiante[0].id_estudiante;

          // 2. Obtener el ID de la carrera basada en el nombre del programa
          const [resultCarrera] = await pool.query(
              `SELECT id_carrera FROM carreras WHERE nombre_programa = ?`,
              [nombre_programa]
          );
          if (resultCarrera.length === 0) {
              console.log(`No se encontró la carrera con nombre ${nombre_programa}.`);
              continue; // Si no se encuentra la carrera, continuar con el siguiente
          }
          const idCarrera = resultCarrera[0].id_carrera;

          // 3. Obtener la información del estudiante en la tabla estudiantes_carreras
          const [estudianteCarrera] = await pool.query(
              `SELECT id_estudiante, estado_academico, fecha_graduacion, periodo_graduacion
               FROM estudiantes_carreras
               WHERE id_estudiante = ? AND id_carrera = ?`,
              [estudianteId, idCarrera]
          );
          if (estudianteCarrera.length === 0) {
              console.log(`El estudiante ${estudianteId} no está inscrito en la carrera ${nombre_programa}.`);
              continue;
          }

          const estudiante = estudianteCarrera[0];

          // Verificar si el estudiante ya tiene la fecha de graduación actualizada
          if (estudiante.fecha_graduacion === fechaGraduacion) {
              console.log(`El estudiante ${estudianteId} ya tiene la fecha de graduación actualizada.`);
              continue; // Continuar con el siguiente si la fecha ya está actualizada
          }

          // 4. Verificar si el estado académico ya es 'Graduado'
          if (estudiante.estado_academico === 'Graduado') {
              console.log(`El estudiante ${estudianteId} ya está marcado como 'Graduado'.`);
              continue;
          }

          // 5. Verificar si ya hay un registro de 'Graduado' en historico_estado
          const [registroGraduacionPrevio] = await pool.query(
              `SELECT * FROM historico_estado
               WHERE id_estudiante = ? AND id_carrera = ? AND estado_nuevo = 'Graduado'`,
              [estudianteId, idCarrera]
          );

          if (registroGraduacionPrevio.length > 0) {
              console.log(`El estudiante ${estudianteId} ya tiene un registro de graduación en el histórico.`);
              continue;
          }

                 // Calcular el periodo de graduación
                const periodoGraduacion = calcularPeriodo(fechaGraduacionDate);

                // 6. Verificar si el estudiante tiene algún registro en el periodo de graduación
                const [registroPrevio] = await pool.query(
                    `SELECT * FROM historico_estado 
                    WHERE id_estudiante = ? AND id_carrera = ? AND periodo_cambio = ?`,
                    [estudianteId, idCarrera, periodoGraduacion]
                );

                if (registroPrevio.length > 0) {
                    // Si hay un registro en el periodo de graduación, actualizarlo a "Graduado"
                    await pool.query(
                        `UPDATE historico_estado 
                        SET estado_nuevo = 'Graduado', fecha_cambio = ? 
                        WHERE id_estudiante = ? AND id_carrera = ? AND periodo_cambio = ?`,
                        [new Date(), estudianteId, idCarrera, periodoGraduacion]
                    );
                    console.log(`El estado del estudiante ${estudianteId} se actualizó a 'Graduado' en el periodo ${periodoGraduacion}.`);
                }

          // 7. Actualizar la fecha de graduación, el estado académico y el periodo de graduación en estudiantes_carreras
          await pool.query(
              `UPDATE estudiantes_carreras 
               SET fecha_graduacion = ?, estado_academico = 'Graduado', periodo_graduacion = ? 
               WHERE id_estudiante = ? AND id_carrera = ?`,
              [fechaGraduacion, periodoGraduacion, estudianteId, idCarrera]
          );

         // 8. Solo insertar en el historico_estado si no se actualizó en el paso 6
         if (registroPrevio.length === 0) {
          await pool.query(
              `INSERT INTO historico_estado (id_estudiante, id_carrera, estado_anterior, estado_nuevo, fecha_cambio, periodo_cambio)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [estudianteId, idCarrera, estudiante.estado_academico, 'Graduado', new Date(), periodoGraduacion]
          );
          console.log(`Estudiante ${estudianteId} ha sido registrado como 'Graduado' en el historico_estado.`);
      }
    }
      return res.status(200).json({
          success: true,
          message: "Archivo de graduados procesado correctamente y los datos han sido actualizados.",
      });

  } catch (error) {
      console.error('Error al procesar el archivo de graduados:', error);
      return res.status(500).json({
          success: false,
          message: 'Hubo un error al procesar el archivo de graduados.',
      });
  }
};


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
  const { id_carrera } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT periodo_inicio
      FROM estudiantes_carreras
      WHERE id_carrera = ?
      AND periodo_inicio IS NOT NULL
      AND periodo_inicio REGEXP '^[0-9]{4}-(1|2)$'
      ORDER BY periodo_inicio
    `, [id_carrera]);
  
    const periodos = rows.map(row => row.periodo_inicio);
    res.json(periodos);
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
};

export const traerPeriodosMatriculas = async (req, res) => {
  const { id_carrera } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT periodo_matricula
      FROM historico_Matriculas
      WHERE id_carrera = ?
      AND periodo_matricula IS NOT NULL
      AND periodo_matricula REGEXP '^[0-9]{4}-(1|2)$'
      ORDER BY periodo_matricula
    `, [id_carrera]);
  
    const periodos = rows.map(row => row.periodo_matricula);
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
        periodo_reingreso: row.periodo_reingreso,
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


// Controlador para obtener los estudiantes por periodo inicial y carrera
export const obtenerEstudiantesPorCorte = async (req, res) => {
  const { idCarrera, periodoInicial } = req.body; // Recibimos id de la carrera y el periodo inicial desde el front
  
  console.log('idCarrera:', idCarrera, 'periodoInicio:',  periodoInicial); // Depuración

  try {
    const [rows] = await pool.query(`
      SELECT e.id_estudiante, e.nombre, e.apellido, e.numero_documento, ec.estado_academico, ec.periodo_graduacion
      FROM estudiantes e
      JOIN estudiantes_carreras ec ON e.id_estudiante = ec.id_estudiante
      WHERE ec.id_carrera = ? AND ec.periodo_inicio = ?
    `, [idCarrera, periodoInicial]);

    console.log('Estudiantes obtenidos:', rows); // Depuración

    const estudiantes = rows;

    const graduados = estudiantes.filter(est => est.estado_academico === 'Graduado');
    const desertados = estudiantes.filter(est => est.estado_academico === 'Desertor');
    const retenidos = estudiantes.filter(est => est.estado_academico === 'Retenido');
    const activos = estudiantes.filter(est => est.estado_academico === 'Activo');
    const inactivos = estudiantes.filter(est => est.estado_academico === 'Inactivo');

    // Nueva consulta para contar el total de matriculados en el periodoInicial y carrera en la tabla 'historico_matriculas'
    const [[{ totalMatriculados }]] = await pool.query(`
      SELECT COUNT(*) AS totalMatriculados
      FROM historico_matriculas
      WHERE id_carrera = ? AND periodo_matricula = ?
    `, [idCarrera, periodoInicial]);

    console.log('Total matriculados en periodo inicial:', totalMatriculados); // Depuración

    res.json({
      todosEstudiantes: estudiantes,
      graduados,
      desertados,
      retenidos,
      activos,
      inactivos,
      totalMatriculados // Añadimos el total de matriculados en el periodo inicial a la respuesta
    });
  } catch (error) {
    console.error('Error al obtener los estudiantes:', error);
    res.status(500).json({ error: 'Error al obtener los estudiantes', details: error.message });
  }
};


export const obtenerEstudiantesPorMatricula = async (req, res) => {
  const { idCarrera, periodoInicial, periodoFinal } = req.body;

  try {
    // Realizar la consulta de cambios de estado
    const [rows] = await pool.query(`
      SELECT he.periodo_cambio, he.estado_anterior, he.estado_nuevo
      FROM historico_estado he
      JOIN estudiantes_carreras ec ON he.id_estudiante = ec.id_estudiante
      WHERE ec.id_carrera = ? 
      AND he.periodo_cambio BETWEEN ? AND ?
      ORDER BY he.periodo_cambio ASC
    `, [idCarrera, periodoInicial, periodoFinal]);

    // Crear un array para almacenar el resumen por periodo
    const resumenPorPeriodo = {};

    rows.forEach((cambio) => {
      // Inicializar el objeto del periodo si no existe
      if (!resumenPorPeriodo[cambio.periodo_cambio]) {
        resumenPorPeriodo[cambio.periodo_cambio] = {
          Graduados: 0,
          Retenidos: 0,
          Inactivos: 0,
          Desertores: 0
        };
      }

      // Incrementar el conteo basado en el estado final
      switch (cambio.estado_nuevo) {
        case 'Graduado':
          resumenPorPeriodo[cambio.periodo_cambio].Graduados += 1;
          break;
        case 'Retenido':
          resumenPorPeriodo[cambio.periodo_cambio].Retenidos += 1;
          break;
        case 'Inactivo':
          resumenPorPeriodo[cambio.periodo_cambio].Inactivos += 1;
          break;
        case 'Desertor':
          resumenPorPeriodo[cambio.periodo_cambio].Desertores += 1;
          break;
        default:
          break;
      }
    });

    res.json(resumenPorPeriodo);
    console.log(resumenPorPeriodo)
  } catch (error) {
    console.error('Error al obtener el resumen estadístico:', error);
    res.status(500).json({ error: 'Error al obtener el resumen estadístico', details: error.message });
  }
};

export const obtenerMatriculadosPorPeriodos = async (req, res) => {
  const { idSeleccionado, periodosFinales } = req.body;
  console.log(idSeleccionado)

  try {
    const resultados = [];

    for (const periodoData of periodosFinales) {
      const { periodo, desertores, segundoPeriodoAnterior } = periodoData;

      // Consulta utilizando `segundoPeriodoAnterior` para obtener el conteo de matriculados
      const [rows] = await pool.query(`
        SELECT COUNT(*) AS matriculados
        FROM historico_matriculas
        WHERE id_carrera = ? AND periodo_matricula = ?
      `, [idSeleccionado, segundoPeriodoAnterior]);

      const totalMatriculados = rows[0].matriculados;

      // Agregar el resultado incluyendo desertores y periodo actual
      resultados.push({
        periodo, // Este es el periodo actual del objeto
        segundoPeriodoAnterior, // El periodo anterior usado en la consulta
        matriculados: totalMatriculados,
        desertores
      });
    }

    // Enviar el array de resultados con todos los datos necesarios
    res.json(resultados);
  } catch (error) {
    console.error("Error al obtener los matriculados por periodos:", error);
    res.status(500).json({ error: "Error al obtener los matriculados por periodos" });
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

