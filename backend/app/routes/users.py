from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.config.database import get_db
from app.config.settings import settings
from app.schemas import UserResponse
from app.utils.helpers import serialize_doc, to_object_id
from app.middleware.auth import get_current_user, require_admin
from datetime import datetime, timezone
from typing import Optional, Any
from pydantic import BaseModel
import aiofiles
import os
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/users", tags=["Users"])

UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(f"{UPLOAD_DIR}/resumes", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/avatars", exist_ok=True)


# ── Flexible profile update schema — accepts ANY fields ──────────────────────
class ProfileUpdatePayload(BaseModel):
    # Common
    name: Optional[str] = None

    # Candidate fields
    bio: Optional[str] = None
    skills: Optional[list] = None
    education: Optional[list] = None
    experience: Optional[list] = None
    location: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

    # Recruiter fields
    company_name: Optional[str] = None
    company_logo: Optional[str] = None
    company_description: Optional[str] = None
    company_website: Optional[str] = None
    company_location: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None

    class Config:
        extra = "allow"  # Accept any extra fields gracefully


# ─── Candidate profile fields ─────────────────────────────────────────────────
CANDIDATE_PROFILE_FIELDS = {
    "bio", "skills", "education", "experience",
    "location", "portfolio_url", "github_url", "linkedin_url",
}

# ─── Recruiter profile fields ─────────────────────────────────────────────────
RECRUITER_PROFILE_FIELDS = {
    "company_name", "company_logo", "company_description",
    "company_website", "company_location", "company_size", "industry",
}


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user


@router.put("/profile")
async def update_profile(
    payload: ProfileUpdatePayload,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    oid = to_object_id(current_user["id"])
    update_data: dict = {"updated_at": datetime.now(timezone.utc)}

    # Always update name if provided
    raw = payload.model_dump(exclude_unset=True)
    
    if raw.get("name"):
        update_data["name"] = raw["name"].strip()

    if current_user["role"] == "candidate":
        for key, value in raw.items():
            if key in CANDIDATE_PROFILE_FIELDS and value is not None:
                update_data[f"candidate_profile.{key}"] = value

    elif current_user["role"] == "recruiter":
        for key, value in raw.items():
            if key in RECRUITER_PROFILE_FIELDS:
                # Store even empty strings so fields can be cleared
                update_data[f"recruiter_profile.{key}"] = value

    if len(update_data) == 1:
        # Only updated_at — nothing to change
        updated = await db.users.find_one({"_id": oid})
        return serialize_doc(updated)

    result = await db.users.update_one({"_id": oid}, {"$set": update_data})
    logger.info(f"Profile update for {current_user['id']}: matched={result.matched_count}, modified={result.modified_count}, data={update_data}")

    updated = await db.users.find_one({"_id": oid})
    return serialize_doc(updated)


@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    if current_user["role"] != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can upload resumes")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

    filename = f"{uuid.uuid4()}.pdf"
    filepath = f"{UPLOAD_DIR}/resumes/{filename}"

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    resume_url = f"/uploads/resumes/{filename}"
    oid = to_object_id(current_user["id"])

    await db.users.update_one(
        {"_id": oid},
        {"$set": {
            "candidate_profile.resume_url": resume_url,
            "candidate_profile.resume_filename": file.filename,
            "updated_at": datetime.now(timezone.utc),
        }},
    )
    return {"resume_url": resume_url, "filename": file.filename}


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images allowed")

    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 2MB limit")

    ext = file.filename.rsplit(".", 1)[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = f"{UPLOAD_DIR}/avatars/{filename}"

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    avatar_url = f"/uploads/avatars/{filename}"
    oid = to_object_id(current_user["id"])
    await db.users.update_one({"_id": oid}, {"$set": {"avatar": avatar_url}})
    return {"avatar_url": avatar_url}


# ─── Admin: User Management ───────────────────────────────────────────────────

@router.get("/", dependencies=[Depends(require_admin)])
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    query = {}
    if role:
        query["role"] = role

    total = await db.users.count_documents(query)
    cursor = db.users.find(query, {"password": 0}).skip((page - 1) * per_page).limit(per_page)
    users = [serialize_doc(u) async for u in cursor]

    return {
        "items": users,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": -(-total // per_page),
    }


@router.delete("/{user_id}", dependencies=[Depends(require_admin)])
async def delete_user(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    oid = to_object_id(user_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.users.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}


@router.patch("/{user_id}/toggle-status", dependencies=[Depends(require_admin)])
async def toggle_user_status(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    oid = to_object_id(user_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_status = not user.get("is_active", True)
    await db.users.update_one({"_id": oid}, {"$set": {"is_active": new_status}})
    return {"message": f"User {'activated' if new_status else 'suspended'}", "is_active": new_status}
