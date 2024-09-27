import { pool } from '../db.js'

export const traerProgramas = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM programas');
        res.json(rows);
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
};

export const traerCortesIniciales = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT DISTINCT ano, periodo FROM estudiante_prog ORDER BY 1, 2');
        res.json(rows);
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
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


export const buscarEstudiantes = async (req, res) => {
    const { search } = req.query;
    console.log('Parámetro de búsqueda recibido:', search); // Aquí imprimes el parámetro search

    try {
      const sql = `SELECT * FROM estudiantes WHERE nombres LIKE ? OR apellidos LIKE ?`;
      const params = [`%${search}%`, `%${search}%`];
      const [rows] = await pool.query(sql, params);
      res.json(rows);
    } catch (error) {
      console.error('Error al buscar estudiantes:', error);
      res.status(500).json({ error: 'Error al obtener datos de estudiantes' });
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


export const obtenerDetalles = async (req, res) => {
  const { documento } = req.params;

  console.log('Documento del estudiante recibido:', documento);

  try {
    // Consulta ajustada para obtener el estado del estudiante
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
          WHEN g.gfechagrado IS NOT NULL AND g.gfechagrado < CURRENT_DATE THEN 'Graduado'
          WHEN ep.doc_est IS NOT NULL AND ep.ano <= YEAR(CURDATE()) THEN 'Retenido'
          ELSE 'Desertado'
        END AS estado_estudiante,
        CASE
          WHEN g.gfechagrado IS NOT NULL THEN g.gfechagrado
          ELSE NULL
        END AS fecha_grado
      FROM 
        estudiantes e
      LEFT JOIN 
        estudiante_prog ep ON e.documento = ep.doc_est
      LEFT JOIN 
        programas p ON ep.cod_prog = p.cod_snies
      LEFT JOIN 
        graduados g ON e.documento = g.gdocumento AND g.gfechagrado < CURRENT_DATE
      WHERE 
        e.documento = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [documento]);

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