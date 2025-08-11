const express = require('express');
const db = require('../db');
const { uploader } = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

const router = express.Router();
const upload = multer();

// ===================
// Get documents for specific employee
// ===================
router.get('/:employeeId/documents', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT * FROM documents WHERE employee_id = ? ORDER BY uploaded_at DESC',
      [req.params.employeeId]
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch employee documents' });
  }
});

// ===================
// Upload employee document
// ===================
router.post('/:employeeId/documents', upload.single('file'), async (req, res) => {
  try {
    const { employeeId } = req.params;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = uploader.upload_stream({ folder: 'employee_documents' }, (error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(file.buffer);

    await db.query(
      'INSERT INTO documents (employee_id, file_name, file_url) VALUES (?, ?, ?)',
      [employeeId, file.originalname, result.secure_url]
    );

    res.json({ message: 'File uploaded successfully', fileUrl: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload employee document' });
  }
});

// ===================
// Get global documents (no employee_id)
// ===================
router.get('/global/list', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT * FROM documents WHERE employee_id IS NULL ORDER BY uploaded_at DESC'
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch global documents' });
  }
});

// ===================
// Upload global document
// ===================
router.post('/global', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = uploader.upload_stream({ folder: 'global_documents' }, (error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(file.buffer);

    await db.query(
      'INSERT INTO documents (employee_id, file_name, file_url) VALUES (NULL, ?, ?)',
      [file.originalname, result.secure_url]
    );

    res.json({ message: 'Global file uploaded successfully', fileUrl: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload global document' });
  }
});

module.exports = router;
