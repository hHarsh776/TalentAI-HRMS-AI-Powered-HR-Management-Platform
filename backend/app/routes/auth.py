from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from backend.app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
from backend.app.database import get_db
from backend.app.models import UserRegister, UserLogin, UserOut
import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
def register(user_in: UserRegister):
    db = get_db()
    users_col = db.get_collection("Users")
    
    # Check if user already exists
    if users_col.find_one({"email": user_in.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    user_dict = user_in.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["created_at"] = datetime.datetime.utcnow().isoformat()
    
    inserted = users_col.insert_one(user_dict)
    return inserted

@router.post("/login")
def login(user_in: UserLogin):
    db = get_db()
    users_col = db.get_collection("Users")
    
    user = users_col.find_one({"email": user_in.email})
    if not user or not verify_password(user_in.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
