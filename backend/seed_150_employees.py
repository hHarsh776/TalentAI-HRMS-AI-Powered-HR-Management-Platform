import os
import random
import uuid
import sys
from datetime import datetime, timedelta

# Add backend to path so we can import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.config import settings
from pymongo import MongoClient
import passlib.context

pwd_context = passlib.context.CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def run_seed():
    uri = settings.MONGODB_URI
    if not uri:
        print("MONGODB_URI not set. Using local sqlite via config?")
        return
        
    client = MongoClient(uri)
    db = client[settings.DATABASE_NAME]
    
    users_col = db["Users"]
    emp_col = db["Employees"]
    attendance_col = db["Attendance"]
    payroll_col = db["Payroll"]
    
    departments = ["Engineering", "Product", "Sales", "Marketing", "HR", "Finance", "Operations", "Customer Success"]
    job_titles = ["Software Engineer", "Product Manager", "Account Executive", "Marketing Specialist", "HR Generalist", "Financial Analyst", "Operations Coordinator", "Customer Success Manager"]
    
    print(f"Connected to DB: {settings.DATABASE_NAME}. Starting to seed 150 employees...")
    
    new_users = []
    new_employees = []
    new_attendance = []
    new_payroll = []
    
    for i in range(150):
        emp_num = i + 101 # starting from 101 to avoid colliding with previous 100 if we want
        name = f"Sample Emp {emp_num}"
        email = f"emp{emp_num}@talentai.com"
        
        user_id = f"usr_{uuid.uuid4().hex[:8]}"
        emp_id = f"emp_{uuid.uuid4().hex[:8]}"
        
        department = random.choice(departments)
        job_title = job_titles[departments.index(department)]
        base_salary = random.randint(50000, 150000)
        
        # User
        new_users.append({
            "_id": user_id,
            "email": email,
            "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQYq", # password123
            "name": name,
            "role": "Employee",
            "created_at": datetime.utcnow().isoformat()
        })
        
        # Employee
        new_employees.append({
            "_id": emp_id,
            "user_id": user_id,
            "department": department,
            "designation": job_title,
            "job_title": job_title,
            "manager_id": "usr_manager1",
            "joining_date": (datetime.utcnow() - timedelta(days=random.randint(30, 1000))).date().isoformat(),
            "base_salary": base_salary,
            "status": "Active"
        })
        
        # Attendance (last 30 days)
        for day in range(30):
            if random.random() < 0.95: # 95% attendance
                date_str = (datetime.utcnow() - timedelta(days=day)).date().isoformat()
                new_attendance.append({
                    "_id": f"att_{uuid.uuid4().hex[:8]}",
                    "employee_id": emp_id,
                    "date": date_str,
                    "status": "Present",
                    "clock_in": "09:00:00",
                    "clock_out": "17:00:00"
                })
                
        # Payroll (latest)
        tax = base_salary * 0.20
        new_payroll.append({
            "_id": f"pay_{uuid.uuid4().hex[:8]}",
            "employee_id": emp_id,
            "period_start": (datetime.utcnow().replace(day=1) - timedelta(days=30)).date().isoformat(),
            "period_end": (datetime.utcnow().replace(day=1) - timedelta(days=1)).date().isoformat(),
            "base_salary": base_salary / 12,
            "bonuses": 0,
            "deductions": tax / 12,
            "net_pay": (base_salary - tax) / 12,
            "status": "Paid",
            "payment_date": datetime.utcnow().date().isoformat()
        })

    if new_users:
        users_col.insert_many(new_users)
        emp_col.insert_many(new_employees)
        attendance_col.insert_many(new_attendance)
        payroll_col.insert_many(new_payroll)
        print(f"Successfully inserted {len(new_users)} employees into {settings.DATABASE_NAME} database!")
    else:
        print("Nothing inserted.")

if __name__ == "__main__":
    run_seed()
