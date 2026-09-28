# SUMS — Smart University Management System

A relational university management system: a MySQL schema that pushes the
integrity rules into the database itself — triggers, stored procedures, views
and foreign keys — with interchangeable API servers and a single-page
dashboard on top.

**Built by Saatwik Sairaam Vasamsetti** (24MIC7131) · [github.com/saatwik-1157](https://github.com/saatwik-1157)

MySQL (InnoDB) · Node/Express · FastAPI · JDBC · PHP/PDO · Vanilla JS · Chart.js

## The idea

Most student CRUD projects enforce their rules in application code, which means
the rules are only as good as the one client that implements them. Here the
constraints live in the schema: a course section cannot be over-enrolled, a
library loan updates inventory, a fine accrues, a GPA aggregates — all through
triggers, procedures and views, so any of the servers below gets the same
guarantees.

The multiple servers exist to prove that: **Express, FastAPI, raw JDBC and PHP
all speak to the same database and none of them re-implement the rules.**

The Express and FastAPI servers are the two that run out of the box; JDBC needs
a driver jar and the PHP variant needs PHP and Composer installed.

## Features

- **Dashboard** — one page that switches between Admin, Student and Faculty
  portals with role-based navigation, plus a presentation ("Showroom") mode.
  Charts are rendered with Chart.js from live API data.
- **REST API** — the same read endpoints implemented four times
  (Express, FastAPI, JDBC, PHP).
- **Database-enforced rules** — 10 triggers (section capacity, library
  inventory, overdue fines, auditing), 4 stored procedures (GPA aggregation,
  graduation eligibility, prerequisite checks, graduating a student) and
  8 views (transcripts, faculty workload, hostel availability, …).
- **Change auditing** — `audit_system.sql` records mutations into a unified
  audit log.
- **Seed data at several scales**, plus a generator for the 50,000-student set.

## Architecture

```
  Browser
  apps/web  (index.html + app.js + style.css, Chart.js from CDN)
  served as static files, e.g. http://localhost:3000
        |
        |  fetch() JSON  ->  API_BASE = http://localhost:8000
        v
  +--------------------------------------------------------------+
  |  apps/api  — pick ONE, all listen on port 8000               |
  |    node/server.js      Express + mysql2                      |
  |    python/server.py    FastAPI + mysql-connector (CORS on)   |
  |    java/JdbcServer.java  JDK HttpServer + JDBC               |
  |    php/server.php      PHP built-in server + PDO             |
  +--------------------------------------------------------------+
        |
        |  SQL (credentials from the root .env)
        v
  MySQL 8  —  database SmartUniversityDB
  tables + views + stored procedures + triggers
  built from packages/database by scripts/setup_db.py
```

## Project structure

```
.
├── apps/
│   ├── web/                 single-page dashboard (index.html, app.js, style.css)
│   └── api/
│       ├── node/            Express server        (npm start / npm run api)
│       ├── python/          FastAPI server        (npm run api:python)
│       ├── java/            JDBC reference server (javac + java)
│       └── php/             PHP/PDO variant       (+ composer.json)
├── packages/
│   └── database/
│       ├── schema/          core tables (schema.sql creates the database)
│       ├── modules/         feature DDL: tables, views, procedures, triggers
│       ├── seed/            INSERT data at several scales
│       ├── queries/         post-load verification queries
│       └── init_database.sql  mysql-client SOURCE script (same order, minus two seed files)
├── scripts/
│   ├── setup_db.py          builds the whole database in the canonical order
│   ├── test_db.py           connectivity check (counts Students)
│   ├── generate_data.py     regenerates seed/data_massive_v6.sql
│   └── generate_ai_ppt.py   unrelated "AI impact" slide generator (see docs/README.md)
├── docs/                    project report (PDF/HTML/Markdown) and slide deck
├── .env.example             template for the root .env
├── package.json             Node dependencies and npm scripts
└── START_PROJECT.bat        Windows one-click start (FastAPI + static server)
```

## Tech actually used

| Layer    | Technology                                                                 |
| -------- | -------------------------------------------------------------------------- |
| Database | MySQL 8.0, InnoDB                                                          |
| API      | Node 18+ with Express 4 and mysql2 · Python 3.10+ with FastAPI, uvicorn, mysql-connector-python, python-dotenv · JDK 17+ with `com.sun.net.httpserver` and MySQL Connector/J · PHP with PDO and vlucas/phpdotenv |
| Frontend | HTML, CSS, vanilla JavaScript, Chart.js, Font Awesome (CDN)                |
| Tooling  | Python scripts driving the `mysql` command-line client                     |

## Setup

### 1. Prerequisites

MySQL 8.0+ with the `mysql` client, and whichever API runtime you pick:
Node 18+, Python 3.10+, JDK 17+, or PHP with Composer. Python is also needed
for the database scripts and the static file server.

### 2. Configure credentials

Copy the template and fill in your MySQL password. There is one `.env`, at the
repository root; every server and script reads it from there.

```bash
cp .env.example .env
```

```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=SmartUniversityDB
```

### 3. Install dependencies

```bash
npm install                                                   # Express server
pip install fastapi uvicorn mysql-connector-python python-dotenv  # FastAPI + scripts
```

### 4. Create the database

> **Warning:** `schema/schema.sql` begins with
> `DROP DATABASE IF EXISTS SmartUniversityDB`. Running setup wipes any
> existing copy of that database.

```bash
npm run db:setup            # same as: python scripts/setup_db.py
```

`setup_db.py` looks for `mysql.exe` under
`C:\Program Files\MySQL\MySQL Server 8.0\bin\` and otherwise uses `mysql` from
`PATH`. It runs the files in this order — later files depend on tables the
earlier ones create:

| #  | File (under `packages/database/`) | Role                                            |
| -- | --------------------------------- | ----------------------------------------------- |
| 1  | `schema/schema.sql`               | drops/creates the database; 12 core tables      |
| 2  | `schema/enterprise_core.sql`      | assets, document requests, workflow history     |
| 3  | `modules/advanced_features.sql`   | placements, infrastructure                      |
| 4  | `modules/addons.sql`              | library, hostel, research                       |
| 5  | `modules/transport.sql`           | buses, routes, stops, subscriptions             |
| 6  | `modules/academic_pro.sql`        | prerequisites, assessments, feedback            |
| 7  | `seed/data.sql`                   | core sample data                                |
| 8  | `seed/data_addons.sql`            | library, research, hostel data                  |
| 9  | `seed/data_massive_v6.sql`        | ~50,000 students, loaded before the triggers    |
| 10 | `modules/analytics.sql`           | views, procedures, triggers                     |
| 11 | `modules/alumni_career.sql`       | alumni network (uses analytics procedures)      |
| 12 | `modules/audit_system.sql`        | audit log and triggers, last so seeding isn't audited |
| 13 | `queries/verify.sql`              | integrity and verification queries              |

Alternatively, with the `mysql` client, run the SOURCE script from inside
`packages/database` (SOURCE paths are relative to the client's working
directory). It uses the same order but skips `data.sql` and `data_addons.sql`:

```bash
cd packages/database
mysql -u root -p < init_database.sql
```

Either way, the transport, alumni, placement and document-request tables stay
empty. To fill those dashboard panels, load the small supplementary seed:

```bash
mysql -u root -p < packages/database/seed/sample_data_v2.sql
```

Check the connection afterwards:

```bash
npm run db:check            # prints "Students count: <n>"
```

### 5. Start an API server (port 8000)

**Node / Express:**

```bash
npm start                   # or: npm run api
```

**Python / FastAPI** — adds OpenAPI docs at `/docs`:

```bash
npm run api:python          # or: python apps/api/python/server.py
```

Both honour an optional `PORT` environment variable (default 8000). The
dashboard always calls port 8000, so only change it for API-only use.

**Java / JDBC** — the MySQL driver is not vendored; download
`mysql-connector-j` and put it on the classpath. Run from the repository root,
because the server reads `.env` from the working directory:

```bash
javac -d apps/api/java apps/api/java/JdbcServer.java
java -cp "apps/api/java;mysql-connector-j-9.1.0.jar" JdbcServer    # ':' instead of ';' on macOS/Linux
```

**PHP** — needs PHP and Composer:

```bash
composer install -d apps/api/php
php -S localhost:8000 apps/api/php/server.php
```

### 6. Serve the dashboard

```bash
npm run web                 # or: python -m http.server 3000 --directory apps/web
```

Open <http://localhost:3000>.

On Windows, `START_PROJECT.bat` does steps 5 and 6 together (FastAPI on 8000,
static server on 3000) and opens the browser.

## API

All servers expose the same read endpoints:

| Endpoint      | Returns                                        |
| ------------- | ---------------------------------------------- |
| `/campuses`   | Campus registry with status and inauguration   |
| `/students`   | Student records (`?limit=` — 1000 by default; FastAPI: 100, plus `?campus_id=`) |
| `/faculty`    | Academic staff                                 |
| `/assets`     | Campus infrastructure inventory                |
| `/placements` | Recruitment drive results                      |
| `/workflows`  | Approval and workflow history                  |
| `/transport`  | Routes and buses (`{routes, buses}`)           |
| `/alumni`     | Alumni and career outcomes                     |
| `/stats`      | Aggregate counts for the dashboard cards       |

The FastAPI server joins in department and campus names and aggregates
placements per company; the other servers return the raw tables. FastAPI also
answers `/` with a health message.

```bash
curl http://localhost:8000/campuses
```

## Database design

Built on InnoDB for real foreign keys and transactions. A database built by
`setup_db.py` holds **35 tables, 8 views, 10 triggers and 4 stored
procedures**, and about 50,000 students, 10,500 faculty, 5,000 assets and
5 campuses.

- **Triggers** (10) — section capacity checks on enrolment, book inventory
  updates on loan and return, automatic fine accrual on overdue returns,
  scholarship payments auto-marked paid, maintenance notifications, audit
  logging of student, faculty and payment changes.
- **Stored procedures** (4) — `GetStudentGPA`, `CheckGraduationEligibility`,
  `CheckPrereqEligibility`, `GraduateStudent`.
- **Views** (8) — student transcripts, faculty workload, overdue books, hostel
  availability, at-risk students, asset health, department finances and
  campus yield, pre-joined so reporting queries stay readable.
- **Audit** — `modules/audit_system.sql` records mutations for traceability.

That is enough rows that an unindexed join is visibly slower than an indexed
one, which is the point of the exercise. The other files in `seed/` hold
alternative data sets at different scales and are not loaded by
`setup_db.py`; see [packages/database/README.md](packages/database/README.md).

## Testing

There is no automated test suite. The checks that exist:

```bash
npm run check               # syntax-check the Node server, dashboard JS and Python files
npm run db:check            # connect with .env credentials and count Students
curl http://localhost:8000/stats   # with a server running
```

`queries/verify.sql` runs as the last step of `db:setup` and exercises the
views and procedures.

## Troubleshooting

- **`DB Connection Failed` / `Access denied`** — check `.env` is at the
  repository root and the MySQL service (`MySQL80` on Windows) is running.
- **Port 8000 already in use** — another process owns it; stop it or run the
  API with `PORT=8010` for API-only testing (the dashboard still calls 8000).
  Note that `START_PROJECT.bat` force-stops whatever is listening on 8000 and
  3000 before starting.
- **Dashboard loads but shows no data with the Express server** — the Express
  server does not send CORS headers, so a page served from port 3000 cannot
  read its responses. Use the FastAPI server (as `START_PROJECT.bat` does) for
  the dashboard.
- **`mysql` not found during `db:setup`** — add the MySQL `bin` directory to
  `PATH`, or install MySQL Server 8.0 in its default location.
- **`init_database.sql` fails with "Failed to open file"** — run it from
  inside `packages/database`.

## Documentation

The project report and presentation are in [docs/](docs/README.md).

*Academic project — VIT-AP, 2026.*
