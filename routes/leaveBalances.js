const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("./verifyToken");

// Get leave balance for a specific employee
router.get("/:employeeId", authenticateToken, async (req, res) => {
  const { employeeId } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM leave_balances WHERE employee_id = ?",
      [employeeId]
    );

    if (rows.length === 0) {
      // Auto-create default row if none exists
      const defaultBalances = {
        vacation_leave: 0,
        sick_leave: 0,
        emergency_leave: 0,
        maternity_leave: 0,
        paternity_leave: 0,
        unpaid_leave: 0,
      };

      await db.query(
        `INSERT INTO leave_balances 
         (employee_id, vacation_leave, sick_leave, emergency_leave, maternity_leave, paternity_leave, unpaid_leave) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeId,
          defaultBalances.vacation_leave,
          defaultBalances.sick_leave,
          defaultBalances.emergency_leave,
          defaultBalances.maternity_leave,
          defaultBalances.paternity_leave,
          defaultBalances.unpaid_leave,
        ]
      );

      return res.json(defaultBalances);
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching leave balances:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update leave balance (Admin only)
router.put("/:employee_id", authenticateToken, async (req, res) => {
  try {
    const { employee_id } = req.params;
    const {
      vacation_leave,
      sick_leave,
      emergency_leave,
      maternity_leave,
      paternity_leave,
      unpaid_leave,
    } = req.body;

    // Check if record exists
    const [rows] = await db.query(
      "SELECT * FROM leave_balances WHERE employee_id = ?",
      [employee_id]
    );

    if (rows.length === 0) {
      // Insert new record
      await db.query(
        `INSERT INTO leave_balances 
         (employee_id, vacation_leave, sick_leave, emergency_leave, maternity_leave, paternity_leave, unpaid_leave)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          employee_id,
          vacation_leave,
          sick_leave,
          emergency_leave,
          maternity_leave,
          paternity_leave,
          unpaid_leave,
        ]
      );
    } else {
      // Update existing
      await db.query(
        `UPDATE leave_balances 
         SET vacation_leave = ?, sick_leave = ?, emergency_leave = ?, maternity_leave = ?, paternity_leave = ?, unpaid_leave = ?
         WHERE employee_id = ?`,
        [
          vacation_leave,
          sick_leave,
          emergency_leave,
          maternity_leave,
          paternity_leave,
          unpaid_leave,
          employee_id,
        ]
      );
    }

    res.json({ message: "Leave balance updated successfully" });
  } catch (error) {
    console.error("Error updating leave balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
