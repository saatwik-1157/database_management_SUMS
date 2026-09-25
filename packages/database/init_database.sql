-- Smart University Management System (SUMS) - Master Initialization Script
-- Execute this script to set up the entire database from scratch.
--
-- SOURCE paths are resolved against the mysql client's working directory,
-- so run this from packages/database:
--   cd packages/database && mysql -u root -p < init_database.sql
--
-- NOTE FOR MYSQL WORKBENCH USERS:
-- The 'SOURCE' command is only supported in the 'mysql' command-line client.
-- To run this in Workbench:
-- 1. Open and run 'schema/schema.sql' first.
-- 2. Open and run 'schema/enterprise_core.sql', 'modules/advanced_features.sql', etc. in the order below.
-- OR use the 'Server' -> 'Data Import' feature if files are structured as a dump.
-- For a quick setup, copy-paste the contents of each file in order into a single query tab.

-- 1. Core Schema and Base Tables
SOURCE schema/schema.sql;

-- 1.1 Enterprise Core (Campuses, Assets, Workflows)
SOURCE schema/enterprise_core.sql;

-- 2. Advanced Features and Modules
SOURCE modules/advanced_features.sql;
SOURCE modules/addons.sql;
SOURCE modules/transport.sql;
SOURCE modules/academic_pro.sql;

-- 3. Massive Enterprise Data V6.0 (50,000+ Records)
-- NOTE: We run this BEFORE analytics & audit triggers to prevent massive lag!
SOURCE seed/data_massive_v6.sql;

-- 4. Analytics, Views, Procedures, & Triggers
SOURCE modules/analytics.sql;

-- 5. Alumni Network (Depends on analytics.sql procedures)
SOURCE modules/alumni_career.sql;

-- 6. Audit System (Run last so massive data injection isn't audited)
SOURCE modules/audit_system.sql;

-- 7. Verification
SOURCE queries/verify.sql;

SELECT 'SMART UNIVERSITY V6.0 (MULTI-CAMPUS) INITIALIZED SUCCESSFULLY' as 'Status';
