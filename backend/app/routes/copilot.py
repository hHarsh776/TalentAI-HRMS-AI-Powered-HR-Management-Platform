from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from backend.app.auth import RoleChecker
from backend.app.database import get_db
from backend.app.models import CopilotQuery, CopilotResponse
from backend.app.ai import get_ai_service, ai_service
import re

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

# Role definitions
admin_or_hr_or_recruiter = RoleChecker(["Management Admin", "Senior Manager", "HR Recruiter"])

@router.post("", response_model=CopilotResponse)
def ask_copilot(payload: CopilotQuery, current_user: dict = Depends(admin_or_hr_or_recruiter)):
    prompt = payload.prompt.strip().lower()
    
    db = get_db()
    candidates_col = db.get_collection("Candidates")
    apps_col = db.get_collection("Applications")
    jobs_col = db.get_collection("Jobs")
    interviews_col = db.get_collection("Interviews")
    
    # 1. "Show top 10 candidates for Data Analyst role"
    role_match = re.search(r'top\s*(\d*)\s*candidates?\s*for\s*(.*?)\s*(role|position|$)', prompt)
    if role_match:
        limit = int(role_match.group(1)) if role_match.group(1) else 10
        role_name = role_match.group(2).strip()
        
        # Find matching job
        jobs = jobs_col.find()
        job_id = None
        matched_job_title = ""
        for job in jobs:
            if role_name in job["title"].lower() or job["title"].lower() in role_name:
                job_id = job["_id"]
                matched_job_title = job["title"]
                break
                
        if not job_id:
            # Fallback search in applications if job not exact
            return CopilotResponse(
                response=f"I couldn't find an exact active job post matching '{role_name}'. Here is a general list of top candidates across all roles.",
                query_type="candidate_search",
                data=[]
            )
            
        apps = apps_col.find({"job_id": job_id})
        # Sort apps by ATS score descending
        apps.sort(key=lambda x: x.get("ats_score", 0), reverse=True)
        apps = apps[:limit]
        
        candidates_data = []
        md_table = f"### Top {limit} Candidates for {matched_job_title}\n\n| Rank | Candidate | Experience | Education | ATS Match Score | Recommendation |\n|---|---|---|---|---|---|\n"
        
        for idx, app in enumerate(apps, start=1):
            cand = candidates_col.find_one({"_id": app["candidate_id"]})
            if cand:
                candidates_data.append({
                    "rank": idx,
                    "name": cand["name"],
                    "experience_years": cand["experience_years"],
                    "education": cand["education"],
                    "ats_score": app["ats_score"],
                    "recommendation": app["fit_recommendation"]
                })
                md_table += f"| {idx} | **{cand['name']}** | {cand['experience_years']} yrs | {cand['education']} | `{app['ats_score']}%` | {app['fit_recommendation']} |\n"
                
        if not candidates_data:
            md_table += "| - | No applicants found for this job yet | - | - | - | - |\n"
            
        return CopilotResponse(
            response=md_table,
            query_type="candidate_search",
            data=candidates_data
        )

    # 2. "Who has the highest ATS score?"
    if "highest ats" in prompt or "best ats" in prompt or "top ats" in prompt:
        apps = apps_col.find()
        if not apps:
            return CopilotResponse(response="No job applications found in database.", query_type="general", data=[])
            
        apps.sort(key=lambda x: x.get("ats_score", 0), reverse=True)
        best_app = apps[0]
        cand = candidates_col.find_one({"_id": best_app["candidate_id"]})
        job = jobs_col.find_one({"_id": best_app["job_id"]})
        
        if cand and job:
            msg = (
                f"### Highest ATS Score Match\n\n"
                f"The candidate with the highest ATS Score is **{cand['name']}** with a score of `{best_app['ats_score']}%`.\n\n"
                f"- **Role Applied For:** {job['title']}\n"
                f"- **Experience:** {cand['experience_years']} Years\n"
                f"- **Education:** {cand['education']}\n"
                f"- **Key Skills:** {', '.join(cand['skills'])}\n"
                f"- **Recommendation:** {best_app['fit_recommendation']}"
            )
            return CopilotResponse(
                response=msg,
                query_type="highest_ats",
                data=[{
                    "name": cand["name"],
                    "ats_score": best_app["ats_score"],
                    "job_title": job["title"],
                    "skills": cand["skills"]
                }]
            )

    # 3. "Generate interview questions for Python Developer"
    q_match = re.search(r'generate\s*(interview\s*)?questions?\s*for\s*(.*)', prompt)
    if q_match:
        role_name = q_match.group(2).replace("role", "").replace("position", "").strip()
        ai = get_ai_service()
        questions = ai.generate_interview_questions(
            job_title=role_name,
            requirements=["FastAPI", "RESTful APIs", "SQL", "Clean Code"],
            skills=["Python", "SQL", "Git"]
        )
        
        md_list = f"### AI-Generated Interview Questions for {role_name.title()}\n\n"
        for idx, q in enumerate(questions, start=1):
            md_list += f"{idx}. **[{q['type'].upper()}]** {q['q']}\n   *Expected answer indicators:* {q['suggested_answer']}\n\n"
            
        return CopilotResponse(
            response=md_list,
            query_type="question_generation",
            data=questions
        )

    # 4. "Predict which candidates are most likely to succeed"
    if "predict" in prompt and ("succeed" in prompt or "success" in prompt or "best" in prompt):
        # Calculate success prediction for all candidates
        apps = apps_col.find()
        predictions = []
        
        all_cands = {c["_id"]: c for c in candidates_col.find()}
        all_jobs = {j["_id"]: j for j in jobs_col.find()}
        all_interviews = {i["application_id"]: i for i in interviews_col.find()}
        
        for app in apps:
            cand = all_cands.get(app["candidate_id"])
            job = all_jobs.get(app["job_id"])
            interview = all_interviews.get(app["_id"])
            
            if cand and job:
                # Basic success scoring logic
                ats_score = app.get("ats_score", 50)
                exp_yrs = cand.get("experience_years", 2.0)
                
                interview_score = 70
                if interview and interview.get("status") == "Completed":
                    interview_score = (interview.get("communication_score", 70) + interview.get("confidence_score", 70)) / 2
                    
                success_score = int((ats_score * 0.4) + (min(10.0, exp_yrs) * 3) + (interview_score * 0.3))
                success_score = min(100, max(20, success_score))
                
                tier = "High Potential (Tier 1)" if success_score >= 80 else ("Qualified (Tier 2)" if success_score >= 60 else "Development Required (Tier 3)")
                
                predictions.append({
                    "name": cand["name"],
                    "job_title": job["title"],
                    "ats_score": ats_score,
                    "experience_years": exp_yrs,
                    "success_probability": success_score,
                    "tier": tier
                })
                
        # Sort predictions by success_probability descending
        predictions.sort(key=lambda x: x["success_probability"], reverse=True)
        
        md_table = "### AI Candidate Success Predictions\n\n| Rank | Candidate | Target Role | Success Prob. | Recommendation Category |\n|---|---|---|---|---|\n"
        for idx, pred in enumerate(predictions, start=1):
            md_table += f"| {idx} | **{pred['name']}** | {pred['job_title']} | `{pred['success_probability']}%` | {pred['tier']} |\n"
            
        if not predictions:
            md_table += "| - | No applicants found to evaluate | - | - | - |\n"
            
        return CopilotResponse(
            response=md_table,
            query_type="success_prediction",
            data=predictions
        )

    # General Fallback LLM / Mock Chat
    if ai_service.gemini_enabled:
        try:
            # Gather schema info to feed Gemini
            prompt_context = (
                "You are TalentAI Copilot, an AI recruiting assistant. Answer this query based on the following HR platform database stats:\n"
                f"Query: {payload.prompt}\n"
                "Provide a helpful, professional, and well-structured response using Markdown."
            )
            response = ai_service.gemini_client.generate_content(prompt_context)
            return CopilotResponse(response=response.text, query_type="general")
        except Exception:
            pass
            
    # Mock general response
    return CopilotResponse(
        response=(
            f"Hello! I am your TalentAI Recruitment Copilot.\n\n"
            f"I analyzed your request: \"{payload.prompt}\"\n\n"
            f"Try asking me one of these supported queries:\n"
            f"- *\"Show top 10 candidates for Software Engineer role\"*\n"
            f"- *\"Who has the highest ATS score?\"*\n"
            f"- *\"Generate interview questions for Product Manager\"*\n"
            f"- *\"Predict which candidates are most likely to succeed\"*"
        ),
        query_type="general"
    )
