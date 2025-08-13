const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const trainingsRouter = require('./routes/trainings');



// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());



app.use('/payslips', require('./routes/payslips'));
app.use('/payroll', require('./routes/payroll'));



app.use('/trainings', trainingsRouter);
// Cloudinary Setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload Configurations
const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hris_photos',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});
const photoUpload = multer({ storage: photoStorage });

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'hris_documents',
    resource_type: 'auto',
    public_id: Date.now() + '-' + file.originalname,
    format: path.extname(file.originalname).slice(1),
  }),
});
const documentUpload = multer({ storage: documentStorage });

// DB
const db = require('./db');

// Routes
const timeLogsRouter = require('./routes/timeLogs');
const employeeRouter = require('./routes/employees');
const documentRouter = require('./routes/documents')(documentUpload);
const assetsRoutes = require('./routes/assets');

// Mount Routes
app.use('/time-logs', timeLogsRouter);
app.use('/employees', employeeRouter(documentUpload));
app.use('/documents', documentRouter); 
app.use('/', assetsRoutes);


// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [results] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = results[0];
    
    const token = jwt.sign(
      {
        id: user.id,
        employee_id: user.employee_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        role: user.role,
        username: user.username,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});