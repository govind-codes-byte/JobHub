from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.config.database import get_db
from app.middleware.auth import require_admin
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
async def get_admin_stats(
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

    total_users = await db.users.count_documents({})
    total_candidates = await db.users.count_documents({"role": "candidate"})
    total_recruiters = await db.users.count_documents({"role": "recruiter"})
    total_jobs = await db.jobs.count_documents({})
    active_jobs = await db.jobs.count_documents({"is_active": True})
    total_applications = await db.applications.count_documents({})
    recent_registrations = await db.users.count_documents(
        {"created_at": {"$gte": seven_days_ago}}
    )

    # Applications by status
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_cursor = db.applications.aggregate(pipeline)
    applications_by_status = {}
    async for doc in status_cursor:
        applications_by_status[doc["_id"]] = doc["count"]

    # Jobs by type
    job_type_pipeline = [
        {"$group": {"_id": "$job_type", "count": {"$sum": 1}}}
    ]
    job_type_cursor = db.jobs.aggregate(job_type_pipeline)
    jobs_by_type = {}
    async for doc in job_type_cursor:
        jobs_by_type[doc["_id"]] = doc["count"]

    return {
        "total_users": total_users,
        "total_candidates": total_candidates,
        "total_recruiters": total_recruiters,
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_applications": total_applications,
        "recent_registrations": recent_registrations,
        "applications_by_status": applications_by_status,
        "jobs_by_type": jobs_by_type,
    }
