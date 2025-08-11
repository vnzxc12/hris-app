// routes/payroll.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET payroll for a given date range
router.get('/range', async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date are required' });
  }

  try {
    const [employees] = await db.query(`
      SELECT id, first_name, last_name, salary_type, rate_per_hour, monthly_salary, overtime_rate
      FROM employees
    `);

    const payrollData = [];

    for (let emp of employees) {
      // Fetch time logs within range
      const [logs] = await db.query(`
        SELECT time_in, time_out
        FROM time_logs
        WHERE employee_id = ?
        AND time_in BETWEEN ? AND ?
      `, [emp.id, start_date, end_date]);

      let totalHours = 0;
      let overtimeHours = 0;

      logs.forEach(log => {
        if (log.time_in && log.time_out) {
          const start = new Date(log.time_in);
          const end = new Date(log.time_out);
          const diffHours = (end - start) / (1000 * 60 * 60);

          if (diffHours > 8) {
            totalHours += 8;
            overtimeHours += diffHours - 8;
          } else {
            totalHours += diffHours;
          }
        }
      });

      let basePay = 0;
      if (emp.salary_type === 'hourly') {
        basePay = totalHours * emp.rate_per_hour;
      } else if (emp.salary_type === 'monthly') {
        // prorate monthly salary based on days worked in range
        const daysInMonth = new Date(start_date).getDate();
        const dailyRate = emp.monthly_salary / daysInMonth;
        basePay = dailyRate * (totalHours / 8);
      }

      const overtimePay = overtimeHours * (emp.overtime_rate || 0);
      const totalPay = basePay + overtimePay;

      payrollData.push({
        employee_id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        totalHours: totalHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
        basePay: basePay.toFixed(2),
        overtimePay: overtimePay.toFixed(2),
        totalPay: totalPay.toFixed(2)
      });
    }

    res.json(payrollData);
  } catch (err) {
    console.error('Error generating range payroll:', err);
    res.status(500).json({ error: 'Server error generating payroll' });
  }
});

module.exports = router;
