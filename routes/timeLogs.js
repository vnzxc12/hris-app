// timelogs.js
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
 * Parse different DB time representations into a Luxon DateTime set to Asia/Manila.
 * Returns a DateTime or null.
 */
function parseToDateTime(value) {
  if (!value) return null;

  // If it's already a JS Date object
  if (value instanceof Date) {
    return DateTime.fromJSDate(value).setZone('Asia/Manila');
  }

  // If numeric (unix ms)
  if (typeof value === 'number') {
    return DateTime.fromMillis(value).setZone('Asia/Manila');
  }

  // Try ISO (respects any offset in the string)
  let dt = DateTime.fromISO(String(value));
  if (dt.isValid) return dt.setZone('Asia/Manila');

  // Try MySQL format without offset
  dt = DateTime.fromFormat(String(value), 'yyyy-MM-dd HH:mm:ss', { zone: 'Asia/Manila' });
  if (dt.isValid) return dt;

  // Fallback: try creating a JS Date (loose parsing)
  const jsd = new Date(String(value));
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

    const phDateTime = getPHDateTime(); // stored format yyyy-MM-dd HH:mm:ss

    await db.query(
      "INSERT INTO time_logs (employee_id, time_in, date) VALUES (?, ?, ?)",
      [employee_id, phDateTime, today]
    );

    // Respond with ISO including offset so frontend knows it's PH time
    const timeInDT = DateTime.fromFormat(phDateTime, 'yyyy-MM-dd HH:mm:ss', { zone: 'Asia/Manila' });
    res.status(200).json({
      message: 'Time in successful',
      time_in: timeInDT.toISO({ suppressMilliseconds: true, includeOffset: true })
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
    console.log('📦 Raw time_in from DB:', rows[0]?.time_in);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No time-in record found for today.' });
    }

    // Parse DB time_in robustly to a DateTime in PH
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

    const diffHours = diff.toFixed(2);

    // Save time_out in DB using the same format as before (no offset) to keep schema consistent
    await db.query(
      "UPDATE time_logs SET time_out = ?, total_hours = ? WHERE employee_id = ? AND date = ?",
      [timeOut.toFormat('yyyy-MM-dd HH:mm:ss'), diffHours, employee_id, today]
    );

    // Return ISO timestamps with +08:00 to the client
    res.json({
      message: 'Time out recorded',
      time_in: timeIn.toISO({ suppressMilliseconds: true, includeOffset: true }),
      time_out: timeOut.toISO({ suppressMilliseconds: true, includeOffset: true }),
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
      const ti = parseToDateTime(row.time_in);
      const to = parseToDateTime(row.time_out);

      return {
        ...row,
        // Send ISO strings WITH offset (+08:00) so the frontend correctly interprets them as PH time
        time_in: ti ? ti.toISO({ suppressMilliseconds: true, includeOffset: true }) : null,
        time_out: to ? to.toISO({ suppressMilliseconds: true, includeOffset: true }) : null
      };
    });

    res.status(200).json(formattedRows);
  } catch (error) {
    console.error('🔥 Fetch All Logs Error:', error);
    res.status(500).json({ error: 'Failed to fetch time logs' });
  }
});

module.exports = router;
