const express = require('express');
const router = express.Router();
const db = require('../db'); // or wherever your db connection is

// Get all assets for an employee
router.get('/employees/:id/assets', (req, res) => {
  res.json({ message: "Assets route is working" });
});


// Add asset to employee
router.post('/employees/:id/assets', (req, res) => {
  const { id } = req.params;
  const { asset_category, asset_description, serial_number, date_assigned, date_returned } = req.body;

  const sql = `INSERT INTO assets (employee_id, asset_category, asset_description, serial_number, date_assigned, date_returned)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [id, asset_category, asset_description, serial_number, date_assigned, date_returned], (err, result) => {
    if (err) return res.status(500).json({ error: 'Insert failed' });
    res.json({ message: 'Asset added', asset_id: result.insertId });
  });
});

// Update asset
router.put('/assets/:assetId', (req, res) => {
  const { assetId } = req.params;
  const { asset_category, asset_description, serial_number, date_assigned, date_returned } = req.body;

  const sql = `UPDATE assets SET asset_category = ?, asset_description = ?, serial_number = ?, date_assigned = ?, date_returned = ?
               WHERE id = ?`;

  db.query(sql, [asset_category, asset_description, serial_number, date_assigned, date_returned, assetId], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: 'Asset updated' });
  });
});

// Delete asset
router.delete('/assets/:assetId', (req, res) => {
  const { assetId } = req.params;
  db.query('DELETE FROM assets WHERE id = ?', [assetId], (err) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ message: 'Asset deleted' });
  });
});

module.exports = router;
