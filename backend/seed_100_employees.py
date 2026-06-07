import os
import random
import uuid
import datetime
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("backend/.env")

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_employees():
    uri = os.getenv("MONGODB_URI")
    if not uri:
        print("No MONGODB_URI found.")
        return
        
    client = MongoClient(uri)
    db = client[os.getenv("DB_NAME", "talentai_hrms")]
    
    users_col = db["Users"]
    emp_col = db["Employees"]
    att_col = db["Attendance"]
    pay_col = db["Payroll"]
    
    first_names = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
    departments = ["Engineering", "Sales", "Marketing", "Human Resources", "Finance", "Product", "Customer Support"]
    job_titles = ["Software Engineer", "Senior Software Engineer", "Account Executive", "Marketing Specialist", "HR Generalist", "Financial Analyst", "Product Manager", "Support Representative"]
    
    hashed_password = get_password_hash("password123")
    
    print("Generating 100 employees...")
    
    users_to_insert = []
    emps_to_insert = []
    atts_to_insert = []
    pays_to_insert = []
    
    today = datetime.datetime.utcnow()
    
    for i in range(1, 101):
        first = random.choice(first_names)
        last = random.choice(last_names)
        email = f"emp{i}.{first.lower()}@talentai.com"
        
        user_id = f"usr_{uuid.uuid4().hex[:8]}"
        emp_id = f"emp_{uuid.uuid4().hex[:8]}"
        
        # 1. User Record
        users_to_insert.append({
            "_id": user_id,
            "email": email,
            "name": f"{first} {last}",
            "hashed_password": hashed_password,
            "role": "Employee",
            "created_at": today.isoformat() + "Z"
        })
        
        # 2. Employee Record
        dept = random.choice(departments)
        if dept == "Engineering":
            title = random.choice(["Software Engineer", "Senior Software Engineer", "DevOps Engineer"])
            base_salary = random.randint(90000, 150000)
        elif dept == "Sales":
            title = random.choice(["Account Executive", "Sales Manager"])
            base_salary = random.randint(60000, 100000)
        else:
            title = random.choice(job_titles)
            base_salary = random.randint(50000, 110000)
            
        join_date = today - datetime.timedelta(days=random.randint(30, 1000))
        
        emps_to_insert.append({
            "_id": emp_id,
            "user_id": user_id,
            "name": f"{first} {last}",
            "email": email,
            "department": dept,
            "job_title": title,
            "manager_id": "usr_manager1",
            "base_salary": base_salary,
            "joining_date": join_date.strftime("%Y-%m-%d"),
            "status": "Active"
        })
        
        # 3. Attendance (last 30 days, skip weekends)
        # Give them random attendance probability
        att_prob = random.uniform(0.85, 1.0)
        for days_ago in range(30):
            d = today - datetime.timedelta(days=days_ago)
            if d.weekday() >= 5: continue # Skip sat/sun
            
            if random.random() <= att_prob:
                # Present
                att_id = f"att_{uuid.uuid4().hex[:8]}"
                clock_in = d.replace(hour=random.randint(8, 9), minute=random.randint(0, 59))
                clock_out = clock_in + datetime.timedelta(hours=random.randint(7, 9))
                
                atts_to_insert.append({
                    "_id": att_id,
                    "employee_id": emp_id,
                    "date": d.strftime("%Y-%m-%d"),
                    "clock_in": clock_in.isoformat() + "Z",
                    "clock_out": clock_out.isoformat() + "Z",
                    "status": "Present"
                })
        
        # 4. Payroll (Latest payslip)
        pays_to_insert.append({
            "_id": f"pay_{uuid.uuid4().hex[:8]}",
            "employee_id": emp_id,
            "period_start": (today.replace(day=1) - datetime.timedelta(days=30)).replace(day=1).strftime("%Y-%m-%d"),
            "period_end": (today.replace(day=1) - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
            "base_salary_amount": round(base_salary / 12, 2),
            "bonuses": 0,
            "deductions": round((base_salary / 12) * 0.2, 2), # 20% tax/deductions
            "net_pay": round((base_salary / 12) * 0.8, 2),
            "status": "Paid",
            "payment_date": today.replace(day=1).strftime("%Y-%m-%d")
        })

    # Clear existing employees generated by script (optional, but let's just insert)
    print("Inserting Users...")
    users_col.insert_many(users_to_insert)
    
    print("Inserting Employees...")
    emp_col.insert_many(emps_to_insert)
    
    print("Inserting Attendance...")
    att_col.insert_many(atts_to_insert)
    
    print("Inserting Payroll...")
    pay_col.insert_many(pays_to_insert)
    
    print("Done! 100 Employees seeded.")
    print("You can login as emp1.first@talentai.com with 'password123'")

if __name__ == "__main__":
    seed_employees()
