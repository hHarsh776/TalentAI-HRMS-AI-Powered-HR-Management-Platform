from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["talentai_db"]
onboarding_col = db["Onboarding"]

onboardings = onboarding_col.find({})
updated_count = 0

for onb in onboardings:
    documents = onb.get("documents", [])
    changed = False
    
    for doc in documents:
        if doc.get("name") == "Passport/ID Card":
            doc["name"] = "Academic Certificates"
            changed = True
            
    if changed:
        onboarding_col.update_one(
            {"_id": onb["_id"]},
            {"$set": {"documents": documents}}
        )
        updated_count += 1

print(f"Successfully updated {updated_count} onboarding records to replace Passport with Academic Certificates.")
