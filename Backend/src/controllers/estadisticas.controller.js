import { pool } from '../db.js'

export const cargarEstudiantes = async (req, res) => {
  const estudiantesData = req.body; // Obtenemos los datos del CSV

  // Verificar que hay datos para procesar
  if (!estudiantesData || estudiantesData.length === 0) {
      console.error('No se recibieron datos para procesar.');
      return res.status(400).json({ success: false, message: 'No se recibieron datos para procesar.' });
  }

  try {
      for (const estudiante of estudiantesData) {
          const {
              nombre,
              apellido,
              tipo_documento,
              numero_documento,
              fecha_nacimiento,
              sexo,
              correo_electronico,
              celular,
              nombre_programa,
              codigo_programa,
              tipo_programa,
              codigo_matricula,
              fecha_matricula,
              periodo_inicio,
              periodo_desercion,
              fecha_graduacion,
              estado_academico,
              jornada,
              sede,
              estado_anterior,
              estado_nuevo,
              fecha_cambio,
              observacion,
          } = estudiante;

          // Validar los datos de la carrera
          if (!nombre_programa || !codigo_programa || !tipo_programa) {
              console.error(`Datos inválidos para carrera en estudiante ${numero_documento}: ${JSON.stringify(estudiante)}`);
              continue; // O puedes lanzar un error si prefieres
          }

          // 1. Insertar en la tabla 'carrera'
          const carreraId = await insertarCarrera(nombre_programa, codigo_programa, tipo_programa);

          // 2. Insertar en la tabla 'estudiante' o actualizar si ya existe
          const estudianteId = await insertarEstudiante(nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, sexo, correo_electronico, celular);

          // 3. Insertar en la tabla 'estudiante_carrera'
          await insertarEstudianteCarrera(estudianteId, carreraId, codigo_matricula, fecha_matricula, periodo_inicio, periodo_desercion, fecha_graduacion, estado_academico, jornada, sede);

          // 4. Solo insertar en la tabla 'historico_estado' si hay cambios
          if (estado_anterior !== estado_nuevo) {
            // Actualizar el histórico de estado
            await insertarHistoricoEstado(estudianteId, carreraId, estado_anterior, estado_nuevo, fecha_cambio, observacion);
            
            // Cambiar el estado_academico en estudiante_carrera
            await actualizarEstadoAcademico(estudianteId, carreraId, estado_nuevo);
          }
      }

      return res.status(200).json({ success: true, message: 'Todos los datos han sido procesados correctamente.' });
  } catch (error) {
      console.error('Error en el procesamiento de datos:', error);
      return res.status(500).json({ success: false, message: 'Error en el procesamiento de datos.' });
  }
};

export const insertarCarrera = async (nombre_programa, codigo_programa, tipo_programa) => {
  try {
      // Verificar si el codigo_programa ya existe
      const [existing] = await pool.query('SELECT * FROM carrera WHERE codigo_programa = ?', [codigo_programa]);

      if (existing.length > 0) {
          // Actualizar si ya existe
          console.log(`Actualizando la carrera con el código ${codigo_programa}.`);
          await pool.query(
              'UPDATE carrera SET nombre_programa = ?, tipo_programa = ? WHERE codigo_programa = ?',
              [nombre_programa, tipo_programa, codigo_programa]
          );
          return existing[0].id_carrera; // Retorna el ID de la carrera existente
      }

      // Si no existe, insertar nueva carrera
      const [result] = await pool.query(
          'INSERT INTO carrera (nombre_programa, codigo_programa, tipo_programa) VALUES (?, ?, ?)',
          [nombre_programa, codigo_programa, tipo_programa]
      );

      return result.insertId; // Retorna el nuevo ID de la carrera insertada
  } catch (error) {
      console.error('Error al insertar/actualizar carrera:', error);
      throw error; // Propagar el error para ser manejado más arriba
  }
};



export const insertarEstudiante = async (nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, sexo, correo_electronico, celular) => {
  try {
      // Verificar si el estudiante ya existe
      const [existing] = await pool.query('SELECT * FROM estudiante WHERE numero_documento = ?', [numero_documento]);

      if (existing.length > 0) {
          // Actualizar si ya existe
          console.log(`Actualizando el estudiante con el número de documento ${numero_documento}.`);
          await pool.query(
              'UPDATE estudiante SET nombre = ?, apellido = ?, tipo_documento = ?, fecha_nacimiento = ?, sexo = ?, correo_electronico = ?, celular = ? WHERE numero_documento = ?',
              [nombre, apellido, tipo_documento, fecha_nacimiento, sexo, correo_electronico, celular, numero_documento]
          );
          return existing[0].id_estudiante; // Retornar el ID del estudiante existente
      }

      // Si no existe, insertar nuevo estudiante
      const [result] = await pool.query(
          'INSERT INTO estudiante (nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, sexo, correo_electronico, celular) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [nombre, apellido, tipo_documento, numero_documento, fecha_nacimiento, sexo, correo_electronico, celular]
      );

      return result.insertId; // Retornar el nuevo ID del estudiante insertado
  } catch (error) {
      console.error('Error al insertar/actualizar estudiante:', error);
      throw error; // Propagar el error para ser manejado más arriba
  }
};



