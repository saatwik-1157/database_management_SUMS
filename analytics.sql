USE SmartUniversityDB;

-- ==========================================
-- 1. VIEWS (Read-only Analytics Layers)
-- ==========================================

DROP VIEW IF EXISTS StudentTranscripts;
DROP VIEW IF EXISTS FacultyWorkload;
DROP VIEW IF EXISTS OverdueBooks;
DROP VIEW IF EXISTS HostelAvailability;

-- Displays a clean view of all completed courses for each student
CREATE VIEW StudentTranscripts AS
SELECT 
    s.StudentID,
    CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
    c.CourseID,
    c.CourseTitle,
    e.Grade,
    sec.Semester,
    sec.Year
FROM Students s
JOIN Enrollments e ON s.StudentID = e.StudentID
JOIN Sections sec ON e.SectionID = sec.SectionID
JOIN Courses c ON sec.CourseID = c.CourseID
WHERE e.EnrollmentStatus = 'Completed';

-- Shows how many sections each faculty member is teaching
CREATE VIEW FacultyWorkload AS
SELECT 
    f.FacultyID,
    CONCAT(f.FirstName, ' ', f.LastName) AS FacultyName,
    d.DeptName,
    COUNT(s.SectionID) AS TotalSections
FROM Faculty f
LEFT JOIN Sections s ON f.FacultyID = s.FacultyID
JOIN Departments d ON f.DeptID = d.DeptID
GROUP BY f.FacultyID, d.DeptName;

-- Lists overdue books (Depends on addons.sql)
CREATE VIEW OverdueBooks AS
SELECT 
    l.LoanID,
    s.StudentID,
    CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
    b.Title AS BookTitle,
    l.DueDate,
    DATEDIFF(CURRENT_DATE, l.DueDate) AS DaysOverdue
FROM LibraryLoans l
JOIN Students s ON l.StudentID = s.StudentID
JOIN Books b ON l.BookID = b.BookID
WHERE l.ReturnDate IS NULL AND l.DueDate < CURRENT_DATE;

-- Shows occupancy stats (Depends on addons.sql)
CREATE VIEW HostelAvailability AS
SELECT 
    HostelName,
    GenderRestriction,
    Capacity,
    CurrentOccupancy,
    (Capacity - CurrentOccupancy) AS RoomsAvailable
FROM Hostels;

-- ==========================================
-- 2. STORED PROCEDURES (Operational Logic)
-- ==========================================

DROP PROCEDURE IF EXISTS GetStudentGPA;
DROP PROCEDURE IF EXISTS CheckGraduationEligibility;

DELIMITER //

-- Calculates average grade on a 10.0 scale
CREATE PROCEDURE GetStudentGPA(IN stud_id INT, OUT gpa DECIMAL(4,2))
BEGIN
    SELECT AVG(Grade) INTO gpa
    FROM Enrollments
    WHERE StudentID = stud_id AND EnrollmentStatus = 'Completed';
    
    IF gpa IS NULL THEN SET gpa = 0.00; END IF;
END //

-- Checks graduation (Threshold: 10 credits and 6.5/10.0 GPA)
CREATE PROCEDURE CheckGraduationEligibility(IN stud_id INT, OUT is_eligible BOOLEAN, OUT msg TEXT)
BEGIN
    DECLARE total_credits INT DEFAULT 0;
    DECLARE current_gpa DECIMAL(4,2) DEFAULT 0.00;
    DECLARE pending_dues INT DEFAULT 0;
    
    -- Sum credits for unique courses completed
    SELECT SUM(Credits) INTO total_credits
    FROM (
        SELECT DISTINCT c.CourseID, c.Credits
        FROM Enrollments e
        JOIN Sections s ON e.SectionID = s.SectionID
        JOIN Courses c ON s.CourseID = c.CourseID
        WHERE e.StudentID = stud_id AND e.EnrollmentStatus = 'Completed'
    ) AS UniqueCredits;
    
    CALL GetStudentGPA(stud_id, current_gpa);
    
    SELECT COUNT(*) INTO pending_dues FROM Payments WHERE StudentID = stud_id AND Status = 'Pending';
    
    -- Adjusted for 10.0 Scale: Req 6.5 GPA
    IF total_credits >= 10 AND current_gpa >= 6.5 THEN
        IF pending_dues = 0 THEN
            SET is_eligible = TRUE;
            SET msg = 'Eligible for graduation.';
        ELSE
            SET is_eligible = FALSE;
            SET msg = 'Ineligible: Pending financial dues.';
        END IF;
    ELSE
        SET is_eligible = FALSE;
        SET msg = CONCAT('Ineligible: Low Credits (', total_credits, ') or GPA (', current_gpa, ').');
    END IF;
