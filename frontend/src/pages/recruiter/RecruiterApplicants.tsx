import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Download, FileText, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { applicationsApi, jobsApi } from "../../api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { getStatusColor, timeAgo, extractApiError } from "../../utils";
import type { Application, ApplicationStatus } from "../../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const STATUS_OPTIONS: ApplicationStatus[] = ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"];

export default function RecruiterApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const qc = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [note, setNote] = useState("");

  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobsApi.get(jobId!),
    enabled: !!jobId,
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ["job-applications", jobId, statusFilter],
    queryFn: () =>
      applicationsApi.jobApplications(jobId!, {
        status: statusFilter === "All" ? undefined : statusFilter,
      }),
    enabled: !!jobId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      applicationsApi.updateStatus(id, status, note),
    onSuccess: (updated) => {
      toast.success(`Status updated to "${updated.status}"`);
      qc.invalidateQueries({ queryKey: ["job-applications", jobId] });
      if (selectedApp) setSelectedApp({ ...selectedApp, status: updated.status });
      setNote("");
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/recruiter/jobs" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Applicants</h1>
          {job && <p className="text-slate-500 text-sm mt-0.5">for <span className="font-medium text-slate-700 dark:text-slate-300">{job.title}</span></p>}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {["All", ...STATUS_OPTIONS].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === s ? "bg-primary-600 text-white" : "bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 hover:border-primary-400"}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : !applications?.items.length ? (
        <div className="card">
          <EmptyState icon={FileText} title="No applicants yet" description={statusFilter === "All" ? "Share your job post to attract candidates." : `No ${statusFilter} applicants.`} />
        </div>
      ) : (
        <div className="space-y-3">
          {applications.items.map((app, i) => {
            const candidate = app.candidate;
            const cp = candidate?.candidate_profile;
            const skillsList: string[] = (cp?.skills as string[] | undefined) || [];
            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar name={candidate?.name || "?"} src={candidate?.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{candidate?.name || app.candidate_name}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />{candidate?.email || app.candidate_email}
                        </p>
                      </div>
                      <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                    </div>
                    {skillsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {skillsList.slice(0, 5).map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-slate-400">Applied {timeAgo(app.applied_at)}</p>
                      <div className="flex items-center gap-2">
                        {app.resume_url && (
                          <a href={`${API_URL}${app.resume_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium">
                            <Download className="w-3.5 h-3.5" /> Resume
                          </a>
                        )}
                        <button onClick={() => { setSelectedApp(app); setNote(app.note || ""); }} className="btn-secondary text-xs py-1.5 px-3">Manage</button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Applicant detail modal */}
      <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="Manage Applicant" size="md">
        {selectedApp && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <Avatar name={selectedApp.candidate?.name || "?"} size="md" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedApp.candidate?.name || selectedApp.candidate_name}</p>
                <p className="text-sm text-slate-500">{selectedApp.candidate?.email || selectedApp.candidate_email}</p>
              </div>
              <Badge className={`ml-auto ${getStatusColor(selectedApp.status)}`}>{selectedApp.status}</Badge>
            </div>
            {selectedApp.cover_letter && (
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Letter</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-600 dark:text-slate-400 max-h-32 overflow-y-auto">{selectedApp.cover_letter}</div>
              </div>
            )}
            <div>
              <label className="label">Update Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} onClick={() => statusMutation.mutate({ id: selectedApp.id, status: s })}
                    disabled={statusMutation.isPending || selectedApp.status === s}
                    className={`p-2.5 rounded-xl text-xs font-medium border-2 transition-all ${selectedApp.status === s ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300" : "border-slate-200 dark:border-dark-border hover:border-primary-400 text-slate-600 dark:text-slate-400"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Note (optional)</label>
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note visible to the candidate..." className="input resize-none text-sm" />
            </div>
            {selectedApp.resume_url && (
              <a href={`${API_URL}${selectedApp.resume_url}`} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center flex items-center gap-2">
                <Download className="w-4 h-4" /> Download Resume
              </a>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
