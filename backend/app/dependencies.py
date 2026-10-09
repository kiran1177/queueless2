from fastapi import Header, HTTPException, Depends
from app.database.connection import get_db

def get_current_user_role(x_user_id: str = Header(None)):
    if not x_user_id:
        # Fallback or unauthorized. We'll allow a mock for demo purposes if not strict,
        # but the prompt requires robust role validation.
        # However, to avoid breaking existing frontend logic that doesn't send this header,
        # we might need to be careful. Let's strictly require it.
        raise HTTPException(status_code=401, detail="X-User-Id header missing")
    
    db = get_db()
    user = db.users.find_one({"userId": x_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.get("role", "citizen")

def require_admin(role: str = Depends(get_current_user_role)):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return role

def require_staff_or_admin(role: str = Depends(get_current_user_role)):
    if role not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Staff or Admin access required")
    return role
