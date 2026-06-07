from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field("Recruiter", description="Super Admin, HR Manager, Recruiter, Interviewer, Candidate")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    email: EmailStr
    role: str
    created_at: str

    class Config:
        populate_by_name = True


# --- Job Schemas ---
class JobCreate(BaseModel):
    title: str
    department: str
    location: str
    type: str = Field("Full-time", description="Full-time, Part-time, Contract, Remote")
    description: str
    requirements: List[str]

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    status: Optional[str] = None

class JobOut(BaseModel):
    id: str = Field(..., alias="_id")
    title: str
    department: str
    location: str
    type: str
    description: str
    requirements: List[str]
    status: str
    created_at: str

    class Config:
        populate_by_name = True


# --- Candidate Schemas ---
class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    skills: List[str]
    experience_years: float
    education: str
    resume_url: Optional[str] = ""
    raw_resume_text: Optional[str] = ""

class CandidateOut(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    email: EmailStr
    phone: str
    skills: List[str]
    experience_years: float
    education: str
    resume_url: str
    raw_resume_text: str

    class Config:
        populate_by_name = True


# --- Application Schemas ---
class ApplicationCreate(BaseModel):
    candidate_id: str
    job_id: str

class ApplicationUpdateStatus(BaseModel):
    status: str

class ApplicationOut(BaseModel):
    id: str = Field(..., alias="_id")
    candidate_id: str
    job_id: str
    status: str
    ats_score: int
    skill_gap: List[str]
    experience_analysis: str
    fit_recommendation: str
    applied_date: str

    class Config:
        populate_by_name = True


# --- Interview Schemas ---
class InterviewQuestion(BaseModel):
    q: str
    type: str  # technical, hr
    suggested_answer: Optional[str] = ""

class InterviewResponse(BaseModel):
    q: str
    transcript: str
    sentiment: str
    confidence_score: float

class InterviewCreate(BaseModel):
    application_id: str
    scheduled_at: str

class InterviewSubmitResponse(BaseModel):
    responses: List[InterviewResponse]

class InterviewOut(BaseModel):
    id: str = Field(..., alias="_id")
    application_id: str
    questions: List[Dict[str, Any]]
    responses: List[Dict[str, Any]]
    communication_score: int
    confidence_score: int
    overall_sentiment: str
    feedback_summary: str
    scheduled_at: str
    status: str

    class Config:
        populate_by_name = True


# --- Onboarding Schemas ---
class ChecklistItem(BaseModel):
    task: str
    completed: bool

class DocumentItem(BaseModel):
    name: str
    status: str  # Pending, Uploaded, Verified

class OnboardingCreate(BaseModel):
    application_id: str

class OnboardingUpdate(BaseModel):
    checklist: Optional[List[ChecklistItem]] = None
    documents: Optional[List[DocumentItem]] = None
    status: Optional[str] = None

class OnboardingOut(BaseModel):
    id: str = Field(..., alias="_id")
    application_id: str
    offer_letter_url: Optional[str] = ""
    offer_letter_text: Optional[str] = ""
    candidate_name: Optional[str] = None
    job_title: Optional[str] = None
    checklist: List[Dict[str, Any]]
    documents: List[Dict[str, Any]]
    status: str

    class Config:
        populate_by_name = True


# --- Copilot Schemas ---
class CopilotQuery(BaseModel):
    prompt: str

class CopilotResponse(BaseModel):
    response: str
    query_type: str
    data: Optional[List[Dict[str, Any]]] = None

# --- Employee Schemas ---
class EmployeeCreate(BaseModel):
    name: str
    email: str
    password: str
    department: str
    designation: str
    joining_date: str
    manager_id: Optional[str] = None
    status: str = Field("Active", description="Active, On Leave, Terminated")

class EmployeeUpdate(BaseModel):
    department: Optional[str] = None
    designation: Optional[str] = None
    manager_id: Optional[str] = None
    status: Optional[str] = None

class EmployeeOut(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    department: str
    designation: str
    joining_date: str
    manager_id: Optional[str] = None
    status: str

    class Config:
        populate_by_name = True

# --- Attendance Schemas ---
class AttendanceCreate(BaseModel):
    employee_id: str
    date: str
    clock_in: str
    clock_out: Optional[str] = None
    status: str = Field("Present", description="Present, Absent, Half Day")

class AttendanceOut(BaseModel):
    id: str = Field(..., alias="_id")
    employee_id: str
    date: str
    clock_in: str
    clock_out: Optional[str] = None
    status: str

    class Config:
        populate_by_name = True

# --- Payroll Schemas ---
class PayrollCreate(BaseModel):
    employee_id: str
    month: str
    year: int
    base_salary: float
    bonuses: float
    deductions: float
    net_salary: float
    status: str = Field("Paid", description="Paid, Pending")

class PayrollOut(BaseModel):
    id: str = Field(..., alias="_id")
    employee_id: str
    month: str
    year: int
    base_salary: float
    bonuses: float
    deductions: float
    net_salary: float
    status: str
    generated_at: str

    class Config:
        populate_by_name = True

# --- Performance Schemas ---
class KPIItem(BaseModel):
    goal: str
    progress: int # 0 to 100
    status: str

class PerformanceCreate(BaseModel):
    employee_id: str
    review_period: str
    kpis: List[KPIItem]
    manager_feedback: Optional[str] = None
    overall_score: Optional[int] = None # 0 to 100

class PerformanceUpdate(BaseModel):
    kpis: Optional[List[KPIItem]] = None
    manager_feedback: Optional[str] = None
    overall_score: Optional[int] = None

class PerformanceOut(BaseModel):
    id: str = Field(..., alias="_id")
    employee_id: str
    review_period: str
    kpis: List[Dict[str, Any]]
    manager_feedback: str
    overall_score: int
    created_at: str

    class Config:
        populate_by_name = True

