const express = require('express');
const router = express.Router();
const db = require('../db');

async function getPHDate() {
  const [[{ today }]] = await db.query("SELECT CONVERT_TZ(NOW(), '+00:00', '+08:00') AS today");
  return today.toISOString().split('T')[0]; // Extract YYYY-MM-DD
}

// POST /time-in
router.post('/time-in', async (req, res) => {
  try {
    const { employee_id } = req.body;
    console.log("🕒 Time-In request for employee ID:", employee_id);

    const today = await getPHDate();

    console.log("📆 Local Date:", today);

    const [existingRows] = await db.query(
      'SELECT * FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Already timed in today.' });
    }

    // ✅ Store PH time using CONVERT_TZ to UTC+8
    await db.query(
      "INSERT INTO time_logs (employee_id, time_in, date) VALUES (?, CONVERT_TZ(NOW(), '+00:00', '+08:00'), ?)",
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
    const today = await getPHDate();

    console.log("📆 Local Date:", today);

    const [rows] = await db.query(
      'SELECT * FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No time-in record found for today.' });
    }

    const timeIn = new Date(rows[0].time_in);
    const [[{ phNow }]] = await db.query("SELECT CONVERT_TZ(NOW(), '+00:00', '+08:00') AS phNow");
const timeOut = new Date(phNow);


    const diffMs = timeOut - timeIn;
    const diffHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    // ✅ Also use CONVERT_TZ for time_out
    await db.query(
      "UPDATE time_logs SET time_out = CONVERT_TZ(NOW(), '+00:00', '+08:00'), total_hours = ? WHERE employee_id = ? AND date = ?",
      [diffHours, employee_id, today]
    );

    res.json({ message: 'Time out recorded', total_hours: diffHours });
  } catch (err) {
    console.error('🔥 Time-Out Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /status/:employee_id
router.get('/status/:employee_id', async (req, res) => {
  try {
    const { employee_id } = req.params;
    const today = await getPHDate();

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
        tl.date,
        tl.total_hours
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
