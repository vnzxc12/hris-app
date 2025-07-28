const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hris_photos',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});
const upload = multer({ storage: storage });

// MySQL connection
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

// Delete employee by ID
app.delete('/employees/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM employees WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete employee' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ success: true });
  });
});

// Add new employee with optional photo
app.post('/employees', upload.single('photo'), (req, res) => {
  const {
    name, first_name, middle_name, last_name,
    gender, marital_status, designation, manager,
    sss, tin, pagibig, philhealth,
    contact_number, email_address, department, date_hired,
  } = req.body;

  const photo_url = req.file ? req.file.path : null;

  const sql = `INSERT INTO employees
    (name, first_name, middle_name, last_name, gender, marital_status, designation, manager, sss, tin, pagibig, philhealth, contact_number, email_address, department, date_hired, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    name, first_name, middle_name, last_name,
    gender, marital_status, designation, manager,
    sss, tin, pagibig, philhealth,
    contact_number, email_address, department, date_hired, photo_url,
  ];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to add employee' });
    res.json({ success: true, id: result.insertId });
  });
});

// Upload/update photo for an existing employee
app.post('/employees/:id/photo', upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const photo_url = req.file ? req.file.path : null;

  if (!photo_url) return res.status(400).json({ error: 'No photo uploaded' });

  const sql = `UPDATE employees SET photo_url = ? WHERE id = ?`;
  db.query(sql, [photo_url, id], (err, result) => {
    if (err) {
      console.error('Error saving photo:', err);
      return res.status(500).json({ error: 'Failed to update photo' });
    }
    res.json({ success: true, photo_url });
  });
});

// Delete photo for employee
app.delete('/employees/:id/photo', (req, res) => {
  const { id } = req.params;

  db.query('SELECT photo_url FROM employees WHERE id = ?', [id], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Employee not found' });

    const photo_url = results[0].photo_url;
    if (!photo_url) return res.status(400).json({ error: 'No photo to delete' });

    // Extract public ID from Cloudinary URL
    const parts = photo_url.split('/');
    const publicIdWithExtension = parts[parts.length - 1];
    const publicId = 'hris_photos/' + publicIdWithExtension.split('.')[0]; // e.g., hris_photos/123456789-name

    try {
      await cloudinary.uploader.destroy(publicId);

      db.query(
        'UPDATE employees SET photo_url = NULL WHERE id = ?',
        [id],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ error: 'Failed to update DB' });
          res.json({ success: true });
        }
      );
    } catch (cloudErr) {
      return res.status(500).json({ error: 'Failed to delete from Cloudinary' });
    }
  });
});

// Update employee by ID
app.put('/employees/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  const fields = Object.keys(updatedData);
  const values = fields.map(field => updatedData[field]);

  const sql = `UPDATE employees SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`;
  db.query(sql, [...values, id], (err, result) => {
    if (err) {
      console.error('Error updating employee:', err);
      return res.status(500).json({ error: 'Update failed' });
    }
    res.json({ success: true });
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
