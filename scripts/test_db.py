import mysql.connector, os, sys
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / '.env')
cfg = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'SmartUniversityDB')
}
try:
    conn = mysql.connector.connect(**cfg)
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM Students')
    count = cur.fetchone()[0]
    print('Students count:', count)
    cur.close()
    conn.close()
except mysql.connector.Error as e:
    print('DB connection error:', e)
    sys.exit(1)
if count == 0:
    print('DB check failed: the Students table is empty')
    sys.exit(1)
