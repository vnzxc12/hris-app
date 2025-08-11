const express = require('express');
const db = require('../db');
const { uploader } = require('cloudinary').v2;

module.exports = (documentUpload) => {
  const router = express.Router();

  // 🔥 Get all documents of a specific employee
  router.get('/employee/:employeeId', async (req, res) => {
    try {
      const [results] = await db.query(
        'SELECT * FROM documents WHERE employee_id = ?',
        [req.params.employeeId]
      );
      res.json(results);
    } catch {
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  // 🌍 Get all global documents (employee_id is NULL)
  router.get('/global', async (req, res) => {
    try {
      const [results] = await db.query(
        'SELECT * FROM documents WHERE employee_id IS NULL'
      );
      res.json(results);
    } catch {
      res.status(500).json({ error: 'Failed to fetch global documents' });
    }
  });

  // 📤 Upload a document (works for both personal & global)
  router.post('/employee/:employeeId/upload', documentUpload.single('document'), async (req, res) => {
    try {
      const { category, role } = req.body; // role will come from frontend
      let employeeId = req.params.employeeId;
      const file = req.file;

      if (!file || !category) {
        return res.status(400).json({ error: 'Missing file or category' });
      }

      // If uploading global doc and user is not admin
      if (employeeId === 'global' && role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can upload global documents' });
      }

      // If "global" is passed, store NULL in the database
      if (employeeId === 'global') {
        employeeId = null;
      }

      const document_url = file.path;
      const document_name = file.originalname;
      const file_type = document_name.split('.').pop();

      const [result] = await db.query(
        'INSERT INTO documents (employee_id, file_name, file_type, file_url, category) VALUES (?, ?, ?, ?, ?)',
        [employeeId, document_name, file_type, document_url, category]
      );

      res.status(201).json({ success: true, documentId: result.insertId });
    } catch {
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // 🌍 Alias route for uploading global documents
  router.post('/global', documentUpload.single('document'), async (req, res) => {
    try {
      const { category, role } = req.body;

      if (!category) {
        return res.status(400).json({ error: 'Missing category' });
      }

      if (role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can upload global documents' });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'Missing file' });
      }

      const document_url = file.path;
      const document_name = file.originalname;
      const file_type = document_name.split('.').pop();

      const [result] = await db.query(
        'INSERT INTO documents (employee_id, file_name, file_type, file_url, category) VALUES (NULL, ?, ?, ?, ?)',
        [document_name, file_type, document_url, category]
      );

      res.status(201).json({ success: true, documentId: result.insertId });
    } catch {
      res.status(500).json({ error: 'Global upload failed' });
    }
  });

  // ❌ Delete a document
  router.delete('/:id', async (req, res) => {
    try {
      const { role } = req.query; // role from frontend query params
      const [results] = await db.query('SELECT file_url, employee_id FROM documents WHERE id = ?', [req.params.id]);

      if (!results.length) return res.status(404).json({ error: 'Document not found' });

      const doc = results[0];

      // Prevent employees from deleting global documents
      if (doc.employee_id === null && role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can delete global documents' });
      }

      const url = doc.file_url;
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
