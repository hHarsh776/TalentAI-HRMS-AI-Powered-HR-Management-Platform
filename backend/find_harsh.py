import os
from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://hhstanwar777_db_user:FAThxkMBjGKL6EPk@cluster0.8yx2fwj.mongodb.net/?appName=Cluster0"
client = MongoClient(MONGODB_URI)
db = client["talentai_hrms"]

apps = list(db.Applications.find())
cands = list(db.Candidates.find({"name": {"$regex": "Harsh", "$options": "i"}}))

print("Candidates matching 'Harsh':")
for c in cands:
    print(c)

print("\nApplications for those candidates:")
for a in apps:
    for c in cands:
        if a.get('candidate_id') == c.get('_id'):
            print(a)
