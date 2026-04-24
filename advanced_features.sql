USE SmartUniversityDB;

-- 1. Career & Placement Module
DROP TABLE IF EXISTS PlacementResults;
DROP TABLE IF EXISTS PlacementDrives;
DROP TABLE IF EXISTS Companies;
CREATE TABLE Companies (
    CompanyID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyName VARCHAR(100) NOT NULL UNIQUE,
    Industry VARCHAR(50),
    ContactPerson VARCHAR(100),
    Website VARCHAR(150)
) ENGINE=InnoDB;

CREATE TABLE PlacementDrives (
    DriveID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT,
    DriveDate DATE NOT NULL,
    Location VARCHAR(100) DEFAULT 'Main Campus Auditorium',
    DeptID INT,
    JobRole VARCHAR(100),
    MinPackage DECIMAL(10, 2),
    MaxPackage DECIMAL(10, 2),
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID),
    FOREIGN KEY (DeptID) REFERENCES Departments(DeptID)
) ENGINE=InnoDB;

CREATE TABLE PlacementResults (
    ResultID INT AUTO_INCREMENT PRIMARY KEY,
    DriveID INT,
    StudentID INT,
    OfferDate DATE DEFAULT (CURRENT_DATE),
    Status ENUM('Placed', 'Interview Scheduled', 'Rejected', 'Offer Accepted') DEFAULT 'Interview Scheduled',
    OfferedPackage DECIMAL(12, 2),
    FOREIGN KEY (DriveID) REFERENCES PlacementDrives(DriveID),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
) ENGINE=InnoDB;

-- 2. Infrastructure Maintenance Module
DROP TABLE IF EXISTS MaintenanceLogs;
CREATE TABLE MaintenanceLogs (
    RequestID INT AUTO_INCREMENT PRIMARY KEY,
    Location VARCHAR(100) NOT NULL, -- e.g. "Turing Hall Room 101"
    Description TEXT NOT NULL,
    Priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Low',
    ReportedDate DATE DEFAULT (CURRENT_DATE),
    Status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    AssignedTechnician VARCHAR(100)
) ENGINE=InnoDB;

-- 3. Notification Log Table
DROP TABLE IF EXISTS SystemNotifications;
CREATE TABLE SystemNotifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT,
    FacultyID INT,
    Message TEXT NOT NULL,
    NotificationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsRead BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (FacultyID) REFERENCES Faculty(FacultyID)
) ENGINE=InnoDB;
