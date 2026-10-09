from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.database.connection import get_db

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[Dict[str, Any]])
def get_notifications(userId: Optional[str] = "usr_priyanka"):
    db = get_db()
    notifs = list(db.notifications.find({"userId": userId}).sort("createdAt", -1).limit(25))
    for n in notifs:
        n.pop("_id", None)
    return notifs

@router.patch("/{notificationId}/read", response_model=Dict[str, Any])
def mark_notification_read(notificationId: str):
    db = get_db()
    res = db.notifications.update_one({"notificationId": notificationId}, {"$set": {"read": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return {"success": True, "message": "Notification marked as read."}

@router.post("/mark-all-read", response_model=Dict[str, Any])
def mark_all_read(userId: Optional[str] = "usr_priyanka"):
    db = get_db()
    db.notifications.update_many({"userId": userId}, {"$set": {"read": True}})
    return {"success": True, "message": "All notifications marked read."}
