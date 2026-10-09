import uuid
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import HTTPException
from app.database.connection import get_db
from app.services.queue_engine import QueueEngine
from app.utils.helpers import get_today_str, minutes_to_time_str
from app.schemas.schemas import TokenCreateRequest

logger = logging.getLogger("queueless.token_service")

class TokenService:
    @staticmethod
    def create_token(req: TokenCreateRequest) -> Dict[str, Any]:
        db = get_db()
        today_str = get_today_str()
        target_date = req.date if req.date else today_str

        # Validate office
        office = db.offices.find_one({"officeId": req.officeId})
        if not office:
            raise HTTPException(status_code=404, detail=f"Office '{req.officeId}' not found.")

        # Validate service
        service = db.services.find_one({"serviceId": req.serviceId})
        if not service:
            raise HTTPException(status_code=404, detail=f"Service '{req.serviceId}' not found.")

        # Check capacity
        daily_capacity = office.get("dailyCapacity", 20)
        issued_count = db.tokens.count_documents({
            "officeId": req.officeId,
            "date": target_date,
            "status": {"$ne": "cancelled"}
        })
        if issued_count >= daily_capacity:
            raise HTTPException(
                status_code=400,
                detail=f"Daily capacity of {daily_capacity} tokens reached for {office.get('officeName')} on {target_date}."
            )

        # Check if user already holds an active token today
        if req.userId:
            existing_active = db.tokens.find_one({
                "userId": req.userId,
                "date": target_date,
                "status": {"$in": ["waiting", "called", "processing"]}
            })
            if existing_active:
                raise HTTPException(
                    status_code=400,
                    detail=f"You already hold active token {existing_active.get('tokenNumber')}. One active token per citizen ensures fair queue management."
                )

        # Safe sequential token number
        token_num = QueueEngine.get_next_token_number(req.officeId, target_date)
        token_id = f"TOK-{uuid.uuid4().hex[:8].upper()}"

        slot_label = "First available"
        if req.slot and req.slot > 0:
            slot_label = f"{minutes_to_time_str(req.slot)} - {minutes_to_time_str(req.slot + 30)}"

        qr_content = f"QL|{token_num}|{req.serviceId}|{req.userId or 'ANON'}"

        new_token = {
            "tokenId": token_id,
            "tokenNumber": token_num,
            "userId": req.userId or "usr_priyanka",
            "officeId": req.officeId,
            "serviceId": req.serviceId,
            "date": target_date,
            "slot": req.slot or 0,
            "slotLabel": slot_label,
            "generatedAt": datetime.utcnow(),
            "status": "waiting",
            "queuePosition": 1,
            "estimatedWaitingTime": service.get("estimatedProcessingTime", 15),
            "estimatedOutTime": None,
            "currentServingToken": office.get("currentToken", "T-001"),
            "counterId": None,
            "source": req.source or "online",
            "qrCodeData": qr_content,
            "checkInStatus": False,
            "checkInTime": None
        }

        # Calculate queue metrics
        metrics = QueueEngine.calculate_token_metrics(new_token)
        new_token["queuePosition"] = metrics["queuePosition"]
        new_token["estimatedWaitingTime"] = metrics["estimatedWaitingTime"]
        new_token["estimatedOutTime"] = metrics["estimatedOutTime"]

        # Insert token into MongoDB
        db.tokens.insert_one(new_token)

        # Create confirmation notification for citizen
        if req.userId:
            notif = {
                "notificationId": f"NOTIF-{uuid.uuid4().hex[:8].upper()}",
                "userId": req.userId,
                "title": f"Token Generated: {token_num}",
                "message": f"Token {token_num} booked for {service.get('serviceName')}. Estimated wait: ~{metrics['estimatedWaitingTime']} minutes.",
                "type": "ok",
                "read": False,
                "createdAt": datetime.utcnow()
            }
            db.notifications.insert_one(notif)

        # Remove MongoDB _id before returning
        new_token.pop("_id", None)
        return new_token

    @staticmethod
    def update_status(token_id: str, new_status: str, counter_id: Optional[int] = None) -> Dict[str, Any]:
        db = get_db()
        token = db.tokens.find_one({"tokenId": token_id})
        if not token:
            raise HTTPException(status_code=404, detail="Token not found.")

        old_status = token.get("status")
        update_fields: Dict[str, Any] = {"status": new_status}

        if counter_id is not None:
            update_fields["counterId"] = counter_id

        # If completed, add to tokenHistory
        if new_status == "completed":
            history_entry = {
                "historyId": f"HIST-{uuid.uuid4().hex[:8].upper()}",
                "tokenId": token_id,
                "tokenNumber": token.get("tokenNumber"),
                "userId": token.get("userId"),
                "officeId": token.get("officeId"),
                "serviceId": token.get("serviceId"),
                "status": "completed",
                "createdAt": token.get("generatedAt", datetime.utcnow()),
                "completedAt": datetime.utcnow(),
                "waitDurationMinutes": 15,
                "serviceDurationMinutes": 10,
                "counterId": counter_id or token.get("counterId")
            }
            db.tokenHistory.insert_one(history_entry)

            # Free counter
            if counter_id:
                db.counters.update_one(
                    {"counterId": counter_id},
                    {"$set": {"currentTokenId": None, "currentTokenNumber": None}}
                )

        # If called or processing, update counter
        if new_status in ["called", "processing"] and counter_id:
            db.counters.update_one(
                {"counterId": counter_id},
                {"$set": {"currentTokenId": token_id, "currentTokenNumber": token.get("tokenNumber")}}
            )
            # Notify user
            if token.get("userId"):
                db.notifications.insert_one({
                    "notificationId": f"NOTIF-{uuid.uuid4().hex[:8].upper()}",
                    "userId": token.get("userId"),
                    "title": f"Turn Arrived: {token.get('tokenNumber')}",
                    "message": f"Token {token.get('tokenNumber')} has been called at Counter {counter_id}. Please proceed to counter.",
                    "type": "call",
                    "read": False,
                    "createdAt": datetime.utcnow()
                })

        db.tokens.update_one({"tokenId": token_id}, {"$set": update_fields})
        updated = db.tokens.find_one({"tokenId": token_id})
        updated.pop("_id", None)
        return updated

    @staticmethod
    def check_in_token(token_id: str) -> Dict[str, Any]:
        db = get_db()
        token = db.tokens.find_one({"tokenId": token_id})
        if not token:
            raise HTTPException(status_code=404, detail="Token not found.")

        db.tokens.update_one(
            {"tokenId": token_id},
            {"$set": {"checkInStatus": True, "checkInTime": datetime.utcnow()}}
        )

        if token.get("userId"):
            db.notifications.insert_one({
                "notificationId": f"NOTIF-{uuid.uuid4().hex[:8].upper()}",
                "userId": token.get("userId"),
                "title": f"Checked In: {token.get('tokenNumber')}",
                "message": f"Physical presence verified at government office for {token.get('tokenNumber')}.",
                "type": "ok",
                "read": False,
                "createdAt": datetime.utcnow()
            })

        updated = db.tokens.find_one({"tokenId": token_id})
        updated.pop("_id", None)
        return updated
