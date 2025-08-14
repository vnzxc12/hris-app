const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("./verifyToken");

// GET all leaves (admin) or user leaves
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("REQ USER PAYLOAD:", req.user);

    const employeeId = req.user.employee_id;
    let query, params;

    if (req.user.role === "admin") {
      query = `
        SELECT l.*, e.id AS emp_id, e.first_name, e.last_name
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        ORDER BY l.date_requested DESC
      `;
      params = [];
    } else {
      query = `SELECT * FROM leaves WHERE employee_id = ? ORDER BY date_requested DESC`;
      params = [employeeId];
    }

    console.log("SQL QUERY:", query);
    console.log("SQL PARAMS:", params);

    const [rows] = await db.promise().query(query, params);
    console.log("LEAVES FETCHED:", rows.length);

    res.json(rows);
  } catch (err) {
    console.error("LEAVES GET ERROR:", err);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

// POST create leave
router.post("/", authenticateToken, async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    const employeeId = req.user.employee_id;
    const { leave_type, start_date, end_date, reason } = req.body;

    console.log("CREATE LEAVE DATA:", { employeeId, leave_type, start_date, end_date, reason });

    const [result] = await db.promise().query(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)`,
      [employeeId, leave_type, start_date, end_date, reason]
    );

    console.log("LEAVE CREATED WITH ID:", result.insertId);

    res.status(201).json({ leave_id: result.insertId });
  } catch (err) {
    console.error("LEAVES POST ERROR:", err);
    res.status(500).json({ error: "Failed to create leave request" });
  }
});

// PUT approve/reject leave (admin only)
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const leaveId = req.params.id;
    const { status } = req.body;

    console.log("UPDATE LEAVE STATUS:", { leaveId, status, approved_by: req.user.employee_id });

    await db.promise().query(
      `UPDATE leaves SET status = ?, approved_by = ? WHERE leave_id = ?`,
      [status, req.user.employee_id, leaveId]
    );

    res.json({ message: "Leave status updated" });
  } catch (err) {
    console.error("LEAVES PUT ERROR:", err);
    res.status(500).json({ error: "Failed to update leave status" });
  }
});

module.exports = router;
