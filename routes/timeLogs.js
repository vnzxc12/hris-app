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

/**
 * Parse different DB/time representations and return a Luxon DateTime **in Asia/Manila**.
 * - Handles JS Date objects, numeric milliseconds, ISO strings (with Z/offset), and SQL DATETIME.
 */
function parseToDateTime(value) {
  if (!value) return null;

  // JS Date object (returned by some MySQL drivers)
  if (value instanceof Date) {
    return DateTime.fromJSDate(value).setZone('Asia/Manila');
  }

  // Numeric (unix ms)
  if (typeof value === 'number') {
    return DateTime.fromMillis(value).setZone('Asia/Manila');
  }

  const s = String(value).trim();

  // ISO with offset / Z (best case)
  let dt = DateTime.fromISO(s, { setZone: true });
  if (dt.isValid) return dt.setZone('Asia/Manila');

  // MySQL DATETIME like '2025-08-12 04:48:13' -> treat as UTC (your DB/store appears to be UTC)
  dt = DateTime.fromFormat(s, 'yyyy-MM-dd HH:mm:ss', { zone: 'utc' });
  if (dt.isValid) return dt.setZone('Asia/Manila');

  // Last resort: loose JS Date parse
  const jsd = new Date(s);
  if (!isNaN(jsd.getTime())) return DateTime.fromJSDate(jsd).setZone('Asia/Manila');

  return null;
}

/* POST /time-in */
router.post('/time-in', async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = getPHDate();
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


/* POST /time-out */
router.post('/time-out', async (req, res) => {
  try {
    const { employee_id } = req.body;

    const [rows] = await db.query(
      `SELECT * FROM time_logs 
       WHERE employee_id = ? AND time_out IS NULL 
       ORDER BY time_in DESC LIMIT 1`,
      [employee_id]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No active time-in session.' });
    }

    const timeIn = parseToDateTime(rows[0].time_in);
    const timeOut = DateTime.now().setZone('Asia/Manila');
    const diffHours = timeOut.diff(timeIn, 'hours').hours.toFixed(2);

    await db.query(
      "UPDATE time_logs SET time_out = ?, total_hours = ? WHERE id = ?",
      [timeOut.toFormat('yyyy-MM-dd HH:mm:ss'), diffHours, rows[0].id]
    );

    res.json({ message: 'Time out recorded', total_hours: diffHours });
  } catch (err) {
    console.error('🔥 Time-Out Error:', err);
    res.status(500).json({ error: err.message });
  }
});


/* GET /status/:employee_id */
router.get('/status/:employee_id', async (req, res) => {
  try {
    const { employee_id } = req.params;

    const [rows] = await db.query(
      `SELECT id FROM time_logs 
       WHERE employee_id = ? AND date = ? AND time_out IS NULL 
       LIMIT 1`,
      [employee_id, getPHDate()]
    );

    const activeSession = rows.length > 0;
    res.json({ activeSession });
  } catch (err) {
    console.error('🔥 Status Check Error:', err);
    res.status(500).json({ error: err.message });
  }
});


/* GET /time-logs/all (Admin view: fetch all logs) */
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

    const formattedRows = rows.map(row => {
      // Parse DB values into Manila DateTimes then send canonical UTC ISO strings
      const ti = parseToDateTime(row.time_in);
      const to = parseToDateTime(row.time_out);

      return {
        ...row,
        time_in: ti ? ti.toUTC().toISO({ suppressMilliseconds: true }) : null,
        time_out: to ? to.toUTC().toISO({ suppressMilliseconds: true }) : null
      };
    });

    res.status(200).json(formattedRows);
  } catch (error) {
    console.error('🔥 Fetch All Logs Error:', error);
    res.status(500).json({ error: 'Failed to fetch time logs' });
  }
});

module.exports = router;
