// backend/routes/leaveBalances.js
const express = require("express");
const db = require("../db");
const authenticateToken = require("./verifyToken");

module.exports = () => {
  const router = express.Router();

  const defaultBalances = {
    vacation_leave: 0,
    sick_leave: 0,
    emergency_leave: 0,
    maternity_leave: 0,
    paternity_leave: 0,
    unpaid_leave: 0,
  };

  // GET leave balances for an employee
 router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM leave_balances WHERE employee_id = ?',
      [id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leave balances' });
  }
});


  // UPDATE leave balances
  router.put("/:employeeId", authenticateToken, async (req, res) => {
    const { employeeId } = req.params;
    const {
      vacation_leave,
      sick_leave,
      emergency_leave,
      maternity_leave,
      paternity_leave,
      unpaid_leave,
    } = req.body;

    try {
      const [existing] = await db.query(
        "SELECT employee_id FROM leave_balances WHERE employee_id = ?",
        [employeeId]
      );

      if (existing.length === 0) {
        // Insert new record if not found
        await db.query(
          `INSERT INTO leave_balances 
            (employee_id, vacation_leave, sick_leave, emergency_leave, maternity_leave, paternity_leave, unpaid_leave) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            employeeId,
            vacation_leave,
            sick_leave,
            emergency_leave,
            maternity_leave,
            paternity_leave,
            unpaid_leave,
          ]
        );
      } else {
        // Update existing record
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
            employeeId,
          ]
        );
      }

      res.json({ message: "Leave balances saved successfully" });
    } catch (err) {
      console.error("Error saving leave balances:", err);
      res.status(500).json({ error: "Failed to save leave balances" });
    }
  });

  // Generic error handler for this router
  router.use((err, req, res, next) => {
    console.error("Unhandled error in leaveBalances router:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return router;
};
