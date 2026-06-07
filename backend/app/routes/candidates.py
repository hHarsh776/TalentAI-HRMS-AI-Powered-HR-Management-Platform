from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List, Optional, Dict, Any
import json
import datetime
from backend.app.auth import RoleChecker
from backend.app.database import get_db
from backend.app.models import CandidateOut, ApplicationOut
from backend.app.ai import get_ai_service

router = APIRouter(prefix="/candidates", tags=["Candidates"])

# Role definitions
admin_or_hr_or_recruiter = RoleChecker(["Management Admin", "Senior Manager", "HR Recruiter"])

def extract_text_from_file(file: UploadFile) -> str:
    """Helper to extract text from files (simulated for docx/pdf, reads text directly for txt)."""
    try:
        content = file.file.read()
        file.file.seek(0)
        
        filename = file.filename.lower()
        if filename.endswith(".pdf"):
            try:
                import PyPDF2
                from io import BytesIO
                reader = PyPDF2.PdfReader(BytesIO(content))
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                if len(text.strip()) > 10:
                    return text
            except Exception as e:
                pass # Fallback below if PDF parsing fails

        # Try decoding as text
        try:
            return content.decode("utf-8")
        except UnicodeDecodeError:
            # If binary, try pulling out legible text strings or use filename context
            ascii_text = []
            for b in content[:5000]:  # Limit to first 5KB
                if 32 <= b <= 126 or b in (10, 13):
                    ascii_text.append(chr(b))
            extracted = "".join(ascii_text)
            if len(extracted) > 100:
                return extracted
            return f"Resume of Candidate. Filename: {file.filename}. Skills: Python, SQL, React, Web Development."
    except Exception as e:
        return f"Could not parse resume content: {str(e)}"

@router.post("/upload", response_model=Dict[str, Any])
def upload_resume(
    job_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(admin_or_hr_or_recruiter)
):
    db = get_db()
    candidates_col = db.get_collection("Candidates")
    applications_col = db.get_collection("Applications")
    jobs_col = db.get_collection("Jobs")
    
    # Check if job exists
    job = jobs_col.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    raw_text = extract_text_from_file(file)
    
    # Parse candidate info using AI
    ai = get_ai_service()
    parsed_info = ai.parse_resume(raw_text)
    
    # Safe extraction of experience
    exp_val = parsed_info.get("experience_years", 3.0)
    try:
        exp_float = float(exp_val) if exp_val is not None and exp_val != "" else 0.0
    except (ValueError, TypeError):
        exp_float = 0.0

    # Insert or update candidate
    candidate_doc = candidates_col.find_one({"email": parsed_info.get("email")})
    if candidate_doc:
        candidate_id = candidate_doc["_id"]
        # Update details
        candidates_col.update_one(
            {"_id": candidate_id},
            {"$set": {
                "name": parsed_info.get("name", candidate_doc["name"]),
                "phone": parsed_info.get("phone", candidate_doc["phone"]),
                "skills": parsed_info.get("skills", candidate_doc["skills"]),
                "experience_years": exp_float,
                "education": parsed_info.get("education", candidate_doc["education"]),
                "resume_url": file.filename,
                "raw_resume_text": raw_text
            }}
        )
        candidate_doc = candidates_col.find_one({"_id": candidate_id})
    else:
        new_candidate = {
            "name": parsed_info.get("name", "John Doe"),
            "email": parsed_info.get("email", "john@example.com"),
            "phone": parsed_info.get("phone", "+1-555-0100"),
            "skills": parsed_info.get("skills", ["Python"]),
            "experience_years": exp_float,
            "education": parsed_info.get("education", "B.S. Computer Science"),
            "resume_url": file.filename,
            "raw_resume_text": raw_text
        }
        candidate_doc = candidates_col.insert_one(new_candidate)
        candidate_id = candidate_doc["_id"]
        
    # Evaluate candidate using match engine
    screening_res = ai.screen_candidate(
        candidate_skills=candidate_doc["skills"],
        candidate_experience=candidate_doc["experience_years"],
        candidate_education=candidate_doc["education"],
        job_description=job["description"],
        job_requirements=job["requirements"]
    )
    
    # Create or update job application
    app_doc = applications_col.find_one({"candidate_id": candidate_id, "job_id": job_id})
    
    # Ensure skill_gap is a list
    skill_gap_val = screening_res.get("skill_gap", [])
    if not isinstance(skill_gap_val, list):
        skill_gap_val = [skill_gap_val] if skill_gap_val else []

    if app_doc:
        app_id = app_doc["_id"]
        applications_col.update_one(
            {"_id": app_id},
            {"$set": {
                "status": "Screening",
                "ats_score": screening_res.get("ats_score", 50),
                "skill_gap": skill_gap_val,
                "experience_analysis": screening_res.get("experience_analysis", ""),
                "fit_recommendation": screening_res.get("fit_recommendation", "Review"),
                "applied_date": datetime.datetime.utcnow().isoformat()
            }}
        )
        app_doc = applications_col.find_one({"_id": app_id})
    else:
        new_app = {
            "candidate_id": candidate_id,
            "job_id": job_id,
            "status": "Screening",
            "ats_score": screening_res.get("ats_score", 50),
            "skill_gap": skill_gap_val,
            "experience_analysis": screening_res.get("experience_analysis", ""),
            "fit_recommendation": screening_res.get("fit_recommendation", "Shortlist"),
            "applied_date": datetime.datetime.utcnow().isoformat()
        }
        app_doc = applications_col.insert_one(new_app)
        app_doc = applications_col.find_one({"_id": app_doc.inserted_id})
        
    return {
        "candidate": candidate_doc,
        "application": app_doc
    }

