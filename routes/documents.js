const express = require('express');
const db = require('../db');
const { uploader } = require('cloudinary').v2;

module.exports = (documentUpload) => {
  const router = express.Router();

  // GET /api/employees/:employeeId/documents
  router.get('/:employeeId/documents', async (req, res) => {
    const employeeId = req.params.employeeId;
    try {
      const [results] = await db.query(
        'SELECT * FROM documents WHERE employee_id = ?',
        [employeeId]
      );
      res.json(results);
    } catch (err) {
      console.error('Error fetching documents:', err);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  // POST /api/employees/:employeeId/documents/upload
  router.post(
    '/:employeeId/documents/upload',
    documentUpload.single('document'),
    async (req, res) => {
      const employeeId = req.params.employeeId;
      const { category } = req.body;
      const file = req.file;

      if (!file || !category) {
        return res.status(400).json({ error: 'Missing file or category' });
      }

      const document_url = file.path;
      const document_name = file.originalname;
      const file_type = document_name.split('.').pop();

      try {
        const [result] = await db.query(
          'INSERT INTO documents (employee_id, file_name, file_type, file_url, category) VALUES (?, ?, ?, ?, ?)',
          [employeeId, document_name, file_type, document_url, category]
        );

        res.status(201).json({
          success: true,
          documentId: result.insertId,
          file_url: document_url,
        });
      } catch (err) {
        console.error('Error uploading document:', err);
        res.status(500).json({ error: 'Upload failed' });
      }
    }
  );

  // DELETE /api/employees/documents/:id
  router.delete('/documents/:id', async (req, res) => {
    const documentId = req.params.id;

    try {
      // Get file_url from DB to delete from Cloudinary
      const [results] = await db.query(
        'SELECT file_url FROM documents WHERE id = ?',
        [documentId]
      );

      if (!results.length) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const url = results[0].file_url;
      const match = url.match(/\/hris_documents\/([^/.]+)/);
      const publicId = match ? `hris_documents/${match[1]}` : null;

      if (publicId) {
        try {
          await uploader.destroy(publicId, { resource_type: 'auto' });
        } catch (cloudErr) {
          console.warn('Cloudinary delete failed (proceeding anyway):', cloudErr.message);
        }
      }

      await db.query('DELETE FROM documents WHERE id = ?', [documentId]);
      res.json({ success: true });
    } catch (err) {
      console.error('Error deleting document:', err);
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  return router;
};
