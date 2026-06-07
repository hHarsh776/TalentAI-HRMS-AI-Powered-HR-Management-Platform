import sqlite3
import json

def update_db():
    conn = sqlite3.connect('talentai_local.db')
    cursor = conn.cursor()
    
    # Update emails
    cursor.execute("SELECT id, data FROM users")
    rows = cursor.fetchall()
    
    for row_id, data_str in rows:
        data = json.loads(data_str)
        changed = False
        
        if data.get('email') == 'hr@talentai.com':
            data['email'] = 'manager@talentai.com'
            changed = True
        elif data.get('email') == 'candidate@talentai.com':
            data['email'] = 'employee@talentai.com'
            changed = True
            
        if changed:
            cursor.execute("UPDATE users SET data = ? WHERE id = ?", (json.dumps(data), row_id))
            print(f"Updated email to {data.get('email')}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    update_db()
