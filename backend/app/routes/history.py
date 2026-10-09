from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from app.database.connection import get_db

router = APIRouter(prefix="/api/token-history", tags=["Token History"])

@router.get("", response_model=List[Dict[str, Any]])
def get_token_history(userId: Optional[str] = None):
    db = get_db()
    query = {}
    if userId:
        query["userId"] = userId
    
    history_items = list(db.tokenHistory.find(query).sort("completedAt", -1).limit(50))
    services_map = {s["serviceId"]: s["serviceName"] for s in db.services.find({})}
    offices_map = {o["officeId"]: o["officeName"] for o in db.offices.find({})}

    for h in history_items:
        h.pop("_id", None)
        h["serviceName"] = services_map.get(h.get("serviceId"), h.get("serviceId"))
        h["officeName"] = offices_map.get(h.get("officeId"), h.get("officeId"))
    
    return history_items
