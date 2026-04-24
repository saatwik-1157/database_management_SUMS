USE SmartUniversityDB;

-- 1. Alumni Network
DROP TABLE IF EXISTS CareerProgression;
DROP TABLE IF EXISTS Alumni;

CREATE TABLE Alumni (
    AlumniID INT PRIMARY KEY,
    StudentID INT UNIQUE,
    GraduationYear YEAR NOT NULL,
    OverallGPA DECIMAL(4, 2),
    ContactEmail VARCHAR(100),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
) ENGINE=InnoDB;

-- 2. Career Progression & Salary Tracking
CREATE TABLE CareerProgression (
    ProgressionID INT AUTO_INCREMENT PRIMARY KEY,
    AlumniID INT,
    CompanyName VARCHAR(100) NOT NULL,
    Designation VARCHAR(100),
    SalaryLPA DECIMAL(10, 2),
    StartDate DATE,
    EndDate DATE,
    IsCurrent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (AlumniID) REFERENCES Alumni(AlumniID)
) ENGINE=InnoDB;

-- 3. Stored Procedure to Promote Student to Alumni
DELIMITER //
DROP PROCEDURE IF EXISTS GraduateStudent //
CREATE PROCEDURE GraduateStudent(IN stud_id INT)
BEGIN
    DECLARE cgpa DECIMAL(4, 2);
    
    -- Calculate Final GPA
    CALL GetStudentGPA(stud_id, cgpa);
    
    -- Insert into Alumni
    INSERT INTO Alumni (AlumniID, StudentID, GraduationYear, OverallGPA, ContactEmail)
    SELECT stud_id, stud_id, YEAR(CURRENT_DATE), cgpa, Email
    FROM Students WHERE StudentID = stud_id;
    
    -- Update Student Status
    UPDATE Students SET DeptID = NULL WHERE StudentID = stud_id; -- Archived status
END //
DELIMITER ;
