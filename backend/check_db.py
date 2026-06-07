import sqlite3
import json

def check_db():
    conn = sqlite3.connect('talentai_local.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT data FROM Users")
    rows = cursor.fetchall()
    
    for r in rows:
        data = json.loads(r[0])
        print(data.get('email'), data.get('role'))
        
    conn.close()

if __name__ == "__main__":
    check_db()
