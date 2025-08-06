const express = require('express');
const router = express.Router();
const db = require('../db'); // assumes you're using db.promise()

// ✅ Get all assets for an employee
router.get('/employees/:id/assets', async (req, res) => {
  const { id } = req.params;
  console.log("Getting assets for employee:", id);

  try {
    const [results] = await db.query('SELECT * FROM assets WHERE employee_id = ?', [id]);
    console.log("Assets fetched:", results);
    res.json(results);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Add asset to employee
router.post('/employees/:id/assets', async (req, res) => {
  const { id } = req.params;
  const { asset_category, asset_description, serial_number, date_assigned, date_returned } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO assets (employee_id, asset_category, asset_description, serial_number, date_assigned, date_returned)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, asset_category, asset_description, serial_number, date_assigned, date_returned]
    );

    res.json({ message: 'Asset added', asset_id: result.insertId });
  } catch (err) {
    console.error("Insert Error:", err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// ✅ Update asset
router.put('/assets/:assetId', async (req, res) => {
  const { assetId } = req.params;
  const { asset_category, asset_description, serial_number, date_assigned, date_returned } = req.body;

  try {
    await db.query(
      `UPDATE assets SET asset_category = ?, asset_description = ?, serial_number = ?, date_assigned = ?, date_returned = ?
       WHERE id = ?`,
      [asset_category, asset_description, serial_number, date_assigned, date_returned, assetId]
    );

    res.json({ message: 'Asset updated' });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// ✅ Delete asset
router.delete('/assets/:assetId', async (req, res) => {
  const { assetId } = req.params;

  try {
    await db.query('DELETE FROM assets WHERE id = ?', [assetId]);
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
