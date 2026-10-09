import logging
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import settings

logger = logging.getLogger("queueless.database")

_client = None
_db = None
_is_connected = False
_connection_mode = "unknown"

def get_client():
    global _client, _db, _is_connected, _connection_mode
    if _client is not None:
        return _client

    logger.info(f"Connecting to MongoDB at URI: {settings.MONGODB_URI} (DB: {settings.DATABASE_NAME})")
    
    # Try connecting to real MongoDB first
    try:
        real_client = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=2500,
            connectTimeoutMS=2500,
            socketTimeoutMS=2500
        )
        # Verify server is responding
        real_client.admin.command("ping")
        _client = real_client
        _db = _client[settings.DATABASE_NAME]
        _is_connected = True
        _connection_mode = "mongodb-live"
        logger.info(f"Successfully connected to live MongoDB server: {settings.MONGODB_URI}")
        return _client
    except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as err:
        logger.warning(f"Could not connect to live MongoDB on {settings.MONGODB_URI}: {err}")
        logger.info("Initializing embedded MongoDB-compatible engine (mongomock) for persistent in-memory session...")
        try:
            import mongomock
            _client = mongomock.MongoClient()
            _db = _client[settings.DATABASE_NAME]
            _is_connected = True
            _connection_mode = "mongodb-mock"
            logger.info("Embedded MongoDB driver initialized successfully.")
            return _client
        except Exception as mock_err:
            logger.error(f"Failed to initialize mock MongoDB: {mock_err}")
            raise err

def get_db():
    global _db
    if _db is None:
        get_client()
    return _db

def get_connection_status():
    global _is_connected, _connection_mode
    return {
        "connected": _is_connected,
        "mode": _connection_mode,
        "database": settings.DATABASE_NAME,
        "uri": settings.MONGODB_URI
    }

def setup_indexes():
    """Create optimal MongoDB indexes for QueueLess collections."""
    db = get_db()
    try:
        # tokens indexes
        db.tokens.create_index([("tokenId", ASCENDING)], unique=True)
        db.tokens.create_index([("tokenNumber", ASCENDING)])
        db.tokens.create_index([("userId", ASCENDING)])
        db.tokens.create_index([("officeId", ASCENDING)])
        db.tokens.create_index([("serviceId", ASCENDING)])
        db.tokens.create_index([("date", ASCENDING), ("status", ASCENDING)])
        db.tokens.create_index([("generatedAt", DESCENDING)])

        # tokenHistory indexes
        db.tokenHistory.create_index([("historyId", ASCENDING)], unique=True)
        db.tokenHistory.create_index([("tokenId", ASCENDING)])
        db.tokenHistory.create_index([("userId", ASCENDING)])
        db.tokenHistory.create_index([("completedAt", DESCENDING)])

        # offices & services indexes
        db.offices.create_index([("officeId", ASCENDING)], unique=True)
        db.services.create_index([("serviceId", ASCENDING)], unique=True)
        db.services.create_index([("officeId", ASCENDING)])

        # documents indexes
        db.documents.create_index([("documentId", ASCENDING)], unique=True)
        db.documents.create_index([("userId", ASCENDING), ("serviceId", ASCENDING)])

        # notifications indexes
        db.notifications.create_index([("notificationId", ASCENDING)], unique=True)
        db.notifications.create_index([("userId", ASCENDING), ("createdAt", DESCENDING)])

        # counters indexes
        db.counters.create_index([("counterId", ASCENDING)], unique=True)

        logger.info("MongoDB indexes verified and configured.")
    except Exception as e:
        logger.warning(f"Note on index configuration: {e}")
