from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.database.connection import get_db
from app.services.token_service import TokenService
from app.services.queue_engine import QueueEngine
from app.schemas.schemas import TokenCreateRequest, TokenStatusUpdateRequest, CheckInRequest

router = APIRouter(prefix="/api/tokens", tags=["Tokens"])

@router.get("", response_model=List[Dict[str, Any]])
def list_tokens(
    officeId: Optional[str] = None,
    serviceId: Optional[str] = None,
    date: Optional[str] = None,
    status: Optional[str] = None,
    userId: Optional[str] = None
):
    db = get_db()
    query = {}
    if officeId:
        query["officeId"] = officeId
    if serviceId:
        query["serviceId"] = serviceId
    if date:
        query["date"] = date
    if status:
        query["status"] = status
    if userId:
        query["userId"] = userId

    tokens = list(db.tokens.find(query).sort([("slot", 1), ("generatedAt", 1)]))
    services_map = {s["serviceId"]: s["serviceName"] for s in db.services.find({})}
    offices_map = {o["officeId"]: o["officeName"] for o in db.offices.find({})}

    for t in tokens:
        t.pop("_id", None)
        t["serviceName"] = services_map.get(t.get("serviceId"), t.get("serviceId"))
        t["officeName"] = offices_map.get(t.get("officeId"), t.get("officeId"))

    return tokens

@router.get("/{tokenId}", response_model=Dict[str, Any])
def get_token(tokenId: str):
    db = get_db()
    token = db.tokens.find_one({"tokenId": tokenId})
    if not token:
        raise HTTPException(status_code=404, detail="Token not found.")
    
    metrics = QueueEngine.calculate_token_metrics(token)
    token.pop("_id", None)
    token["metrics"] = metrics
    
    # Enrich names
    srv = db.services.find_one({"serviceId": token.get("serviceId")})
    off = db.offices.find_one({"officeId": token.get("officeId")})
    token["serviceName"] = srv.get("serviceName") if srv else token.get("serviceId")
    token["officeName"] = off.get("officeName") if off else token.get("officeId")
    return token

@router.post("", response_model=Dict[str, Any], status_code=201)
def create_token(payload: TokenCreateRequest):
    new_token = TokenService.create_token(payload)
    return new_token

@router.patch("/{tokenId}/status", response_model=Dict[str, Any])
def update_token_status(tokenId: str, payload: TokenStatusUpdateRequest):
    updated = TokenService.update_status(tokenId, payload.status, payload.counterId)
    return updated

@router.post("/{tokenId}/checkin", response_model=Dict[str, Any])
def checkin_token(tokenId: str):
    updated = TokenService.check_in_token(tokenId)
    return updated

@router.delete("/{tokenId}", response_model=Dict[str, Any])
def cancel_token(tokenId: str, userId: Optional[str] = "usr_priyanka"):
    db = get_db()
    token = db.tokens.find_one({"tokenId": tokenId})
    if not token:
        raise HTTPException(status_code=404, detail="Token not found.")
    
    updated = TokenService.update_status(tokenId, "cancelled")
    return {"success": True, "message": f"Token {token.get('tokenNumber')} cancelled successfully."}
