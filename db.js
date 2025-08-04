const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}).promise();

db.connect()
  .then(() => console.log('Connected to Railway MySQL DB'))
  .catch((err) => console.error('MySQL connection failed:', err));

module.exports = db;
