# apps/api

Four implementations of the same read-only REST API over `SmartUniversityDB`.
Pick one; they all listen on port 8000, which is where the dashboard
(`apps/web/app.js`, `API_BASE`) sends its requests. All of them read the
database credentials from the `.env` at the repository root (see
`.env.example`).

| Folder    | Server                                  | Start (from the repository root)                 |
| --------- | --------------------------------------- | ------------------------------------------------ |
| `node/`   | Express + mysql2                        | `npm start` or `npm run api`                     |
| `python/` | FastAPI + mysql-connector, docs at `/docs` | `npm run api:python`                          |
| `java/`   | JDK `HttpServer` + JDBC                 | see below                                        |
| `php/`    | PHP built-in server + PDO               | see below                                        |

The Node and FastAPI servers take an optional `PORT` environment variable
(default 8000).

Endpoints: `/campuses`, `/students`, `/faculty`, `/assets`, `/placements`,
`/workflows`, `/transport`, `/alumni`, `/stats`. FastAPI also serves `/` and
`/docs`, joins in department and campus names, and aggregates placements per
company; the other servers return the raw tables.

Only the FastAPI server sends CORS headers, so it is the one to use with the
dashboard served from port 3000.

## Java

The MySQL driver is not vendored. Download `mysql-connector-j` and run from
the repository root, because the server reads `.env` from the working
directory:

```bash
javac -d apps/api/java apps/api/java/JdbcServer.java
java -cp "apps/api/java;mysql-connector-j-9.1.0.jar" JdbcServer    # ':' instead of ';' on macOS/Linux
```

Compiled `.class` files are gitignored.

## PHP

```bash
composer install -d apps/api/php
php -S localhost:8000 apps/api/php/server.php
```
