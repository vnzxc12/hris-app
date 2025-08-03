const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// ---------------- Cloudinary Setup ---------------- //
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hris_photos',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});
const photoUpload = multer({ storage: photoStorage });

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'hris_documents',
    resource_type: 'auto',
    public_id: Date.now() + '-' + file.originalname,
    format: path.extname(file.originalname).slice(1),
  }),
});
const documentUpload = multer({ storage: documentStorage });

// ---------------- MySQL DB Setup ---------------- //
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
    const [rows] = await db.query(
      'SELECT id, username, password, role, employee_id FROM users WHERE username = ?',
      [username]
    );
    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        employee_id: user.employee_id,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
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

// Get employee by ID
app.get('/employees/:id', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (results.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(results[0]);
  } catch {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Add employee + user
app.post('/employees', async (req, res) => {
  const { name, department, designation, photo_url } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO employees (name, department, designation, photo_url) VALUES (?, ?, ?, ?)',
      [name, department, designation, photo_url]
    );
    const newEmployeeId = result.insertId;

    await db.query(
      'INSERT INTO users (username, password, role, employee_id) VALUES (?, ?, ?, ?)',
      [String(newEmployeeId), String(newEmployeeId), 'Employee', newEmployeeId]
    );

    res.status(201).json({ success: true, employeeId: newEmployeeId });
  } catch (err) {
    console.error('Add employee/user failed:', err);
    res.status(500).json({ error: 'Failed to add employee and user' });
  }
});

// Full admin update
app.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  const {
    first_name, middle_name, last_name, gender, marital_status,
    contact_number, email_address, department, designation,
    manager, sss, tin, pagibig, philhealth,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE employees SET
        first_name = ?, middle_name = ?, last_name = ?, gender = ?,
        marital_status = ?, contact_number = ?, email_address = ?,
        department = ?, designation = ?, manager = ?,
        sss = ?, tin = ?, pagibig = ?, philhealth = ?
      WHERE id = ?`,
      [
        first_name, middle_name, last_name, gender,
        marital_status, contact_number, email_address,
        department, designation, manager,
        sss, tin, pagibig, philhealth,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// 🔐 Employee self-update only
app.put('/employees/:id/self-update', async (req, res) => {
  const { id } = req.params;
  const {
    marital_status,
    contact_number,
    email_address,
    sss,
    tin,
    pagibig,
    philhealth,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE employees SET
        marital_status = ?, contact_number = ?, email_address = ?,
        sss = ?, tin = ?, pagibig = ?, philhealth = ?
      WHERE id = ?`,
      [
        marital_status, contact_number, email_address,
        sss, tin, pagibig, philhealth,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ success: true, message: 'Employee profile updated successfully' });
  } catch (err) {
    console.error('Self-update failed:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete employee
app.delete("/employees/:id", async (req, res) => {
  const employeeId = req.params.id;

  try {
    const result = await db.query("DELETE FROM employees WHERE id = ?", [employeeId]);

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ message: "Failed to delete employee" });
  }
});

// Password change or reset
app.put('/api/users/:id/change-password', async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword, password } = req.body;

  try {
    const [user] = await db.query(
      'SELECT password FROM users WHERE id = ? OR employee_id = ?',
      [id, id]
    );

    if (!user.length) return res.status(404).json({ error: 'User not found' });

    if (currentPassword && newPassword) {
      if (user[0].password !== currentPassword) {
        return res.status(401).json({ error: 'Incorrect current password' });
      }
      await db.query('UPDATE users SET password = ? WHERE id = ? OR employee_id = ?', [newPassword, id, id]);
      return res.json({ success: true });
    }

    if (password) {
      await db.query('UPDATE users SET password = ? WHERE id = ? OR employee_id = ?', [password, id, id]);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Missing required fields' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Password update failed' });
  }
});

// Document routes
app.get('/employees/:id/documents', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM documents WHERE employee_id = ?', [req.params.id]);
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.post('/employees/:id/documents/upload', documentUpload.single('document'), async (req, res) => {
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
    res.status(500).json({ error: 'Document upload failed' });
  }
});

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

const { uploader } = require("cloudinary").v2;

app.delete('/documents/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query('SELECT file_url FROM documents WHERE id = ?', [id]);
    if (!results.length) return res.status(404).json({ error: 'Document not found' });

    const url = results[0].file_url;
    const match = url.match(/\/hris_documents\/([^/.]+)/);
    if (!match) {
      console.error('Failed to extract publicId from URL:', url);
      return res.status(400).json({ error: 'Invalid file URL format' });
    }

    const publicId = `hris_documents/${match[1]}`;

    try {
      await uploader.destroy(publicId, { resource_type: 'auto' });
    } catch (cloudErr) {
      console.warn("Cloudinary delete warning:", cloudErr.message);
    }

    await db.query('DELETE FROM documents WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (err) {
    console.error('Document delete failed:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// ---------------- Start Server ---------------- //
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
