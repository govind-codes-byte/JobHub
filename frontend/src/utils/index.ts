import type { ApplicationStatus, JobType } from "../types";

export function formatSalary(min?: number, max?: number, currency = "USD"): string {
  if (!min && !max) return "Salary not disclosed";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getStatusColor(status: ApplicationStatus): string {
  const map: Record<ApplicationStatus, string> = {
    Applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "Under Review": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    Shortlisted: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    Rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    Selected: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  };
  return map[status] || "bg-slate-100 text-slate-700";
}

export function getJobTypeColor(type: JobType): string {
  const map: Record<JobType, string> = {
    "Full-Time": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "Part-Time": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Contract: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    Freelance: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    Internship: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    Remote: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  };
  return map[type] || "bg-slate-100 text-slate-700";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function extractApiError(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const resp = (error as { response?: { data?: { detail?: string } } }).response;
    return resp?.data?.detail || "Something went wrong";
  }
  return "Network error. Please try again.";
}
