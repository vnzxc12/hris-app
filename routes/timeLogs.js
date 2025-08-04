const express = require('express');
const router = express.Router();
const db = require('../db'); // Renamed to `db` for clarity (already promised)


// POST /time-in
router.post('/time-in', async (req, res) => {
  try {
    const { employee_id } = req.body;
    console.log("🕒 Time-In request for employee ID:", employee_id);

    const today = new Date().toISOString().split('T')[0];

    // Check if already timed in
    const [existingRows] = await db.query(
      'SELECT * FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Already timed in today.' });
    }

    await db.query(
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

    const [rows] = await db.query(
      'SELECT * FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No time-in record found for today.' });
    }

    await db.query(
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

    const [rows] = await db.query(
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

// GET /time-logs/all (Admin view: fetch all logs)
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        tl.id,
        tl.employee_id,
        e.first_name,
        e.last_name,
        tl.time_in,
        tl.time_out,
        tl.date
      FROM time_logs tl
      JOIN employees e ON tl.employee_id = e.id
      ORDER BY tl.date DESC, tl.time_in DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error('🔥 Fetch All Logs Error:', error);
    res.status(500).json({ error: 'Failed to fetch time logs' });
  }
});


module.exports = router;
