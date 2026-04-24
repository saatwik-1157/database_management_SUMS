-- Smart University Management System (SUMS) - Master Initialization Script
-- Execute this script to set up the entire database from scratch.
-- 
-- NOTE FOR MYSQL WORKBENCH USERS:
-- The 'SOURCE' command is only supported in the 'mysql' command-line client.
-- To run this in Workbench:
-- 1. Open and run 'schema.sql' first.
-- 2. Open and run 'enterprise_core.sql', 'advanced_features.sql', etc. in the order below.
-- OR use the 'Server' -> 'Data Import' feature if files are structured as a dump.
-- For a quick setup, copy-paste the contents of each file in order into a single query tab.

-- 1. Core Schema and Base Tables
SOURCE schema.sql;

-- 1.1 Enterprise Core (Campuses, Assets, Workflows)
SOURCE enterprise_core.sql;

-- 2. Advanced Features and Modules
SOURCE advanced_features.sql;
SOURCE addons.sql;
SOURCE transport.sql;
SOURCE academic_pro.sql;

-- 3. Massive Enterprise Data V6.0 (50,000+ Records)
-- NOTE: We run this BEFORE analytics & audit triggers to prevent massive lag!
SOURCE data_massive_v6.sql;

-- 4. Analytics, Views, Procedures, & Triggers
SOURCE analytics.sql;

-- 5. Alumni Network (Depends on analytics.sql procedures)
SOURCE alumni_career.sql;

-- 6. Audit System (Run last so massive data injection isn't audited)
SOURCE audit_system.sql;

-- 7. Verification
SOURCE verify.sql;

SELECT 'SMART UNIVERSITY V6.0 (MULTI-CAMPUS) INITIALIZED SUCCESSFULLY' as 'Status';
