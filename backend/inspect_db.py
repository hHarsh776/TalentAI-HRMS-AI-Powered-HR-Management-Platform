import pymongo

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["talentai"]

apps = list(db.Applications.find())
candidates = list(db.Candidates.find())

print(f"Total Applications: {len(apps)}")
for app in apps:
    print(f"App {app.get('_id')}:")
    print(f"  skill_gap type: {type(app.get('skill_gap'))} - value: {app.get('skill_gap')}")
    print(f"  ats_score type: {type(app.get('ats_score'))} - value: {app.get('ats_score')}")

print(f"\nTotal Candidates: {len(candidates)}")
for c in candidates:
    print(f"Cand {c.get('_id')}:")
    print(f"  skills type: {type(c.get('skills'))} - value: {c.get('skills')}")
    print(f"  experience_years type: {type(c.get('experience_years'))} - value: {c.get('experience_years')}")
