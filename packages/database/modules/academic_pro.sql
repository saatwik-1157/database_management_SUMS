USE SmartUniversityDB;

-- 1. Course Prerequisites
DROP TABLE IF EXISTS CourseFeedback;
DROP TABLE IF EXISTS AssessmentScores;
DROP TABLE IF EXISTS CoursePrerequisites;

CREATE TABLE CoursePrerequisites (
    CourseID VARCHAR(10),
    PrereqCourseID VARCHAR(10),
    MinGradeRequired DECIMAL(4, 2) DEFAULT 5.00,
    PRIMARY KEY (CourseID, PrereqCourseID),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE,
    FOREIGN KEY (PrereqCourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Detailed Assessment Scores (Breakdown of Grade)
CREATE TABLE AssessmentScores (
    ScoreID INT AUTO_INCREMENT PRIMARY KEY,
    EnrollmentID INT,
    AssessmentType ENUM('Assignment', 'Midterm', 'Final', 'Quiz', 'Project') NOT NULL,
    ScoreObtained DECIMAL(5, 2),
    MaxScore DECIMAL(5, 2) DEFAULT 100.00,
    AssessmentDate DATE,
    FOREIGN KEY (EnrollmentID) REFERENCES Enrollments(EnrollmentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Student Feedback for Courses
CREATE TABLE CourseFeedback (
    FeedbackID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT,
    SectionID INT,
    CourseRating INT CHECK (CourseRating BETWEEN 1 AND 5),
    FacultyRating INT CHECK (FacultyRating BETWEEN 1 AND 5),
    Comments TEXT,
    SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (SectionID) REFERENCES Sections(SectionID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Stored Procedure to check Prerequisite Eligibility
DELIMITER //
DROP PROCEDURE IF EXISTS CheckPrereqEligibility //
CREATE PROCEDURE CheckPrereqEligibility(IN stud_id INT, IN course_id VARCHAR(10), OUT is_eligible BOOLEAN)
BEGIN
    DECLARE total_prereqs INT;
    DECLARE cleared_prereqs INT;
    
    -- Count total prerequisites for the course
    SELECT COUNT(*) INTO total_prereqs FROM CoursePrerequisites WHERE CourseID = course_id;
    
    IF total_prereqs = 0 THEN
        SET is_eligible = TRUE;
    ELSE
        -- Count how many prerequisites the student has cleared with the minimum required grade
        SELECT COUNT(DISTINCT cp.PrereqCourseID) INTO cleared_prereqs
        FROM Enrollments e
        JOIN CoursePrerequisites cp ON e.SectionID IN (SELECT SectionID FROM Sections WHERE CourseID = cp.PrereqCourseID)
        WHERE e.StudentID = stud_id 
          AND cp.CourseID = course_id 
          AND e.Grade >= cp.MinGradeRequired
          AND e.EnrollmentStatus = 'Completed';
          
        IF cleared_prereqs = total_prereqs THEN
            SET is_eligible = TRUE;
        ELSE
            SET is_eligible = FALSE;
        END IF;
    END IF;
END //
DELIMITER ;
