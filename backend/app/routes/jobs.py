from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from backend.app.auth import RoleChecker
from backend.app.database import get_db
from backend.app.models import JobCreate, JobOut, JobUpdate
from backend.app.ai import get_ai_service
import datetime

router = APIRouter(prefix="/jobs", tags=["Jobs"])

# Role definitions
admin_or_hr_or_recruiter = RoleChecker(["Management Admin", "Senior Manager", "HR Recruiter"])

@router.post("", response_model=JobOut)
def create_job(job_in: JobCreate, current_user: dict = Depends(admin_or_hr_or_recruiter)):
    db = get_db()
    jobs_col = db.get_collection("Jobs")
    
    job_dict = job_in.dict()
    job_dict["status"] = "Published"
    job_dict["created_at"] = datetime.datetime.utcnow().isoformat()
    job_dict["ai_generated"] = False
    
    inserted = jobs_col.insert_one(job_dict)
    return inserted

@router.get("", response_model=List[JobOut])
def get_jobs():
    db = get_db()
    jobs_col = db.get_collection("Jobs")
    return jobs_col.find()

@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: str):
    db = get_db()
    jobs_col = db.get_collection("Jobs")
    job = jobs_col.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.put("/{job_id}", response_model=JobOut)
def update_job(job_id: str, job_in: JobUpdate, current_user: dict = Depends(admin_or_hr_or_recruiter)):
    db = get_db()
    jobs_col = db.get_collection("Jobs")
    
    job = jobs_col.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    update_data = {k: v for k, v in job_in.dict(exclude_unset=True).items()}
    if update_data:
        jobs_col.update_one({"_id": job_id}, {"$set": update_data})
        
    updated_job = jobs_col.find_one({"_id": job_id})
    return updated_job

@router.delete("/{job_id}")
def delete_job(job_id: str, current_user: dict = Depends(admin_or_hr_or_recruiter)):
    db = get_db()
    jobs_col = db.get_collection("Jobs")
    
    job = jobs_col.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    jobs_col.delete_one({"_id": job_id})
    return {"message": "Job deleted successfully"}

@router.post("/generate-description")
def generate_description(job_title: str, department: Optional[str] = "Engineering", current_user: dict = Depends(admin_or_hr_or_recruiter)):
    ai = get_ai_service()
    
    if ai.gemini_enabled:
        try:
            import json
            prompt = (
                f"Generate a professional Job Description for the role '{job_title}' in the '{department}' department.\n"
                "Return a JSON object containing:\n"
                "1. 'description' (a paragraphs long overview of the role)\n"
                "2. 'requirements' (a list of 5-8 key technical and professional requirements as strings)"
            )
            response = ai.gemini_client.generate_content(prompt)
            clean_txt = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_txt)
        except Exception:
            pass

    # High fidelity fallback description
    desc = (
        f"We are seeking a talented and motivated {job_title} to join our dynamic {department} team. "
        "In this role, you will collaborate with cross-functional teams to design, build, and deploy high-quality software solutions. "
        "You will be responsible for writing clean, maintainable code, troubleshooting issues, and keeping up-to-date with industry best practices."
    )
    reqs = [
        f"Strong proficiency in core technologies related to {job_title}.",
        "Experience building scalable applications and RESTful APIs.",
        "Solid understanding of software design principles and database management systems.",
        "Excellent problem-solving skills and attention to detail.",
        "Strong team collaboration and communication skills."
    ]
    return {
        "description": desc,
        "requirements": reqs
    }
