from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
import uuid

from backend.app.database import get_db
from backend.app.auth import get_current_user, RoleChecker
from backend.app.models import EmployeeCreate, EmployeeUpdate, EmployeeOut

router = APIRouter(prefix="/employees", tags=["Employees"])

admin_or_manager = RoleChecker(["Management Admin", "Senior Manager"])
all_roles = RoleChecker(["Management Admin", "Senior Manager", "HR Recruiter", "Employee"])

@router.post("", response_model=EmployeeOut)
def create_employee(emp_in: EmployeeCreate, current_user: dict = Depends(admin_or_manager)):
    db = get_db()
    users_col = db.get_collection("Users")
    
    # Check if email exists
    if users_col.find_one({"email": emp_in.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    from backend.app.auth import get_password_hash
    
    user_id = f"usr_{uuid.uuid4().hex[:8]}"
    
    # 1. Create User
    new_user = {
        "_id": user_id,
        "email": emp_in.email,
        "name": emp_in.name,
        "hashed_password": get_password_hash(emp_in.password),
        "role": "Employee",
        "created_at": datetime.utcnow().isoformat()
    }
    users_col.insert_one(new_user)
    
    # 2. Create Employee
    emp_col = db.get_collection("Employees")
    emp_dict = emp_in.model_dump(exclude={"name", "email", "password"})
    emp_dict["_id"] = f"emp_{uuid.uuid4().hex[:8]}"
    emp_dict["user_id"] = user_id
    
    emp_col.insert_one(emp_dict)
    
    # Add back name and email for the response
    emp_dict["name"] = new_user["name"]
    emp_dict["email"] = new_user["email"]
    
    return emp_dict

@router.get("", response_model=List[EmployeeOut])
def get_all_employees(current_user: dict = Depends(all_roles)):
    db = get_db()
    emp_col = db.get_collection("Employees")
    users_col = db.get_collection("Users")
    
    employees = emp_col.find()
    
    # Enrich with user data
    result = []
    for emp in employees:
        user = users_col.find_one({"_id": emp["user_id"]})
        if user:
            emp["name"] = user.get("name", "Unknown")
            emp["email"] = user.get("email", "Unknown")
        else:
            emp["name"] = "Unknown"
            emp["email"] = "Unknown"
        result.append(emp)
        
    return result

@router.get("/me", response_model=EmployeeOut)
def get_my_employee_profile(current_user: dict = Depends(all_roles)):
    db = get_db()
    emp_col = db.get_collection("Employees")
    emp = emp_col.find_one({"user_id": current_user["_id"]})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee record not found for this user")
        
    emp["name"] = current_user.get("name")
    emp["email"] = current_user.get("email")
    return emp

@router.get("/{emp_id}", response_model=EmployeeOut)
def get_employee(emp_id: str, current_user: dict = Depends(all_roles)):
    db = get_db()
    emp_col = db.get_collection("Employees")
    emp = emp_col.find_one({"_id": emp_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    users_col = db.get_collection("Users")
    user = users_col.find_one({"_id": emp["user_id"]})
    if user:
        emp["name"] = user.get("name")
        emp["email"] = user.get("email")
        
    return emp

@router.put("/{emp_id}", response_model=EmployeeOut)
def update_employee(emp_id: str, emp_in: EmployeeUpdate, current_user: dict = Depends(admin_or_manager)):
    db = get_db()
    emp_col = db.get_collection("Employees")
    emp = emp_col.find_one({"_id": emp_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    update_data = {k: v for k, v in emp_in.model_dump().items() if v is not None}
    if update_data:
        emp_col.update_one({"_id": emp_id}, update_data)
        emp.update(update_data)
        
    users_col = db.get_collection("Users")
    user = users_col.find_one({"_id": emp["user_id"]})
    if user:
        emp["name"] = user.get("name")
        emp["email"] = user.get("email")
        
    return emp
