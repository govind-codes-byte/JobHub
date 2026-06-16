import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Users, Eye, EyeOff, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { jobsApi } from "../../api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { getJobTypeColor, timeAgo, extractApiError } from "../../utils";

export default function RecruiterJobs() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-jobs", page],
    queryFn: () => jobsApi.myJobs({ page }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => {
      toast.success("Job deleted");
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      jobsApi.update(id, { is_active }),
    onSuccess: () => {
      toast.success("Job status updated");
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Job Posts</h1>
          <p className="text-slate-500 mt-1">{data?.total || 0} total jobs posted</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : !data?.items.length ? (
        <div className="card">
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Create your first job posting to start receiving applications."
            action={
              <Link to="/recruiter/jobs/new" className="btn-primary">Post a Job</Link>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Job</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Applicants</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Posted</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {data.items.map((job, i) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{job.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{job.location}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Badge className={getJobTypeColor(job.job_type)}>{job.job_type}</Badge>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <Link
                        to={`/recruiter/jobs/${job.id}/applicants`}
                        className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        <Users className="w-4 h-4" /> {job.applicant_count}
                      </Link>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-sm text-slate-500">
                      {timeAgo(job.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleMutation.mutate({ id: job.id, is_active: !job.is_active })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          job.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {job.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {job.is_active ? "Active" : "Closed"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/recruiter/jobs/${job.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(job.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.total_pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-dark-border">
              <p className="text-sm text-slate-500">
                Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, data.total)} of {data.total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary p-1.5 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => p + 1)} disabled={page === data.total_pages} className="btn-secondary p-1.5 disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Job" size="sm">
        <p className="text-slate-600 dark:text-slate-400 mb-5 text-sm">
          Are you sure you want to delete this job? All associated applications will also be removed. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
          <Button
            variant="danger"
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            loading={deleteMutation.isPending}
            className="flex-1"
          >
            Delete Job
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
