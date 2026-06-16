from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.config.database import get_db
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.helpers import serialize_doc
from app.middleware.auth import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Check duplicate email
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    now = datetime.now(timezone.utc)
    user_doc = {
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "password": hash_password(payload.password),
        "role": payload.role.value,
        "avatar": None,
        "candidate_profile": {
            "bio": None, "skills": [], "education": [],
            "experience": [], "location": None,
            "portfolio_url": None, "github_url": None,
            "linkedin_url": None, "resume_url": None, "resume_filename": None,
        } if payload.role.value == "candidate" else None,
        "recruiter_profile": {
            "company_name": None, "company_logo": None,
            "company_description": None, "company_website": None,
            "company_location": None, "company_size": None, "industry": None,
        } if payload.role.value == "recruiter" else None,
        "created_at": now,
        "updated_at": now,
        "is_active": True,
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    user = serialize_doc(user_doc)

    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    user_doc = await db.users.find_one({"email": payload.email.lower()})

    if not user_doc or not verify_password(payload.password, user_doc["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user_doc.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended",
        )

    user = serialize_doc(user_doc)
    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
