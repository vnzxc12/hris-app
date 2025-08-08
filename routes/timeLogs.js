const express = require('express');
const router = express.Router();
const db = require('../db');
const { DateTime } = require("luxon");

function getPHDate() {
  return DateTime.now().setZone('Asia/Manila').toFormat('yyyy-MM-dd');
}

function getPHDateTime() {
  return DateTime.now().setZone('Asia/Manila').toFormat('yyyy-MM-dd HH:mm:ss');
}

// POST /time-in
router.post('/time-in', async (req, res) => {
  try {
    const { employee_id } = req.body;
    console.log("🕒 Time-In request for employee ID:", employee_id);

    const today = getPHDate();
    console.log("📆 Local Date:", today);

    const [existingRows] = await db.query(
      'SELECT * FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Already timed in today.' });
    }

    const phDateTime = getPHDateTime();

    await db.query(
      "INSERT INTO time_logs (employee_id, time_in, date) VALUES (?, ?, ?)",
      [employee_id, phDateTime, today]
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

    const today = getPHDate();

    const [rows] = await db.query(
      'SELECT * FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No time-in record found for today.' });
    }

    const timeIn = DateTime.fromISO(rows[0].time_in).setZone('Asia/Manila');
    const timeOut = DateTime.now().setZone('Asia/Manila');
    const diffHours = timeOut.diff(timeIn, 'hours').hours.toFixed(2);

    await db.query(
      "UPDATE time_logs SET time_out = ?, total_hours = ? WHERE employee_id = ? AND date = ?",
      [timeOut.toFormat('yyyy-MM-dd HH:mm:ss'), diffHours, employee_id, today]
    );

    res.json({
      message: 'Time out recorded',
      time_in: timeIn.toFormat('yyyy-MM-dd HH:mm:ss'),
      time_out: timeOut.toFormat('yyyy-MM-dd HH:mm:ss'),
      total_hours: diffHours
    });
  } catch (err) {
    console.error('🔥 Time-Out Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /status/:employee_id
router.get('/status/:employee_id', async (req, res) => {
  try {
    const { employee_id } = req.params;
    const today = getPHDate();

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
