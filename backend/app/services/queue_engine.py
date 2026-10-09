import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.database.connection import get_db
from app.utils.helpers import (
    get_today_str,
    minutes_to_time_str,
    get_peak_factor,
    get_office_status
)

logger = logging.getLogger("queueless.queue_engine")

class QueueEngine:
    @staticmethod
    def calculate_token_metrics(token_doc: Dict[str, Any], travel_time_min: int = 25) -> Dict[str, Any]:
        """
        Calculates real-time dynamic queue metrics for a specific token:
        - Queue position
        - People ahead
        - Active serving counters
        - Estimated waiting time (minutes)
        - Estimated out-time / service time
        - Recommended leave-by time (taking travel buffer into account)
        - Current serving token at counter
        """
        db = get_db()
        today_str = get_today_str()
        office_id = token_doc.get("officeId")
        date_str = token_doc.get("date", today_str)
        token_id = token_doc.get("tokenId")
        token_status = token_doc.get("status", "waiting")

        # If already completed, missed or cancelled
        if token_status in ["completed", "missed", "cancelled"]:
            return {
                "queuePosition": 0,
                "peopleAhead": 0,
                "estimatedWaitingTime": 0,
                "estimatedOutTime": token_doc.get("estimatedOutTime") or "Done",
                "recommendedLeaveBy": "N/A",
                "currentServingToken": "Completed",
                "explanation": "Token processing is complete."
            }

        # If currently processing or called
        if token_status in ["processing", "called"]:
            return {
                "queuePosition": 0,
                "peopleAhead": 0,
                "estimatedWaitingTime": 0,
                "estimatedOutTime": "Currently at Counter",
                "recommendedLeaveBy": "Arrive immediately",
                "currentServingToken": token_doc.get("tokenNumber"),
                "explanation": f"Your token is called at Counter {token_doc.get('counterId', 1)}."
            }

        # Active counters
        active_counters = list(db.counters.find({"active": True}))
        num_counters = max(1, len(active_counters))

        # Currently serving tokens in office
        serving_tokens = list(db.tokens.find({
            "officeId": office_id,
            "date": date_str,
            "status": {"$in": ["processing", "called"]}
        }))
        current_serving_str = ", ".join([t["tokenNumber"] for t in serving_tokens]) if serving_tokens else "T-001"

        # Find all tokens waiting ahead of this token
        # Sorting priority: slot ASC, generatedAt ASC
        my_slot = token_doc.get("slot", 0)
        my_gen = token_doc.get("generatedAt", datetime.utcnow())

        all_active_tokens = list(db.tokens.find({
            "officeId": office_id,
            "date": date_str,
            "status": "waiting"
        }).sort([("slot", 1), ("generatedAt", 1)]))

        people_ahead = 0
        sum_ahead_service_time = 0

        # Load services mapping for service processing times
        services_map = {s["serviceId"]: s.get("estimatedProcessingTime", 15) for s in db.services.find({})}

        for other in all_active_tokens:
            if other.get("tokenId") == token_id:
                break
            people_ahead += 1
            srv_time = services_map.get(other.get("serviceId"), 15)
            sum_ahead_service_time += srv_time

        my_srv_time = services_map.get(token_doc.get("serviceId"), 15)
        sum_ahead_service_time += my_srv_time

        # Current clock minutes from midnight
        now = datetime.now()
        cur_min = now.hour * 60 + now.minute
        peak = get_peak_factor(cur_min)

        # Baseline wait distributed across active counters
        raw_wait = (sum_ahead_service_time / num_counters) * peak

        # Lunch break adjustment (1:00 PM - 2:00 PM: 780 to 840 min)
        target_minute = cur_min + raw_wait
        lunch_adjustment = 0
        if cur_min < 780 and target_minute >= 780:
            # Overlaps lunch break: add 60 minutes
            lunch_adjustment = 60
            raw_wait += lunch_adjustment

        est_wait = max(5, round(raw_wait))
        est_arrival_min = cur_min + est_wait
        out_time_str = minutes_to_time_str(est_arrival_min)

        # Travel buffer
        leave_by_min = max(cur_min, est_arrival_min - (travel_time_min + 10))
        leave_by_str = minutes_to_time_str(leave_by_min)
        if est_wait <= travel_time_min + 10:
            leave_by_str = "Leave now"

        queue_position = people_ahead + 1

        explanation = (
            f"{people_ahead} citizens waiting ahead across {num_counters} active counters. "
            f"Factored with {peak:.1f}x time load multiplier and official 9 AM - 5 PM office schedule."
        )
        if lunch_adjustment > 0:
            explanation += " (Includes 1:00 PM - 2:00 PM lunch break adjustment)."

        return {
            "queuePosition": queue_position,
            "peopleAhead": people_ahead,
            "estimatedWaitingTime": est_wait,
            "estimatedOutTime": out_time_str,
            "recommendedLeaveBy": leave_by_str,
            "currentServingToken": current_serving_str,
            "activeCountersCount": num_counters,
            "peakFactor": peak,
            "explanation": explanation
        }

    @staticmethod
    def get_next_token_number(office_id: str, date_str: str) -> str:
        """Safely generates the next sequential token number for an office/day."""
        db = get_db()
        # Find all tokens for office on date
        cursor = db.tokens.find({"officeId": office_id, "date": date_str})
        max_num = 0
        for doc in cursor:
            tok_num = doc.get("tokenNumber", "")
            # Expect format T-XXX or B-XXX
            if "-" in tok_num:
                try:
                    num_part = int(tok_num.split("-")[1])
                    if num_part > max_num:
                        max_num = num_part
                except Exception:
                    pass
        next_num = max_num + 1
        return f"T-{next_num:03d}"
