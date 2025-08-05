const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./verifyToken');

module.exports = () => {
  const router = express.Router();

  // Get all employees
  router.get('/', async (req, res) => {
    try {
      const [results] = await db.query('SELECT * FROM employees');
      res.json(results);
    } catch {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Get employee by ID
  router.get('/:id', async (req, res) => {
    try {
      const [results] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
      if (results.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(results[0]);
    } catch {
      res.status(500).json({ error: 'Failed to fetch employee' });
    }
  });

  // Add employee + user
  router.post('/', async (req, res) => {
    const { name, department, designation, photo_url } = req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO employees (name, department, designation, photo_url) VALUES (?, ?, ?, ?)',
        [name, department, designation, photo_url]
      );
      const newEmployeeId = result.insertId;

      await db.query(
        'INSERT INTO users (username, password, role, employee_id) VALUES (?, ?, ?, ?)',
        [String(newEmployeeId), String(newEmployeeId), 'Employee', newEmployeeId]
      );

      res.status(201).json({ success: true, employeeId: newEmployeeId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add employee and user' });
    }
  });

  // Full update
 router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    first_name, middle_name, last_name, gender, marital_status,
    contact_number, email_address, address, department, designation,
    manager, date_hired, sss, tin, pagibig, philhealth,
    salary_type, rate_per_hour
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE employees SET
        first_name = ?, middle_name = ?, last_name = ?, gender = ?,
        marital_status = ?, contact_number = ?, email_address = ?, address = ?,
        department = ?, designation = ?, manager = ?, date_hired = ?,
        sss = ?, tin = ?, pagibig = ?, philhealth = ?,
        salary_type = ?, rate_per_hour = ?
      WHERE id = ?`,
      [
        first_name, middle_name, last_name, gender,
        marital_status, contact_number, email_address, address,
        department, designation, manager, date_hired,
        sss, tin, pagibig, philhealth,
        salary_type, rate_per_hour,
        id
      ]
    );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({ success: true, message: 'Employee updated successfully' });
   } catch (err) {
  console.error('❌ Update error:', err); // ✅ This shows exact error
  res.status(500).json({ error: 'Update failed', details: err.message });
}

  });

  // Self-update (protected by token)
  router.put('/:id/self-update', authenticateToken, async (req, res) => {
    const paramId = Number(req.params.id);
    const tokenId = Number(req.user.employee_id);

    if (paramId !== tokenId) {
      return res.status(403).json({
        error: `Unauthorized: You are employee ${tokenId} trying to update ${paramId}`,
      });
    }

    const {
      marital_status,
      contact_number,
      email_address,
      address,
      sss,
      tin,
      pagibig,
      philhealth,
    } = req.body;

    try {
      const [result] = await db.query(
        `UPDATE employees SET
          marital_status = ?, contact_number = ?, email_address = ?, address = ?,
          sss = ?, tin = ?, pagibig = ?, philhealth = ?
        WHERE id = ?`,
        [
          marital_status, contact_number, email_address, address,
          sss, tin, pagibig, philhealth,
          paramId,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({ success: true, message: 'Employee profile updated successfully' });
    } catch (err) {
      console.error('❌ Self-update error:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Delete
  router.delete('/:id', async (req, res) => {
    try {
      const [result] = await db.query("DELETE FROM employees WHERE id = ?", [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ message: "Employee not found" });
      res.json({ message: "Employee deleted successfully" });
    } catch {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  return router;
};
