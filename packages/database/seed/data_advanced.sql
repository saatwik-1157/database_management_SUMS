-- Smart University Management System (SUMS) - Advanced Data (Placements, Maintenance)
USE SmartUniversityDB;

-- 1. Companies
INSERT IGNORE INTO Companies (CompanyName, Industry, ContactPerson, Website) VALUES
('Google', 'Technology', 'Sundar Pichai', 'https://google.com'),
('Microsoft', 'Software', 'Satya Nadella', 'https://microsoft.com'),
('Tesla', 'Automobile', 'Elon Musk', 'https://tesla.com');

-- 2. Placement Drives
INSERT IGNORE INTO PlacementDrives (CompanyID, DriveDate, DeptID, JobRole, MinPackage, MaxPackage) VALUES
(1, '2024-05-15', 1, 'Software Engineer', 80000.00, 150000.00),
(2, '2024-05-20', 1, 'Systems Architect', 90000.00, 160000.00),
(3, '2024-06-01', 3, 'Mechanical Design Engineer', 70000.00, 120000.00);

-- 3. Placement Results
INSERT IGNORE INTO PlacementResults (DriveID, StudentID, Status, OfferedPackage) VALUES
(1, 1, 'Placed', 120000.00),
(1, 2, 'Offer Accepted', 125000.00),
(2, 9, 'Interview Scheduled', NULL),
(3, 5, 'Placed', 85000.00),
(3, 6, 'Rejected', NULL);

-- 4. Maintenance Logs
INSERT IGNORE INTO MaintenanceLogs (Location, Description, Priority, Status, AssignedTechnician) VALUES
('ab1 newton hall', 'AC not cooling properly', 'Medium', 'In Progress', 'Tech-John'),
('physics lab ab1 1st floor', 'Loose wiring in workbench 5', 'Urgent', 'Pending', 'Tech-Sarah'),
('Newton Center M105', 'Projector lamp burned out', 'High', 'Pending', 'Tech-Mark');
