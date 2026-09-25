USE SmartUniversityDB;

-- 1. Unified Audit Log Table
DROP TABLE IF EXISTS UnifiedAuditLog;
CREATE TABLE UnifiedAuditLog (
    AuditID INT AUTO_INCREMENT PRIMARY KEY,
    TableName VARCHAR(50) NOT NULL,
    RecordID INT,
    ActionType ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    ChangedBy VARCHAR(100),
    OldValue JSON,
    NewValue JSON,
    ChangeTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Triggers for Auditing
DROP TRIGGER IF EXISTS AuditStudentUpdate;
DROP TRIGGER IF EXISTS AuditFacultyUpdate;
DROP TRIGGER IF EXISTS AuditPaymentInsert;

DELIMITER //

-- Audit Trigger for Students (Update)
CREATE TRIGGER AuditStudentUpdate
AFTER UPDATE ON Students
FOR EACH ROW
BEGIN
    INSERT INTO UnifiedAuditLog (TableName, RecordID, ActionType, ChangedBy, OldValue, NewValue)
    VALUES (
        'Students', 
        OLD.StudentID, 
        'UPDATE', 
        USER(), 
        JSON_OBJECT('FirstName', OLD.FirstName, 'LastName', OLD.LastName, 'Email', OLD.Email),
        JSON_OBJECT('FirstName', NEW.FirstName, 'LastName', NEW.LastName, 'Email', NEW.Email)
    );
END //

-- Audit Trigger for Faculty (Update)
CREATE TRIGGER AuditFacultyUpdate
AFTER UPDATE ON Faculty
FOR EACH ROW
BEGIN
    INSERT INTO UnifiedAuditLog (TableName, RecordID, ActionType, ChangedBy, OldValue, NewValue)
    VALUES (
        'Faculty', 
        OLD.FacultyID, 
        'UPDATE', 
        USER(), 
        JSON_OBJECT('FirstName', OLD.FirstName, 'LastName', OLD.LastName, 'Rank', OLD.FacultyRank),
        JSON_OBJECT('FirstName', NEW.FirstName, 'LastName', NEW.LastName, 'Rank', NEW.FacultyRank)
    );
END //

-- Audit Trigger for Payments (Insert - High risk)
CREATE TRIGGER AuditPaymentInsert
AFTER INSERT ON Payments
FOR EACH ROW
BEGIN
    INSERT INTO UnifiedAuditLog (TableName, RecordID, ActionType, ChangedBy, NewValue)
    VALUES (
        'Payments', 
        NEW.PaymentID, 
        'INSERT', 
        USER(), 
        JSON_OBJECT('Amount', NEW.Amount, 'StudentID', NEW.StudentID, 'Status', NEW.Status)
    );
END //

DELIMITER ;
