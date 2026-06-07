import logging
import random
import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.auth import get_password_hash
from backend.app.routes import auth, jobs, candidates, interviews, onboarding, analytics, copilot, employees, attendance, payroll, performance

logger = logging.getLogger("talentai.main")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for demo/hackathon ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(candidates.router, prefix=settings.API_V1_STR)
app.include_router(interviews.router, prefix=settings.API_V1_STR)
app.include_router(onboarding.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(copilot.router, prefix=settings.API_V1_STR)
app.include_router(employees.router, prefix=settings.API_V1_STR)
app.include_router(attendance.router, prefix=settings.API_V1_STR)
app.include_router(payroll.router, prefix=settings.API_V1_STR)
app.include_router(performance.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def seed_database():
    """Seed sample data if the collections are empty."""
    db = get_db()
    users_col = db.get_collection("Users")
    jobs_col = db.get_collection("Jobs")
    candidates_col = db.get_collection("Candidates")
    apps_col = db.get_collection("Applications")
    interviews_col = db.get_collection("Interviews")
    onboarding_col = db.get_collection("Onboarding")
    emp_col = db.get_collection("Employees")
    att_col = db.get_collection("Attendance")
    pay_col = db.get_collection("Payroll")
    perf_col = db.get_collection("Performance")
    
    # 1. Seed Users
    if users_col.count_documents({}) == 0:
        logger.info("Seeding default users...")
        default_users = [
            {
                "_id": "user_admin",
                "name": "Super Admin",
                "email": "admin@talentai.com",
                "hashed_password": get_password_hash("password123"),
                "role": "Management Admin",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "_id": "user_manager",
                "name": "Sarah Jenkins",
                "email": "manager@talentai.com",
                "hashed_password": get_password_hash("password123"),
                "role": "Senior Manager",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "_id": "user_recruiter",
                "name": "Michael Chang",
                "email": "recruiter@talentai.com",
                "hashed_password": get_password_hash("password123"),
                "role": "HR Recruiter",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "_id": "user_employee",
                "name": "Alice Smith",
                "email": "employee@talentai.com",
                "hashed_password": get_password_hash("password123"),
                "role": "Employee",
                "created_at": "2026-01-01T00:00:00Z"
            }
        ]
        for u in default_users:
            users_col.insert_one(u)

    # 2. Seed Jobs
    if jobs_col.count_documents({}) == 0:
        logger.info("Seeding sample jobs...")
        default_jobs = [
            {
                "_id": "job_python",
                "title": "Senior Python Developer",
                "department": "Engineering",
                "location": "San Francisco, CA",
                "type": "Full-time",
                "description": "We are looking for a Senior Python Developer to join our backend systems team. You will lead development of FastAPI web applications and integrations with core database services.",
                "requirements": ["Python", "FastAPI", "MongoDB", "SQL", "Docker", "RESTful APIs"],
                "status": "Published",
                "created_at": "2026-05-15T09:00:00Z",
                "ai_generated": False
            },
            {
                "_id": "job_analyst",
                "title": "Lead Data Analyst",
                "department": "Data Science",
                "location": "Remote",
                "type": "Full-time",
                "description": "Our product analytics division requires a Lead Data Analyst. You will formulate key metrics pipelines and create charts showing user retention, engagement, and conversion.",
                "requirements": ["SQL", "Python", "Data Analysis", "Tableau", "Pandas", "Statistics"],
                "status": "Published",
                "created_at": "2026-05-20T10:30:00Z",
                "ai_generated": False
            },
            {
                "_id": "job_pm",
                "title": "Technical Product Manager",
                "department": "Product Management",
                "location": "New York, NY",
                "type": "Full-time",
                "description": "Seeking an experienced Product Manager with high technical proficiency to steer development of our machine learning platform tools and dashboard features.",
                "requirements": ["Product Roadmapping", "Agile/Scrum", "Machine Learning concepts", "UX Design principles"],
                "status": "Published",
                "created_at": "2026-05-22T11:00:00Z",
                "ai_generated": False
            }
        ]
        for j in default_jobs:
            jobs_col.insert_one(j)

    # 3. Seed Candidates & Applications
    if candidates_col.count_documents({}) == 0:
        logger.info("Seeding sample candidates & applications...")
        
        # Candidate 1: Alice Smith (Python Developer, offered, has onboarding)
        c1 = {
            "_id": "cand_alice",
            "name": "Alice Smith",
            "email": "candidate@talentai.com",
            "phone": "+1-555-123-4567",
            "skills": ["Python", "FastAPI", "SQL", "Docker", "Git", "React"],
            "experience_years": 5.5,
            "education": "Master of Science in Computer Science - Stanford University",
            "resume_url": "alice_resume.pdf",
            "raw_resume_text": "Alice Smith. 5.5 years backend exp. Core skills: Python, FastAPI, Docker, SQL, Git."
        }
        candidates_col.insert_one(c1)
        
        a1 = {
            "_id": "app_alice",
            "candidate_id": "cand_alice",
            "job_id": "job_python",
            "status": "Offered",
            "ats_score": 88,
            "skill_gap": ["MongoDB"],
            "experience_analysis": "Alice has 5.5 years of strong Python experience, meeting the required backend stack perfectly except for MongoDB.",
            "fit_recommendation": "Shortlist",
            "applied_date": "2026-05-18T14:20:00Z"
        }
        apps_col.insert_one(a1)
        
        # Seed Onboarding for Alice
        onboarding_col.insert_one({
            "_id": "onb_alice",
            "application_id": "app_alice",
            "offer_letter_url": "offer_letter_app_alice.pdf",
            "checklist": [
                {"task": "Sign Offer Letter", "completed": True},
                {"task": "Upload Identity Documents", "completed": True},
                {"task": "Complete Background Check", "completed": False},
                {"task": "Setup Direct Deposit", "completed": False},
                {"task": "Attend Orientation", "completed": False}
            ],
            "documents": [
                {"name": "Academic Certificates", "status": "Verified"},
                {"name": "Signed NDA", "status": "Uploaded"}
            ],
            "status": "Initiated"
        })

        # Candidate 2: Bob Johnson (Data Analyst, interviewing, has scheduled interview)
        c2 = {
            "_id": "cand_bob",
            "name": "Bob Johnson",
            "email": "bob.johnson@example.com",
            "phone": "+1-555-987-6543",
            "skills": ["SQL", "Python", "Data Analysis", "Pandas", "Excel"],
            "experience_years": 4.0,
            "education": "Bachelor of Science in Statistics - UC Berkeley",
            "resume_url": "bob_resume.pdf",
            "raw_resume_text": "Bob Johnson. Data Analyst with 4 years experience. Skilled in SQL querying, Python analytics, Pandas, Excel."
        }
        candidates_col.insert_one(c2)
        
        a2 = {
            "_id": "app_bob",
            "candidate_id": "cand_bob",
            "job_id": "job_analyst",
            "status": "Interviewing",
            "ats_score": 92,
            "skill_gap": ["Tableau"],
            "experience_analysis": "Bob shows excellent analytical competence with 4 years of statistics work and deep SQL and Pandas familiarity.",
            "fit_recommendation": "Shortlist",
            "applied_date": "2026-05-21T09:15:00Z"
        }
        apps_col.insert_one(a2)
        
        # Seed Scheduled Interview for Bob
        interviews_col.insert_one({
            "_id": "int_bob",
            "application_id": "app_bob",
            "questions": [
                {
                    "q": "How do you handle missing or corrupt data in a Python analytics pipeline using Pandas?",
                    "type": "technical",
                    "suggested_answer": "Look for dropna(), fillna() usage and statistical strategies like mean/median imputation."
                },
                {
                    "q": "Describe a complex SQL query you designed. How did you optimize its join performance?",
                    "type": "technical",
                    "suggested_answer": "Assess indexing knowledge, CTE vs subquery, and explain plan diagnostic skills."
                },
                {
                    "q": "How do you explain technical analytical insights to non-technical business stakeholders?",
                    "type": "hr",
                    "suggested_answer": "Check for visual translation methods, empathy, and business focus."
                }
            ],
            "responses": [],
            "communication_score": 0,
            "confidence_score": 0,
            "overall_sentiment": "Pending",
            "feedback_summary": "Interview scheduled. Responses pending.",
            "scheduled_at": "2026-06-10T14:00:00Z",
            "status": "Scheduled"
        })

        # Candidate 3: Charlie Brown (Product Manager, rejected)
        c3 = {
            "_id": "cand_charlie",
            "name": "Charlie Brown",
            "email": "charlie@example.com",
            "phone": "+1-555-456-7890",
            "skills": ["UX Design principles", "Marketing"],
            "experience_years": 1.0,
            "education": "Bachelor of Arts in Communications",
            "resume_url": "charlie_resume.pdf",
            "raw_resume_text": "Charlie Brown. Communications major. Experience in visual marketing, product layouts, and basic customer surveys."
        }
        candidates_col.insert_one(c3)
        
        a3 = {
            "_id": "app_charlie",
            "candidate_id": "cand_charlie",
            "job_id": "job_pm",
            "status": "Rejected",
            "ats_score": 45,
            "skill_gap": ["Product Roadmapping", "Agile/Scrum", "Machine Learning concepts"],
            "experience_analysis": "Candidate is too junior (1 year experience) and lacks the agile roadmapping and technical machine learning experience required.",
            "fit_recommendation": "Reject",
            "applied_date": "2026-05-23T16:00:00Z"
        }
        apps_col.insert_one(a3)

        logger.info("Generating 200 additional sample candidates...")
        first_names = ["John", "Jane", "Mike", "Emily", "David", "Sarah", "Chris", "Jessica", "Matt", "Ashley", "Daniel", "Laura", "Kevin", "Amanda", "Brian", "Melissa", "Jason", "Stephanie", "Eric", "Nicole"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
        job_ids = ["job_python", "job_analyst", "job_pm"]
        statuses = ["Applied", "Screening", "Interviewing", "Offered", "Rejected"]
        skills_pool = ["Python", "SQL", "Data Analysis", "React", "Docker", "Java", "C++", "Machine Learning", "Agile", "Tableau", "AWS", "Azure", "Git", "Node.js", "MongoDB"]
        
        for i in range(200):
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            name = f"{fname} {lname}"
            cid = f"cand_gen_{i}_{uuid.uuid4().hex[:8]}"
            job_id = random.choice(job_ids)
            status = random.choice(statuses)
            
            c_skills = random.sample(skills_pool, random.randint(2, 6))
            candidates_col.insert_one({
                "_id": cid,
                "name": name,
                "email": f"{fname.lower()}.{lname.lower()}{i}@example.com",
                "phone": f"+1-555-{random.randint(100,999)}-{random.randint(1000,9999)}",
                "skills": c_skills,
                "experience_years": round(random.uniform(1.0, 15.0), 1),
                "education": "Bachelor's Degree",
                "resume_url": f"{fname.lower()}_{lname.lower()}_resume.pdf",
                "raw_resume_text": f"{name} resume text..."
            })
            
            apps_col.insert_one({
                "_id": f"app_gen_{i}_{uuid.uuid4().hex[:8]}",
                "candidate_id": cid,
                "job_id": job_id,
                "status": status,
                "ats_score": random.randint(30, 99),
                "skill_gap": ["Missing Skill"] if random.choice([True, False]) else [],
                "experience_analysis": "Auto-generated analysis.",
                "fit_recommendation": random.choice(["Shortlist", "Reject"]),
                "applied_date": (datetime.utcnow() - timedelta(days=random.randint(1, 60))).isoformat() + "Z"
            })
        logger.info("Finished generating sample candidates.")

    # 4. Seed Employees, Attendance, Payroll
    if emp_col.count_documents({}) == 0:
        logger.info("Seeding sample employees and HR data...")
        # Create core employees from default users
        employees_seed = [
            {
                "_id": "emp_admin",
                "user_id": "user_admin",
                "department": "Executive",
                "designation": "Chief Executive Officer",
                "joining_date": "2024-01-01",
                "manager_id": None,
                "status": "Active"
            },
            {
                "_id": "emp_manager",
                "user_id": "user_manager",
                "department": "Human Resources",
                "designation": "HR Director",
                "joining_date": "2024-03-15",
                "manager_id": "emp_admin",
                "status": "Active"
            },
            {
                "_id": "emp_employee",
                "user_id": "user_employee",
                "department": "Engineering",
                "designation": "Software Engineer",
                "joining_date": "2025-06-01",
                "manager_id": "emp_manager",
                "status": "Active"
            }
        ]
        
        for e in employees_seed:
            emp_col.insert_one(e)
            
            # Generate 5 days of attendance for each core employee
            for i in range(5):
                d = datetime.utcnow() - timedelta(days=i)
                att_col.insert_one({
                    "_id": f"att_{e['_id']}_{i}",
                    "employee_id": e["_id"],
                    "date": d.strftime("%Y-%m-%d"),
                    "clock_in": d.replace(hour=9, minute=random.randint(0, 30)).isoformat() + "Z",
                    "clock_out": d.replace(hour=17, minute=random.randint(0, 30)).isoformat() + "Z",
                    "status": "Present"
                })
            
            # Generate 1 payroll record for each core employee
            pay_col.insert_one({
                "_id": f"pay_{e['_id']}",
                "employee_id": e["_id"],
                "month": "May",
                "year": 2026,
                "base_salary": random.randint(5000, 15000),
                "bonuses": random.randint(0, 2000),
                "deductions": random.randint(500, 1500),
                "net_salary": random.randint(4500, 15500),
                "status": "Paid",
                "generated_at": datetime.utcnow().isoformat() + "Z"
            })
            
            # Generate 1 performance review for each core employee
            perf_col.insert_one({
                "_id": f"perf_{e['_id']}",
                "employee_id": e["_id"],
                "review_period": "Q1 2026",
                "kpis": [
                    {"goal": "Deliver Project X", "progress": random.randint(50, 100), "status": "In Progress"},
                    {"goal": "Improve Test Coverage", "progress": random.randint(20, 100), "status": "Pending"}
                ],
                "manager_feedback": "Excellent performance this quarter.",
                "overall_score": random.randint(75, 100),
                "created_at": datetime.utcnow().isoformat() + "Z"
            })

        # To demonstrate scalability up to 5000+, we will generate a pool of 50 sample employees.
        logger.info("Generating 50 additional sample employees...")
        first_names = ["Sam", "Taylor", "Jordan", "Alex", "Casey", "Morgan", "Riley", "Cameron", "Dakota", "Quinn"]
        last_names = ["Evans", "Stone", "Rivers", "Banks", "Hill", "Woods", "Ford", "Cross", "Gates", "Lake"]
        depts = ["Engineering", "Marketing", "Sales", "Support", "Finance"]
        
        for i in range(50):
            emp_id = f"emp_gen_{i}_{uuid.uuid4().hex[:8]}"
            user_id = f"user_gen_{i}_{uuid.uuid4().hex[:8]}"
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            
            users_col.insert_one({
                "_id": user_id,
                "name": name,
                "email": f"emp{i}@talentai.com",
                "hashed_password": get_password_hash("password123"),
                "role": "Employee",
                "created_at": "2026-01-01T00:00:00Z"
            })
            
            emp_col.insert_one({
                "_id": emp_id,
                "user_id": user_id,
                "department": random.choice(depts),
                "designation": "Staff",
                "joining_date": "2025-01-01",
                "manager_id": "emp_manager",
                "status": "Active"
            })


@app.get("/")
def read_root():
    return {"message": "Welcome to TalentAI HRMS API. Docs available at /docs"}
