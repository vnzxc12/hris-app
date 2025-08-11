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
      const { category } = req.body;
      let employeeId = req.params.employeeId;
      const file = req.file;

      if (!file || !category) {
        return res.status(400).json({ error: 'Missing file or category' });
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

  // ❌ Delete a document
  router.delete('/:id', async (req, res) => {
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
