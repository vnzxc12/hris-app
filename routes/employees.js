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

// Get all employees + their user_id
router.get('/', async (req, res) => {
  try {
    const [employees] = await db.query(`
      SELECT 
        e.*, 
        u.id AS user_id 
      FROM employees e
      LEFT JOIN users u ON u.employee_id = e.id
    `);

    res.json(employees);
  } catch (err) {
    console.error("Failed to fetch employees:", err);
    res.status(500).json({ error: "Database error" });
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
router.put("/:id", async (req, res) => {
  const {
    first_name,
    middle_name,
    last_name,
    gender,
    marital_status,
    contact_number,
    email_address,
    address,
    department,
    designation,
    manager,
    date_hired,
    sss,
    tin,
    pagibig,
    philhealth,
    salary_type,
    rate_per_hour,
  } = req.body;

  try {
    await db.query(
      `UPDATE employees SET
        first_name = ?, middle_name = ?, last_name = ?, gender = ?, marital_status = ?,
        contact_number = ?, email_address = ?, address = ?, department = ?, designation = ?,
        manager = ?, date_hired = ?, sss = ?, tin = ?, pagibig = ?, philhealth = ?,
        salary_type = ?, rate_per_hour = ?
      WHERE id = ?`,
      [
        first_name,
        middle_name,
        last_name,
        gender,
        marital_status,
        contact_number,
        email_address,
        address,
        department,
        designation,
        manager,
        date_hired,
        sss,
        tin,
        pagibig,
        philhealth,
        salary_type,
        rate_per_hour,
        req.params.id,
      ]
    );

    res.json({ message: "Employee updated successfully." });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error while updating employee." });
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
