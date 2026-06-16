import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MapPin, DollarSign, Clock, Users, Wifi,
  ArrowLeft, CheckCircle, Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import { jobsApi, applicationsApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { formatSalary, timeAgo, getJobTypeColor, extractApiError } from "../utils";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { Skeleton } from "../components/ui/Skeleton";
import Navbar from "../components/layout/Navbar";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobsApi.get(id!),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: () =>
      applicationsApi.apply({ job_id: id!, cover_letter: coverLetter || undefined }),
    onSuccess: () => {
      toast.success("Application submitted! 🎉");
      setApplyOpen(false);
      qc.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user?.role !== "candidate") {
      toast.error("Only candidates can apply for jobs");
      return;
    }
    if (!user?.candidate_profile?.resume_url) {
      toast.error("Please upload your resume first");
      navigate("/candidate/profile");
      return;
    }
    setApplyOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex items-start gap-4 mb-4">
                {job.company_logo ? (
                  <img src={job.company_logo} alt={job.company_name} className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-dark-border" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {(job.company_name || "J")[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{job.title}</h1>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">{job.company_name}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-dark-text mb-4">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" />{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{job.applicant_count} applicants</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />Posted {timeAgo(job.created_at)}</span>
                {job.is_remote && <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400"><Wifi className="w-4 h-4" />Remote</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={getJobTypeColor(job.job_type)}>{job.job_type}</Badge>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{job.experience_level}</Badge>
                {!job.is_active && <Badge className="bg-red-100 text-red-700">Closed</Badge>}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Job Description</h2>
              <div className="space-y-3">
                {job.description.split("\n").map((para: string, i: number) => (
                  <p key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{para}</p>
                ))}
              </div>
            </motion.div>

            {job.requirements?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />{req}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {job.skills?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string) => (
                    <Badge key={skill} className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm py-1 px-3">{skill}</Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card p-5 sticky top-24">
              <Button onClick={handleApply} disabled={!job.is_active} className="w-full mb-3" size="lg">
                {job.is_active ? "Apply Now" : "Position Closed"}
              </Button>
              {!isAuthenticated && (
                <p className="text-xs text-center text-slate-500">
                  <Link to="/login" className="text-primary-600 font-medium">Sign in</Link> to apply
                </p>
              )}
              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Experience</span>
                  <span className="font-medium text-slate-900 dark:text-white">{job.experience_level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Job Type</span>
                  <span className="font-medium text-slate-900 dark:text-white">{job.job_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Location</span>
                  <span className="font-medium text-slate-900 dark:text-white">{job.location}</span>
                </div>
                {(job.salary_min || job.salary_max) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Salary</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> About the Company
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {(job.company_name || "J")[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{job.company_name}</p>
                  {job.company_location && <p className="text-xs text-slate-500">{job.company_location}</p>}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Apply for this Position" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
            <p className="font-semibold text-slate-900 dark:text-white">{job.title}</p>
            <p className="text-sm text-slate-500">{job.company_name}</p>
          </div>
          <div>
            <label className="label">Cover Letter <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea rows={5} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell the employer why you're a great fit..." className="input resize-none" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            Your resume will be included automatically
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setApplyOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={() => applyMutation.mutate()} loading={applyMutation.isPending} className="flex-1">Submit Application</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
