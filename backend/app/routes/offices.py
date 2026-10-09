from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.database.connection import get_db
from app.schemas.schemas import OfficeUpdateRequest
from app.utils.helpers import get_today_str

router = APIRouter(prefix="/api/offices", tags=["Offices"])

@router.get("", response_model=List[Dict[str, Any]])
def list_offices():
    db = get_db()
    today_str = get_today_str()
    offices = list(db.offices.find({}))
    for off in offices:
        off.pop("_id", None)
        # Count today's tokens
        issued_today = db.tokens.count_documents({
            "officeId": off.get("officeId"),
            "date": today_str,
            "status": {"$ne": "cancelled"}
        })
        off["tokensIssuedToday"] = issued_today
        off["remainingCapacity"] = max(0, off.get("dailyCapacity", 20) - issued_today)
    return offices

@router.get("/{officeId}", response_model=Dict[str, Any])
def get_office(officeId: str):
    db = get_db()
    today_str = get_today_str()
    office = db.offices.find_one({"officeId": officeId})
    if not office:
        raise HTTPException(status_code=404, detail="Office not found.")
    office.pop("_id", None)
    issued_today = db.tokens.count_documents({
        "officeId": officeId,
        "date": today_str,
        "status": {"$ne": "cancelled"}
    })
    office["tokensIssuedToday"] = issued_today
    office["remainingCapacity"] = max(0, office.get("dailyCapacity", 20) - issued_today)
    return office

@router.patch("/{officeId}", response_model=Dict[str, Any])
def update_office(officeId: str, payload: OfficeUpdateRequest):
    db = get_db()
    office = db.offices.find_one({"officeId": officeId})
    if not office:
        raise HTTPException(status_code=404, detail="Office not found.")
    
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    if update_data:
        db.offices.update_one({"officeId": officeId}, {"$set": update_data})
    
    updated = db.offices.find_one({"officeId": officeId})
    updated.pop("_id", None)
    return updated
