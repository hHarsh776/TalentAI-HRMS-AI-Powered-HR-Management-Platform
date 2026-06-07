import os
from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://hhstanwar777_db_user:FAThxkMBjGKL6EPk@cluster0.8yx2fwj.mongodb.net/?appName=Cluster0"
client = MongoClient(MONGODB_URI)
db = client["talentai_hrms"]

apps = list(db.Applications.find({"_id": {"$not": {"$regex": "^app_gen_"}}}))
cands = list(db.Candidates.find({"_id": {"$not": {"$regex": "^cand_gen_"}}}))

print(f"Non-generated Candidates: {len(cands)}")
for c in cands:
    print(f"Cand {c.get('_id')}: Name={c.get('name')}, Email={c.get('email')}, Exp={c.get('experience_years')}, Edu={c.get('education')}")

print(f"\nNon-generated Applications: {len(apps)}")
for a in apps:
    print(f"App {a.get('_id')}: Job={a.get('job_id')}, ATS={a.get('ats_score')}")

