USE SmartUniversityDB;

-- 1. Multi-Campus Support
DROP TABLE IF EXISTS Assets;

-- Campuses table created in schema.sql

-- 2. Asset & Inventory Life-Cycle
CREATE TABLE Assets (
    AssetID INT AUTO_INCREMENT PRIMARY KEY,
    CampusID INT,
    AssetName VARCHAR(150) NOT NULL,
    SerialNo VARCHAR(100) UNIQUE,
    AssetType ENUM('IT Equipment', 'Lab Hardware', 'Vehicle', 'Furniture', 'Digital License') NOT NULL,
    ConditionLevel ENUM('New', 'Excellent', 'Good', 'Fair', 'Needs Replacement') DEFAULT 'New',
    PurchaseDate DATE,
    EstimatedValue DECIMAL(12, 2),
    FOREIGN KEY (CampusID) REFERENCES Campuses(CampusID)
) ENGINE=InnoDB;

-- 3. Bureaucratic Document Workflows
DROP TABLE IF EXISTS WorkflowHistory;
DROP TABLE IF EXISTS DocumentRequests;

CREATE TABLE DocumentRequests (
    RequestID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT,
    RequestType ENUM('Official Transcript', 'NOC', 'ID Card Replacement', 'Scholarship Appeal', 'Leave of Absence') NOT NULL,
    CurrentStatus ENUM('Submitted', 'Dept Review', 'Registrar Approval', 'Completed', 'Rejected') DEFAULT 'Submitted',
    SubmissionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Priority ENUM('Standard', 'Express', 'Urgent') DEFAULT 'Standard',
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
) ENGINE=InnoDB;

CREATE TABLE WorkflowHistory (
    StepID INT AUTO_INCREMENT PRIMARY KEY,
    RequestID INT,
    ActionBy VARCHAR(100), -- User identifier
    OldStatus VARCHAR(50),
    NewStatus VARCHAR(50),
    Comments TEXT,
    ActionTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RequestID) REFERENCES DocumentRequests(RequestID)
) ENGINE=InnoDB;

-- 4. Multi-Campus Initialization Data
INSERT INTO Campuses (CampusName, City, InaugurationDate) VALUES 
('Vellore Main Campus', 'Vellore', '2017-07-15'),
('Chennai Tech Campus', 'Chennai', '2024-01-10'),
('Bhopal Engineering Campus', 'Bhopal', '2025-05-20'),
('Delhi Business Campus', 'Delhi', '2026-01-01'),
('Amaravati Central Campus', 'Amaravati', '2026-06-01');
