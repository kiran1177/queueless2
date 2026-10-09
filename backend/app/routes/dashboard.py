from fastapi import APIRouter, Query
from typing import Optional, Dict, Any, List
from datetime import datetime, date, timedelta
from app.database.connection import get_db, get_connection_status
from app.services.queue_engine import QueueEngine
from app.utils.helpers import get_today_str, get_office_status, minutes_to_time_str

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=Dict[str, Any])
def get_dashboard_data(userId: Optional[str] = "usr_priyanka"):
    db = get_db()
    today_str = get_today_str()

    # 1. User Profile
    user = db.users.find_one({"userId": userId})
    if user:
        user.pop("_id", None)
    else:
        user = {
            "userId": userId,
            "name": "Priyanka Maheta",
            "phone": "9876543210",
            "role": "citizen",
            "city": "Rajkot, Gujarat"
        }

    # 2. Active Token for Citizen (waiting, called, processing)
    active_token = db.tokens.find_one({
        "userId": userId,
        "date": today_str,
        "status": {"$in": ["waiting", "called", "processing"]}
    })
    
    token_metrics = None
    if active_token:
        token_metrics = QueueEngine.calculate_token_metrics(active_token)
        active_token.pop("_id", None)
        active_token["metrics"] = token_metrics
    else:
        # Check if user has a future booked token
        future_token = db.tokens.find_one({
            "userId": userId,
            "date": {"$gt": today_str},
            "status": "waiting"
        })
        if future_token:
            future_token.pop("_id", None)
            active_token = future_token
            active_token["metrics"] = {
                "queuePosition": 1,
                "peopleAhead": 0,
                "estimatedWaitingTime": 0,
                "estimatedOutTime": future_token.get("slotLabel", "Booked"),
                "recommendedLeaveBy": "Appointment on " + future_token.get("date"),
                "currentServingToken": "Not started",
                "explanation": f"Booked for {future_token.get('date')}. Live queue tracking activates on the appointment day."
            }

    # 3. Upcoming Tokens for citizen
    upcoming_tokens = list(db.tokens.find({
        "userId": userId,
        "status": {"$in": ["waiting", "called", "processing"]}
    }).sort([("date", 1), ("slot", 1)]))
    for t in upcoming_tokens:
        t.pop("_id", None)
        # Attach service and office names
        srv = db.services.find_one({"serviceId": t.get("serviceId")})
        off = db.offices.find_one({"officeId": t.get("officeId")})
        t["serviceName"] = srv.get("serviceName") if srv else t.get("serviceId")
        t["officeName"] = off.get("officeName") if off else t.get("officeId")

    # 4. Calendar Appointments & Tokens
    calendar_tokens = list(db.tokens.find({
        "userId": userId,
        "status": {"$in": ["waiting", "called", "processing", "completed"]}
    }))
    for ct in calendar_tokens:
        ct.pop("_id", None)

    # 5. Office & Queue Status
    office_status = get_office_status()
    primary_office = db.offices.find_one({"officeId": "OFF-CIVIC-02"}) or db.offices.find_one({})
    if primary_office:
        primary_office.pop("_id", None)

    # 6. Counters
    counters = list(db.counters.find({}))
    for c in counters:
        c.pop("_id", None)

    # 7. Document Readiness Checklist (for active token service or Birth Cert)
    target_service_id = active_token.get("serviceId") if active_token else "SRV-BIRTH"
    service_doc = db.services.find_one({"serviceId": target_service_id})
    if service_doc:
        service_doc.pop("_id", None)

    user_docs = list(db.documents.find({
        "userId": userId,
        "serviceId": target_service_id
    }))
    for ud in user_docs:
        ud.pop("_id", None)

    # 8. Notifications
    notifs = list(db.notifications.find({"userId": userId}).sort("createdAt", -1).limit(6))
    for n in notifs:
        n.pop("_id", None)

    # 9. Recent Completed Token History
    history = list(db.tokenHistory.find({}).sort("completedAt", -1).limit(6))
    for h in history:
        h.pop("_id", None)
        srv = db.services.find_one({"serviceId": h.get("serviceId")})
        h["serviceName"] = srv.get("serviceName") if srv else h.get("serviceId")

    # 10. Summary Stats
    total_today = db.tokens.count_documents({"date": today_str})
    waiting_today = db.tokens.count_documents({"date": today_str, "status": "waiting"})
    serving_today = db.tokens.count_documents({"date": today_str, "status": {"$in": ["processing", "called"]}})
    completed_today = db.tokens.count_documents({"date": today_str, "status": "completed"})

    return {
        "user": user,
        "currentToken": active_token,
        "upcomingTokens": upcoming_tokens,
        "calendarTokens": calendar_tokens,
        "officeStatus": office_status,
        "primaryOffice": primary_office,
        "counters": counters,
        "service": service_doc,
        "documents": user_docs,
        "notifications": notifs,
        "recentHistory": history,
        "stats": {
            "totalToday": total_today,
            "waiting": waiting_today,
            "serving": serving_today,
            "completed": completed_today,
            "dailyCapacity": primary_office.get("dailyCapacity", 20) if primary_office else 20
        },
        "dbStatus": get_connection_status()
    }
