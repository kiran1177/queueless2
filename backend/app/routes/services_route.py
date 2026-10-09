from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.database.connection import get_db

router = APIRouter(prefix="/api/services", tags=["Services"])

@router.get("", response_model=List[Dict[str, Any]])
def list_services(officeId: Optional[str] = None):
    db = get_db()
    query = {}
    if officeId:
        query["officeId"] = officeId
    services = list(db.services.find(query))
    for s in services:
        s.pop("_id", None)
    return services

@router.get("/{serviceId}", response_model=Dict[str, Any])
def get_service(serviceId: str):
    db = get_db()
    service = db.services.find_one({"serviceId": serviceId})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found.")
    service.pop("_id", None)
    return service
