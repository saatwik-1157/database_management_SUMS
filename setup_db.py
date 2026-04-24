import os
import subprocess
from dotenv import load_dotenv

load_dotenv()

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
    
    SQL_FILES = [
        'schema.sql',
        'enterprise_core.sql',
        'advanced_features.sql',
        'addons.sql',
        'transport.sql',
        'academic_pro.sql',
        'data.sql',
        'data_addons.sql',
        'data_massive_v6.sql',
        'analytics.sql',
        'alumni_career.sql',
        'audit_system.sql',
        'verify.sql'
    ]

    for sql_file in SQL_FILES:
        run_sql_file_via_cli(mysql_path, sql_file, user, password, host)

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
