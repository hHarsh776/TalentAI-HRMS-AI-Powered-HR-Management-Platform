import os
from pymongo import MongoClient
import json

MONGODB_URI = "mongodb+srv://hhstanwar777_db_user:FAThxkMBjGKL6EPk@cluster0.8yx2fwj.mongodb.net/?appName=Cluster0"
client = MongoClient(MONGODB_URI)
db = client["talentai_hrms"]

apps = list(db.Applications.find().sort('_id', -1).limit(10))
cands = list(db.Candidates.find().sort('_id', -1).limit(10))

print("Recent Candidates:")
for c in cands:
    print(f"Cand {c.get('_id')}: Name={c.get('name')} Exp={c.get('experience_years')} Edu={c.get('education')}")
