const mysql = require('mysql2');



// Configuración del pool de conexiones
const pool = mysql.createPool({
    host: '147.93.113.198',
    user: 'root',
    password: 'PuS4ENP0tvqLuWQGkG3CQ06rpzi5Q63VX3PJimxnCz62lE7M4wRsXPf92uLnil1N',
    database: 'fotografias',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,  // Puedes ajustar este valor según lo necesites
    queueLimit: 0,
    connectTimeout: 10000  // Intentar con más tiempo
}).promise();





module.exports = pool;