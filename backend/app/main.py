import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database.connection import get_client, setup_indexes, get_connection_status
from app.database.seed import seed_database
from app.routes import (
    dashboard_router,
    tokens_router,
    services_router,
    offices_router,
    documents_router,
    calendar_router,
    history_router,
    notifications_router,
    admin_router,
    auth_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("queueless.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing QueueLess System Backend...")
    try:
        # Establish MongoDB connection
        get_client()
        # Ensure collection indexes
        setup_indexes()
        # Seed initial dataset if needed
        seed_database()
        logger.info("QueueLess Backend initialized and ready to serve requests.")
    except Exception as e:
        logger.error(f"Startup warning during database initialization: {e}")
    yield
    logger.info("QueueLess System Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Smart Government-Office Virtual Queue and Token Management System API",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard_router)
app.include_router(tokens_router)
app.include_router(services_router)
app.include_router(offices_router)
app.include_router(documents_router)
app.include_router(calendar_router)
app.include_router(history_router)
app.include_router(notifications_router)
app.include_router(admin_router)
app.include_router(auth_router)

@app.get("/api/health", tags=["Health"])
def health_check():
    db_status = get_connection_status()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status
    }

@app.get("/api", tags=["Root"])
def api_root():
    return {
        "message": "QueueLess Smart Government Office API is operational.",
        "docs": "/docs",
        "version": settings.VERSION
    }

# Mount frontend directly at root for full-stack serving
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
if os.path.exists(frontend_dist) and os.path.isdir(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
