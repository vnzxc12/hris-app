const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const { uploader } = require('cloudinary').v2;
const authenticateToken = require('./verifyToken');


module.exports = (documentUpload) => {
  const router = express.Router();

  // Get all employees
  router.get('/', async (req, res) => {
    try {
      const [results] = await db.query('SELECT * FROM employees');
      res.json(results);
    } catch {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Get employee by ID
  router.get('/:id', async (req, res) => {
    try {
      const [results] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
      if (results.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(results[0]);
    } catch {
      res.status(500).json({ error: 'Failed to fetch employee' });
    }
  });

  // Add employee + user
  router.post('/', async (req, res) => {
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
      res.status(500).json({ error: 'Failed to add employee and user' });
    }
  });

  // Full update
  router.put('/:id', async (req, res) => {
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
    } catch {
      res.status(500).json({ error: 'Update failed' });
    }
  });

  // Self-update (token protected)
router.put('/:id/self-update', authenticateToken, async (req, res) => {
  const paramId = Number(req.params.id);
  const tokenId = Number(req.user.employee_id);

  console.log(`🔐 Self-update attempt: token employee_id=${tokenId}, route param id=${paramId}`);

  if (paramId !== tokenId) {
    return res.status(403).json({
      error: `Unauthorized: You are employee ${tokenId} trying to update ${paramId}`,
    });
  }

  const {
    marital_status,
    contact_number,
    email_address,
    address,
    sss,
    tin,
    pagibig,
    philhealth,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE employees SET
        marital_status = ?, contact_number = ?, email_address = ?, address = ?,
        sss = ?, tin = ?, pagibig = ?, philhealth = ?
      WHERE id = ?`,
      [
        marital_status, contact_number, email_address, address,
        sss, tin, pagibig, philhealth,
        paramId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ success: true, message: 'Employee profile updated successfully' });
  } catch (err) {
    console.error('❌ Self-update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


  // Delete
  router.delete('/:id', async (req, res) => {
    try {
      const [result] = await db.query("DELETE FROM employees WHERE id = ?", [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ message: "Employee not found" });
      res.json({ message: "Employee deleted successfully" });
    } catch {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Document routes
  router.get('/:id/documents', async (req, res) => {
    try {
      const [results] = await db.query('SELECT * FROM documents WHERE employee_id = ?', [req.params.id]);
      res.json(results);
    } catch {
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  router.post('/:id/documents/upload', documentUpload.single('document'), async (req, res) => {
    try {
      const { category } = req.body;
      const employeeId = req.params.id;
      const file = req.file;

      if (!file || !category) return res.status(400).json({ error: 'Missing file or category' });

      const document_url = file.path;
      const document_name = file.originalname;
      const file_type = document_name.split('.').pop();

      const [result] = await db.query(
        'INSERT INTO documents (employee_id, file_name, file_type, file_url, category) VALUES (?, ?, ?, ?, ?)',
        [employeeId, document_name, file_type, document_url, category]
      );

      res.status(201).json({ success: true, documentId: result.insertId });
    } catch {
      res.status(500).json({ error: 'Document upload failed' });
    }
  });

  router.delete('/documents/:id', async (req, res) => {
    try {
      const [results] = await db.query('SELECT file_url FROM documents WHERE id = ?', [req.params.id]);
      if (!results.length) return res.status(404).json({ error: 'Document not found' });

      const url = results[0].file_url;
      const match = url.match(/\/hris_documents\/([^/.]+)/);
      const publicId = match ? `hris_documents/${match[1]}` : null;

      if (publicId) {
        try {
          await uploader.destroy(publicId, { resource_type: 'auto' });
        } catch {}
      }

      await db.query('DELETE FROM documents WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  return router;
};
