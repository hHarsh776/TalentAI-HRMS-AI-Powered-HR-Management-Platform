import os
from pymongo import MongoClient
import bcrypt
from dotenv import load_dotenv

load_dotenv("backend/.env")

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def add_candidate_to_mongo():
    uri = os.getenv("MONGODB_URI")
    if not uri:
        print("No MONGODB_URI found.")
        return
        
    client = MongoClient(uri)
    db = client[os.getenv("DB_NAME", "talentai_hrms")]
    users_col = db["Users"]
    
    candidate_user = {
        "_id": "user_candidate",
        "email": "candidate@talentai.com",
        "name": "Jane Doe",
        "hashed_password": get_password_hash("password123"),
        "role": "Candidate"
    }
    
    # Upsert the user
    result = users_col.update_one(
        {"email": "candidate@talentai.com"},
        {"$set": candidate_user},
        upsert=True
    )
    
    if result.upserted_id:
        print("Candidate added to MongoDB!")
    else:
        print("Candidate updated in MongoDB!")

if __name__ == "__main__":
    add_candidate_to_mongo()
