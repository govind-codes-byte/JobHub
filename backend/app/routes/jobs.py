from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.config.database import get_db
from app.schemas import CreateJobRequest, UpdateJobRequest
from app.utils.helpers import serialize_doc, to_object_id
from app.middleware.auth import get_current_user, require_recruiter_or_admin, require_admin
from datetime import datetime, timezone
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: CreateJobRequest,
    current_user: dict = Depends(require_recruiter_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    if current_user["role"] == "recruiter":
        rp = current_user.get("recruiter_profile") or {}
        if not rp.get("company_name"):
            raise HTTPException(
                status_code=400,
                detail="Please complete your company profile before posting jobs",
            )

    now = datetime.now(timezone.utc)
    job_doc = {
        **payload.model_dump(),
        "company_id": current_user["id"],
        "company_name": (current_user.get("recruiter_profile") or {}).get("company_name") or current_user["name"],
        "company_logo": (current_user.get("recruiter_profile") or {}).get("company_logo"),
        "company_location": (current_user.get("recruiter_profile") or {}).get("company_location"),
        "recruiter_name": current_user["name"],
        "is_active": True,
        "applicant_count": 0,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.jobs.insert_one(job_doc)
    job_doc["_id"] = result.inserted_id
    return serialize_doc(job_doc)


@router.get("/")
async def list_jobs(
    q: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    skills: Optional[str] = Query(None),
    salary_min: Optional[int] = Query(None),
    is_remote: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    query: dict = {"is_active": True}

    if q:
        query["$text"] = {"$search": q}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if job_type:
        query["job_type"] = job_type
    if experience_level:
        query["experience_level"] = experience_level
    if skills:
        skill_list = [s.strip() for s in skills.split(",")]
        query["skills"] = {"$in": skill_list}
    if salary_min is not None:
        query["salary_max"] = {"$gte": salary_min}
    if is_remote is not None:
        query["is_remote"] = is_remote

    total = await db.jobs.count_documents(query)
    sort = [("$textScore", {"$meta": "textScore"})] if q else [("created_at", -1)]

    cursor = db.jobs.find(query).sort(sort).skip((page - 1) * per_page).limit(per_page)
    jobs = [serialize_doc(j) async for j in cursor]

    return {
        "items": jobs,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": -(-total // per_page),
    }


@router.get("/featured")
async def get_featured_jobs(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Return 6 most recent active jobs for landing page."""
    cursor = db.jobs.find({"is_active": True}).sort("created_at", -1).limit(6)
    jobs = [serialize_doc(j) async for j in cursor]
    return jobs


@router.get("/my-jobs")
async def get_my_jobs(
    current_user: dict = Depends(require_recruiter_or_admin),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    query = {"company_id": current_user["id"]}
    total = await db.jobs.count_documents(query)
    cursor = db.jobs.find(query).sort("created_at", -1).skip((page - 1) * per_page).limit(per_page)
    jobs = [serialize_doc(j) async for j in cursor]
    return {
        "items": jobs,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": -(-total // per_page),
    }


@router.get("/{job_id}")
async def get_job(job_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    oid = to_object_id(job_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    job = await db.jobs.find_one({"_id": oid})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return serialize_doc(job)


@router.put("/{job_id}")
async def update_job(
    job_id: str,
    payload: UpdateJobRequest,
    current_user: dict = Depends(require_recruiter_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    oid = to_object_id(job_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    job = await db.jobs.find_one({"_id": oid})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user["role"] != "admin" and str(job["company_id"]) != current_user["id"]:
        raise HTTPException(status_code=403, detail="You don't have permission to edit this job")

    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.jobs.update_one({"_id": oid}, {"$set": update_data})
    updated = await db.jobs.find_one({"_id": oid})
    return serialize_doc(updated)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: str,
    current_user: dict = Depends(require_recruiter_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    oid = to_object_id(job_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    job = await db.jobs.find_one({"_id": oid})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user["role"] != "admin" and str(job["company_id"]) != current_user["id"]:
        raise HTTPException(status_code=403, detail="You don't have permission to delete this job")

    await db.jobs.delete_one({"_id": oid})
    await db.applications.delete_many({"job_id": job_id})
