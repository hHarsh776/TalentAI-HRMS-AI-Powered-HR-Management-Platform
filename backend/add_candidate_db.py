import sqlite3
import json
import bcrypt

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def update_candidate_password():
    conn = sqlite3.connect('talentai_local.db')
    cursor = conn.cursor()
    
    # Get the user
    cursor.execute("SELECT id, data FROM Users WHERE json_extract(data, '$.email') = 'candidate@talentai.com'")
    row = cursor.fetchone()
    if row:
        user_id, data_str = row
        data = json.loads(data_str)
        data['hashed_password'] = get_password_hash('password123')
        data['role'] = 'Candidate'
        
        cursor.execute("UPDATE Users SET data = ? WHERE id = ?", (json.dumps(data), user_id))
        conn.commit()
        print("Candidate password updated to password123 successfully!")
    else:
        print("Candidate not found.")
        
    conn.close()

if __name__ == "__main__":
    update_candidate_password()
