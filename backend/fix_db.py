import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['talentai_hrms']

for emp in db['Employees'].find({"designation": {"$exists": False}}):
    db['Employees'].update_one(
        {"_id": emp["_id"]},
        {"$set": {"designation": emp.get("job_title", "Employee")}}
    )
    
print("Fixed DB designations.")
