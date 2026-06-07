import os
from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://hhstanwar777_db_user:FAThxkMBjGKL6EPk@cluster0.8yx2fwj.mongodb.net/?appName=Cluster0"
client = MongoClient(MONGODB_URI)
db = client["talentai_hrms"]

apps = list(db.Applications.find())
cands = list(db.Candidates.find())

print(f"Total Apps: {len(apps)}")
for a in apps[-3:]: # only last 3
    print(f"App {a['_id']}: ATS: {a.get('ats_score')}")

print(f"\nTotal Candidates: {len(cands)}")
for c in cands[-3:]:
    print(f"Cand {c['_id']}: Exp: {c.get('experience_years')}, Edu: {c.get('education')}")

# Delete all heuristic fakes
res1 = db.Candidates.delete_many({"experience_years": 5.5, "education": "Master of Science in Computer Science"})
res2 = db.Applications.delete_many({"ats_score": 92})

print(f"\nDeleted {res1.deleted_count} fake candidates and {res2.deleted_count} fake applications.")
