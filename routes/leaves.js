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
        SELECT 
          l.*, 
          e.id AS emp_id, 
          CONCAT(e.first_name, ' ', e.last_name) AS employee_name
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        ORDER BY l.date_requested DESC
      `;
      params = [];
    } else {
      query = `
        SELECT 
          l.*, 
          CONCAT(e.first_name, ' ', e.last_name) AS employee_name
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        WHERE l.employee_id = ?
        ORDER BY l.date_requested DESC
      `;
      params = [employeeId];
    }

    console.log("SQL QUERY:", query);
    console.log("SQL PARAMS:", params);

    const [rows] = await db.query(query, params);
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

    const [result] = await db.query(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status, date_requested) 
       VALUES (?, ?, ?, ?, ?, 'Pending', NOW())`,
      [employeeId, leave_type, start_date, end_date, reason]
    );

    console.log("LEAVE CREATED WITH ID:", result.insertId);

    res.status(201).json({ leave_id: result.insertId });
  } catch (err) {
    console.error("LEAVES POST ERROR:", err);
    res.status(500).json({ error: "Failed to create leave request" });
  }
});

// PUT approve/reject leave (admin only) + deduct leave balance
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    if (req.user.role !== "admin") {
      console.warn("Unauthorized attempt to change leave status by:", req.user);
      return res.status(403).json({ error: "Unauthorized" });
    }

    const leaveId = req.params.id;
    const { status } = req.body;

    console.log("UPDATE LEAVE STATUS:", { leaveId, status, approved_by: req.user.employee_id });

    // First, get the leave details
    const [leaveRows] = await db.query(`SELECT * FROM leaves WHERE leave_id = ?`, [leaveId]);
    if (leaveRows.length === 0) {
      console.warn("No leave found with ID:", leaveId);
      return res.status(404).json({ error: "Leave not found" });
    }

    const leave = leaveRows[0];
    console.log("LEAVE DETAILS FOUND:", leave);

    // Update leave status
    await db.query(
      `UPDATE leaves SET status = ?, approved_by = ? WHERE leave_id = ?`,
      [status, req.user.employee_id, leaveId]
    );
    console.log(`Leave ID ${leaveId} status updated to:`, status);

    // If approved, deduct leave balance
    if (status.toLowerCase() === "approved") {
      console.log("Leave approved — calculating days to deduct...");
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      console.log(`Days difference calculated: ${daysDiff} days`);
      console.log(`Leave type for deduction: ${leave.leave_type}`);

      let leaveColumn;
      switch (leave.leave_type.toLowerCase()) {
        case "vacation":
        case "vacation leave":
          leaveColumn = "vacation_leave";
          break;
        case "sick":
        case "sick leave":
          leaveColumn = "sick_leave";
          break;
        case "maternity":
        case "maternity leave":
          leaveColumn = "maternity_leave";
          break;
        case "paternity":
        case "paternity leave":
          leaveColumn = "paternity_leave";
          break;
        default:
          console.warn("Unknown leave type, skipping balance deduction:", leave.leave_type);
          leaveColumn = null;
      }

      if (leaveColumn) {
        const [updateResult] = await db.query(
          `UPDATE leave_balances SET ${leaveColumn} = ${leaveColumn} - ? WHERE employee_id = ?`,
          [daysDiff, leave.employee_id]
        );
        console.log("LEAVE BALANCE DEDUCTION RESULT:", updateResult);
      }
    }

    res.json({ message: "Leave status updated" });
  } catch (err) {
    console.error("LEAVES PUT ERROR:", err);
    res.status(500).json({ error: "Failed to update leave status" });
  }
});

module.exports = router;
