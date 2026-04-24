from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

app = FastAPI(title="Smart University Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "SmartUniversityDB")
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

@app.get("/")
async def root():
    return {"message": "SUMS API is online", "status": "Secure", "version": "6.1"}

@app.get("/campuses")
async def get_campuses():
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Connection Failed")
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Campuses")
    data = cursor.fetchall()
    conn.close()
    return data

@app.get("/students")
async def get_students(campus_id: Optional[int] = None, limit: int = 100):
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Connection Failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT s.*, d.DeptName, c.CampusName 
        FROM Students s 
        JOIN Departments d ON s.DeptID = d.DeptID
        JOIN Campuses c ON d.CampusID = c.CampusID
    """
    params = []
    if campus_id:
        query += " WHERE d.CampusID = %s"
        params.append(campus_id)
    query += " LIMIT %s"
    params.append(limit)
    cursor.execute(query, params)
    data = cursor.fetchall()
    conn.close()
    return data

@app.get("/faculty")
async def get_faculty(campus_id: Optional[int] = None):
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Connection Failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT f.*, d.DeptName, c.CampusName 
        FROM Faculty f 
        JOIN Departments d ON f.DeptID = d.DeptID
        JOIN Campuses c ON d.CampusID = c.CampusID
    """
    params = []
    if campus_id:
        query += " WHERE d.CampusID = %s"
        params.append(campus_id)
    cursor.execute(query, params)
    data = cursor.fetchall()
    conn.close()
    return data

@app.get("/assets")
async def get_assets(limit: int = 50):
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Connection Failed")
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT a.*, c.CampusName FROM Assets a JOIN Campuses c ON a.CampusID = c.CampusID LIMIT %s", (limit,))
    data = cursor.fetchall()
    conn.close()
    return data

@app.get("/placements")
async def get_placements():
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Connection Failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT c.CompanyName, COUNT(r.ResultID) as Offers, 
        MAX(r.OfferedPackage) as Highest, AVG(r.OfferedPackage) as Average
        FROM Companies c
        LEFT JOIN PlacementDrives d ON c.CompanyID = d.CompanyID
        LEFT JOIN PlacementResults r ON d.DriveID = r.DriveID
        GROUP BY c.CompanyID
    """
    cursor.execute(query)
    data = cursor.fetchall()
    conn.close()
    return data

@app.get("/workflows")
async def get_workflows():
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Connection Failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT r.*, s.FirstName, s.LastName
        FROM DocumentRequests r
        JOIN Students s ON r.StudentID = s.StudentID
        ORDER BY r.SubmissionDate DESC LIMIT 20
    """
    cursor.execute(query)
    data = cursor.fetchall()
    conn.close()
    return data

@app.get("/transport")
async def get_transport():
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Connection Failed")
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM BusRoutes")
    routes = cursor.fetchall()
    cursor.execute("SELECT * FROM Buses")
    buses = cursor.fetchall()
    conn.close()
    return {"routes": routes, "buses": buses}

@app.get("/alumni")
async def get_alumni():
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Connection Failed")
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT a.*, s.FirstName, s.LastName, cp.CompanyName, cp.Designation
        FROM Alumni a
        JOIN Students s ON a.StudentID = s.StudentID
        LEFT JOIN CareerProgression cp ON a.AlumniID = cp.AlumniID AND cp.IsCurrent = 1
        LIMIT 20
    """
    cursor.execute(query)
    data = cursor.fetchall()
    conn.close()
    return data

@app.get("/stats")
async def get_stats():
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=500, detail="DB Connection Failed")
    cursor = conn.cursor()
    
    stats = {}
    cursor.execute("SELECT COUNT(*) FROM Students")
    stats["student_count"] = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM Faculty")
    stats["faculty_count"] = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(Amount) FROM Payments WHERE Status='Paid'")
    stats["total_revenue"] = float(cursor.fetchone()[0] or 0)
    
    cursor.execute("SELECT COUNT(*) FROM Assets")
    stats["asset_count"] = cursor.fetchone()[0]
    
    conn.close()
    return stats

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
