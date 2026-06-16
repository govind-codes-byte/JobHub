from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.config.database import get_db
from app.schemas import CreateApplicationRequest, UpdateApplicationStatus
from app.utils.helpers import serialize_doc, to_object_id
from app.middleware.auth import get_current_user, require_recruiter_or_admin
from datetime import datetime, timezone
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/applications", tags=["Applications"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def apply_for_job(
    payload: CreateApplicationRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    if current_user["role"] != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can apply for jobs")

    # Verify job exists
    job_oid = to_object_id(payload.job_id)
    if not job_oid:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    job = await db.jobs.find_one({"_id": job_oid, "is_active": True})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or no longer active")

    # Prevent duplicate application
    existing = await db.applications.find_one({
        "job_id": payload.job_id,
        "candidate_id": current_user["id"],
    })
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied for this job")

    # Get candidate's resume
    cp = current_user.get("candidate_profile") or {}
    if not cp.get("resume_url"):
        raise HTTPException(status_code=400, detail="Please upload your resume before applying")

    now = datetime.now(timezone.utc)
    app_doc = {
        "job_id": payload.job_id,
        "candidate_id": current_user["id"],
        "candidate_name": current_user["name"],
        "candidate_email": current_user["email"],
        "resume_url": cp.get("resume_url"),
        "resume_filename": cp.get("resume_filename"),
        "cover_letter": payload.cover_letter,
        "status": "Applied",
        "note": None,
        "applied_at": now,
        "updated_at": now,
    }

    result = await db.applications.insert_one(app_doc)

    # Increment applicant count on job
    await db.jobs.update_one({"_id": job_oid}, {"$inc": {"applicant_count": 1}})

    app_doc["_id"] = result.inserted_id
    return serialize_doc(app_doc)


@router.get("/my-applications")
async def get_my_applications(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    if current_user["role"] != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can view their applications")

    query = {"candidate_id": current_user["id"]}
    total = await db.applications.count_documents(query)
    cursor = db.applications.find(query).sort("applied_at", -1).skip((page - 1) * per_page).limit(per_page)
    apps = []
    async for app in cursor:
        app_data = serialize_doc(app)
        # Enrich with job data
        job_oid = to_object_id(app["job_id"])
        if job_oid:
            job = await db.jobs.find_one({"_id": job_oid})
            if job:
                app_data["job"] = serialize_doc(job)
        apps.append(app_data)

    return {
        "items": apps,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": -(-total // per_page),
    }


@router.get("/job/{job_id}")
async def get_job_applications(
    job_id: str,
    current_user: dict = Depends(require_recruiter_or_admin),
    status_filter: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    # Verify job ownership
    if current_user["role"] == "recruiter":
        job_oid = to_object_id(job_id)
        job = await db.jobs.find_one({"_id": job_oid})
        if not job or str(job["company_id"]) != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

    query: dict = {"job_id": job_id}
    if status_filter:
        query["status"] = status_filter

    total = await db.applications.count_documents(query)
    cursor = (
        db.applications.find(query)
        .sort("applied_at", -1)
        .skip((page - 1) * per_page)
        .limit(per_page)
    )

    apps = []
    async for app in cursor:
        app_data = serialize_doc(app)
        # Enrich with candidate profile
        cand_oid = to_object_id(app["candidate_id"])
        if cand_oid:
            candidate = await db.users.find_one({"_id": cand_oid}, {"password": 0})
            if candidate:
                app_data["candidate"] = serialize_doc(candidate)
        apps.append(app_data)

    return {
        "items": apps,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": -(-total // per_page),
    }


@router.put("/{application_id}/status")
async def update_application_status(
    application_id: str,
    payload: UpdateApplicationStatus,
    current_user: dict = Depends(require_recruiter_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    oid = to_object_id(application_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid application ID")

    app = await db.applications.find_one({"_id": oid})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Verify recruiter owns the job
    if current_user["role"] == "recruiter":
        job_oid = to_object_id(app["job_id"])
        job = await db.jobs.find_one({"_id": job_oid})
        if not job or str(job["company_id"]) != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

    await db.applications.update_one(
        {"_id": oid},
        {"$set": {
            "status": payload.status.value,
            "note": payload.note,
            "updated_at": datetime.now(timezone.utc),
        }},
    )
    updated = await db.applications.find_one({"_id": oid})
    return serialize_doc(updated)


@router.get("/{application_id}")
async def get_application(
    application_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    oid = to_object_id(application_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid application ID")

    app = await db.applications.find_one({"_id": oid})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Access control
    if current_user["role"] == "candidate" and app["candidate_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return serialize_doc(app)
