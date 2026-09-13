# SUMS — Smart University Management System

A relational university management system: a MySQL schema that pushes the
integrity rules into the database itself — triggers, stored procedures, views
and foreign keys — with three interchangeable API servers and a single-page
dashboard on top.

**Built by Saatwik Sairaam Vasamsetti** (24MIC7131) · [github.com/saatwik-1157](https://github.com/saatwik-1157)

MySQL (InnoDB) · Node/Express · FastAPI · JDBC · Vanilla JS · Chart.js

## The idea

Most student CRUD projects enforce their rules in application code, which means
the rules are only as good as the one client that implements them. Here the
constraints live in the schema: a hostel cannot be over-allocated, a library
loan updates inventory, a fine accrues, a GPA aggregates — all through
triggers, procedures and views, so any of the three servers below gets the same
guarantees.

The multiple servers exist to prove that: **Express, FastAPI and raw JDBC all
speak to the same database and none of them re-implement the rules.**

The Express and FastAPI servers are the two that run out of the box; JDBC needs
a driver jar and the PHP variant needs PHP installed.

## Quick start

### 1. Create the database

Run the scripts in this order — later files depend on tables the earlier ones
create:

```bash
mysql -u root -p < init_database.sql
mysql -u root -p SmartUniversityDB < schema.sql              # 12 core tables
mysql -u root -p SmartUniversityDB < advanced_features.sql   # placements, infrastructure
mysql -u root -p SmartUniversityDB < addons.sql              # library, hostel, research
mysql -u root -p SmartUniversityDB < data_massive_v2.sql     # ~1,100 students
mysql -u root -p SmartUniversityDB < analytics.sql           # views, procedures, triggers
mysql -u root -p SmartUniversityDB < verify.sql              # integrity checks
```

### 2. Configure credentials

Create a `.env` next to the server you plan to run:

```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=SmartUniversityDB
```

### 3. Start a server

**Node / Express** — port 8000:

```bash
npm install
npm start
```

**Python / FastAPI** — port 8000, adds OpenAPI docs at `/docs`:

```bash
pip install fastapi uvicorn mysql-connector-python python-dotenv
python server.py
```

**Java / JDBC** — the reference implementation. The MySQL driver is not
vendored, so download `mysql-connector-j` and put it on the classpath:

```bash
javac JdbcServer.java
java -cp .:mysql-connector-j-9.1.0.jar JdbcServer     # ';' not ':' on Windows
```

A fourth variant, `php_server.php`, exposes the same routes if you have PHP
installed.

### 4. Serve the dashboard

```bash
python -m http.server 3000
```

Open <http://localhost:3000>.

On Windows, `START_PROJECT.bat` does steps 3 and 4 together (FastAPI on 8000,
static server on 3000) and opens the browser.

## API

All three servers expose the same read endpoints:

| Endpoint      | Returns                                        |
| ------------- | ---------------------------------------------- |
| `/campuses`   | Campus registry with status and inauguration   |
| `/students`   | Student records (`?limit=` — defaults to 1000) |
| `/faculty`    | Academic staff                                 |
| `/assets`     | Campus infrastructure inventory                |
| `/placements` | Recruitment drive results                      |
| `/workflows`  | Approval and workflow history                  |
| `/transport`  | Routes and allocations                         |
| `/alumni`     | Alumni and career outcomes                     |
| `/stats`      | Aggregate counts for the dashboard cards        |

Verify a running server with:

```bash
curl http://localhost:8000/campuses
```

## Database design

Built on InnoDB for real foreign keys and transactions.

A fully loaded database holds **43 tables, 8 views, 10 triggers and 4 stored
procedures**.

- **Triggers** (10) — hostel capacity checks, book inventory decrements on loan,
  automatic fine accrual on overdue returns.
- **Stored procedures** (4) — graduation eligibility, GPA aggregation across
  semesters.
- **Views** (8) — faculty workload and student transcripts, pre-joined so
  reporting queries stay readable.
- **Audit** — `audit_system.sql` records mutations for traceability.

Twenty-one SQL files are grouped by role: `schema` and `enterprise_core` build
structure, the `data_*` files seed at various scales, and `analytics`,
`audit_system` and `transport` add the logic layers.

## Scale

Loading every `data_*` file gives roughly **50,000 students, 10,500 faculty and
5,000 tracked assets** across 5 campuses. That is enough rows that an unindexed
join is visibly slower than an indexed one, which is the point of the exercise.

For a smaller working set, load `sample_data_v2.sql` instead of the
`data_massive_*` and `data_ultra_*` files.

## Dashboard

A single-page app that switches between admin, student and faculty views with
role-based navigation. Charts are rendered with Chart.js against live `/stats`
data — student growth, departmental performance and CGPA distribution.

## Layout

```
schema.sql, enterprise_core.sql     table structures
advanced_features.sql, addons.sql   placements, library, hostel, research
data_*.sql, sample_data_v2.sql      seed data at several scales
analytics.sql                       views, procedures, triggers
audit_system.sql                    change auditing
verify.sql                          post-load integrity checks

node_server.js      Express API        (npm start)
server.py           FastAPI API        (python server.py)
JdbcServer.java     JDBC reference     (javac + java)
php_server.php      PHP variant

index.html, app.js, style.css        the dashboard
Presentation.html, Project_Report.html, SUMS_Final_Report.md
```

## Requirements

MySQL 8.0+, and whichever runtime you pick: Node 18+, Python 3.10+, or JDK 17+.

*Academic project — VIT-AP, 2026.*
