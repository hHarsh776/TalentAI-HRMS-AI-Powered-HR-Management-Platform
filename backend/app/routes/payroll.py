from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
import uuid

from backend.app.database import get_db
from backend.app.auth import get_current_user, RoleChecker
from backend.app.models import PayrollCreate, PayrollOut

router = APIRouter(prefix="/payroll", tags=["Payroll"])

admin_or_manager = RoleChecker(["Management Admin", "Senior Manager"])
all_roles = RoleChecker(["Management Admin", "Senior Manager", "HR Recruiter", "Employee"])

@router.post("", response_model=PayrollOut)
def generate_payroll(payroll_in: PayrollCreate, current_user: dict = Depends(admin_or_manager)):
    db = get_db()
    pay_col = db.get_collection("Payroll")
    
    pay_dict = payroll_in.model_dump()
    pay_dict["_id"] = f"pay_{uuid.uuid4().hex[:8]}"
    pay_dict["generated_at"] = datetime.utcnow().isoformat() + "Z"
    
    pay_col.insert_one(pay_dict)
    return pay_dict

@router.get("", response_model=List[PayrollOut])
def get_payroll(current_user: dict = Depends(all_roles)):
    db = get_db()
    pay_col = db.get_collection("Payroll")
    emp_col = db.get_collection("Employees")
    
    if current_user["role"] == "Employee":
        emp = emp_col.find_one({"user_id": current_user["_id"]})
        if not emp:
            return []
        records = pay_col.find({"employee_id": emp["_id"]})
        return list(records)
        
    return list(pay_col.find())
