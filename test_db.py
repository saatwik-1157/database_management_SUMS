import mysql.connector, os
from dotenv import load_dotenv
load_dotenv()
cfg = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME')
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
