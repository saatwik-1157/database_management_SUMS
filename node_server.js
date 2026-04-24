const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

const app = express();
const PORT = 8000;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'SmartUniversityDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper to send JSON or error
const sendJson = async (res, query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: err.message });
  }
};

app.get('/campuses', (req, res) => sendJson(res, 'SELECT * FROM Campuses'));
app.get('/students', (req, res) => {
  const limit = parseInt(req.query.limit) || 1000;
  sendJson(res, 'SELECT * FROM Students LIMIT ?', [limit]);
});
app.get('/faculty', (req, res) => sendJson(res, 'SELECT * FROM Faculty'));
app.get('/assets', (req, res) => sendJson(res, 'SELECT * FROM Assets'));
app.get('/placements', (req, res) => sendJson(res, 'SELECT * FROM PlacementResults'));
app.get('/workflows', (req, res) => sendJson(res, 'SELECT * FROM WorkflowHistory'));
app.get('/transport', async (req, res) => {
  try {
    const [routes] = await pool.execute('SELECT * FROM BusRoutes');
    const [buses] = await pool.execute('SELECT * FROM Buses');
    res.json({ routes, buses });
  } catch (err) {
    console.error('Transport DB error:', err);
    res.status(500).json({ error: err.message });
  }
});
app.get('/alumni', (req, res) => sendJson(res, 'SELECT * FROM Alumni'));
app.get('/stats', async (req, res) => {
  const sql = `SELECT 
        (SELECT COUNT(*) FROM Students) AS student_count,
        (SELECT COUNT(*) FROM Faculty) AS faculty_count,
        (SELECT COALESCE(SUM(Amount), 0) FROM Payments WHERE Status='Paid') AS total_revenue,
        (SELECT COUNT(*) FROM Assets) AS asset_count`;
  try {
    const [rows] = await pool.query(sql);
    res.json(rows[0]);
  } catch (err) {
    console.error('Stats DB error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js Express API listening on http://localhost:${PORT}`);
});
