// routes/trainings.js
const express = require('express');
const router = express.Router();
const db = require('../db');

console.log("✅ Trainings route loaded");

// Get trainings for a specific employee
router.get('/employee/:id', async (req, res) => {
  const employeeId = req.params.id;
  try {
    const [trainings] = await db.query(
      'SELECT * FROM trainings WHERE employee_id = ? ORDER BY training_date DESC',
      [employeeId]
    );
    res.json(trainings);
  } catch (err) {
    console.error('Error fetching trainings:', err);
    res.status(500).json({ error: 'Error fetching trainings' });
  }
});

// Add new training
router.post('/', async (req, res) => {
  const { employee_id, training_name, training_date } = req.body;

  if (!employee_id || !training_name || !training_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO trainings (employee_id, training_name, training_date) VALUES (?, ?, ?)',
      [employee_id, training_name, training_date]
    );
    res.json({ id: result.insertId, message: 'Training added successfully' });
  } catch (err) {
    console.error('Error adding training:', err);
    res.status(500).json({ error: 'Error adding training' });
  }
});

// Update a training by ID
router.put('/:id', async (req, res) => {
  const trainingId = req.params.id;
  const { training_name, training_date } = req.body;

  if (!training_name || !training_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.query(
      'UPDATE trainings SET training_name = ?, training_date = ? WHERE id = ?',
      [training_name, training_date, trainingId]
    );
    res.json({ message: 'Training updated successfully' });
  } catch (err) {
    console.error('Error updating training:', err);
    res.status(500).json({ error: 'Error updating training' });
  }
});

// Delete a training by ID
router.delete('/:id', async (req, res) => {
  const trainingId = req.params.id;

  try {
    await db.query('DELETE FROM trainings WHERE id = ?', [trainingId]);
    res.json({ message: 'Training deleted successfully' });
  } catch (err) {
    console.error('Error deleting training:', err);
    res.status(500).json({ error: 'Error deleting training' });
  }
});

module.exports = router;
