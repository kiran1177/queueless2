from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UserModel(BaseModel):
    userId: str
    name: str
    email: Optional[str] = None
    phone: str
    role: str = "citizen"  # citizen, staff, admin
    city: Optional[str] = "Rajkot, Gujarat"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class OfficeModel(BaseModel):
    officeId: str
    officeName: str
    location: str
    availableServices: List[str]
    status: str = "open"  # open, break, closed
    workingHours: str = "09:00 AM - 05:00 PM"
    breakHours: str = "01:00 PM - 02:00 PM"
    currentToken: Optional[str] = None
    estimatedWaitingTime: int = 25
    dailyCapacity: int = 20
    activeCounters: int = 3

class ServiceModel(BaseModel):
    serviceId: str
    serviceName: str
    description: str
    requiredDocuments: List[str]
    estimatedProcessingTime: int  # minutes
    officeId: str
    icon: Optional[str] = "📄"

class DocumentItemModel(BaseModel):
    documentId: str
    userId: str
    serviceId: str
    documentType: str
    status: str = "pending"  # verified, pending, missing
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)
    verifiedAt: Optional[datetime] = None
    notes: Optional[str] = None

class TokenModel(BaseModel):
    tokenId: str
    tokenNumber: str
    userId: str
    officeId: str
    serviceId: str
    date: str  # YYYY-MM-DD
    slot: Optional[int] = 0  # minutes from midnight or 0 for first available
    slotLabel: Optional[str] = "First available"
    generatedAt: datetime = Field(default_factory=datetime.utcnow)
    status: str = "waiting"  # waiting, called, processing, completed, missed, cancelled
    queuePosition: int = 1
    estimatedWaitingTime: int = 15
    estimatedOutTime: Optional[str] = None
    currentServingToken: Optional[str] = None
    counterId: Optional[int] = None
    source: str = "online"  # online, walk-in
    qrCodeData: Optional[str] = None
    checkInStatus: bool = False
    checkInTime: Optional[datetime] = None

class TokenHistoryModel(BaseModel):
    historyId: str
    tokenId: str
    tokenNumber: str
    userId: str
    officeId: str
    serviceId: str
    status: str = "completed"  # completed, missed, cancelled
    createdAt: datetime
    completedAt: datetime = Field(default_factory=datetime.utcnow)
    waitDurationMinutes: Optional[int] = 18
    serviceDurationMinutes: Optional[int] = 12
    counterId: Optional[int] = None

class NotificationModel(BaseModel):
    notificationId: str
    userId: str
    title: str
    message: str
    type: str = "info"  # info, call, warn, ok
    read: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class CounterModel(BaseModel):
    counterId: int
    counterName: str
    active: bool = True
    currentTokenId: Optional[str] = None
    currentTokenNumber: Optional[str] = None
    serviceType: Optional[str] = "General Services"
