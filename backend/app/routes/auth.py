from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import hashlib
import os
import uuid
from datetime import datetime

from app.database.connection import get_db

auth_router = APIRouter(prefix="/api/auth", tags=["Auth"])

def hash_password(password: str, salt: str = None):
    if not salt:
        salt = os.urandom(16).hex()
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return f"{salt}${hashed}"

def verify_password(password: str, hashed_pw: str):
    try:
        salt, _ = hashed_pw.split("$")
        return hash_password(password, salt) == hashed_pw
    except ValueError:
        return False

class LoginRequest(BaseModel):
    phone: str
    password: str
    role: str

@auth_router.post("/login")
def login(request: LoginRequest):
    db = get_db()
    user = db.users.find_one({"phone": request.phone, "role": request.role})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if "password" in user:
        if not verify_password(request.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    else:
        # Seeded users fallback
        if request.password != "demo123":
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    response = {
        "userId": str(user["userId"]),
        "role": user["role"],
        "name": user["name"]
    }
    if "assignedCounterId" in user:
        response["assignedCounterId"] = user["assignedCounterId"]
    return response

class CitizenRegisterRequest(BaseModel):
    name: str
    phone: str
    password: str

@auth_router.post("/register")
def register_citizen(request: CitizenRegisterRequest):
    db = get_db()
    if db.users.find_one({"phone": request.phone}):
        raise HTTPException(status_code=400, detail="Phone number already registered")
        
    user_id = f"usr_citizen_{uuid.uuid4().hex[:8]}"
    db.users.insert_one({
        "userId": user_id,
        "name": request.name,
        "phone": request.phone,
        "password": hash_password(request.password),
        "role": "citizen",
        "city": "",
        "createdAt": datetime.utcnow()
    })
    return {"message": "Registration successful"}
