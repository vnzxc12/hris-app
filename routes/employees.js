const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./verifyToken');

module.exports = () => {
  const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT *, DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate
       FROM employees`
    );
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});


// Get employee by ID (with leave balances)
router.get('/:id', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT e.*, DATE_FORMAT(e.birthdate, '%Y-%m-%d') AS birthdate,
              lb.vacation_leave, lb.sick_leave, lb.emergency_leave,
              lb.maternity_leave, lb.paternity_leave, lb.unpaid_leave
       FROM employees e
       LEFT JOIN leave_balances lb ON e.id = lb.employee_id
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(results[0]);
  } catch (err) {
    console.error('❌ Fetch employee error:', err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});



  // Add employee + user
  router.post('/', async (req, res) => {
  const { first_name, middle_name, last_name, department, designation, photo_url, role } = req.body;
  console.log("📥 Request Body:", req.body); // ✅ log form data from frontend

   if (!first_name || !last_name || !department || !designation || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    
    const [result] = await db.query(
      'INSERT INTO employees (first_name, middle_name, last_name, department, designation, photo_url) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, middle_name, last_name, department, designation, photo_url]
    );

    const newEmployeeId = result.insertId;

    await db.query(
      'INSERT INTO users (username, password, role, employee_id) VALUES (?, ?, ?, ?)',
      [String(newEmployeeId), String(newEmployeeId), role, newEmployeeId]
    );

    res.status(201).json({ success: true, employeeId: newEmployeeId });
  } catch (err) {
    console.error("❌ Add employee error:", err);
    res.status(500).json({ error: 'Failed to add employee and user', details: err.message });
  }
});


  // Full update
 router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    first_name, middle_name, last_name, gender, marital_status,
    contact_number, email_address, address, department, designation,
    manager, date_hired, sss, tin, pagibig, philhealth,
    salary_type, rate_per_hour, monthly_salary, 
    sss_amount, philhealth_amount, pagibig_amount, tax_amount, reimbursement_details, reimbursement_amount,
     college_institution, degree, specialization,
    birthdate, status, 
    emergency_contact_name, emergency_contact_relationship,  emergency_contact_phone,  emergency_contact_email, emergency_contact_address

  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE employees SET
        first_name = ?, middle_name = ?, last_name = ?, gender = ?,
        marital_status = ?, contact_number = ?, email_address = ?, address = ?,
        department = ?, designation = ?, manager = ?, date_hired = ?,
        sss = ?, tin = ?, pagibig = ?, philhealth = ?,
        salary_type = ?, rate_per_hour = ?, monthly_salary = ?, 
        sss_amount = ?, philhealth_amount = ?, pagibig_amount = ?, tax_amount = ?, reimbursement_details = ?, reimbursement_amount = ?,
        college_institution = ?, degree = ?, specialization = ?,
        birthdate = ?, status = ?, 
    emergency_contact_name = ?, emergency_contact_relationship = ?,  emergency_contact_phone = ?,  emergency_contact_email = ?, 
    emergency_contact_address = ?
      WHERE id = ?`,
      [
        first_name, middle_name, last_name, gender,
        marital_status, contact_number, email_address, address,
        department, designation, manager, date_hired,
        sss, tin, pagibig, philhealth,
        salary_type, rate_per_hour, monthly_salary,
        sss_amount, philhealth_amount, pagibig_amount, tax_amount, reimbursement_details, reimbursement_amount,
        college_institution, degree, specialization,
        birthdate, status, 
        emergency_contact_name, emergency_contact_relationship,  emergency_contact_phone,  emergency_contact_email, emergency_contact_address,
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
    emergency_contact_name,
    emergency_contact_relationship,
    emergency_contact_phone,
    emergency_contact_email,
    emergency_contact_address,

    college_institution,
    degree,
    specialization,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE employees SET
        marital_status = ?, contact_number = ?, email_address = ?, address = ?,
        sss = ?, tin = ?, pagibig = ?, philhealth = ?,

        emergency_contact_name = ?, emergency_contact_relationship = ?, emergency_contact_phone = ?,
        emergency_contact_email = ?, emergency_contact_address = ?,

        college_institution = ?, degree = ?, specialization = ?
      WHERE id = ?`,
      [
        marital_status, contact_number, email_address, address,
        sss, tin, pagibig, philhealth,

        emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
        emergency_contact_email, emergency_contact_address,

        college_institution, degree, specialization,
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

//DELETE ROUTE
 router.delete('/:id', async (req, res) => {
  const employeeId = req.params.id;

  try {
    await db.query("START TRANSACTION");

    // Delete related records first
    await db.query("DELETE FROM leaves WHERE employee_id = ?", [employeeId]);
    await db.query("DELETE FROM leave_balances WHERE employee_id = ?", [employeeId]);
    await db.query("DELETE FROM time_logs WHERE employee_id = ?", [employeeId]);
    await db.query("DELETE FROM payslips WHERE employee_id = ?", [employeeId]);
    await db.query("DELETE FROM assets WHERE employee_id = ?", [employeeId]);
    await db.query("DELETE FROM trainings WHERE employee_id = ?", [employeeId]);
    await db.query("DELETE FROM users WHERE employee_id = ?", [employeeId]);

    // Finally delete from employees
    const [result] = await db.query("DELETE FROM employees WHERE id = ?", [employeeId]);

    if (result.affectedRows === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "Employee not found" });
    }

    await db.query("COMMIT");
    res.json({ message: "Employee deleted successfully" });

  } catch (err) {
    await db.query("ROLLBACK");
    console.error("❌ Delete error:", err);
    res.status(500).json({
      message: "Failed to delete employee",
      details: err.message
    });
  }
});



  // UPLOAD CLOUDINARY

  const { uploader } = require("cloudinary").v2;
const multer = require("multer");
const streamifier = require("streamifier");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to upload buffer to Cloudinary
function streamUpload(req) {
  return new Promise((resolve, reject) => {
    let stream = uploader.upload_stream({ folder: "employees" }, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
}

// Update employee profile photo
router.put("/:id/photo", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Only admin can change others' photos
    const paramId = Number(req.params.id);
    const tokenRole = req.user.role;
    const tokenEmpId = Number(req.user.employee_id);

    if (tokenRole !== "admin" && paramId !== tokenEmpId) {
      return res.status(403).json({ error: "Unauthorized to change this photo" });
    }

    // Upload to Cloudinary
    const result = await streamUpload(req);

    // Save the URL in database
    await db.query("UPDATE employees SET photo_url = ? WHERE id = ?", [result.secure_url, paramId]);

    res.json({
      success: true,
      message: "Profile photo updated successfully",
      photo_url: result.secure_url
    });
  } catch (err) {
    console.error("❌ Photo upload error:", err);
    res.status(500).json({ error: "Failed to update profile photo" });
  }
});

  return router;
};