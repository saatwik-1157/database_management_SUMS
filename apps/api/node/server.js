const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
// .env lives at the repository root, three levels up from apps/api/node/.
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 8000;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'SmartUniversityDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// CORS: the dashboard is served from another origin (python -m http.server
// on :3000), so without these headers the browser blocks every fetch.
// Mirrors the FastAPI server's allow-all CORSMiddleware.
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
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
// The queries below return the same shapes as the FastAPI server
// (apps/api/python/server.py), which are the fields apps/web/app.js reads:
// DeptName/CampusName on students, faculty and assets, per-company
// placement aggregates, document requests with the student's name, and
// alumni with their current role.
app.get('/students', (req, res) => {
  const limit = Math.max(1, parseInt(req.query.limit) || 1000);
  sendJson(res, `SELECT s.*, d.DeptName, c.CampusName
    FROM Students s
    JOIN Departments d ON s.DeptID = d.DeptID
    JOIN Campuses c ON d.CampusID = c.CampusID
    LIMIT ?`, [limit]);
});
app.get('/faculty', (req, res) => sendJson(res, `SELECT f.*, d.DeptName, c.CampusName
    FROM Faculty f
    JOIN Departments d ON f.DeptID = d.DeptID
    JOIN Campuses c ON d.CampusID = c.CampusID`));
app.get('/assets', (req, res) => sendJson(res, `SELECT a.*, c.CampusName
    FROM Assets a JOIN Campuses c ON a.CampusID = c.CampusID`));
app.get('/placements', (req, res) => sendJson(res, `SELECT c.CompanyName, COUNT(r.ResultID) AS Offers,
    MAX(r.OfferedPackage) AS Highest, AVG(r.OfferedPackage) AS Average
    FROM Companies c
    LEFT JOIN PlacementDrives d ON c.CompanyID = d.CompanyID
    LEFT JOIN PlacementResults r ON d.DriveID = r.DriveID
    GROUP BY c.CompanyID`));
// WorkflowHistory is never seeded; the dashboard's workflow desk lists the
// document requests themselves.
app.get('/workflows', (req, res) => sendJson(res, `SELECT r.*, s.FirstName, s.LastName
    FROM DocumentRequests r
    JOIN Students s ON r.StudentID = s.StudentID
    ORDER BY r.SubmissionDate DESC LIMIT 20`));
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
app.get('/alumni', (req, res) => sendJson(res, `SELECT a.*, s.FirstName, s.LastName, cp.CompanyName, cp.Designation
    FROM Alumni a
    JOIN Students s ON a.StudentID = s.StudentID
    LEFT JOIN CareerProgression cp ON a.AlumniID = cp.AlumniID AND cp.IsCurrent = 1
    LIMIT 20`));
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