END //

DELIMITER ;

-- ==========================================
-- 3. TRIGGERS (Automated Business Rules)
-- ==========================================

DROP TRIGGER IF EXISTS BeforeEnrollmentInsert;
DROP TRIGGER IF EXISTS BeforePaymentInsert;
DROP TRIGGER IF EXISTS BeforeBookLoan;
DROP TRIGGER IF EXISTS AfterBookLoan;
DROP TRIGGER IF EXISTS BeforeBookReturn;
DROP TRIGGER IF EXISTS AfterBookReturn;
DROP TRIGGER IF EXISTS AfterMaintenanceInsert;

DELIMITER //

-- Capacity Control
CREATE TRIGGER BeforeEnrollmentInsert
BEFORE INSERT ON Enrollments
FOR EACH ROW
BEGIN
    DECLARE current_count INT;
    DECLARE max_cap INT;
    SELECT COUNT(*) INTO current_count FROM Enrollments WHERE SectionID = NEW.SectionID AND EnrollmentStatus IN ('Enrolled', 'Completed');
    SELECT Capacity INTO max_cap FROM Sections WHERE SectionID = NEW.SectionID;
    IF current_count >= max_cap THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Section Capacity Reached.';
    END IF;
END //

-- Auto-Pay for Scholarships
CREATE TRIGGER BeforePaymentInsert
BEFORE INSERT ON Payments
FOR EACH ROW
BEGIN
    IF NEW.PaymentMethod = 'Scholarship' THEN SET NEW.Status = 'Paid'; END IF;
END //

-- Library Availability Check (Error 1644)
CREATE TRIGGER BeforeBookLoan
BEFORE INSERT ON LibraryLoans
FOR EACH ROW
BEGIN
    DECLARE available INT;
    SELECT AvailableCopies INTO available FROM Books WHERE BookID = NEW.BookID;
    IF available IS NULL OR available <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: No copies of this book are currently available.';
    END IF;
END //

-- Library Inventory Management
CREATE TRIGGER AfterBookLoan
AFTER INSERT ON LibraryLoans
FOR EACH ROW
BEGIN
    UPDATE Books SET AvailableCopies = AvailableCopies - 1 WHERE BookID = NEW.BookID;
END //

-- Library Fine Calculation (BEFORE UPDATE to modify NEW)
CREATE TRIGGER BeforeBookReturn
BEFORE UPDATE ON LibraryLoans
FOR EACH ROW
BEGIN
    IF OLD.ReturnDate IS NULL AND NEW.ReturnDate IS NOT NULL THEN
        IF NEW.ReturnDate > NEW.DueDate THEN
            SET NEW.FineAmount = DATEDIFF(NEW.ReturnDate, NEW.DueDate) * 5.00; -- ₹5 per day
        END IF;
    END IF;
END //

-- Update Books on Return
CREATE TRIGGER AfterBookReturn
AFTER UPDATE ON LibraryLoans
FOR EACH ROW
BEGIN
    IF OLD.ReturnDate IS NULL AND NEW.ReturnDate IS NOT NULL THEN
        UPDATE Books SET AvailableCopies = AvailableCopies + 1 WHERE BookID = NEW.BookID;
    END IF;
