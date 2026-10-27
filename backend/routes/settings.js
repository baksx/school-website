const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
    const settingsObj = {};
    rows.forEach(row => { settingsObj[row.setting_key] = row.setting_value; });
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: 'Помилка бази даних' });
  }
});

router.post('/', authenticateToken, requirePermission('settings'), async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      const valStr = value === null || value === undefined ? '' : String(value);
      await pool.query(
        `INSERT INTO settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [key, valStr, valStr]
      );
    }
    res.json({ message: 'Налаштування успішно збережено!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;