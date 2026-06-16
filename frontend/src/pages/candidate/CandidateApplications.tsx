import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, Clock, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { applicationsApi } from "../../api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { getStatusColor, formatSalary, timeAgo } from "../../utils";
import type { ApplicationStatus } from "../../types";

const STATUS_TABS: (ApplicationStatus | "All")[] = ["All", "Applied", "Under Review", "Shortlisted", "Selected", "Rejected"];

export default function CandidateApplications() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");

  const { data, isLoading } = useQuery({
    queryKey: ["my-applications", page],
    queryFn: () => applicationsApi.myApplications({ page }),
  });

  const filtered =
    statusFilter === "All"
      ? data?.items || []
      : (data?.items || []).filter((a) => a.status === statusFilter);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Applications</h1>
        <p className="text-slate-500 mt-1">Track and manage all your job applications</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {STATUS_TABS.map((status) => {
          const count = status === "All"
            ? data?.items.length
            : data?.items.filter((a) => a.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === status
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:border-primary-400"
              }`}
            >
              {status}
              {count !== undefined && count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  statusFilter === status ? "bg-white/30 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : !filtered.length ? (
        <div className="card">
          <EmptyState
            icon={Briefcase}
            title={statusFilter === "All" ? "No applications yet" : `No ${statusFilter} applications`}
            description="Start applying for jobs that match your skills and experience."
            action={
              <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Company logo */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {(app.job?.company_name || "J")[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {app.job?.title || "Job Position"}
                      </h3>
                      <p className="text-sm text-slate-500">{app.job?.company_name}</p>
                    </div>
                    <Badge className={`${getStatusColor(app.status)} flex-shrink-0`}>{app.status}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                    {app.job?.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.job.location}</span>
                    )}
                    {(app.job?.salary_min || app.job?.salary_max) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatSalary(app.job.salary_min, app.job.salary_max)}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Applied {timeAgo(app.applied_at)}</span>
                  </div>

                  {app.note && (
                    <div className="mt-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Recruiter note:</span> {app.note}
                    </div>
                  )}
                </div>

                {app.job?.id && (
                  <Link
                    to={`/jobs/${app.job.id}`}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-600 transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary p-2 disabled:opacity-40">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="flex items-center px-4 text-sm text-slate-600 dark:text-slate-400">
            Page {page} of {data.total_pages}
          </span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page === data.total_pages} className="btn-secondary p-2 disabled:opacity-40">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
