"""Smoke-test a running SUMS API server.

Hits every route the dashboard (apps/web/app.js) calls and fails unless each
returns HTTP 200 with non-empty JSON carrying the fields the dashboard reads,
plus an allow-all CORS header. Standard library only.

    python scripts/smoke_api.py http://127.0.0.1:8600
    python scripts/smoke_api.py http://127.0.0.1:8601 /   # also check extra routes
"""
import json
import sys
import time
import urllib.error
import urllib.request

# Same routes, in the same order, as the dashboard's Promise.all in app.js.
DASHBOARD_ROUTES = [
    "/campuses", "/stats", "/students?limit=200", "/faculty", "/assets",
    "/placements", "/workflows", "/transport", "/alumni",
]

# Where `npm run web` serves the dashboard from.
DASHBOARD_ORIGIN = "http://localhost:3000"

# Fields apps/web/app.js reads from each response (the first row of a list).
EXPECTED_FIELDS = {
    "/campuses": {"CampusID", "CampusName", "City"},
    "/stats": {"student_count", "faculty_count", "total_revenue", "asset_count"},
    "/students?limit=200": {"StudentID", "FirstName", "LastName", "DeptName"},
    "/faculty": {"FacultyID", "FirstName", "LastName", "DeptName", "FacultyRank"},
    "/assets": {"SerialNo", "AssetName", "AssetType", "ConditionLevel", "CampusName", "EstimatedValue"},
    "/placements": {"CompanyName", "Offers", "Highest", "Average"},
    "/workflows": {"RequestID", "RequestType", "FirstName", "LastName", "CurrentStatus", "Priority"},
    "/transport": {"routes", "buses"},
    "/alumni": {"FirstName", "LastName", "GraduationYear", "CompanyName", "Designation"},
}


def wait_until_up(base, timeout=60):
    deadline = time.time() + timeout
    while True:
        try:
            urllib.request.urlopen(base + "/campuses", timeout=5).close()
            return
        except urllib.error.HTTPError:
            return  # it answered; the route checks will judge the status
        except OSError:
            if time.time() > deadline:
                raise SystemExit(f"FAIL: {base} did not come up within {timeout}s")
            time.sleep(1)


def check(base, route):
    # Send an Origin like the browser does for the dashboard's cross-origin
    # fetches; CORS middleware (e.g. Starlette's) only answers when it is set.
    req = urllib.request.Request(base + route, headers={"Origin": DASHBOARD_ORIGIN})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            status, body = r.status, r.read()
            cors = r.headers.get("Access-Control-Allow-Origin")
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: {e.read()[:300]!r}"
    except OSError as e:
        return f"request failed: {e}"
    if status != 200:
        return f"HTTP {status}"
    try:
        data = json.loads(body)
    except ValueError:
        return f"not JSON: {body[:200]!r}"
    if not data:
        return "empty JSON"
    if isinstance(data, dict):
        empty = [k for k, v in data.items() if isinstance(v, list) and not v]
        if empty:
            return f"empty list(s) in response: {empty}"
    expected = EXPECTED_FIELDS.get(route, set())
    sample = data[0] if isinstance(data, list) else data
    missing = sorted(expected - set(sample)) if isinstance(sample, dict) else sorted(expected)
    if missing:
        return f"missing field(s) the dashboard reads: {missing}"
    if route == "/transport" and "RouteName" not in data["routes"][0]:
        return "transport routes lack RouteName"
    if cors != "*":
        return f"missing CORS header (Access-Control-Allow-Origin={cors!r})"
    size = len(data) if isinstance(data, (list, dict)) else 1
    print(f"  ok  {route}  ({type(data).__name__}, {size} item(s))")
    return None


def main(argv):
    if len(argv) < 2:
        raise SystemExit(__doc__)
    base = argv[1].rstrip("/")
    routes = DASHBOARD_ROUTES + argv[2:]
    wait_until_up(base)
    print(f"Checking {base}")
    failures = []
    for route in routes:
        err = check(base, route)
        if err:
            print(f"  FAIL {route}: {err}")
            failures.append(route)
    if failures:
        print(f"{len(failures)} of {len(routes)} route(s) failed")
        return 1
    print(f"All {len(routes)} route(s) returned 200 with non-empty JSON")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
