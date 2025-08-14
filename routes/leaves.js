const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("./verifyToken");

// GET all leaves (admin) or user leaves
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.employee_id; // employee_id from user object
    let query, params;

    if (req.user.role === "admin") {
      query = `SELECT l.*, e.first_name, e.last_name FROM leaves l
               JOIN employees e ON l.employee_id = e.id
               ORDER BY date_requested DESC`;
      params = [];
    } else {
      query = `SELECT * FROM leaves WHERE employee_id = ? ORDER BY date_requested DESC`;
      params = [userId];
    }

    const [rows] = await db.promise().query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

// POST create leave
router.post("/", authenticateToken, async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const { leave_type, start_date, end_date, reason } = req.body;

    const [result] = await db
      .promise()
      .query(
        `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)`,
        [employeeId, leave_type, start_date, end_date, reason]
      );

    res.status(201).json({ leave_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create leave request" });
  }
});

// PUT approve/reject leave (admin only)
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const leaveId = req.params.id;
    const { status } = req.body;

    await db
      .promise()
      .query(`UPDATE leaves SET status = ?, approved_by = ? WHERE leave_id = ?`, [
        status,
        req.user.employee_id,
        leaveId,
      ]);

    res.json({ message: "Leave status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update leave status" });
  }
});

module.exports = router;
