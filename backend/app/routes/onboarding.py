from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from backend.app.auth import get_current_user, RoleChecker
from backend.app.database import get_db
from backend.app.models import OnboardingOut, OnboardingUpdate
from backend.app.ai import ai_service
import datetime
router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

admin_or_hr = RoleChecker(["Management Admin", "Senior Manager"])

@router.get("", response_model=List[OnboardingOut])
def get_onboardings(current_user: dict = Depends(get_current_user)):
    db = get_db()
    onboarding_col = db.get_collection("Onboarding")
    apps_col = db.get_collection("Applications")
    cands_col = db.get_collection("Candidates")
    jobs_col = db.get_collection("Jobs")
    
    # Candidate can only see their own onboarding
    if current_user["role"] == "Candidate":
        candidate_apps = apps_col.find({"candidate_id": current_user["_id"]})
        app_ids = [app["_id"] for app in candidate_apps]
        onbs = list(onboarding_col.find({"application_id": {"$in": app_ids}}))
    else:
        onbs = list(onboarding_col.find())
        
    for onb in onbs:
        app = apps_col.find_one({"_id": onb["application_id"]})
        if app:
            cand = cands_col.find_one({"_id": app["candidate_id"]})
            job = jobs_col.find_one({"_id": app["job_id"]})
            if cand:
                onb["candidate_name"] = cand.get("name")
            if job:
                onb["job_title"] = job.get("title")
    return onbs

@router.get("/{onboarding_id}", response_model=OnboardingOut)
def get_onboarding(onboarding_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    onboarding_col = db.get_collection("Onboarding")
    apps_col = db.get_collection("Applications")
    cands_col = db.get_collection("Candidates")
    jobs_col = db.get_collection("Jobs")
    
    onb = onboarding_col.find_one({"_id": onboarding_id})
    if not onb:
        raise HTTPException(status_code=404, detail="Onboarding not found")
        
    app = apps_col.find_one({"_id": onb["application_id"]})
    if app:
        cand = cands_col.find_one({"_id": app["candidate_id"]})
        job = jobs_col.find_one({"_id": app["job_id"]})
        if cand:
            onb["candidate_name"] = cand.get("name")
        if job:
            onb["job_title"] = job.get("title")
            
    return onb

@router.put("/{onboarding_id}", response_model=OnboardingOut)
def update_onboarding(
    onboarding_id: str,
    payload: OnboardingUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    onboarding_col = db.get_collection("Onboarding")
    
    onb = onboarding_col.find_one({"_id": onboarding_id})
    if not onb:
        raise HTTPException(status_code=404, detail="Onboarding not found")
        
    updates = {}
    if payload.checklist is not None:
        updates["checklist"] = [item.dict() for item in payload.checklist]
    if payload.documents is not None:
        updates["documents"] = [doc.dict() for doc in payload.documents]
    if payload.status is not None:
        updates["status"] = payload.status
        
    if updates:
        onboarding_col.update_one({"_id": onboarding_id}, {"$set": updates})
        
    return onboarding_col.find_one({"_id": onboarding_id})

@router.post("/{onboarding_id}/generate-offer")
def generate_offer_letter(onboarding_id: str, salary: float = 120000.0, current_user: dict = Depends(admin_or_hr)):
    db = get_db()
    onboarding_col = db.get_collection("Onboarding")
    apps_col = db.get_collection("Applications")
    candidates_col = db.get_collection("Candidates")
    jobs_col = db.get_collection("Jobs")
    
    onb = onboarding_col.find_one({"_id": onboarding_id})
    if not onb:
        raise HTTPException(status_code=404, detail="Onboarding record not found")
        
    app = apps_col.find_one({"_id": onb["application_id"]})
    candidate = candidates_col.find_one({"_id": app["candidate_id"]})
    job = jobs_col.find_one({"_id": app["job_id"]})
    
    offer_text = ai_service.generate_offer_letter(candidate, job, salary)
    
    # Update offer letter field in database
    onboarding_col.update_one({"_id": onboarding_id}, {"$set": {"offer_letter_text": offer_text}})
    return {"offer_letter_text": offer_text}