@router.post("/upload-bulk")
def upload_bulk_resumes(
    job_id: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(admin_or_hr_or_recruiter)
):
    results = []
    for file in files:
        try:
            res = upload_resume(job_id=job_id, file=file, current_user=current_user)
            results.append({"filename": file.filename, "status": "success", "candidate": res["candidate"]["name"], "ats_score": res["application"]["ats_score"]})
        except Exception as e:
            results.append({"filename": file.filename, "status": "failed", "error": str(e)})
    return {"results": results}

@router.get("", response_model=List[CandidateOut])
def get_candidates(current_user: dict = Depends(admin_or_hr_or_recruiter)):
    db = get_db()
    candidates_col = db.get_collection("Candidates")
    return candidates_col.find()

@router.get("/applications", response_model=List[dict])
def get_all_applications(current_user: dict = Depends(admin_or_hr_or_recruiter)):
    db = get_db()
    apps_col = db.get_collection("Applications")
    candidates_col = db.get_collection("Candidates")
    jobs_col = db.get_collection("Jobs")
    
    apps = apps_col.find()
    
    # Pre-fetch all candidates and jobs into memory to avoid N+1 queries (SQLite JSON loads overhead)
    all_candidates = {c["_id"]: c for c in candidates_col.find()}
    all_jobs = {j["_id"]: j for j in jobs_col.find()}
    
    detailed_apps = []
    for app in apps:
        candidate = all_candidates.get(app["candidate_id"])
        job = all_jobs.get(app["job_id"])
        if candidate and job:
            app_copy = app.copy()
            app_copy["candidate"] = candidate
            app_copy["job"] = job
            detailed_apps.append(app_copy)
    return detailed_apps

@router.put("/applications/{app_id}/status")
def update_application_status(
    app_id: str,
    payload: dict,
    current_user: dict = Depends(admin_or_hr_or_recruiter)
):
    status_val = payload.get("status")
    if not status_val:
        raise HTTPException(status_code=400, detail="Status is required")
        
    db = get_db()
    apps_col = db.get_collection("Applications")
    
    app = apps_col.find_one({"_id": app_id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    apps_col.update_one({"_id": app_id}, {"$set": {"status": status_val}})
    
    # Auto-initialize onboarding if status changes to Offered
    if status_val.lower() == "offered":
        onboarding_col = db.get_collection("Onboarding")
        existing = onboarding_col.find_one({"application_id": app_id})
        if not existing:
            onboarding_col.insert_one({
                "application_id": app_id,
                "offer_letter_url": f"offer_letter_{app_id}.pdf",
                "checklist": [
                    {"task": "Sign Offer Letter", "completed": False},
                    {"task": "Upload Identity Documents", "completed": False},
                    {"task": "Complete Background Check", "completed": False},
                    {"task": "Setup Direct Deposit", "completed": False},
                    {"task": "Attend Orientation", "completed": False}
                ],
                "documents": [
                    {"name": "Academic Certificates", "status": "Pending"},
                    {"name": "Signed NDA", "status": "Pending"}
                ],
                "status": "Initiated"
            })
            
    return {"message": "Status updated successfully", "status": status_val}

@router.get("/compare")
def compare_candidates(ids: str, current_user: dict = Depends(admin_or_hr_or_recruiter)):
    db = get_db()
    candidates_col = db.get_collection("Candidates")
    apps_col = db.get_collection("Applications")
    jobs_col = db.get_collection("Jobs")
    
    id_list = ids.split(",")
    comparison_data = []
    
    for cid in id_list:
        candidate = candidates_col.find_one({"_id": cid})
        if not candidate:
            continue
        # Find their applications
        apps = apps_col.find({"candidate_id": cid})
        for app in apps:
            job = jobs_col.find_one({"_id": app["job_id"]})
            comparison_data.append({
                "candidate_id": cid,
                "name": candidate["name"],
                "email": candidate["email"],
                "experience_years": candidate["experience_years"],
                "education": candidate["education"],
                "skills": candidate["skills"],
                "job_title": job["title"] if job else "N/A",
                "ats_score": app["ats_score"],
                "fit_recommendation": app["fit_recommendation"],
                "skill_gap": app["skill_gap"],
                "status": app["status"]
            })
            
    return comparison_data

@router.post("/analyze_resume", response_model=Dict[str, Any])
def analyze_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(RoleChecker(["Management Admin", "Candidate"]))
):
    """Endpoint for Candidates to upload their resume and get instant AI feedback."""
    ai_service = get_ai_service()
    
    # Extract text from PDF
    text = extract_text_from_file(file)
    if not text or len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Could not extract enough text from the resume.")
        
    # Send to AI
    analysis = ai_service.analyze_resume(text)
    return analysis
