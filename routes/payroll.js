// backend/routes/payroll.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// --- Your existing /range route stays exactly as you have it ---
router.get('/range', async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date are required' });
  }

  try {
    // 👇 Your existing working query + logic goes here (unchanged)
    // ---------------------
    const [employees] = await db.query(`
      SELECT 
        id, first_name, last_name, salary_type, rate_per_hour, monthly_salary, overtime_rate,
        sss_amount, pagibig_amount, philhealth_amount, tax_amount,
        reimbursement_details, reimbursement_amount
      FROM employees
    `);

    const payrollData = [];

    for (let emp of employees) {
      const [logs] = await db.query(`
        SELECT total_hours, date
        FROM time_logs
        WHERE employee_id = ?
          AND date BETWEEN ? AND ?
      `, [emp.id, start_date, end_date]);

      let totalHours = 0;
      let overtimeHours = 0;
      const uniqueWorkDays = new Set();

      logs.forEach(log => {
        const hoursWorked = log.total_hours ? parseFloat(log.total_hours) : 0;
        if (log.date) {
          const dayStr = typeof log.date === 'string' ? log.date : log.date.toISOString().slice(0, 10);
          uniqueWorkDays.add(dayStr);
        }
        if (hoursWorked > 8) {
          totalHours += 8;
          overtimeHours += (hoursWorked - 8);
        } else {
          totalHours += hoursWorked;
        }
      });

      let basePay = 0;
      if (emp.salary_type === 'Hourly') {
        basePay = totalHours * emp.rate_per_hour;
      } else if (emp.salary_type === 'Monthly') {
        const startDateObj = new Date(start_date);
        const year = startDateObj.getFullYear();
        const month = startDateObj.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const dailyRate = emp.monthly_salary / daysInMonth;
        const daysWorked = uniqueWorkDays.size;
        basePay = dailyRate * daysWorked;
      }

      const overtimePay = overtimeHours * (emp.overtime_rate || 0);

      const totalPay =
        Number(basePay) +
        Number(overtimePay) -
        Number(emp.sss_amount || 0) -
        Number(emp.pagibig_amount || 0) -
        Number(emp.philhealth_amount || 0) -
        Number(emp.tax_amount || 0) +
        Number(emp.reimbursement_amount || 0);

      payrollData.push({
        employee_id: emp.id,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        totalHours: totalHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
        basePay: basePay.toFixed(2),
        overtimePay: overtimePay.toFixed(2),
        sss_amount: parseFloat(emp.sss_amount || 0).toFixed(2),
        pagibig_amount: parseFloat(emp.pagibig_amount || 0).toFixed(2),
        philhealth_amount: parseFloat(emp.philhealth_amount || 0).toFixed(2),
        tax_amount: parseFloat(emp.tax_amount || 0).toFixed(2),
        reimbursement_details: emp.reimbursement_details || "",
        reimbursement_amount: parseFloat(emp.reimbursement_amount || 0).toFixed(2),
        totalPay: totalPay.toFixed(2)
      });
    }

    res.json(payrollData);
    // ---------------------
  } catch (err) {
    console.error('Error generating range payroll:', err);
    res.status(500).json({ error: 'Server error generating payroll' });
  }
});

// --- New /save route ---
router.post('/save', async (req, res) => {
  try {
    const { payrollData, pay_date } = req.body;

    if (!Array.isArray(payrollData) || !pay_date) {
      return res.status(400).json({ error: 'payrollData array and pay_date are required' });
    }

    // Save each payroll record as a payslip
    for (const p of payrollData) {
      await db.query(
        `INSERT INTO payslips 
          (employee_id, pay_date, base_pay, overtime_pay, sss_amount, pagibig_amount, philhealth_amount, tax_amount, reimbursement_amount, total_pay) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.employee_id,
          pay_date,
          p.basePay,
          p.overtimePay,
          p.sss_amount,
          p.pagibig_amount,
          p.philhealth_amount,
          p.tax_amount,
          p.reimbursement_amount,
          p.totalPay
        ]
      );
    }

    res.json({ success: true, message: 'Payslips saved successfully' });
  } catch (err) {
    console.error('Error saving payslips:', err);
    res.status(500).json({ error: 'Server error saving payslips' });
  }
});

module.exports = router;
