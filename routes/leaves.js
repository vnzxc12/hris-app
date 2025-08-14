// backend/routes/leaves.js

const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("./verifyToken");

// Employee: Submit a leave request
router.post("/", authenticateToken, async (req, res) => {
    try {
        const {
            leave_type,
            start_date,
            end_date,
            reason
        } = req.body;

        const employee_id = req.user.id; // from token

        await db.query(
            `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status) 
             VALUES (?, ?, ?, ?, ?, 'Pending')`,
            [employee_id, leave_type, start_date, end_date, reason]
        );

        res.json({ message: "Leave request submitted successfully" });
    } catch (error) {
        console.error("Error submitting leave request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Admin: Approve or reject a leave request
router.put("/:leave_id", authenticateToken, async (req, res) => {
    try {
        const { leave_id } = req.params;
        const { status } = req.body;
        const approved_by = req.user.id;

        // Update leave status
        await db.query(
            `UPDATE leaves 
             SET status = ?, approved_by = ? 
             WHERE leave_id = ?`,
            [status, approved_by, leave_id]
        );

        // If approved, deduct from leave balance
        if (status === "Approved") {
            const [leaveData] = await db.query(
                `SELECT employee_id, leave_type, DATEDIFF(end_date, start_date) + 1 AS days 
                 FROM leaves WHERE leave_id = ?`,
                [leave_id]
            );

            if (leaveData.length > 0) {
                const { employee_id, leave_type, days } = leaveData[0];

                let columnName;
                switch (leave_type) {
                    case "Vacation":
                        columnName = "vacation_leave";
                        break;
                    case "Sick":
                        columnName = "sick_leave";
                        break;
                    case "Emergency":
                        columnName = "emergency_leave";
                        break;
                    case "Maternity":
                        columnName = "maternity_leave";
                        break;
                    case "Paternity":
                        columnName = "paternity_leave";
                        break;
                    case "Unpaid":
                        columnName = "unpaid_leave";
                        break;
                    default:
                        columnName = null;
                }

                if (columnName) {
                    await db.query(
                        `UPDATE leave_balances 
                         SET ${columnName} = GREATEST(${columnName} - ?, 0) 
                         WHERE employee_id = ?`,
                        [days, employee_id]
                    );
                }
            }
        }

        res.json({ message: `Leave request ${status.toLowerCase()} successfully` });
    } catch (error) {
        console.error("Error updating leave request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get all leave requests (admin view)
router.get("/", authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT l.*, e.first_name, e.last_name 
             FROM leaves l
             JOIN employees e ON l.employee_id = e.employee_id
             ORDER BY l.date_requested DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error("Error fetching leave requests:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get leave requests for the logged-in employee
router.get("/my", authenticateToken, async (req, res) => {
    try {
        const employee_id = req.user.id;
        const [rows] = await db.query(
            `SELECT * FROM leaves 
             WHERE employee_id = ? 
             ORDER BY date_requested DESC`,
            [employee_id]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error fetching my leave requests:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
