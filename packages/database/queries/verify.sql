-- Smart University Management System (SUMS) - Identification & Verification Queries
USE SmartUniversityDB;

-- 1. Check Student Enrollments and Grades (Using View)
SELECT * FROM StudentTranscripts ORDER BY StudentName;

-- 2. Check Faculty Workload (Using View)
SELECT * FROM FacultyWorkload ORDER BY TotalSections DESC;

-- 3. Calculate GPA for a specific student (Using Stored Procedure)
SET @alice_gpa = 0.00;
CALL GetStudentGPA(1, @alice_gpa);
SELECT @alice_gpa AS 'Alice GPA (Student ID: 1)';

-- 4. Check Top Students (Overall Performance)
SELECT 
    s.StudentID,
    CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
    AVG(e.Grade) as GPA 
FROM Students s 
JOIN Enrollments e ON s.StudentID = e.StudentID 
WHERE e.EnrollmentStatus = 'Completed' 
GROUP BY s.StudentID 
ORDER BY GPA DESC 
LIMIT 5;

-- 5. Track Unpaid Fees
SELECT 
    s.StudentID,
    CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
    p.Amount,
    p.Status
FROM Students s
JOIN Payments p ON s.StudentID = p.StudentID
WHERE p.Status = 'Pending';

-- 6. Check Overdue Library Books (Using View)
SELECT * FROM OverdueBooks;

-- 7. Check Hostel Availability (Using View)
SELECT * FROM HostelAvailability;

-- 8. Test Library Fine Calculation Logic
-- Manually return a book late for student ID 3
UPDATE LibraryLoans 
SET ReturnDate = '2024-03-20' 
WHERE LoanID = 3;

-- Check if fine was calculated ($1 per day late from 2024-02-15 to 2024-03-20)
SELECT LoanID, StudentID, DueDate, ReturnDate, FineAmount 
FROM LibraryLoans 
WHERE LoanID = 3;

-- 9. Check Faculty Research Performance
SELECT 
    f.FacultyID,
    CONCAT(f.FirstName, ' ', f.LastName) AS FacultyName,
    COUNT(rp.PaperID) AS PaperCount,
    SUM(rp.Citations) AS TotalCitations
FROM Faculty f
JOIN ResearchPapers rp ON f.FacultyID = rp.FacultyID
GROUP BY f.FacultyID
ORDER BY TotalCitations DESC;

-- 10. Check Placement Statistics (Average Package per Dept)
SELECT 
    d.DeptName,
    COUNT(pr.ResultID) AS StudentsPlaced,
    AVG(pr.OfferedPackage) AS AveragePackage
FROM Departments d
JOIN PlacementDrives pd ON d.DeptID = pd.DeptID
JOIN PlacementResults pr ON pd.DriveID = pr.DriveID
WHERE pr.Status IN ('Placed', 'Offer Accepted')
GROUP BY d.DeptName;

-- 11. Test Graduation Eligibility (Using Stored Procedure)
-- Case 1: Student 1 (Alice - Should be eligible if No Dues)
SET @alice_elig = FALSE;
SET @alice_msg = '';
CALL CheckGraduationEligibility(1, @alice_elig, @alice_msg);
SELECT @alice_elig AS 'Alice Eligible', @alice_msg AS 'Status Message';

-- Case 2: Student 4 (David - Should fail due to Pending Dues)
SET @david_elig = FALSE;
SET @david_msg = '';
CALL CheckGraduationEligibility(4, @david_elig, @david_msg);
SELECT @david_elig AS 'David Eligible', @david_msg AS 'Status Message';

-- 12. View System Notifications (Trigger check for Urgent Maintenance)
SELECT * FROM SystemNotifications;


