from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
import uuid

from backend.app.database import get_db
from backend.app.auth import get_current_user, RoleChecker
from backend.app.models import PerformanceCreate, PerformanceUpdate, PerformanceOut

router = APIRouter(prefix="/performance", tags=["Performance"])

admin_or_manager = RoleChecker(["Management Admin", "Senior Manager"])
all_roles = RoleChecker(["Management Admin", "Senior Manager", "HR Recruiter", "Employee"])

@router.post("", response_model=PerformanceOut)
def create_performance_review(perf_in: PerformanceCreate, current_user: dict = Depends(admin_or_manager)):
    db = get_db()
    perf_col = db.get_collection("Performance")
    
    perf_dict = perf_in.model_dump()
    perf_dict["_id"] = f"perf_{uuid.uuid4().hex[:8]}"
    perf_dict["created_at"] = datetime.utcnow().isoformat() + "Z"
    
    perf_col.insert_one(perf_dict)
    return perf_dict

@router.get("", response_model=List[PerformanceOut])
def get_performance_reviews(current_user: dict = Depends(all_roles)):
    db = get_db()
    perf_col = db.get_collection("Performance")
    emp_col = db.get_collection("Employees")
    
    if current_user["role"] == "Employee":
        emp = emp_col.find_one({"user_id": current_user["_id"]})
        if not emp:
            return []
        records = perf_col.find({"employee_id": emp["_id"]})
        return list(records)
        
    return list(perf_col.find())

@router.put("/{perf_id}", response_model=PerformanceOut)
def update_performance_review(perf_id: str, perf_in: PerformanceUpdate, current_user: dict = Depends(admin_or_manager)):
    db = get_db()
    perf_col = db.get_collection("Performance")
    
    perf = perf_col.find_one({"_id": perf_id})
    if not perf:
        raise HTTPException(status_code=404, detail="Review not found")
        
    update_data = {k: v for k, v in perf_in.model_dump().items() if v is not None}
    if update_data:
        perf_col.update_one({"_id": perf_id}, update_data)
        perf.update(update_data)
        
    return perf
