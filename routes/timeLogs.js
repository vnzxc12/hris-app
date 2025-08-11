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

    const phDateTime = getPHDateTime(); // stored as 'yyyy-MM-dd HH:mm:ss' (PH local string)

    await db.query(
      "INSERT INTO time_logs (employee_id, time_in, date) VALUES (?, ?, ?)",
      [employee_id, phDateTime, today]
    );

    // Return both a human message and a canonical ISO (UTC) so frontend can parse consistently.
    const timeInDT = DateTime.fromFormat(phDateTime, 'yyyy-MM-dd HH:mm:ss', { zone: 'Asia/Manila' });
    res.status(200).json({
      message: 'Time in successful',
      // send UTC ISO (Z) — frontend treats backend ISO as UTC and converts to PH for display
      time_in: timeInDT.toUTC().toISO({ suppressMilliseconds: true })
    });
  } catch (error) {
    console.error('🔥 Time-In Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/* POST /time-out */
router.post('/time-out', async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = getPHDate();

    const [rows] = await db.query(
      'SELECT * FROM time_logs WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'No time-in record found for today.' });
    }

    console.log('📦 Raw time_in from DB:', rows[0].time_in);

    // parse DB time_in to a Manila DateTime (handles ISO/Z or SQL DATETIME)
    const timeIn = parseToDateTime(rows[0].time_in);
    if (!timeIn) {
      console.error('⛔ Could not parse time_in from DB:', rows[0].time_in);
      return res.status(500).json({ error: 'Failed to parse time-in from database.' });
    }

    const timeOut = DateTime.now().setZone('Asia/Manila');
    const diff = timeOut.diff(timeIn, 'hours').hours;

    if (isNaN(diff)) {
      console.error('⛔ diff is NaN. timeIn:', timeIn.toString(), 'timeOut:', timeOut.toString());
      return res.status(500).json({ error: 'Time calculation failed.' });
    }

    const diffHours = Number(diff).toFixed(2);

    // Save time_out in DB using PH format (keeps DB same schema as before)
    await db.query(
      "UPDATE time_logs SET time_out = ?, total_hours = ? WHERE employee_id = ? AND date = ?",
      [timeOut.toFormat('yyyy-MM-dd HH:mm:ss'), diffHours, employee_id, today]
    );

    // Return UTC ISO timestamps to the client (frontend will convert to PH for display)
    res.json({
      message: 'Time out recorded',
      time_in: timeIn.toUTC().toISO({ suppressMilliseconds: true }),
      time_out: timeOut.toUTC().toISO({ suppressMilliseconds: true }),
      total_hours: diffHours
    });
  } catch (err) {
    console.error('🔥 Time-Out Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* GET /status/:employee_id */
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
