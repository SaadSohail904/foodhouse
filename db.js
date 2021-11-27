const mysql = require('mysql');
const dotenv = require('dotenv').config()
    //local mysql db connection
    // let connection = mysql.createConnection({

// });
var connection = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB,
    port: process.env.DB_PORT,
    debug: false
});
module.exports = connection;
// module.exports = connection;
