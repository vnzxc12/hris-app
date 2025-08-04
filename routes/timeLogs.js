const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /time-in
router.post('/time-in', async (req, res) => {
  try {
    const { employee_id } = req.body;
    console.log("🕒 Time-In request for employee ID:", employee_id);

    const today = new Date().toISOString().split('T')[0];

    // Check if already timed in
    const [existingRows] = await pool.promise().query(
      'SELECT * FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Already timed in today.' });
    }

    await pool.promise().query(
      'INSERT INTO time_logs (employee_id, time_in, date) VALUES (?, NOW(), ?)',
      [employee_id, today]
    );

    res.status(200).json({ message: 'Time in successful' });
  } catch (error) {
    console.error('🔥 Time-In Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /time-out
router.post('/time-out', async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const [rows] = await pool.promise().query(
      'SELECT * FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No time-in record found for today.' });
    }

    await pool.promise().query(
      'UPDATE time_logs SET time_out = NOW() WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    res.json({ message: 'Time out recorded' });
  } catch (err) {
    console.error('🔥 Time-Out Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /status/:employee_id
router.get('/status/:employee_id', async (req, res) => {
  try {
    const { employee_id } = req.params;
    const today = new Date().toISOString().split('T')[0];
    console.log("🔍 Checking time-in status for employee ID:", employee_id);

    const [rows] = await pool.promise().query(
      'SELECT time_in, time_out FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    const hasTimedIn = rows.length > 0 && rows[0].time_in != null && rows[0].time_out == null;
    res.json({ hasTimedIn });
  } catch (err) {
    console.error('🔥 Status Check Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
