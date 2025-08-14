// backend/routes/leaveBalances.js

const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("./verifyToken");

// Get leave balance for a specific employee

router.get("/:employee_id", authenticateToken, async (req, res) => {
    try {
        const { employee_id } = req.params;
        if (isNaN(employee_id)) {
    return res.status(400).json({ error: "Invalid employee ID" });
}
        const [rows] = await db.query(
            "SELECT * FROM leave_balances WHERE employee_id = ?",
            [employee_id]
        );

        if (rows.length === 0) {
            // Create zero balances automatically
            await db.query(
                `INSERT INTO leave_balances 
                 (employee_id, vacation_leave, sick_leave, emergency_leave, maternity_leave, paternity_leave, unpaid_leave) 
                 VALUES (?, 0, 0, 0, 0, 0, 0)`,
                [employee_id]
            );

            return res.json({
                employee_id,
                vacation_leave: 0,
                sick_leave: 0,
                emergency_leave: 0,
                maternity_leave: 0,
                paternity_leave: 0,
                unpaid_leave: 0,
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching leave balance:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Update leave balance
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

        res.json({ message: "Leave balance updated successfully" });
    } catch (error) {
        console.error("Error updating leave balance:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Optional: Delete leave balance
router.delete("/:employee_id", authenticateToken, async (req, res) => {
    try {
        const { employee_id } = req.params;

        await db.query("DELETE FROM leave_balances WHERE employee_id = ?", [
            employee_id,
        ]);

        res.json({ message: "Leave balance deleted successfully" });
    } catch (error) {
        console.error("Error deleting leave balance:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
