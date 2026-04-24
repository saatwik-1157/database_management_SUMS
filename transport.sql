USE SmartUniversityDB;

-- 1. Buses Table
DROP TABLE IF EXISTS TransportSubscriptions;
DROP TABLE IF EXISTS BusStops;
DROP TABLE IF EXISTS BusRoutes;
DROP TABLE IF EXISTS Buses;

CREATE TABLE Buses (
    BusID INT AUTO_INCREMENT PRIMARY KEY,
    BusNumber VARCHAR(20) UNIQUE NOT NULL,
    DriverName VARCHAR(100),
    DriverPhone VARCHAR(20),
    Capacity INT DEFAULT 50,
    Status ENUM('Active', 'Maintenance', 'Inactive') DEFAULT 'Active'
) ENGINE=InnoDB;

-- 2. Routes Table
CREATE TABLE BusRoutes (
    RouteID INT AUTO_INCREMENT PRIMARY KEY,
    RouteName VARCHAR(100) NOT NULL,
    Source VARCHAR(100),
    Destination VARCHAR(100),
    MorningTime TIME,
    EveningTime TIME
) ENGINE=InnoDB;

-- 3. Bus Stops (Mapping Routes to Stops)
CREATE TABLE BusStops (
    StopID INT AUTO_INCREMENT PRIMARY KEY,
    RouteID INT,
    StopName VARCHAR(100) NOT NULL,
    SequenceOrder INT, -- Order of the stop in the route
    PickUpTime TIME,
    FOREIGN KEY (RouteID) REFERENCES BusRoutes(RouteID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Student Transport Subscriptions
CREATE TABLE TransportSubscriptions (
    SubscriptionID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT,
    RouteID INT,
    StopID INT,
    StartDate DATE DEFAULT (CURRENT_DATE),
    Status ENUM('Active', 'Expired', 'Cancelled') DEFAULT 'Active',
    FeeAmount DECIMAL(10, 2),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (RouteID) REFERENCES BusRoutes(RouteID),
    FOREIGN KEY (StopID) REFERENCES BusStops(StopID)
) ENGINE=InnoDB;
