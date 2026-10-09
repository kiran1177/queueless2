from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class TokenCreateRequest(BaseModel):
    officeId: str
    serviceId: str
    date: Optional[str] = None  # YYYY-MM-DD, defaults to today
    slot: Optional[int] = 0  # 0 for first available, or minutes from midnight e.g. 600 (10:00 AM)
    userId: Optional[str] = "usr_priyanka"
    userName: Optional[str] = "Priyanka Maheta"
    userPhone: Optional[str] = "9876543210"
    source: Optional[str] = "online"  # 'online' or 'walk-in'

class TokenStatusUpdateRequest(BaseModel):
    status: str  # waiting, called, processing, completed, missed, cancelled
    counterId: Optional[int] = None
    notes: Optional[str] = None

class CheckInRequest(BaseModel):
    qrCodeData: Optional[str] = None
    tokenId: str

class DocumentVerifyRequest(BaseModel):
    documentId: str
    status: str  # verified, pending, missing
    notes: Optional[str] = None

class DocumentToggleRequest(BaseModel):
    userId: str
    serviceId: str
    documentType: str
    status: str  # verified, pending, missing

class CounterUpdateRequest(BaseModel):
    active: bool
    serviceType: Optional[str] = None

class CapacityUpdateRequest(BaseModel):
    dailyCapacity: int = Field(gt=0, le=200)

class OfficeUpdateRequest(BaseModel):
    status: Optional[str] = None  # open, break, closed
    dailyCapacity: Optional[int] = None
    workingHours: Optional[str] = None

class UserCreateRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    role: Optional[str] = "citizen"
    city: Optional[str] = "Rajkot, Gujarat"

class ApiResponse(BaseModel):
    success: bool = True
    message: str = "Operation successful"
    data: Optional[Any] = None
