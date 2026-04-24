USE SmartUniversityDB;

-- 1. Transport Data
INSERT IGNORE INTO Buses (BusNumber, DriverName, DriverPhone, Capacity, Status) VALUES
('BUS-001', 'Rajesh Kumar', '+91-9876543210', 50, 'Active'),
('BUS-002', 'Suresh Raina', '+91-9876543211', 40, 'Active'),
('BUS-003', 'Amitabh B.', '+91-9876543212', 60, 'Maintenance');

INSERT IGNORE INTO BusRoutes (RouteName, Source, Destination, MorningTime, EveningTime) VALUES
('Vellore - Katpadi', 'Main Gate', 'Katpadi Station', '07:30:00', '17:30:00'),
('Vellore - Silk Mill', 'Main Gate', 'Silk Mill', '08:00:00', '18:00:00'),
('Vellore - CMC', 'Main Gate', 'CMC Hospital', '08:30:00', '16:30:00');

-- 2. Placement Data
INSERT IGNORE INTO Companies (CompanyName, Industry, Website) VALUES
('Google', 'Technology', 'https://google.com'),
('Microsoft', 'Technology', 'https://microsoft.com'),
('Amazon', 'E-commerce', 'https://amazon.com'),
('TCS', 'IT Services', 'https://tcs.com');

INSERT IGNORE INTO PlacementDrives (CompanyID, DriveDate, Location, MaxPackage) VALUES
(1, '2025-10-15', 'Main Auditorium', 50.50),
(2, '2025-10-20', 'Hall 4', 45.00),
(3, '2025-11-05', 'Placement Cell', 35.00);

INSERT IGNORE INTO PlacementResults (DriveID, StudentID, OfferedPackage, Status) VALUES
(1, 1, 48.50, 'Offer Accepted'),
(1, 2, 42.00, 'Offer Accepted'),
(2, 3, 40.00, 'Offer Accepted'),
(3, 4, 32.00, 'Interview Scheduled');

-- 3. Alumni Data
INSERT IGNORE INTO Alumni (AlumniID, StudentID, GraduationYear, OverallGPA, ContactEmail) VALUES
(1, 5, 2022, 8.5, 'eve.a@alumni.sums.edu'),
(2, 6, 2021, 9.0, 'frank.m@alumni.sums.edu'),
(3, 7, 2023, 7.8, 'grace.h@alumni.sums.edu');

INSERT IGNORE INTO CareerProgression (AlumniID, CompanyName, Designation, StartDate, IsCurrent) VALUES
(1, 'Meta', 'Senior Engineer', '2022-07-01', 1),
(2, 'Netflix', 'Product Manager', '2021-08-15', 1);

-- 4. Workflow Data
INSERT IGNORE INTO DocumentRequests (StudentID, RequestType, Priority, CurrentStatus) VALUES
(1, 'Official Transcript', 'Urgent', 'Registrar Approval'),
(2, 'ID Card Replacement', 'Standard', 'Dept Review'),
(3, 'NOC', 'Express', 'Submitted');
