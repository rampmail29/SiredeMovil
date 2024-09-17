import { createPool } from 'mysql2/promise'

const pool = createPool({
    host: 'localhost', // Cambia esto por la dirección de tu servidor MySQL
    user: 'root',      // Cambia esto por tu nombre de usuario de MySQL
    password: '',      // Cambia esto por tu contraseña de MySQL
    database: 'uts', // Cambia esto por el nombre de tu base de datos
})

export { pool }
