-- Smart University Management System (SUMS) - Core Sample Data
USE SmartUniversityDB;

-- 1. Departments
INSERT IGNORE INTO Departments (DeptName, Building, Budget) VALUES
('Computer Science', 'ab1 newton hall', 500000.00),
('Electrical Engineering', 'physics lab ab1 1st floor', 450000.00),
('Mechanical Engineering', 'Newton Center', 400000.00),
('Business Administration', 'Smith Block', 350000.00);

-- 2. Faculty (10 Faculty members)
INSERT IGNORE INTO Faculty (FirstName, LastName, Email, Phone, HireDate, DeptID, FacultyRank) VALUES
('John', 'Doe', 'john.doe@univ.edu', '555-0101', '2015-08-15', 1, 'Professor'),
('Jane', 'Smith', 'jane.smith@univ.edu', '555-0102', '2016-01-10', 1, 'Associate Professor'),
('Alan', 'Turing', 'alan.turing@univ.edu', '555-0103', '2014-03-22', 1, 'Professor'),
('Nikola', 'Tesla', 'nikola.tesla@univ.edu', '555-0104', '2017-09-01', 2, 'Professor'),
('Marie', 'Curie', 'marie.curie@univ.edu', '555-0105', '2018-02-14', 2, 'Assistant Professor'),
('Isaac', 'Newton', 'isaac.newton@univ.edu', '555-0106', '2012-05-10', 3, 'Professor'),
('Richard', 'Feynman', 'richard.feynman@univ.edu', '555-0107', '2019-11-20', 3, 'Associate Professor'),
('Adam', 'Smith', 'adam.smith@univ.edu', '555-0108', '2020-06-15', 4, 'Professor'),
('Sheryl', 'Sandberg', 'sheryl.s@univ.edu', '555-0109', '2021-01-05', 4, 'Assistant Professor'),
('Elon', 'Musk', 'elon.musk@univ.edu', '555-0110', '2022-03-12', 4, 'Lecturer');

-- 3. Courses (10 Courses)
INSERT IGNORE INTO Courses (CourseID, CourseTitle, Credits, DeptID) VALUES
('CS101', 'Intro to Programming', 4, 1),
('CS202', 'Data Structures', 4, 1),
('EE101', 'Basic Electronics', 3, 2),
('EE305', 'Digital Signal Processing', 4, 2),
('ME101', 'Thermodynamics', 3, 3),
('ME202', 'Fluid Mechanics', 4, 3),
('BA101', 'Principles of Management', 3, 4),
('BA305', 'Financial Accounting', 4, 4),
('CS404', 'Artificial Intelligence', 4, 1),
('BA410', 'Strategic Marketing', 3, 4);

-- 4. Sections (20 Sections)
INSERT IGNORE INTO Sections (CourseID, FacultyID, Semester, Year, RoomNumber, Capacity) VALUES
('CS101', 1, 'Fall', 2024, 'AB1', 30),
('CS101', 2, 'Fall', 2024, 'AB1', 30),
('CS202', 3, 'Spring', 2024, 'R201', 25),
('EE101', 4, 'Fall', 2024, 'L101', 40),
('EE305', 5, 'Spring', 2024, 'Phy-1F', 20),
('ME101', 6, 'Fall', 2024, 'M101', 35),
('ME202', 7, 'Spring', 2024, 'M105', 30),
('BA101', 8, 'Fall', 2024, 'B101', 50),
('BA305', 9, 'Spring', 2024, 'B202', 40),
('CS404', 1, 'Fall', 2024, 'R303', 20);

-- 5. Students (20 Students)
INSERT IGNORE INTO Students (FirstName, LastName, Email, DOB, DeptID) VALUES
('Alice', 'Green', 'alice.g@student.edu', '2004-05-12', 1),
('Bob', 'White', 'bob.w@student.edu', '2003-11-22', 1),
('Charlie', 'Brown', 'charlie.b@student.edu', '2005-01-15', 2),
('David', 'Black', 'david.b@student.edu', '2004-09-30', 2),
('Eve', 'Adams', 'eve.a@student.edu', '2003-03-05', 3),
('Frank', 'Miller', 'frank.m@student.edu', '2005-07-20', 3),
('Grace', 'Hopper', 'grace.h@student.edu', '2004-12-10', 4),
('Harry', 'Potter', 'harry.p@student.edu', '2003-07-31', 4),
('Ivy', 'League', 'ivy.l@student.edu', '2005-02-28', 1),
('Jack', 'Sparrow', 'jack.s@student.edu', '1995-05-17', 2), -- Non-traditional
('Kate', 'Middleton', 'kate.m@student.edu', '2004-01-09', 3),
('Liam', 'Neeson', 'liam.n@student.edu', '2003-06-07', 4),
('Mia', 'Wallace', 'mia.w@student.edu', '2005-04-15', 1),
('Noah', 'Ark', 'noah.a@student.edu', '2004-08-12', 2),
('Olivia', 'Pope', 'olivia.p@student.edu', '2003-10-30', 3),
('Peter', 'Parker', 'peter.p@student.edu', '2005-08-10', 4),
('Quinn', 'Eskimo', 'quinn.e@student.edu', '2004-03-14', 1),
('Rose', 'Dawson', 'rose.d@student.edu', '1910-04-10', 2), -- Historical joke
('Sam', 'Altman', 'sam.a@student.edu', '2004-04-22', 1),
('Tania', 'Savage', 'tania.s@student.edu', '2005-09-25', 4);

-- 6. Enrollments (Some sample grades)
INSERT IGNORE INTO Enrollments (StudentID, SectionID, Grade, EnrollmentStatus) VALUES
(1, 1, 9.50, 'Completed'),
(1, 3, 10.00, 'Completed'),
(2, 1, 8.00, 'Completed'),
(2, 10, 9.75, 'Enrolled'),
(3, 4, 8.75, 'Completed'),
(4, 4, 7.75, 'Completed'),
(5, 6, 7.25, 'Enrolled'),
(6, 6, 10.00, 'Completed'),
(7, 8, 9.25, 'Completed'),
(8, 8, 8.50, 'Enrolled'),
(9, 2, 9.88, 'Completed'),
(10, 5, 6.25, 'Dropped'),
(11, 7, 9.00, 'Completed'),
(12, 9, 9.63, 'Enrolled'),
(13, 1, 8.25, 'Completed'),
(14, 4, 7.50, 'Completed'),
(15, 6, 8.00, 'Completed'),
(16, 8, 9.75, 'Enrolled'),
(17, 10, 10.00, 'Enrolled'),
(18, 5, 8.75, 'Enrolled');

-- 7. Payments
INSERT IGNORE INTO Payments (StudentID, Amount, PaymentMethod, Status) VALUES
(1, 25000.00, 'Bank Transfer', 'Paid'),
(2, 25000.00, 'Credit Card', 'Paid'),
(3, 20000.00, 'Scholarship', 'Paid'),
(4, 20000.00, 'Bank Transfer', 'Pending'),
(5, 22000.00, 'Cash', 'Paid'),
(6, 22000.00, 'Bank Transfer', 'Paid'),
(7, 18000.00, 'Scholarship', 'Paid'),
(8, 18000.00, 'Credit Card', 'Pending');
