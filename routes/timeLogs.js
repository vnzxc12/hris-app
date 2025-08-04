// routes/timeLogs.js
const express = require('express');
const router = express.Router();

router.post('/time-in', (req, res) => {
  res.send('Time-in recorded');
});

router.post('/time-out', (req, res) => {
  res.send('Time-out recorded');
});

module.exports = router;
