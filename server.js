const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
require('dotenv').config();
const path = require('path');

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

// Multer for employee photo upload
const photoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hris_photos',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});
const photoUpload = multer({ storage: photoStorage });

// Multer for document upload
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hris_documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'png', 'jpg'],
    resource_type: 'auto',
  },
});
const documentUpload = multer({ storage: documentStorage });

// MySQL connection
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

// ---------------- Routes ---------------- //

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [result] = await db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    if (result.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true, user: result[0] });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all employees
app.get('/employees', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM employees');
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get single employee
app.get('/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM employees WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(results[0]);
  } catch {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// ✅ FIXED: Add new employee
app.post('/employees', async (req, res) => {
  const { name, department, designation, photo_url } = req.body;

  const sql = `
    INSERT INTO employees (name, department, designation, photo_url)
    VALUES (?, ?, ?, ?)
  `;

  try {
    const [result] = await db.query(sql, [name, department, designation, photo_url]);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Add employee failed:", err);
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

// Update employee
app.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (!updatedData || Object.keys(updatedData).length === 0) {
    return res.status(400).json({ error: 'No data to update' });
  }

  const fields = Object.keys(updatedData);
  const values = fields.map(field => updatedData[field]);

  const sql = `UPDATE employees SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`;

  try {
    await db.query(sql, [...values, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Delete employee
app.delete('/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM employees WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Upload photo URL
app.post('/employees/:id/photo', async (req, res) => {
  const { id } = req.params;
  const { photo_url } = req.body;

  if (!photo_url) {
    return res.status(400).json({ error: 'Missing photo_url' });
  }

  try {
    await db.query('UPDATE employees SET photo_url = ? WHERE id = ?', [photo_url, id]);
    res.json({ message: 'Photo URL saved' });
  } catch (err) {
    console.error('Failed to save photo URL:', err);
    res.status(500).json({ message: 'Failed to save photo URL' });
  }
});

// Delete photo
app.delete('/employees/:id/photo', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT photo_url FROM employees WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ error: 'Not found' });

    const url = results[0].photo_url;
    const publicId = 'hris_photos/' + url.split('/').pop().split('.')[0];

    await cloudinary.uploader.destroy(publicId);
    await db.query('UPDATE employees SET photo_url = NULL WHERE id = ?', [id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// ---------------- DOCUMENT ROUTES ---------------- //

// Get all documents for employee
app.get('/employees/:id/documents', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM documents WHERE employee_id = ?', [id]);
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// ✅ Original route for multipart uploads (keep for fallback)
app.post('/employees/:id/documents/upload', documentUpload.single('document'), async (req, res) => {
console.log('📄 Uploaded File:', JSON.stringify(req.file, null, 2));
console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));

  try {
    const { category } = req.body;
    const employeeId = req.params.id;
    const file = req.file;

    if (!file || !category) {
      return res.status(400).json({ error: 'Missing file or category' });
    }

    const document_url = file.path;
    const document_name = file.originalname;
    const file_type = path.extname(file.originalname).substring(1);

    const [result] = await db.query(
      'INSERT INTO documents (employee_id, file_name, file_type, file_url, category) VALUES (?, ?, ?, ?, ?)',
      [employeeId, document_name, file_type, document_url, category]
    );

    res.status(201).json({ success: true, documentId: result.insertId });
  } catch (err) {
    console.error('Document upload failed:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ ✅ ADDED: Support Cloudinary metadata-only upload from frontend
app.post('/employees/:id/documents/upload-metadata', async (req, res) => {
  try {
    const { document_url, document_name, category } = req.body;
    const employeeId = req.params.id;

    if (!document_url || !document_name || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const file_type = path.extname(document_name).substring(1);

    const [result] = await db.query(
      'INSERT INTO documents (employee_id, file_name, file_type, file_url, category) VALUES (?, ?, ?, ?, ?)',
      [employeeId, document_name, file_type, document_url, category]
    );

    res.status(201).json({ success: true, documentId: result.insertId });
  } catch (err) {
    console.error('Metadata upload failed:', err);
    res.status(500).json({ error: 'Failed to save document metadata' });
  }
});

// Delete document
app.delete('/documents/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query('SELECT file_url FROM documents WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ error: 'Not found' });

    const url = results[0].file_url;
    const publicId = 'hris_documents/' + url.split('/').pop().split('.')[0];

    await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
    await db.query('DELETE FROM documents WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Document delete failed:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
