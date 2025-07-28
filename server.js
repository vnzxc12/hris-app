require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection failed:', err);
    return;
  }
  console.log('Connected to MySQL DB');
});

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage for Cloudinary
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'documents',
    resource_type: 'auto',
  },
});

const documentUpload = multer({ storage: documentStorage });

/* ===============================
   USER LOGIN
================================= */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, result) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Login failed', detail: err.message });
      }
      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      res.json({ success: true, user: result[0] });
    }
  );
});

/* ===============================
   EMPLOYEES
================================= */
app.get('/employees', (req, res) => {
  db.query('SELECT * FROM employees', (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch employees' });
    res.json(result);
  });
});

app.get('/employees/:id', (req, res) => {
  db.query('SELECT * FROM employees WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch employee' });
    res.json(result[0]);
  });
});

app.put('/employees/:id', (req, res) => {
  const updated = req.body;
  db.query('UPDATE employees SET ? WHERE id = ?', [updated, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ success: true });
  });
});

/* ===============================
   PHOTO UPLOAD
================================= */
app.post('/employees/:id/photo', (req, res) => {
  const { photo_url } = req.body;
  if (!photo_url) return res.status(400).json({ error: 'No photo URL' });

  db.query('UPDATE employees SET photo_url = ? WHERE id = ?', [photo_url, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to save photo URL' });
    res.json({ success: true });
  });
});

app.delete('/employees/:id/photo', (req, res) => {
  db.query('UPDATE employees SET photo_url = NULL WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete photo' });
    res.json({ success: true });
  });
});

/* ===============================
   DOCUMENT UPLOAD (Cloudinary)
================================= */
app.post('/employees/:id/documents/upload', documentUpload.single('document'), (req, res) => {
  const employeeId = req.params.id;
  const category = req.body.category || 'Other';

  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: 'No document uploaded' });
  }

  const documentUrl = req.file.path;
  const documentName = req.file.originalname;

  db.query(
    'INSERT INTO documents (employee_id, document_name, document_url, category) VALUES (?, ?, ?, ?)',
    [employeeId, documentName, documentUrl, category],
    (err, result) => {
      if (err) {
        console.error('DB insert error:', err);
        return res.status(500).json({ error: 'Failed to save document' });
      }
      res.json({ success: true, document_url: documentUrl });
    }
  );
});

app.get('/employees/:id/documents', (req, res) => {
  db.query('SELECT * FROM documents WHERE employee_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch documents' });
    res.json(result);
  });
});

app.delete('/employees/:id/documents/:docId', (req, res) => {
  db.query('DELETE FROM documents WHERE id = ?', [req.params.docId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete document' });
    res.json({ success: true });
  });
});

/* ===============================
   START SERVER
================================= */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
