from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from app.database.connection import get_db
from app.utils.helpers import get_today_str, generate_day_slots

router = APIRouter(prefix="/api/calendar", tags=["Calendar"])

@router.get("", response_model=Dict[str, Any])
def get_calendar_events(
    userId: Optional[str] = "usr_priyanka",
    month: Optional[int] = None,
    year: Optional[int] = None
):
    db = get_db()
    today_str = get_today_str()
    today_date = date.today()

    cur_year = year or today_date.year
    cur_month = month or today_date.month

    # Fetch user tokens across dates
    user_tokens = list(db.tokens.find({
        "userId": userId,
        "status": {"$in": ["waiting", "called", "processing", "completed"]}
    }).sort("date", 1))

    events_by_date: Dict[str, List[Dict[str, Any]]] = {}
    services_map = {s["serviceId"]: s["serviceName"] for s in db.services.find({})}
    offices_map = {o["officeId"]: o["officeName"] for o in db.offices.find({})}

    for t in user_tokens:
        t.pop("_id", None)
        d = t.get("date")
        if d not in events_by_date:
            events_by_date[d] = []
        events_by_date[d].append({
            "tokenId": t.get("tokenId"),
            "tokenNumber": t.get("tokenNumber"),
            "serviceName": services_map.get(t.get("serviceId"), t.get("serviceId")),
            "officeName": offices_map.get(t.get("officeId"), t.get("officeId")),
            "slotLabel": t.get("slotLabel"),
            "status": t.get("status"),
            "isToday": d == today_str
        })

    # Available time slots structure
    slots = generate_day_slots(slot_duration=30)

    return {
        "today": today_str,
        "currentMonth": cur_month,
        "currentYear": cur_year,
        "events": events_by_date,
        "availableSlots": slots
    }
