import os
import psycopg2
from dotenv import load_dotenv

load_dotenv("server/.env")

try:
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cur = conn.cursor()
    # Insert staff user
    cur.execute("""
        INSERT INTO users (name, email, password, role) 
        VALUES ('Staff User', 'staff@restaurant.com', '$2b$10$255OUyv4yyHXv5PObbp2iesF20cAPHvT4jDtx2rN56f1i9PBf4p4O', 'staff')
        ON CONFLICT (email) DO NOTHING;
    """)
    conn.commit()
    print("Staff user inserted successfully.")
    
    cur.execute("SELECT id, name, email, role FROM users;")
    rows = cur.fetchall()
    print("Users in DB:")
    for r in rows:
        print(r)
    conn.close()
except Exception as e:
    print("Error:", e)
