from datetime import datetime, date, timedelta
from typing import List, Dict, Any

def get_today_str() -> str:
    """Returns today's date in YYYY-MM-DD format."""
    return date.today().isoformat()

def minutes_to_time_str(minutes: int) -> str:
    """Converts minutes from midnight to 12-hour AM/PM format (e.g. 570 -> 9:30 AM)."""
    minutes = round(minutes)
    h = (minutes // 60) % 24
    m = minutes % 60
    period = "AM" if h < 12 else "PM"
    h12 = h % 12
    if h12 == 0:
        h12 = 12
    return f"{h12}:{m:02d} {period}"

def time_str_to_minutes(time_str: str) -> int:
    """Converts HH:MM string to minutes from midnight."""
    try:
        parts = time_str.split(":")
        return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        return 540  # default 9:00 AM

def get_peak_factor(minute_of_day: int) -> float:
    """
    Returns realistic load multiplier based on office hour conditions:
    - 09:00 - 10:00: 1.10x
    - 10:00 - 12:00: 1.30x (Peak morning rush)
    - 12:00 - 13:00: 1.00x
    - 13:00 - 14:00: Break period (1.5x / held)
    - 14:00 - 15:00: 0.90x
    - 15:00 - 17:00: 1.15x (Evening rush)
    """
    if minute_of_day < 600:
        return 1.10
    elif minute_of_day < 720:
        return 1.30
    elif minute_of_day < 780:
        return 1.00
    elif minute_of_day < 840:
        return 1.40
    elif minute_of_day < 900:
        return 0.90
    else:
        return 1.15

def get_office_status(now_minutes: int = None) -> Dict[str, Any]:
    """Determines if the government office is Open, on Lunch Break, or Closed."""
    if now_minutes is None:
        now = datetime.now()
        now_minutes = now.hour * 60 + now.minute
    
    # Office timings: 9:00 AM (540) to 5:00 PM (1020)
    # Break: 1:00 PM (780) to 2:00 PM (840)
    if now_minutes < 540:
        return {
            "status": "closed",
            "badge": "Closed (Opens 9:00 AM)",
            "message": "Office opens at 9:00 AM. Virtual tokens for today will start processing soon.",
            "isOpen": False
        }
    elif 780 <= now_minutes < 840:
        return {
            "status": "break",
            "badge": "Lunch Break (1:00 - 2:00 PM)",
            "message": "Staff lunch break in progress. Token counters resume actively at 2:00 PM.",
            "isOpen": False
        }
    elif now_minutes >= 1020:
        return {
            "status": "closed",
            "badge": "Closed for the day",
            "message": "Office counters are closed. You can book tokens for tomorrow.",
            "isOpen": False
        }
    else:
        return {
            "status": "open",
            "badge": "Counters Active (9 AM - 5 PM)",
            "message": "Public counters are currently serving tokens normally.",
            "isOpen": True
        }

def format_token_number(seq_num: int, prefix: str = "T") -> str:
    """Formats numeric sequence into T-014 format."""
    return f"{prefix}-{seq_num:03d}"

def generate_day_slots(slot_duration: int = 30) -> List[Dict[str, Any]]:
    """Generates 30-min service slots from 9:00 AM to 5:00 PM excluding 1:00-2:00 PM."""
    slots = []
    # 540 is 9:00 AM, 1020 is 5:00 PM
    cur = 540
    while cur < 1020:
        if 780 <= cur < 840:
            cur += slot_duration
            continue
        end = cur + slot_duration
        slots.append({
            "slotValue": cur,
            "label": f"{minutes_to_time_str(cur)} - {minutes_to_time_str(end)}",
            "isBreak": False
        })
        cur += slot_duration
    return slots
