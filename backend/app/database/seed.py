import logging
from datetime import datetime, timedelta, date
from app.database.connection import get_db
from app.utils.helpers import get_today_str

logger = logging.getLogger("queueless.seed")

def seed_database(force: bool = False):
    db = get_db()
    today_str = get_today_str()

    # Check if offices already exist
    if not force and db.offices.count_documents({}) > 0:
        logger.info("Database already seeded. Skipping initial seed.")
        return

    logger.info("Seeding QueueLess database with official government data...")

    # 1. Offices
    offices_data = [
        {
            "officeId": "OFF-RTO-01",
            "officeName": "Rajkot Regional Transport Office (RTO)",
            "location": "Near Madhapar Chokdi, Jamnagar Highway, Rajkot - 360006",
            "availableServices": ["SRV-DL", "SRV-DV", "SRV-RC"],
            "status": "open",
            "workingHours": "09:00 AM - 05:00 PM",
            "breakHours": "01:00 PM - 02:00 PM",
            "currentToken": "T-006",
            "estimatedWaitingTime": 28,
            "dailyCapacity": 20,
            "activeCounters": 3
        },
        {
            "officeId": "OFF-CIVIC-02",
            "officeName": "Ahmedabad Jan Seva Kendra (Civic Center)",
            "location": "Paldi Cross Roads, Ellisbridge, Ahmedabad - 380006",
            "availableServices": ["SRV-BIRTH", "SRV-INCOME", "SRV-DV"],
            "status": "open",
            "workingHours": "09:00 AM - 05:00 PM",
            "breakHours": "01:00 PM - 02:00 PM",
            "currentToken": "T-005",
            "estimatedWaitingTime": 22,
            "dailyCapacity": 25,
            "activeCounters": 3
        },
        {
            "officeId": "OFF-REV-03",
            "officeName": "Surat District Collectorate & Revenue Office",
            "location": "Nanpura Bahumali Bhavan, Surat - 395001",
            "availableServices": ["SRV-INCOME", "SRV-DV", "SRV-PASSPORT"],
            "status": "open",
            "workingHours": "09:00 AM - 05:00 PM",
            "breakHours": "01:00 PM - 02:00 PM",
            "currentToken": "T-007",
            "estimatedWaitingTime": 18,
            "dailyCapacity": 20,
            "activeCounters": 2
        }
    ]
    db.offices.delete_many({})
    db.offices.insert_many(offices_data)

    # 2. Services
    services_data = [
        {
            "serviceId": "SRV-BIRTH",
            "serviceName": "Birth Certificate Issuance",
            "description": "Registration and issuance of official legal birth certificate.",
            "requiredDocuments": [
                "Hospital Birth Discharge Summary",
                "Parents Aadhaar Cards",
                "Marriage Certificate of Parents",
                "Permanent Address Proof"
            ],
            "estimatedProcessingTime": 12,
            "officeId": "OFF-CIVIC-02",
            "icon": "📄"
        },
        {
            "serviceId": "SRV-DL",
            "serviceName": "Driving License (New / Renewal)",
            "description": "Biometric capture, test slot verification, and smart card driving license issuance.",
            "requiredDocuments": [
                "Learner License Test Slip",
                "Original Aadhaar Card",
                "Two Passport-size Photographs",
                "Medical Fitness Certificate (Form 1A)"
            ],
            "estimatedProcessingTime": 18,
            "officeId": "OFF-RTO-01",
            "icon": "🚗"
        },
        {
            "serviceId": "SRV-DV",
            "serviceName": "Document Verification & Attestation",
            "description": "Gazetted document validation and notary counter attestation.",
            "requiredDocuments": [
                "Original Academic / Identity Certificates",
                "Two Self-Attested Photocopies",
                "Valid Government Photo ID Proof"
            ],
            "estimatedProcessingTime": 8,
            "officeId": "OFF-RTO-01",
            "icon": "✅"
        },
        {
            "serviceId": "SRV-INCOME",
            "serviceName": "Income Certificate Issuance",
            "description": "Tahsildar approved family income certificate for scholarships and official benefits.",
            "requiredDocuments": [
                "Income Affidavit on Stamp Paper",
                "Last 3 Months Salary Slips / Form 16",
                "Ration Card Copy",
                "Recent Electricity / Utility Bill"
            ],
            "estimatedProcessingTime": 15,
            "officeId": "OFF-CIVIC-02",
            "icon": "💼"
        },
        {
            "serviceId": "SRV-PASSPORT",
            "serviceName": "Passport Verification & Annexures",
            "description": "Verification of documents and police verification forwardal for passport issuance.",
            "requiredDocuments": [
                "Passport Online ARN Receipt",
                "Original Birth Certificate",
                "Aadhaar Card with Biometric Proof",
                "Residential Address Proof (1 Year)"
            ],
            "estimatedProcessingTime": 22,
            "officeId": "OFF-REV-03",
            "icon": "🛂"
        }
    ]
    db.services.delete_many({})
    db.services.insert_many(services_data)

    # 3. Counters
    counters_data = [
        {
            "counterId": 1,
            "counterName": "Counter 1",
            "active": True,
            "currentTokenId": "TOK-005",
            "currentTokenNumber": "T-005",
            "serviceType": "Birth Certificate & Document Verification"
        },
        {
            "counterId": 2,
            "counterName": "Counter 2",
            "active": True,
            "currentTokenId": "TOK-006",
            "currentTokenNumber": "T-006",
            "serviceType": "Driving License & Vehicle Services"
        },
        {
            "counterId": 3,
            "counterName": "Counter 3",
            "active": True,
            "currentTokenId": "TOK-007",
            "currentTokenNumber": "T-007",
            "serviceType": "Revenue, Income & Attestation"
        }
    ]
    db.counters.delete_many({})
    db.counters.insert_many(counters_data)

    # 4. Users
    users_data = [
        {
            "userId": "usr_priyanka",
            "name": "Priyanka Maheta",
            "email": "priyanka.maheta@example.in",
            "phone": "9876543210",
            "role": "citizen",
            "city": "Rajkot, Gujarat",
            "createdAt": datetime.utcnow() - timedelta(days=15)
        },
        {
            "userId": "usr_staff_01",
            "name": "Rajesh Vaghela",
            "email": "rajesh.rto@gujarat.gov.in",
            "phone": "9876543211",
            "role": "staff",
            "city": "Rajkot RTO Office",
            "assignedOfficeId": "OFF-RTO-01",
            "assignedCounterId": 1,
            "status": "active",
            "createdAt": datetime.utcnow() - timedelta(days=90)
        },
        {
            "userId": "usr_admin_01",
            "name": "Office Administrator",
            "email": "admin.rto@gujarat.gov.in",
            "phone": "9876543212",
            "role": "admin",
            "city": "Rajkot RTO Office",
            "createdAt": datetime.utcnow() - timedelta(days=120)
        }
    ]
    db.users.delete_many({})
    db.users.insert_many(users_data)

    # 5. Documents for citizen Priyanka
    docs_data = [
        # Birth cert docs
        {
            "documentId": "DOC-001",
            "userId": "usr_priyanka",
            "serviceId": "SRV-BIRTH",
            "documentType": "Hospital Birth Discharge Summary",
            "status": "verified",
            "uploadedAt": datetime.utcnow() - timedelta(days=2),
            "verifiedAt": datetime.utcnow() - timedelta(days=1),
            "notes": "Verified against civil hospital seal."
        },
        {
            "documentId": "DOC-002",
            "userId": "usr_priyanka",
            "serviceId": "SRV-BIRTH",
            "documentType": "Parents Aadhaar Cards",
            "status": "verified",
            "uploadedAt": datetime.utcnow() - timedelta(days=2),
            "verifiedAt": datetime.utcnow() - timedelta(days=1),
            "notes": "UIDAI e-KYC verified."
        },
        {
            "documentId": "DOC-003",
            "userId": "usr_priyanka",
            "serviceId": "SRV-BIRTH",
            "documentType": "Marriage Certificate of Parents",
            "status": "verified",
            "uploadedAt": datetime.utcnow() - timedelta(days=2),
            "verifiedAt": datetime.utcnow() - timedelta(hours=14),
            "notes": "Sub-registrar copy authenticated."
        },
        {
            "documentId": "DOC-004",
            "userId": "usr_priyanka",
            "serviceId": "SRV-BIRTH",
            "documentType": "Permanent Address Proof",
            "status": "pending",
            "uploadedAt": datetime.utcnow() - timedelta(hours=5),
            "verifiedAt": None,
            "notes": "Awaiting front desk verification."
        },
        # Driving license docs
        {
            "documentId": "DOC-005",
            "userId": "usr_priyanka",
            "serviceId": "SRV-DL",
            "documentType": "Learner License Test Slip",
            "status": "verified",
            "uploadedAt": datetime.utcnow() - timedelta(days=3),
            "verifiedAt": datetime.utcnow() - timedelta(days=2),
            "notes": "Parivahan record LL-2026-993 verified."
        },
        {
            "documentId": "DOC-006",
            "userId": "usr_priyanka",
            "serviceId": "SRV-DL",
            "documentType": "Original Aadhaar Card",
            "status": "verified",
            "uploadedAt": datetime.utcnow() - timedelta(days=3),
            "verifiedAt": datetime.utcnow() - timedelta(days=2),
            "notes": "Verified."
        },
        {
            "documentId": "DOC-007",
            "userId": "usr_priyanka",
            "serviceId": "SRV-DL",
            "documentType": "Two Passport-size Photographs",
            "status": "verified",
            "uploadedAt": datetime.utcnow() - timedelta(days=3),
            "verifiedAt": datetime.utcnow() - timedelta(days=2),
            "notes": "Standard 35x45mm format checked."
        },
        {
            "documentId": "DOC-008",
            "userId": "usr_priyanka",
            "serviceId": "SRV-DL",
            "documentType": "Medical Fitness Certificate (Form 1A)",
            "status": "missing",
            "uploadedAt": datetime.utcnow(),
            "verifiedAt": None,
            "notes": "Registered MBBS doctor sign required."
        }
    ]
    db.documents.delete_many({})
    db.documents.insert_many(docs_data)

    # 6. Seed Tokens for Today
    tokens_data = [
        # Completed earlier today
        {
            "tokenId": "TOK-001",
            "tokenNumber": "T-001",
            "userId": "usr_citizen_901",
            "officeId": "OFF-CIVIC-02",
            "serviceId": "SRV-BIRTH",
            "date": today_str,
            "slot": 540,
            "slotLabel": "09:00 AM - 09:30 AM",
            "generatedAt": datetime.utcnow() - timedelta(hours=2, minutes=30),
            "status": "completed",
            "queuePosition": 0,
            "estimatedWaitingTime": 0,
            "estimatedOutTime": "09:18 AM",
            "currentServingToken": "T-005",
            "counterId": 1,
            "source": "online",
            "qrCodeData": "QL|001|SRV-BIRTH",
            "checkInStatus": True,
            "checkInTime": datetime.utcnow() - timedelta(hours=2, minutes=25)
        },
        {
            "tokenId": "TOK-002",
            "tokenNumber": "T-002",
            "userId": "usr_citizen_902",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DL",
            "date": today_str,
            "slot": 540,
            "slotLabel": "09:00 AM - 09:30 AM",
            "generatedAt": datetime.utcnow() - timedelta(hours=2, minutes=20),
            "status": "completed",
            "queuePosition": 0,
            "estimatedWaitingTime": 0,
            "estimatedOutTime": "09:32 AM",
            "currentServingToken": "T-006",
            "counterId": 2,
            "source": "walk-in",
            "qrCodeData": "QL|002|SRV-DL",
            "checkInStatus": True,
            "checkInTime": datetime.utcnow() - timedelta(hours=2, minutes=15)
        },
        {
            "tokenId": "TOK-003",
            "tokenNumber": "T-003",
            "userId": "usr_citizen_903",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DV",
            "date": today_str,
            "slot": 570,
            "slotLabel": "09:30 AM - 10:00 AM",
            "generatedAt": datetime.utcnow() - timedelta(hours=2),
            "status": "completed",
            "queuePosition": 0,
            "estimatedWaitingTime": 0,
            "estimatedOutTime": "09:44 AM",
            "currentServingToken": "T-007",
            "counterId": 3,
            "source": "online",
            "qrCodeData": "QL|003|SRV-DV",
            "checkInStatus": True,
            "checkInTime": datetime.utcnow() - timedelta(hours=1, minutes=55)
        },
        {
            "tokenId": "TOK-004",
            "tokenNumber": "T-004",
            "userId": "usr_citizen_904",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DL",
            "date": today_str,
            "slot": 570,
            "slotLabel": "09:30 AM - 10:00 AM",
            "generatedAt": datetime.utcnow() - timedelta(hours=1, minutes=45),
            "status": "completed",
            "queuePosition": 0,
            "estimatedWaitingTime": 0,
            "estimatedOutTime": "09:58 AM",
            "currentServingToken": "T-006",
            "counterId": 2,
            "source": "online",
            "qrCodeData": "QL|004|SRV-DL",
            "checkInStatus": True,
            "checkInTime": datetime.utcnow() - timedelta(hours=1, minutes=40)
        },
        # Currently Processing / Serving at counters
        {
            "tokenId": "TOK-005",
            "tokenNumber": "T-005",
            "userId": "usr_citizen_905",
            "officeId": "OFF-CIVIC-02",
            "serviceId": "SRV-BIRTH",
            "date": today_str,
            "slot": 600,
            "slotLabel": "10:00 AM - 10:30 AM",
            "generatedAt": datetime.utcnow() - timedelta(minutes=45),
            "status": "processing",
            "queuePosition": 0,
            "estimatedWaitingTime": 4,
            "estimatedOutTime": "10:20 AM",
            "currentServingToken": "T-005",
            "counterId": 1,
            "source": "online",
            "qrCodeData": "QL|005|SRV-BIRTH",
            "checkInStatus": True,
            "checkInTime": datetime.utcnow() - timedelta(minutes=20)
        },
        {
            "tokenId": "TOK-006",
            "tokenNumber": "T-006",
            "userId": "usr_citizen_906",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DL",
            "date": today_str,
            "slot": 600,
            "slotLabel": "10:00 AM - 10:30 AM",
            "generatedAt": datetime.utcnow() - timedelta(minutes=40),
            "status": "processing",
            "queuePosition": 0,
            "estimatedWaitingTime": 8,
            "estimatedOutTime": "10:25 AM",
            "currentServingToken": "T-006",
            "counterId": 2,
            "source": "walk-in",
            "qrCodeData": "QL|006|SRV-DL",
            "checkInStatus": True,
            "checkInTime": datetime.utcnow() - timedelta(minutes=15)
        },
        {
            "tokenId": "TOK-007",
            "tokenNumber": "T-007",
            "userId": "usr_citizen_907",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DV",
            "date": today_str,
            "slot": 600,
            "slotLabel": "10:00 AM - 10:30 AM",
            "generatedAt": datetime.utcnow() - timedelta(minutes=35),
            "status": "processing",
            "queuePosition": 0,
            "estimatedWaitingTime": 3,
            "estimatedOutTime": "10:18 AM",
            "currentServingToken": "T-007",
            "counterId": 3,
            "source": "online",
            "qrCodeData": "QL|007|SRV-DV",
            "checkInStatus": True,
            "checkInTime": datetime.utcnow() - timedelta(minutes=12)
        },
        # Waiting queue
        {
            "tokenId": "TOK-008",
            "tokenNumber": "T-008",
            "userId": "usr_citizen_908",
            "officeId": "OFF-CIVIC-02",
            "serviceId": "SRV-BIRTH",
            "date": today_str,
            "slot": 630,
            "slotLabel": "10:30 AM - 11:00 AM",
            "generatedAt": datetime.utcnow() - timedelta(minutes=30),
            "status": "waiting",
            "queuePosition": 1,
            "estimatedWaitingTime": 12,
            "estimatedOutTime": "10:32 AM",
            "currentServingToken": "T-005",
            "counterId": None,
            "source": "online",
            "qrCodeData": "QL|008|SRV-BIRTH",
            "checkInStatus": False
        },
        {
            "tokenId": "TOK-009",
            "tokenNumber": "T-009",
            "userId": "usr_citizen_909",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DL",
            "date": today_str,
            "slot": 630,
            "slotLabel": "10:30 AM - 11:00 AM",
            "generatedAt": datetime.utcnow() - timedelta(minutes=25),
            "status": "waiting",
            "queuePosition": 2,
            "estimatedWaitingTime": 19,
            "estimatedOutTime": "10:41 AM",
            "currentServingToken": "T-006",
            "counterId": None,
            "source": "walk-in",
            "qrCodeData": "QL|009|SRV-DL",
            "checkInStatus": False
        },
        {
            "tokenId": "TOK-010",
            "tokenNumber": "T-010",
            "userId": "usr_citizen_910",
            "officeId": "OFF-CIVIC-02",
            "serviceId": "SRV-INCOME",
            "date": today_str,
            "slot": 630,
            "slotLabel": "10:30 AM - 11:00 AM",
            "generatedAt": datetime.utcnow() - timedelta(minutes=22),
            "status": "waiting",
            "queuePosition": 3,
            "estimatedWaitingTime": 26,
            "estimatedOutTime": "10:50 AM",
            "currentServingToken": "T-007",
            "counterId": None,
            "source": "online",
            "qrCodeData": "QL|010|SRV-INCOME",
            "checkInStatus": False
        },
        {
            "tokenId": "TOK-011",
            "tokenNumber": "T-011",
            "userId": "usr_citizen_911",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DL",
            "date": today_str,
            "slot": 660,
            "slotLabel": "11:00 AM - 11:30 AM",
            "generatedAt": datetime.utcnow() - timedelta(minutes=18),
            "status": "waiting",
            "queuePosition": 4,
            "estimatedWaitingTime": 32,
            "estimatedOutTime": "11:02 AM",
            "currentServingToken": "T-006",
            "counterId": None,
            "source": "online",
            "qrCodeData": "QL|011|SRV-DL",
            "checkInStatus": False
        },
        {
            "tokenId": "TOK-012",
            "tokenNumber": "T-012",
            "userId": "usr_citizen_912",
            "officeId": "OFF-CIVIC-02",
            "serviceId": "SRV-BIRTH",
            "date": today_str,
            "slot": 660,
            "slotLabel": "11:00 AM - 11:30 AM",
            "generatedAt": datetime.utcnow() - timedelta(minutes=15),
            "status": "waiting",
            "queuePosition": 5,
            "estimatedWaitingTime": 38,
            "estimatedOutTime": "11:15 AM",
            "currentServingToken": "T-005",
            "counterId": None,
            "source": "walk-in",
            "qrCodeData": "QL|012|SRV-BIRTH",
            "checkInStatus": False
        },
        # User Priyanka's Active Token
        {
            "tokenId": "TOK-013",
            "tokenNumber": "T-013",
            "userId": "usr_priyanka",
            "officeId": "OFF-CIVIC-02",
            "serviceId": "SRV-BIRTH",
            "date": today_str,
            "slot": 660,
            "slotLabel": "11:00 AM - 11:30 AM",
            "generatedAt": datetime.utcnow() - timedelta(minutes=10),
            "status": "waiting",
            "queuePosition": 6,
            "estimatedWaitingTime": 42,
            "estimatedOutTime": "11:28 AM",
            "currentServingToken": "T-005",
            "counterId": 1,
            "source": "online",
            "qrCodeData": "QL|013|SRV-BIRTH",
            "checkInStatus": False
        },
        # Tomorrow's Token for Priyanka
        {
            "tokenId": "TOK-021",
            "tokenNumber": "T-021",
            "userId": "usr_priyanka",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DL",
            "date": (date.today() + timedelta(days=1)).isoformat(),
            "slot": 630,
            "slotLabel": "10:30 AM - 11:00 AM",
            "generatedAt": datetime.utcnow() - timedelta(minutes=5),
            "status": "waiting",
            "queuePosition": 1,
            "estimatedWaitingTime": 15,
            "estimatedOutTime": "10:45 AM",
            "currentServingToken": "None",
            "counterId": 2,
            "source": "online",
            "qrCodeData": "QL|021|SRV-DL",
            "checkInStatus": False
        }
    ]
    db.tokens.delete_many({})
    db.tokens.insert_many(tokens_data)

    # 7. Token History
    history_data = [
        {
            "historyId": "HIST-001",
            "tokenId": "TOK-001",
            "tokenNumber": "T-001",
            "userId": "usr_citizen_901",
            "officeId": "OFF-CIVIC-02",
            "serviceId": "SRV-BIRTH",
            "status": "completed",
            "createdAt": datetime.utcnow() - timedelta(hours=2, minutes=30),
            "completedAt": datetime.utcnow() - timedelta(hours=1, minutes=50),
            "waitDurationMinutes": 14,
            "serviceDurationMinutes": 13,
            "counterId": 1
        },
        {
            "historyId": "HIST-002",
            "tokenId": "TOK-002",
            "tokenNumber": "T-002",
            "userId": "usr_citizen_902",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DL",
            "status": "completed",
            "createdAt": datetime.utcnow() - timedelta(hours=2, minutes=20),
            "completedAt": datetime.utcnow() - timedelta(hours=1, minutes=40),
            "waitDurationMinutes": 17,
            "serviceDurationMinutes": 18,
            "counterId": 2
        },
        {
            "historyId": "HIST-003",
            "tokenId": "TOK-003",
            "tokenNumber": "T-003",
            "userId": "usr_citizen_903",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DV",
            "status": "completed",
            "createdAt": datetime.utcnow() - timedelta(hours=2),
            "completedAt": datetime.utcnow() - timedelta(hours=1, minutes=25),
            "waitDurationMinutes": 12,
            "serviceDurationMinutes": 8,
            "counterId": 3
        },
        {
            "historyId": "HIST-004",
            "tokenId": "TOK-004",
            "tokenNumber": "T-004",
            "userId": "usr_citizen_904",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DL",
            "status": "completed",
            "createdAt": datetime.utcnow() - timedelta(hours=1, minutes=45),
            "completedAt": datetime.utcnow() - timedelta(hours=1, minutes=10),
            "waitDurationMinutes": 21,
            "serviceDurationMinutes": 17,
            "counterId": 2
        },
        # Previous visit completed for Priyanka last week
        {
            "historyId": "HIST-005",
            "tokenId": "TOK-PREV-09",
            "tokenNumber": "T-098",
            "userId": "usr_priyanka",
            "officeId": "OFF-RTO-01",
            "serviceId": "SRV-DV",
            "status": "completed",
            "createdAt": datetime.utcnow() - timedelta(days=7, hours=3),
            "completedAt": datetime.utcnow() - timedelta(days=7, hours=2),
            "waitDurationMinutes": 16,
            "serviceDurationMinutes": 9,
            "counterId": 3
        }
    ]
    db.tokenHistory.delete_many({})
    db.tokenHistory.insert_many(history_data)

    # 8. Notifications for Priyanka
    notifications_data = [
        {
            "notificationId": "NOTIF-001",
            "userId": "usr_priyanka",
            "title": "Token Generated: T-013",
            "message": "Token T-013 generated for Birth Certificate Issuance. Estimated wait is ~42 minutes. We will notify you when to leave.",
            "type": "ok",
            "read": False,
            "createdAt": datetime.utcnow() - timedelta(minutes=10)
        },
        {
            "notificationId": "NOTIF-002",
            "userId": "usr_priyanka",
            "title": "Document Verification Update",
            "message": "3 of 4 required documents verified for Birth Certificate. Please carry original Permanent Address Proof to the counter.",
            "type": "info",
            "read": False,
            "createdAt": datetime.utcnow() - timedelta(minutes=25)
        },
        {
            "notificationId": "NOTIF-003",
            "userId": "usr_priyanka",
            "title": "Counter 3 Accelerated",
            "message": "Counter 3 has opened for general revenue and attestation services. Queue waiting times recalculated.",
            "type": "info",
            "read": True,
            "createdAt": datetime.utcnow() - timedelta(minutes=50)
        }
    ]
    db.notifications.delete_many({})
    db.notifications.insert_many(notifications_data)

    logger.info("MongoDB seed successfully applied.")
