const express = require('express');
const router = express.Router();
const db = require('../db');

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
      // Filter using time_in (datetime)
      const [logs] = await db.query(`
        SELECT time_in, time_out, total_hours
        FROM time_logs
        WHERE employee_id = ?
          AND time_in BETWEEN ? AND ?
      `, [emp.id, `${start_date} 00:00:00`, `${end_date} 23:59:59`]);

      let totalHours = 0;
      let overtimeHours = 0;
      const uniqueWorkDays = new Set();

      logs.forEach(log => {
        let hoursWorked = 0;
        if (log.total_hours != null) {
          hoursWorked = parseFloat(log.total_hours);
        } else if (log.time_in && log.time_out) {
          const start = new Date(log.time_in);
          const end = new Date(log.time_out);
          hoursWorked = (end - start) / (1000 * 60 * 60);
        }

        // Derive work day from time_in datetime
        if (log.time_in) {
          uniqueWorkDays.add(log.time_in.toISOString().slice(0, 10));
        }

        if (hoursWorked > 8) {
          totalHours += 8;
          overtimeHours += hoursWorked - 8;
        } else {
          totalHours += hoursWorked;
        }
      });

      // Calculate base pay
      let basePay = 0;
      if (emp.salary_type === 'hourly') {
        basePay = totalHours * emp.rate_per_hour;
      } else if (emp.salary_type === 'monthly') {
        // Prorate monthly salary by unique days worked
        const startDateObj = new Date(start_date);
        const year = startDateObj.getFullYear();
        const month = startDateObj.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dailyRate = emp.monthly_salary / daysInMonth;
        const daysWorked = uniqueWorkDays.size;
        basePay = dailyRate * daysWorked;
      }

      const overtimePay = overtimeHours * (emp.overtime_rate || 0);
      const totalPay = basePay + overtimePay;

      payrollData.push({
        employee_id: emp.id,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
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
