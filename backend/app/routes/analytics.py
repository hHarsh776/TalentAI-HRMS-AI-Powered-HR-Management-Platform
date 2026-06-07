from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from backend.app.auth import RoleChecker
from backend.app.database import get_db
import datetime

router = APIRouter(prefix="/analytics", tags=["Analytics"])

admin_or_hr_or_recruiter = RoleChecker(["Management Admin", "Senior Manager", "HR Recruiter"])

@router.get("/dashboard")
def get_dashboard_analytics(current_user: dict = Depends(admin_or_hr_or_recruiter)):
    db = get_db()
    apps_col = db.get_collection("Applications")
    candidates_col = db.get_collection("Candidates")
    jobs_col = db.get_collection("Jobs")
    interviews_col = db.get_collection("Interviews")
    
    total_candidates = candidates_col.count_documents({})
    total_jobs = jobs_col.count_documents({})
    total_apps = apps_col.count_documents({})
    
    # Funnel count
    funnel = {
        "Applied": apps_col.count_documents({"status": "Applied"}),
        "Screening": apps_col.count_documents({"status": "Screening"}),
        "Interviewing": apps_col.count_documents({"status": "Interviewing"}),
        "Offered": apps_col.count_documents({"status": "Offered"}),
        "Rejected": apps_col.count_documents({"status": "Rejected"})
    }
    
    # Department breakdown
    dept_counts = {}
    jobs = jobs_col.find()
    job_depts = {j["_id"]: j["department"] for j in jobs}
    
    apps = apps_col.find()
    for app in apps:
        job_id = app["job_id"]
        dept = job_depts.get(job_id, "Other")
        dept_counts[dept] = dept_counts.get(dept, 0) + 1
        
    department_wise = [{"name": dept, "value": count} for dept, count in dept_counts.items()]
    if not department_wise:
        department_wise = [
            {"name": "Engineering", "value": 5},
            {"name": "Product Management", "value": 2},
            {"name": "Design", "value": 1},
            {"name": "Marketing", "value": 2}
        ]
        
    # Mocking hiring trend data over months
    hiring_trends = [
        {"month": "Jan", "applicants": 12, "hired": 2},
        {"month": "Feb", "applicants": 19, "hired": 3},
        {"month": "Mar", "applicants": 25, "hired": 4},
        {"month": "Apr", "applicants": 32, "hired": 6},
        {"month": "May", "applicants": 28, "hired": 5},
        {"month": "Jun", "applicants": total_apps, "hired": funnel["Offered"]}
    ]
    
    return {
        "total_candidates": total_candidates,
        "total_jobs": total_jobs,
        "total_applications": total_apps,
        "funnel": funnel,
        "department_wise": department_wise,
        "hiring_trends": hiring_trends
    }

@router.get("/predict-success/{app_id}")
def predict_candidate_success(app_id: str, current_user: dict = Depends(admin_or_hr_or_recruiter)):
    db = get_db()
    apps_col = db.get_collection("Applications")
    candidates_col = db.get_collection("Candidates")
    interviews_col = db.get_collection("Interviews")
    jobs_col = db.get_collection("Jobs")
    
    app = apps_col.find_one({"_id": app_id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    candidate = candidates_col.find_one({"_id": app["candidate_id"]})
    job = jobs_col.find_one({"_id": app["job_id"]})
    interview = interviews_col.find_one({"application_id": app_id})
    
    if not candidate or not job:
        raise HTTPException(status_code=400, detail="Inconsistent application records")
        
    # Formula to predict candidate success
    # 35% ATS score, 25% Experience years (capped), 20% Interview communication, 20% Interview confidence
    ats_weight = app.get("ats_score", 50) * 0.35
    
    exp_factor = min(10.0, candidate.get("experience_years", 2.0)) / 10.0
    exp_weight = (exp_factor * 100) * 0.25
    
    if interview and interview.get("status") == "Completed":
        comm_weight = interview.get("communication_score", 70) * 0.20
        conf_weight = interview.get("confidence_score", 70) * 0.20
        has_interview = True
    else:
        comm_weight = 70 * 0.20
        conf_weight = 70 * 0.20
        has_interview = False
        
    predicted_success_score = int(ats_weight + exp_weight + comm_weight + conf_weight)
    predicted_success_score = min(100, max(20, predicted_success_score))
    
    # Categorization and AI Summary
    if predicted_success_score >= 80:
        tier = "High Potential (Tier 1)"
        summary = f"The candidate lists excellent capabilities. With an ATS Match Score of {app.get('ats_score')}% and strong experience, they are highly aligned to succeed in this {job['title']} role."
    elif predicted_success_score >= 60:
        tier = "Qualified (Tier 2)"
        summary = "The candidate shows standard capabilities and meets most requirements. They will likely succeed with standard team onboarding."
    else:
        tier = "Development Required (Tier 3)"
        summary = "The candidate has notable skill gaps and matches fewer critical items. They may require substantial mentoring to succeed in the role."
        
    return {
        "candidate_id": candidate["_id"],
        "name": candidate["name"],
        "job_title": job["title"],
        "ats_score": app["ats_score"],
        "predicted_success_score": predicted_success_score,
        "success_tier": tier,
        "has_interview": has_interview,
        "ai_summary": summary
    }
