import uuid
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.database.connection import get_db
from app.schemas.schemas import DocumentVerifyRequest, DocumentToggleRequest

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("", response_model=List[Dict[str, Any]])
def list_documents(userId: Optional[str] = "usr_priyanka", serviceId: Optional[str] = None):
    db = get_db()
    query = {"userId": userId}
    if serviceId:
        query["serviceId"] = serviceId
    
    docs = list(db.documents.find(query))
    services_map = {s["serviceId"]: s["serviceName"] for s in db.services.find({})}
    for d in docs:
        d.pop("_id", None)
        d["serviceName"] = services_map.get(d.get("serviceId"), d.get("serviceId"))
    return docs

@router.post("/toggle", response_model=Dict[str, Any])
def toggle_document_status(payload: DocumentToggleRequest):
    """Citizen or staff toggles readiness for a required document."""
    db = get_db()
    existing = db.documents.find_one({
        "userId": payload.userId,
        "serviceId": payload.serviceId,
        "documentType": payload.documentType
    })
    
    if existing:
        db.documents.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "status": payload.status,
                "verifiedAt": datetime.utcnow() if payload.status == "verified" else None
            }}
        )
        updated = db.documents.find_one({"_id": existing["_id"]})
        updated.pop("_id", None)
        return updated
    else:
        new_doc = {
            "documentId": f"DOC-{uuid.uuid4().hex[:8].upper()}",
            "userId": payload.userId,
            "serviceId": payload.serviceId,
            "documentType": payload.documentType,
            "status": payload.status,
            "uploadedAt": datetime.utcnow(),
            "verifiedAt": datetime.utcnow() if payload.status == "verified" else None,
            "notes": "Citizen verified status."
        }
        db.documents.insert_one(new_doc)
        new_doc.pop("_id", None)
        return new_doc

@router.patch("/{documentId}", response_model=Dict[str, Any])
def update_document(documentId: str, payload: DocumentVerifyRequest):
    db = get_db()
    doc = db.documents.find_one({"documentId": documentId})
    if not doc:
        raise HTTPException(status_code=404, detail="Document record not found.")
    
    update_data = {
        "status": payload.status,
        "verifiedAt": datetime.utcnow() if payload.status == "verified" else None
    }
    if payload.notes:
        update_data["notes"] = payload.notes
        
    db.documents.update_one({"documentId": documentId}, {"$set": update_data})
    updated = db.documents.find_one({"documentId": documentId})
    updated.pop("_id", None)
    return updated
