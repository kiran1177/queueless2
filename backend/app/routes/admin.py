import uuid
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.database.connection import get_db
from app.database.seed import seed_database
from app.services.token_service import TokenService
from app.services.queue_engine import QueueEngine
from app.schemas.schemas import CapacityUpdateRequest, CounterUpdateRequest, TokenCreateRequest
from app.utils.helpers import get_today_str
from app.dependencies import require_admin, require_staff_or_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/overview", response_model=Dict[str, Any])
def get_admin_overview(officeId: Optional[str] = "OFF-RTO-01", role: str = Depends(require_staff_or_admin)):
    db = get_db()
    today_str = get_today_str()

    office = db.offices.find_one({"officeId": officeId}) or db.offices.find_one({})
    if office:
        office.pop("_id", None)

    tokens_today = list(db.tokens.find({"date": today_str}).sort([("slot", 1), ("generatedAt", 1)]))
    services_map = {s["serviceId"]: s["serviceName"] for s in db.services.find({})}
    
    for t in tokens_today:
        t.pop("_id", None)
        t["serviceName"] = services_map.get(t.get("serviceId"), t.get("serviceId"))

    counters = list(db.counters.find({}))
    for c in counters:
        c.pop("_id", None)

    # Breakdown
    waiting = [t for t in tokens_today if t.get("status") == "waiting"]
    processing = [t for t in tokens_today if t.get("status") in ["processing", "called"]]
    completed = [t for t in tokens_today if t.get("status") == "completed"]
    missed = [t for t in tokens_today if t.get("status") == "missed"]

    daily_capacity = office.get("dailyCapacity", 20) if office else 20

    return {
        "office": office,
        "counters": counters,
        "metrics": {
            "totalToday": len(tokens_today),
            "waiting": len(waiting),
            "processing": len(processing),
            "completed": len(completed),
            "missed": len(missed),
            "dailyCapacity": daily_capacity,
            "remainingCapacity": max(0, daily_capacity - len(tokens_today))
        },
        "tokens": {
            "all": tokens_today,
            "waiting": waiting,
            "processing": processing,
            "completed": completed,
            "missed": missed
        }
    }

@router.post("/call-next", response_model=Dict[str, Any])
def call_next_token(counterId: int, officeId: Optional[str] = "OFF-RTO-01", role: str = Depends(require_staff_or_admin)):
    """Assigns the next waiting token to the specified counter."""
    db = get_db()
    today_str = get_today_str()

    counter = db.counters.find_one({"counterId": counterId})
    if not counter:
        raise HTTPException(status_code=404, detail=f"Counter {counterId} not found.")

    if not counter.get("active", True):
        raise HTTPException(status_code=400, detail=f"Counter {counterId} is closed. Please open it first.")

    # Find earliest waiting token for today
    next_token = db.tokens.find_one(
        {"date": today_str, "status": "waiting"},
        sort=[("slot", 1), ("generatedAt", 1)]
    )

    if not next_token:
        raise HTTPException(status_code=404, detail="No waiting tokens available in the queue.")

    updated = TokenService.update_status(next_token["tokenId"], "called", counterId)
    return {
        "success": True,
        "message": f"Token {next_token.get('tokenNumber')} called to Counter {counterId}.",
        "token": updated
    }

@router.post("/walkin", response_model=Dict[str, Any])
def issue_walkin_token(serviceId: str, officeId: Optional[str] = "OFF-RTO-01", citizenName: Optional[str] = "Walk-in Citizen", role: str = Depends(require_staff_or_admin)):
    """Issues an offline/walk-in token directly at the counter."""
    db = get_db()
    user_id = f"usr_walkin_{uuid.uuid4().hex[:6]}"
    
    req = TokenCreateRequest(
        officeId=officeId,
        serviceId=serviceId,
        date=get_today_str(),
        slot=0,
        userId=user_id,
        userName=citizenName,
        userPhone="9000000000",
        source="walk-in"
    )
    new_token = TokenService.create_token(req)
    return new_token

@router.patch("/counter/{counterId}", response_model=Dict[str, Any])
def toggle_counter(counterId: int, payload: CounterUpdateRequest, role: str = Depends(require_admin)):
    db = get_db()
    counter = db.counters.find_one({"counterId": counterId})
    if not counter:
        raise HTTPException(status_code=404, detail="Counter not found.")

    db.counters.update_one(
        {"counterId": counterId},
        {"$set": {"active": payload.active}}
    )
    updated = db.counters.find_one({"counterId": counterId})
    updated.pop("_id", None)
    return updated

@router.patch("/capacity", response_model=Dict[str, Any])
def update_capacity(payload: CapacityUpdateRequest, officeId: Optional[str] = "OFF-RTO-01", role: str = Depends(require_admin)):
    db = get_db()
    db.offices.update_many({}, {"$set": {"dailyCapacity": payload.dailyCapacity}})
    return {"success": True, "dailyCapacity": payload.dailyCapacity}

@router.post("/reset-demo", response_model=Dict[str, Any])
def reset_demo(role: str = Depends(require_admin)):
    seed_database(force=True)
    return {"success": True, "message": "Demo data reset successfully."}

class StaffCreateRequest(BaseModel):
    name: str
    phone: str
    email: str
    password: str
    assignedOfficeId: str
    assignedCounterId: int

@router.get("/staff", response_model=List[Dict[str, Any]])
def get_staff(role: str = Depends(require_admin)):
    db = get_db()
    staff = list(db.users.find({"role": "staff"}))
    for s in staff:
        s.pop("_id", None)
        if "password" in s:
            s.pop("password")
    return staff

@router.post("/staff", response_model=Dict[str, Any])
def create_staff(req: StaffCreateRequest, role: str = Depends(require_admin)):
    db = get_db()
    if db.users.find_one({"phone": req.phone}):
        raise HTTPException(status_code=400, detail="Phone number already registered")
        
    from app.routes.auth import hash_password
    user_id = f"usr_staff_{uuid.uuid4().hex[:6]}"
    
    new_staff = {
        "userId": user_id,
        "name": req.name,
        "phone": req.phone,
        "email": req.email,
        "password": hash_password(req.password),
        "role": "staff",
        "assignedOfficeId": req.assignedOfficeId,
        "assignedCounterId": req.assignedCounterId,
        "status": "active",
        "createdAt": datetime.utcnow()
    }
    db.users.insert_one(new_staff)
    new_staff.pop("_id", None)
    new_staff.pop("password")
    return new_staff

