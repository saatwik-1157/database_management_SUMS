import os
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# Resolve everything from this script's location, not the caller's CWD.
REPO_ROOT = Path(__file__).resolve().parent.parent
DB_DIR = REPO_ROOT / "packages" / "database"

load_dotenv(REPO_ROOT / ".env")

def run_sql_file_via_cli(mysql_path, filename, user, password, host, db_name=None):
    print(f"Executing {filename} via mysql CLI...")
    if not os.path.exists(filename):
        print(f"  Warning: {filename} not found, skipping.")
        return

    cmd = [
        mysql_path,
        "-h", host,
        "-u", user,
        f"-p{password}",
        "--default-character-set=utf8mb4"
    ]
    if db_name:
        cmd.append(db_name)
        
    with open(filename, 'r', encoding='utf-8') as f:
        try:
            result = subprocess.run(cmd, stdin=f, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"  Error in {filename}:")
                # Print only the first few lines of the error to avoid spam
                print("\n".join(result.stderr.splitlines()[:10]))
        except Exception as e:
            print(f"  Exception running {filename}: {e}")

def main():
    mysql_path = r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    if not os.path.exists(mysql_path):
        mysql_path = "mysql" # fallback to PATH

    host = os.getenv('DB_HOST', 'localhost')
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

    for sql_file in SQL_FILES:
        run_sql_file_via_cli(mysql_path, str(DB_DIR / sql_file), user, password, host)

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
    cmd = [mysql_path, "-h", host, "-u", user, f"-p{password}"]
    result = subprocess.run(cmd, input=check_script, text=True, capture_output=True)
    if result.returncode == 0:
        print(result.stdout)
    else:
        print("Error fetching stats:", result.stderr)

if __name__ == "__main__":
    main()
