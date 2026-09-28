USE SmartUniversityDB;

-- 1. Library Module
DROP TABLE IF EXISTS LibraryLoans;
DROP TABLE IF EXISTS Books;
CREATE TABLE Books (
    BookID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Author VARCHAR(100) NOT NULL,
    ISBN VARCHAR(20) UNIQUE NOT NULL,
    Category VARCHAR(50),
    TotalCopies INT DEFAULT 1,
    AvailableCopies INT DEFAULT 1 CHECK (AvailableCopies >= 0)
) ENGINE=InnoDB;

CREATE TABLE LibraryLoans (
    LoanID INT AUTO_INCREMENT PRIMARY KEY,
    BookID INT,
    StudentID INT,
    LoanDate DATE DEFAULT (CURRENT_DATE),
    DueDate DATE NOT NULL,
    ReturnDate DATE,
    FineAmount DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (BookID) REFERENCES Books(BookID),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
) ENGINE=InnoDB;

-- 2. Research & Publications Module
DROP TABLE IF EXISTS ResearchPapers;
CREATE TABLE ResearchPapers (
    PaperID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(250) NOT NULL,
    FacultyID INT,
    PublicationDate DATE,
    JournalName VARCHAR(200),
    Citations INT DEFAULT 0,
    DOI VARCHAR(100) UNIQUE,
    FOREIGN KEY (FacultyID) REFERENCES Faculty(FacultyID)
) ENGINE=InnoDB;

-- 3. Hostel Management Module
DROP TABLE IF EXISTS RoomAllocations;
DROP TABLE IF EXISTS Hostels;
CREATE TABLE Hostels (
    HostelID INT AUTO_INCREMENT PRIMARY KEY,
    HostelName VARCHAR(100) NOT NULL,
    GenderRestriction ENUM('Male', 'Female', 'Co-ed') NOT NULL,
    Capacity INT NOT NULL,
    CurrentOccupancy INT DEFAULT 0,
    ManagerName VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE RoomAllocations (
    AllocationID INT AUTO_INCREMENT PRIMARY KEY,
    HostelID INT,
    StudentID INT,
    RoomNumber VARCHAR(10),
    AllocationDate DATE DEFAULT (CURRENT_DATE),
    Status ENUM('Active', 'Vacated') DEFAULT 'Active',
    -- Removed UNIQUE(StudentID, Status) to allow history
    FOREIGN KEY (HostelID) REFERENCES Hostels(HostelID),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
) ENGINE=InnoDB;