export const insertarEstudianteCarrera = async (id_estudiante, id_carrera, codigo_matricula, fecha_matricula, periodo_inicio, periodo_desercion, fecha_graduacion, estado_academico, jornada, sede) => {
  try {
      // Verificar si la relación ya existe
      const [existing] = await pool.query('SELECT * FROM estudiante_carrera WHERE id_estudiante = ? AND id_carrera = ?', [id_estudiante, id_carrera]);

      if (existing.length > 0) {
          // Actualizar si ya existe y el estudiante sigue en la misma carrera
          console.log(`Actualizando la relación entre estudiante ${id_estudiante} y carrera ${id_carrera}.`);
          await pool.query(
              'UPDATE estudiante_carrera SET codigo_matricula = ?, fecha_matricula = ?, periodo_inicio = ?, periodo_desercion = ?, fecha_graduacion = ?, estado_academico = ?, jornada = ?, sede = ? WHERE id_estudiante = ? AND id_carrera = ?',
              [codigo_matricula, fecha_matricula, periodo_inicio, periodo_desercion, fecha_graduacion, estado_academico, jornada, sede, id_estudiante, id_carrera]
          );
      } else {
          // Insertar nueva relación
          const [result] = await pool.query(
              'INSERT INTO estudiante_carrera (id_estudiante, id_carrera, codigo_matricula, fecha_matricula, periodo_inicio, periodo_desercion, fecha_graduacion, estado_academico, jornada, sede) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [id_estudiante, id_carrera, codigo_matricula, fecha_matricula, periodo_inicio, periodo_desercion, fecha_graduacion, estado_academico, jornada, sede]
          );
          return result.insertId; // Retorna el ID de la relación insertada
      }
  } catch (error) {
      console.error('Error al insertar/actualizar estudiante en carrera:', error);
      throw error; // Propagar el error para ser manejado más arriba
  }
};

const insertarHistoricoEstado = async (id_estudiante, id_carrera, estado_anterior, estado_nuevo, fecha_cambio, observacion) => {
  try {
      // Verificar si el registro ya existe (puedes agregar lógica para determinar cuándo se considera un duplicado)
      const [existing] = await pool.query('SELECT * FROM historico_estado WHERE id_estudiante = ? AND id_carrera = ? AND fecha_cambio = ?', [id_estudiante, id_carrera, fecha_cambio]);

      if (existing.length > 0) {
          // Actualizar si ya existe
          console.log(`Actualizando el histórico de estado para el estudiante ${id_estudiante} en la carrera ${id_carrera}.`);
          await pool.query(
              'UPDATE historico_estado SET estado_anterior = ?, estado_nuevo = ?, observacion = ? WHERE id_estudiante = ? AND id_carrera = ? AND fecha_cambio = ?',
              [estado_anterior, estado_nuevo, observacion, id_estudiante, id_carrera, fecha_cambio]
          );
          return existing[0].id_historico_estado; // Retornar el ID del registro existente
      }

      // Si no existe, insertar nuevo registro
      const query = 'INSERT INTO historico_estado (id_estudiante, id_carrera, estado_anterior, estado_nuevo, fecha_cambio, observacion) VALUES (?, ?, ?, ?, ?, ?)';
      const [result] = await pool.query(query, [id_estudiante, id_carrera, estado_anterior, estado_nuevo, fecha_cambio, observacion]);
      return result.insertId; // Retorna el nuevo ID del registro insertado
  } catch (error) {
      console.error('Error al insertar/actualizar histórico de estado:', error);
      throw error; // Propagar el error para ser manejado más arriba
  }
};
;
const actualizarEstadoAcademico = async (id_estudiante, id_carrera, nuevo_estado_academico) => {
  try {
      // Actualizar el estado_academico en la tabla estudiante_carrera
      await pool.query(
          'UPDATE estudiante_carrera SET estado_academico = ? WHERE id_estudiante = ? AND id_carrera = ?',
          [nuevo_estado_academico, id_estudiante, id_carrera]
      );
  } catch (error) {
      console.error('Error al actualizar el estado académico del estudiante en carrera:', error);
      throw error; // Propagar el error para ser manejado más arriba
  }
};


export const traerProgramas = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM carrera');
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
          FROM estudiante_carrera
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
    const sql = `SELECT * FROM estudiante WHERE nombre LIKE ? OR apellido LIKE ?`;

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
        estudiante e
      LEFT JOIN 
        estudiante_carrera ec ON e.id_estudiante = ec.id_estudiante  -- Unión con estudiante_carrera
      LEFT JOIN 
        carrera c ON ec.id_carrera = c.id_carrera  -- Unión con carrera
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
        fecha_matricula: row.fecha_matricula,
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

