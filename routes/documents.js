const express = require('express');
const db = require('../db');
const { uploader } = require('cloudinary').v2;

module.exports = (documentUpload) => {
  const router = express.Router();

  // ✅ Existing: Get documents (short path)
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

  // ✅ ✅ New: Add this route to match frontend call: /employees/:employeeId/documents
  router.get('/employees/:employeeId/documents', async (req, res) => {
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

  // 📤 Upload a document (unchanged)
  router.post('/employees/:employeeId/documents/upload', documentUpload.single('document'), async (req, res) => {
    try {
      const { category } = req.body;
      const employeeId = req.params.employeeId;
      const file = req.file;

      if (!file || !category) {
        return res.status(400).json({ error: 'Missing file or category' });
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

  // ❌ Delete a document (unchanged)
 router.delete(['/documents/:id', '/employees/documents/:id'], async (req, res) => {

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
