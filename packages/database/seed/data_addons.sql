-- Smart University Management System (SUMS) - Add-on Data (Library, Research, Hostel)
USE SmartUniversityDB;

-- 1. Library Books
INSERT IGNORE INTO Books (Title, Author, ISBN, Category, TotalCopies, AvailableCopies) VALUES
('Introduction to Algorithms', 'Cormen et al.', '978-0262033848', 'CS', 5, 5),
('Clean Code', 'Robert Martin', '978-0132350884', 'CS', 3, 3),
('The Art of Electronics', 'Horowitz', '978-0521370950', 'EE', 2, 2),
('Engineering Mechanics', 'Hibbeler', '978-0133915426', 'ME', 4, 4),
('Principles of Economics', 'Mankiw', '978-1305585126', 'BA', 10, 10);

-- 2. Library Loans (Tracking Active, Late, and Overdue states)
INSERT IGNORE INTO LibraryLoans (BookID, StudentID, LoanDate, DueDate, ReturnDate) VALUES
(1, 1, '2024-03-01', '2024-03-15', '2024-03-14'), -- Returned on time
(2, 2, '2024-03-10', '2024-03-24', NULL),         -- Active loan
(3, 3, '2024-02-01', '2024-02-15', '2024-02-20'), -- Returned late (Fines apply)
(4, 4, '2024-03-05', '2024-03-19', NULL),         -- Overdue loan
(5, 5, '2024-03-20', '2024-04-03', NULL);         -- Active loan

-- 3. Research Papers
INSERT IGNORE INTO ResearchPapers (Title, FacultyID, PublicationDate, JournalName, Citations, DOI) VALUES
('Quantum Computing in 2024', 1, '2024-01-15', 'IEEE Quantum', 50, '10.1101/qc2024'),
('Efficient Solar Cells', 4, '2023-11-20', 'Energy Today', 120, '10.1102/esc2023'),
('Advanced Thermodynamics', 6, '2024-02-10', 'Physics Letters', 30, '10.1103/at2024'),
('Market Trends in Tech', 8, '2024-03-01', 'Business Weekly', 15, '10.1104/mtt2024'),
('AI in Mechanical Design', 7, '2024-03-12', 'Mech-AI Journal', 45, '10.1105/aimd2024');

-- 4. Hostels
INSERT IGNORE INTO Hostels (HostelName, GenderRestriction, Capacity, ManagerName) VALUES
('Edison Hall', 'Male', 100, 'Michael Faraday'),
('Franklin Hall', 'Female', 100, 'Rosalind Franklin');

-- 5. Room Allocations
INSERT IGNORE INTO RoomAllocations (HostelID, StudentID, RoomNumber) VALUES
(1, 2, 'E101'),
(1, 4, 'E102'),
(2, 1, 'F101'),
(2, 3, 'F102'),
(1, 10, 'E103');
