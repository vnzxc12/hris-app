const express = require('express');
const router = express.Router();
const pool = require('../db'); // or however you import your DB

// Time In route
router.post('/time-in', async (req, res) => {
  const { employee_id } = req.body;
  const today = new Date().toISOString().split('T')[0];
  try {
    const [existing] = await pool.promise().query(
      'SELECT * FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already timed in today' });
    }

    await pool.promise().query(
      'INSERT INTO time_logs (employee_id, time_in, date) VALUES (?, NOW(), ?)',
      [employee_id, today]
    );
    res.status(201).json({ message: 'Time in recorded' });
  } catch (err) {
    console.error('Time In error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Time Out route
router.post('/time-out', async (req, res) => {
  const { employee_id } = req.body;
  const today = new Date().toISOString().split('T')[0];
  try {
    await pool.promise().query(
      'UPDATE time_logs SET time_out = NOW() WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );
    res.json({ message: 'Time out recorded' });
  } catch (err) {
    console.error('Time Out error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Status check route
router.get('/status/:employee_id', async (req, res) => {
  const { employee_id } = req.params;
  const today = new Date().toISOString().split('T')[0];
  try {
    const [rows] = await pool.promise().query(
      'SELECT time_in, time_out FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    const hasTimedIn = rows.length > 0 && rows[0].time_in != null && rows[0].time_out == null;
    res.json({ hasTimedIn });
  } catch (err) {
    console.error('Status check error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
