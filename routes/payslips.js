const express = require("express");
const db = require("../db");
const authenticateToken = require("./verifyToken");

module.exports = () => {
  const router = express.Router();

  // =========================
  // Get payslips for a specific employee
  // =========================
  router.get("/:employeeId", authenticateToken, async (req, res) => {
    try {
      const employeeId = req.params.employeeId;

      const [rows] = await db.query(`
        SELECT 
          p.id AS payslip_id,
          p.employee_id,
          e.first_name,
          e.last_name,
          e.department,
          e.designation,
          p.pay_date,
          p.base_pay,
          p.overtime_pay,
          p.sss_amount,
          p.pagibig_amount,
          p.philhealth_amount,
          p.tax_amount,
          p.reimbursement_amount,
          p.total_pay,
          p.generated_at
        FROM payslips p
        JOIN employees e ON p.employee_id = e.id
        WHERE p.employee_id = ?
        ORDER BY p.pay_date DESC
      `, [employeeId]);

      res.json(rows);
    } catch (error) {
      console.error("Error fetching payslips:", error);
      res.status(500).json({ message: "Failed to fetch payslips" });
    }
  });

  // =========================
  // Admin creates a payslip
  // =========================
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const {
        employee_id,
        pay_date,
        base_pay,
        overtime_pay,
        sss_amount,
        pagibig_amount,
        philhealth_amount,
        tax_amount,
        reimbursement_amount,
        total_pay
      } = req.body;

      await db.query(`
        INSERT INTO payslips (
          employee_id, pay_date, base_pay, overtime_pay,
          sss_amount, pagibig_amount, philhealth_amount, tax_amount,
          reimbursement_amount, total_pay
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        employee_id, pay_date, base_pay, overtime_pay,
        sss_amount, pagibig_amount, philhealth_amount, tax_amount,
        reimbursement_amount, total_pay
      ]);

      res.json({ message: "Payslip created successfully" });
    } catch (error) {
      console.error("Error creating payslip:", error);
      res.status(500).json({ message: "Failed to create payslip" });
    }
  });

  return router;
};
