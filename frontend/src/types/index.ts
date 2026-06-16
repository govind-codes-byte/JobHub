// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "candidate" | "recruiter" | "admin";

export type JobType =
  | "Full-Time"
  | "Part-Time"
  | "Contract"
  | "Freelance"
  | "Internship"
  | "Remote";

export type ExperienceLevel =
  | "Entry Level"
  | "Junior"
  | "Mid Level"
  | "Senior"
  | "Lead"
  | "Manager";

export type ApplicationStatus =
  | "Applied"
  | "Under Review"
  | "Shortlisted"
  | "Rejected"
  | "Selected";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface Education {
  institution: string;
  degree: string;
  field: string;
  start_year: number;
  end_year?: number;
  current: boolean;
}

export interface Experience {
  company: string;
  position: string;
  description?: string;
  start_date: string;
  end_date?: string;
  current: boolean;
}

export interface CandidateProfile {
  bio?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  location?: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  resume_url?: string;
  resume_filename?: string;
}

export interface RecruiterProfile {
  company_name?: string;
  company_logo?: string;
  company_description?: string;
  company_website?: string;
  company_location?: string;
  company_size?: string;
  industry?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  candidate_profile?: CandidateProfile;
  recruiter_profile?: RecruiterProfile;
  created_at: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// ─── Job ──────────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  location: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  is_remote: boolean;
  is_active: boolean;
  company_id: string;
  company_name?: string;
  company_logo?: string;
  company_location?: string;
  recruiter_name?: string;
  applicant_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  location: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  is_remote: boolean;
}

// ─── Application ──────────────────────────────────────────────────────────────

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  candidate_name?: string;
  candidate_email?: string;
  status: ApplicationStatus;
  cover_letter?: string;
  note?: string;
  resume_url?: string;
  resume_filename?: string;
  applied_at: string;
  updated_at: string;
  job?: Job;
  candidate?: User;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface JobFilters {
  q?: string;
  location?: string;
  job_type?: JobType | "";
  experience_level?: ExperienceLevel | "";
  skills?: string;
  salary_min?: number;
  is_remote?: boolean;
  page?: number;
  per_page?: number;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  total_candidates: number;
  total_recruiters: number;
  total_jobs: number;
  active_jobs: number;
  total_applications: number;
  recent_registrations: number;
  applications_by_status: Record<string, number>;
  jobs_by_type: Record<string, number>;
}
