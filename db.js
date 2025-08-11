// db.js
const mysql = require('mysql2');
require('dotenv').config();

// Use a **pool** for better performance and concurrency
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+08:00', // ✅ Force MySQL to send times in PH timezone
});

// Export the promised version of the pool
const db = pool.promise();

console.log('✅ Connected to Railway MySQL DB');

module.exports = db;
