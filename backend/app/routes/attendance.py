from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
import uuid

from backend.app.database import get_db
from backend.app.auth import get_current_user, RoleChecker
from backend.app.models import AttendanceCreate, AttendanceOut

router = APIRouter(prefix="/attendance", tags=["Attendance"])

all_roles = RoleChecker(["Management Admin", "Senior Manager", "HR Recruiter", "Employee"])

@router.post("/clock-in", response_model=AttendanceOut)
def clock_in(current_user: dict = Depends(all_roles)):
    db = get_db()
    att_col = db.get_collection("Attendance")
    emp_col = db.get_collection("Employees")
    
    emp = emp_col.find_one({"user_id": current_user["_id"]})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee record not found for this user")
        
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    existing = att_col.find_one({"employee_id": emp["_id"], "date": date_str})
    if existing:
        raise HTTPException(status_code=400, detail="Already clocked in today")
        
    att_dict = {
        "_id": f"att_{uuid.uuid4().hex[:8]}",
        "employee_id": emp["_id"],
        "date": date_str,
        "clock_in": datetime.utcnow().isoformat() + "Z",
        "clock_out": None,
        "status": "Present"
    }
    att_col.insert_one(att_dict)
    return att_dict

@router.post("/clock-out", response_model=AttendanceOut)
def clock_out(current_user: dict = Depends(all_roles)):
    db = get_db()
    att_col = db.get_collection("Attendance")
    emp_col = db.get_collection("Employees")
    
    emp = emp_col.find_one({"user_id": current_user["_id"]})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee record not found for this user")
        
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    existing = att_col.find_one({"employee_id": emp["_id"], "date": date_str})
    if not existing:
        raise HTTPException(status_code=400, detail="Not clocked in today")
    if existing.get("clock_out"):
        raise HTTPException(status_code=400, detail="Already clocked out today")
        
    att_col.update_one(
        {"_id": existing["_id"]}, 
        {"clock_out": datetime.utcnow().isoformat() + "Z"}
    )
    existing["clock_out"] = datetime.utcnow().isoformat() + "Z"
    return existing

@router.get("", response_model=List[AttendanceOut])
def get_attendance(current_user: dict = Depends(all_roles)):
    db = get_db()
    att_col = db.get_collection("Attendance")
    emp_col = db.get_collection("Employees")
    
    if current_user["role"] == "Employee":
        emp = emp_col.find_one({"user_id": current_user["_id"]})
        if not emp:
            return []
        records = att_col.find({"employee_id": emp["_id"]})
        return list(records)
    
    # Managers and Admins can see all
    return list(att_col.find())
