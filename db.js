const { Pool } = require('pg')

const pool = new Pool ({
    user:process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD, 
    host: process.env.DB_HOST,
    database:process.env.DB_DATABASENAME,
    port:5432,
    //ssl: true

});

module.exports = pool; //client;
