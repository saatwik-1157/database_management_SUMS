import os
import subprocess
import sys
from pathlib import Path
from dotenv import load_dotenv

# Resolve everything from this script's location, not the caller's CWD.
REPO_ROOT = Path(__file__).resolve().parent.parent
DB_DIR = REPO_ROOT / "packages" / "database"

load_dotenv(REPO_ROOT / ".env")


def mysql_base_cmd(mysql_path, host, port, user):
    # The password travels in the child's MYSQL_PWD environment variable
    # (see mysql_env), never on the command line where `ps` can see it.
    return [mysql_path, "-h", host, "-P", str(port), "-u", user]


def mysql_env(password):
    env = os.environ.copy()
    env["MYSQL_PWD"] = password
    return env


def run_sql_file_via_cli(mysql_path, filename, user, password, host, port, db_name=None):
    """Run one SQL file through the mysql client. Returns True on success."""
    print(f"Executing {filename} via mysql CLI...")
    if not os.path.exists(filename):
        print(f"  Error: {filename} not found.")
        return False

    cmd = mysql_base_cmd(mysql_path, host, port, user) + ["--default-character-set=utf8mb4"]
    if db_name:
        cmd.append(db_name)

    with open(filename, 'r', encoding='utf-8') as f:
        try:
            result = subprocess.run(cmd, stdin=f, capture_output=True, text=True,
                                    env=mysql_env(password))
        except Exception as e:
            print(f"  Exception running {filename}: {e}")
            return False
    if result.returncode != 0:
        print(f"  Error in {filename}:")
        # Print only the first few lines of the error to avoid spam
        print("\n".join(result.stderr.splitlines()[:10]))
        return False
    return True


def main():
    mysql_path = r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    if not os.path.exists(mysql_path):
        mysql_path = "mysql" # fallback to PATH

    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '3306')
    user = os.getenv('DB_USER', 'root')
    password = os.getenv('DB_PASSWORD', '')

    # Load order matters: later files depend on tables the earlier ones create.
    SQL_FILES = [
        'schema/schema.sql',
        'schema/enterprise_core.sql',
        'modules/advanced_features.sql',
        'modules/addons.sql',
        'modules/transport.sql',
        'modules/academic_pro.sql',
        'seed/data.sql',
        'seed/data_addons.sql',
        'seed/data_massive_v6.sql',
        'modules/analytics.sql',
        'modules/alumni_career.sql',
        'modules/audit_system.sql',
        'queries/verify.sql'
    ]

    failed = []
    for sql_file in SQL_FILES:
        if not run_sql_file_via_cli(mysql_path, str(DB_DIR / sql_file), user, password, host, port):
            failed.append(sql_file)

    if failed:
        print(f"\nDatabase setup FAILED: {len(failed)} of {len(SQL_FILES)} file(s) had errors:")
        for sql_file in failed:
            print(f"  - {sql_file}")
        return 1

    print("\nDatabase setup complete!")

    # Check stats using mysql CLI
    print("\nTable Statistics:")
    check_script = """
    USE SmartUniversityDB;
    SELECT 'Students' as Table_Name, COUNT(*) FROM Students
    UNION ALL SELECT 'Faculty', COUNT(*) FROM Faculty
    UNION ALL SELECT 'Campuses', COUNT(*) FROM Campuses
    UNION ALL SELECT 'Assets', COUNT(*) FROM Assets
    UNION ALL SELECT 'Payments', COUNT(*) FROM Payments;
    """
    cmd = mysql_base_cmd(mysql_path, host, port, user)
    result = subprocess.run(cmd, input=check_script, text=True, capture_output=True,
                            env=mysql_env(password))
    if result.returncode == 0:
        print(result.stdout)
    else:
        print("Error fetching stats:", result.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
