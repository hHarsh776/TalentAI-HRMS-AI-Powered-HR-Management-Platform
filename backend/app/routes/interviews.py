from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from backend.app.auth import RoleChecker, get_current_user
from backend.app.database import get_db
from backend.app.models import InterviewCreate, InterviewOut, InterviewSubmitResponse
from backend.app.ai import get_ai_service
import datetime

router = APIRouter(prefix="/interviews", tags=["Interviews"])

# Role definitions
admin_or_hr_or_recruiter_or_interviewer = RoleChecker(["Management Admin", "Senior Manager", "HR Recruiter", "Employee"])

@router.post("", response_model=InterviewOut)
def schedule_interview(
    interview_in: InterviewCreate,
    current_user: dict = Depends(admin_or_hr_or_recruiter_or_interviewer)
):
    db = get_db()
    interviews_col = db.get_collection("Interviews")
    apps_col = db.get_collection("Applications")
    candidates_col = db.get_collection("Candidates")
    jobs_col = db.get_collection("Jobs")
    
    # Verify application
    app = apps_col.find_one({"_id": interview_in.application_id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    candidate = candidates_col.find_one({"_id": app["candidate_id"]})
    job = jobs_col.find_one({"_id": app["job_id"]})
    if not candidate or not job:
        raise HTTPException(status_code=400, detail="Invalid application reference data")
        
    # Generate AI questions tailored to candidate
    ai = get_ai_service()
    questions = ai.generate_interview_questions(
        job_title=job["title"],
        requirements=job["requirements"],
        skills=candidate["skills"]
    )
    
    new_interview = {
        "application_id": interview_in.application_id,
        "questions": questions,
        "responses": [],
        "communication_score": 0,
        "confidence_score": 0,
        "overall_sentiment": "Pending",
        "feedback_summary": "Interview scheduled. Responses pending.",
        "scheduled_at": interview_in.scheduled_at,
        "status": "Scheduled"
    }
    
    inserted = interviews_col.insert_one(new_interview)
    
    # Update application status
    apps_col.update_one({"_id": interview_in.application_id}, {"$set": {"status": "Interviewing"}})
    
    return inserted

@router.get("", response_model=List[InterviewOut])
def get_interviews(current_user: dict = Depends(get_current_user)):
    db = get_db()
    interviews_col = db.get_collection("Interviews")
    # If the user is a candidate, let them only see their own interviews
    if current_user["role"] == "Candidate":
        apps_col = db.get_collection("Applications")
        candidate_apps = apps_col.find({"candidate_id": current_user["_id"]})
        app_ids = [app["_id"] for app in candidate_apps]
        return interviews_col.find({"application_id": {"$in": app_ids}})
        
    return interviews_col.find()

@router.get("/{interview_id}", response_model=InterviewOut)
def get_interview(interview_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    interviews_col = db.get_collection("Interviews")
    interview = interviews_col.find_one({"_id": interview_id})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview

@router.post("/{interview_id}/submit", response_model=InterviewOut)
def submit_responses(
    interview_id: str,
    payload: InterviewSubmitResponse,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    interviews_col = db.get_collection("Interviews")
    
    interview = interviews_col.find_one({"_id": interview_id})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    # Analyze responses using AI model
    ai = get_ai_service()
    resp_dicts = [r.dict() for r in payload.responses]
    analysis = ai.analyze_interview(resp_dicts)
    
    updates = {
        "responses": resp_dicts,
        "communication_score": analysis["communication_score"],
        "confidence_score": analysis["confidence_score"],
        "overall_sentiment": analysis["overall_sentiment"],
        "feedback_summary": analysis["feedback_summary"],
        "status": "Completed"
    }
    
    interviews_col.update_one({"_id": interview_id}, {"$set": updates})
    updated = interviews_col.find_one({"_id": interview_id})
    return updated

@router.post("/demo_evaluate")
def demo_evaluate(payload: InterviewSubmitResponse, current_user: dict = Depends(get_current_user)):
    """Demo endpoint to evaluate an interview on the fly without an ID."""
    ai = get_ai_service()
    resp_dicts = [r.dict() for r in payload.responses]
    analysis = ai.analyze_interview(resp_dicts)
    return analysis