END //

-- Urgent System Alerts
CREATE TRIGGER AfterMaintenanceInsert
AFTER INSERT ON MaintenanceLogs
FOR EACH ROW
BEGIN
    IF NEW.Priority = 'Urgent' THEN
        INSERT INTO SystemNotifications (FacultyID, Message)
        SELECT FacultyID, CONCAT('URGENT: Maintenance at ', NEW.Location)
        FROM Faculty WHERE FacultyRank = 'Professor' LIMIT 1;
    END IF;
END //

DELIMITER ;

-- ==========================================
-- 4. COMPLEX ANALYTICS (Management Tier)
-- ==========================================

-- Predicts students at risk of failure based on participation and attendance
CREATE OR REPLACE VIEW AtRiskStudents AS
SELECT 
    s.StudentID,
    CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
    d.DeptName,
    AVG(e.Grade) as CurrentGPA,
    (SELECT AVG(Status = 'Present') FROM Attendance a WHERE a.StudentID = s.StudentID) * 100 AS AttendancePercentage,
    CASE 
        WHEN (SELECT AVG(Status = 'Present') FROM Attendance a WHERE a.StudentID = s.StudentID) < 0.75 THEN 'High Risk (Attendance)'
        WHEN AVG(e.Grade) < 5.0 THEN 'High Risk (Academic)'
        ELSE 'On Track'
    END AS RiskLevel
FROM Students s
JOIN Enrollments e ON s.StudentID = e.StudentID
JOIN Departments d ON s.DeptID = d.DeptID
GROUP BY s.StudentID, d.DeptName;

-- Financial Heatmap: Dept Budget vs Revenue Generated
CREATE OR REPLACE VIEW DeptFinancialPerformance AS
SELECT 
    d.DeptName,
    d.Budget,
    SUM(p.Amount) AS TotalRevenueCollected,
    (SUM(p.Amount) - d.Budget) AS NetProfitMargin,
    CASE 
        WHEN (SUM(p.Amount) - d.Budget) > 0 THEN 'Self-Sufficient'
        ELSE 'Subsidized'
    END AS FinancialStatus
FROM Departments d
LEFT JOIN Students s ON d.DeptID = s.DeptID
LEFT JOIN Payments p ON s.StudentID = p.StudentID AND p.Status = 'Paid'
GROUP BY d.DeptID, d.DeptName, d.Budget;

-- ==========================================
-- 5. ULTRA-ENTERPRISE ANALYTICS (Global Tier)
-- ==========================================

-- Cross-Campus Yield: Comparing student performance across locations
CREATE OR REPLACE VIEW GlobalCampusYield AS
SELECT 
    c.CampusName,
    COUNT(s.StudentID) AS TotalStudents,
    AVG(e.Grade) AS AverageCampusGPA,
    SUM(p.Amount) AS TotalCampusRevenue
FROM Campuses c
LEFT JOIN Departments d ON c.CampusID = d.CampusID
LEFT JOIN Students s ON d.DeptID = s.DeptID
LEFT JOIN Enrollments e ON s.StudentID = e.StudentID
LEFT JOIN Payments p ON s.StudentID = p.StudentID AND p.Status = 'Paid'
GROUP BY c.CampusID, c.CampusName;

-- Asset Health Summary: tracking IT and Lab hardware across campuses
CREATE OR REPLACE VIEW AssetHealthSummary AS
SELECT 
    c.CampusName,
    a.AssetType,
    COUNT(*) AS TotalAssets,
    SUM(a.EstimatedValue) AS InventoryValue,
    SUM(CASE WHEN a.ConditionLevel IN ('Needs Replacement', 'Fair') THEN 1 ELSE 0 END) AS MaintenanceRequired
FROM Campuses c
JOIN Assets a ON c.CampusID = a.CampusID
GROUP BY c.CampusName, a.AssetType;


