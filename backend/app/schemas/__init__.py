from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, Enum):
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class JobType(str, Enum):
    FULL_TIME = "Full-Time"
    PART_TIME = "Part-Time"
    CONTRACT = "Contract"
    FREELANCE = "Freelance"
    INTERNSHIP = "Internship"
    REMOTE = "Remote"


class ExperienceLevel(str, Enum):
    ENTRY = "Entry Level"
    JUNIOR = "Junior"
    MID = "Mid Level"
    SENIOR = "Senior"
    LEAD = "Lead"
    MANAGER = "Manager"


class ApplicationStatus(str, Enum):
    APPLIED = "Applied"
    UNDER_REVIEW = "Under Review"
    SHORTLISTED = "Shortlisted"
    REJECTED = "Rejected"
    SELECTED = "Selected"


# ─── Shared Helpers ────────────────────────────────────────────────────────────

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")


# ─── Auth Schemas ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: UserRole = UserRole.CANDIDATE


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ─── User Schemas ──────────────────────────────────────────────────────────────

class Education(BaseModel):
    institution: str
    degree: str
    field: str
    start_year: int
    end_year: Optional[int] = None
    current: bool = False


class Experience(BaseModel):
    company: str
    position: str
    description: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    current: bool = False


class CandidateProfile(BaseModel):
    bio: Optional[str] = None
    skills: List[str] = []
    education: List[Education] = []
    experience: List[Experience] = []
    location: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    resume_url: Optional[str] = None
    resume_filename: Optional[str] = None


class RecruiterProfile(BaseModel):
    company_name: Optional[str] = None
    company_logo: Optional[str] = None
    company_description: Optional[str] = None
    company_website: Optional[str] = None
    company_location: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    avatar: Optional[str] = None
    candidate_profile: Optional[CandidateProfile] = None
    recruiter_profile: Optional[RecruiterProfile] = None
    created_at: datetime

    class Config:
        populate_by_name = True


class UpdateCandidateProfile(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[List[Education]] = None
    experience: Optional[List[Experience]] = None
    location: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class UpdateRecruiterProfile(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    company_name: Optional[str] = None
    company_description: Optional[str] = None
    company_website: Optional[str] = None
    company_location: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None


# ─── Job Schemas ───────────────────────────────────────────────────────────────

class CreateJobRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=50)
    requirements: List[str] = Field(..., min_length=1)
    skills: List[str] = Field(..., min_length=1)
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "USD"
    location: str
    job_type: JobType
    experience_level: ExperienceLevel
    is_remote: bool = False

    @field_validator("salary_max")
    @classmethod
    def validate_salary(cls, v, info):
        if v and info.data.get("salary_min") and v < info.data["salary_min"]:
            raise ValueError("salary_max must be greater than salary_min")
        return v


class UpdateJobRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=50)
    requirements: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    location: Optional[str] = None
    job_type: Optional[JobType] = None
    experience_level: Optional[ExperienceLevel] = None
    is_remote: Optional[bool] = None
    is_active: Optional[bool] = None


class JobResponse(BaseModel):
    id: str
    title: str
    description: str
    requirements: List[str]
    skills: List[str]
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "USD"
    location: str
    job_type: JobType
    experience_level: ExperienceLevel
    is_remote: bool
    is_active: bool
    company_id: str
    company_name: Optional[str] = None
    company_logo: Optional[str] = None
    company_location: Optional[str] = None
    recruiter_name: Optional[str] = None
    applicant_count: int = 0
    created_at: datetime
    updated_at: datetime


# ─── Application Schemas ───────────────────────────────────────────────────────

class CreateApplicationRequest(BaseModel):
    job_id: str
    cover_letter: Optional[str] = None


class UpdateApplicationStatus(BaseModel):
    status: ApplicationStatus
    note: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    candidate_id: str
    status: ApplicationStatus
    cover_letter: Optional[str] = None
    note: Optional[str] = None
    resume_url: Optional[str] = None
    resume_filename: Optional[str] = None
    applied_at: datetime
    updated_at: datetime
    # Populated fields
    job: Optional[JobResponse] = None
    candidate: Optional[UserResponse] = None


# ─── Pagination & Filters ──────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    per_page: int
    total_pages: int


class JobFilters(BaseModel):
    q: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[JobType] = None
    experience_level: Optional[ExperienceLevel] = None
    skills: Optional[str] = None  # comma-separated
    salary_min: Optional[int] = None
    is_remote: Optional[bool] = None
    page: int = Field(1, ge=1)
    per_page: int = Field(12, ge=1, le=50)


# ─── Admin Schemas ─────────────────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_users: int
    total_candidates: int
    total_recruiters: int
    total_jobs: int
    active_jobs: int
    total_applications: int
    recent_registrations: int  # last 7 days


# ─── Response Wrappers ─────────────────────────────────────────────────────────

class SuccessResponse(BaseModel):
    message: str
    data: Optional[dict] = None


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
