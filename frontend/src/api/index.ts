import api from "./client";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
  Job,
  CreateJobPayload,
  Application,
  PaginatedResponse,
  JobFilters,
  AdminStats,
  ApplicationStatus,
} from "../types";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>("/api/auth/register", data).then((r) => r.data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>("/api/auth/login", data).then((r) => r.data),

  me: () => api.get<User>("/api/auth/me").then((r) => r.data),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  getProfile: () => api.get<User>("/api/users/profile").then((r) => r.data),

  updateProfile: (data: Partial<User & Record<string, unknown>>) =>
    api.put<User>("/api/users/profile", data).then((r) => r.data),

  uploadResume: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<{ resume_url: string; filename: string }>("/api/users/resume", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<{ avatar_url: string }>("/api/users/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  // Admin
  listUsers: (params?: { page?: number; per_page?: number; role?: string }) =>
    api.get<PaginatedResponse<User>>("/api/users", { params }).then((r) => r.data),

  deleteUser: (id: string) => api.delete(`/api/users/${id}`).then((r) => r.data),

  toggleUserStatus: (id: string) =>
    api.patch(`/api/users/${id}/toggle-status`).then((r) => r.data),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const jobsApi = {
  list: (filters?: JobFilters) =>
    api.get<PaginatedResponse<Job>>("/api/jobs", { params: filters }).then((r) => r.data),

  featured: () => api.get<Job[]>("/api/jobs/featured").then((r) => r.data),

  myJobs: (params?: { page?: number }) =>
    api.get<PaginatedResponse<Job>>("/api/jobs/my-jobs", { params }).then((r) => r.data),

  get: (id: string) => api.get<Job>(`/api/jobs/${id}`).then((r) => r.data),

  create: (data: CreateJobPayload) =>
    api.post<Job>("/api/jobs", data).then((r) => r.data),

  update: (id: string, data: Partial<CreateJobPayload & { is_active: boolean }>) =>
    api.put<Job>(`/api/jobs/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/api/jobs/${id}`).then((r) => r.data),
};

// ─── Applications ─────────────────────────────────────────────────────────────

export const applicationsApi = {
  apply: (data: { job_id: string; cover_letter?: string }) =>
    api.post<Application>("/api/applications", data).then((r) => r.data),

  myApplications: (params?: { page?: number }) =>
    api
      .get<PaginatedResponse<Application>>("/api/applications/my-applications", { params })
      .then((r) => r.data),

  jobApplications: (jobId: string, params?: { status?: string; page?: number }) =>
    api
      .get<PaginatedResponse<Application>>(`/api/applications/job/${jobId}`, { params })
      .then((r) => r.data),

  updateStatus: (id: string, status: ApplicationStatus, note?: string) =>
    api
      .put<Application>(`/api/applications/${id}/status`, { status, note })
      .then((r) => r.data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  stats: () => api.get<AdminStats>("/api/admin/stats").then((r) => r.data),
};
