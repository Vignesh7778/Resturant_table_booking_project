import os
import psycopg2
from dotenv import load_dotenv

load_dotenv("server/.env")

try:
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, role FROM users;")
    rows = cur.fetchall()
    print("Users in DB:")
    for r in rows:
        print(r)
    conn.close()
except Exception as e:
    print("Error:", e)
