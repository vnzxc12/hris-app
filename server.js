const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer config for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err);
  } else {
    console.log('Connected to Railway MySQL DB');
  }
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      if (result.length === 0)
        return res.status(401).json({ error: 'Invalid credentials' });
      res.json({ success: true, user: result[0] });
    }
  );
});

// Get all employees
app.get('/employees', (req, res) => {
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Add new employee with optional photo
app.post('/employees', upload.single('photo'), (req, res) => {
  const {
    name, // <-- Added here
    first_name,
    middle_name,
    last_name,
    gender,
    marital_status,
    designation,
    manager,
    sss,
    tin,
    pagibig,
    philhealth,
    contact_number,
    email_address,
    department,
    date_hired,
  } = req.body;

  let photo_url = null;
  if (req.file) {
    photo_url = `/uploads/${req.file.filename}`;
  }

  const sql = `INSERT INTO employees
    (name, first_name, middle_name, last_name, gender, marital_status, designation, manager, sss, tin, pagibig, philhealth, contact_number, email_address, department, date_hired, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`; // <-- Updated to include 'name'

  const params = [
    name, // <-- Added to param list
    first_name,
    middle_name,
    last_name,
    gender,
    marital_status,
    designation,
    manager,
    sss,
    tin,
    pagibig,
    philhealth,
    contact_number,
    email_address,
    department,
    date_hired,
    photo_url,
  ];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to add employee' });
    res.json({ success: true, id: result.insertId });
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
