from pymongo import MongoClient
import os
from backend.app.ai import ai_service
from backend.app.config import settings

client = MongoClient("mongodb://localhost:27017/")
db = client["talentai_db"]
onboarding_col = db["Onboarding"]
apps_col = db["Applications"]
candidates_col = db["Candidates"]
jobs_col = db["Jobs"]

onboardings = list(onboarding_col.find({}))
updated_count = 0

print(f"Found {len(onboardings)} onboardings.")
for onb in onboardings:
    app = apps_col.find_one({"_id": onb["application_id"]})
    if not app:
        continue
        
    candidate = candidates_col.find_one({"_id": app["candidate_id"]})
    job = jobs_col.find_one({"_id": app["job_id"]})
    
    if candidate and job:
        # Assuming typical base salary for the sake of the script
        salary = 120000.00
        print(f"Generating new offer letter for {candidate['name']} - {job['title']}...")
        offer_text = ai_service.generate_offer_letter(candidate, job, salary)
        
        onboarding_col.update_one(
            {"_id": onb["_id"]},
            {"$set": {"offer_letter_text": offer_text}}
        )
        updated_count += 1
        print("Updated.")

print(f"Successfully generated and updated offer letters for {updated_count} existing onboarding records.")
