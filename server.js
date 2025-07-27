const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const port = 3001;

// ------------------ MIDDLEWARE ------------------

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve uploaded images
app.use("/uploads", express.static(uploadDir));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ------------------ MYSQL CONNECTION ------------------

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "hris",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err);
  } else {
    console.log("✅ Connected to MySQL Database");
    db.query("SELECT DATABASE()", (err, result) => {
      if (!err) console.log("📂 Using DB:", result[0]["DATABASE()"]);
    });
  }
});

// ------------------ EMPLOYEE ROUTES ------------------

// GET all employees
app.get("/employees", (req, res) => {
  const sql = "SELECT * FROM employees ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// GET single employee by ID
app.get("/employees/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employees WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Employee not found" });
    res.json(result[0]);
  });
});

// ADD employee with photo support
app.post("/employees", upload.single("photo"), (req, res) => {
  const {
    name,
    department,
    date_hired,
    last_name,
    first_name,
    middle_name,
    gender,
    marital_status,
    designation,
    manager,
    sss,
    tin,
    pagibig,
    philhealth,
    contact_number,
    email_address,
  } = req.body;

  const photo_url = req.file ? `/uploads/${req.file.filename}` : "";

  const sql = `
    INSERT INTO employees 
    (name, department, date_hired, last_name, first_name, middle_name, gender, marital_status, designation, manager, sss, tin, pagibig, philhealth, contact_number, email_address, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    department,
    date_hired,
    last_name,
    first_name,
    middle_name,
    gender,
    marital_status,
    designation,
    manager,
    sss,
    tin,
    pagibig,
    philhealth,
    contact_number,
    email_address,
    photo_url,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error adding employee:", err);
      return res.status(500).json({ error: "Failed to add employee" });
    }
    res.json({ message: "✅ Employee added", id: result.insertId });
  });
});

// UPDATE employee
app.put("/employees/:id", (req, res) => {
  const id = req.params.id;
  const {
    name,
    department,
    date_hired,
    last_name,
    first_name,
    middle_name,
    gender,
    marital_status,
    designation,
    manager,
    sss,
    tin,
    pagibig,
    philhealth,
    contact_number,
    email_address,
    photo_url,
  } = req.body;

  const sql = `
    UPDATE employees SET 
      name = ?, department = ?, date_hired = ?, 
      last_name = ?, first_name = ?, middle_name = ?, gender = ?, marital_status = ?, 
      designation = ?, manager = ?, sss = ?, tin = ?, pagibig = ?, philhealth = ?, 
      contact_number = ?, email_address = ?, photo_url = ?
    WHERE id = ?
  `;

  const values = [
    name,
    department,
    date_hired,
    last_name,
    first_name,
    middle_name,
    gender,
    marital_status,
    designation,
    manager,
    sss,
    tin,
    pagibig,
    philhealth,
    contact_number,
    email_address,
    photo_url,
    id,
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "✅ Employee updated" });
  });
});

// DELETE employee
app.delete("/employees/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM employees WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "🗑️ Employee deleted" });
  });
});

// UPLOAD photo (standalone)
app.post("/upload-photo", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ message: "✅ Photo uploaded", photo_url: filePath });
});

// ------------------ LOGIN ROUTE ------------------

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Login Attempt:", username);

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];
    res.json({ message: "Login successful", role: user.role, user });
  });
});

// ------------------ SERVER START ------------------

app.listen(port, () => {
  console.log(`🚀 Server running at: http://localhost:${port}`);
});
