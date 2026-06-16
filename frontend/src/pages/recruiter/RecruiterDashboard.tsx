import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Briefcase, Users, TrendingUp, Eye, ArrowRight, Plus, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { jobsApi } from "../../api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import { getJobTypeColor, timeAgo } from "../../utils";
import { StatCardSkeleton } from "../../components/ui/Skeleton";

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const { data: myJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["my-jobs"],
    queryFn: () => jobsApi.myJobs({ page: 1 }),
  });

  const totalApplicants = myJobs?.items.reduce((sum, j) => sum + j.applicant_count, 0) || 0;
  const activeJobs = myJobs?.items.filter((j) => j.is_active).length || 0;

  const rp = user?.recruiter_profile;
  const profileComplete = !!(rp?.company_name && rp?.company_description && rp?.company_location);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome, {user?.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {rp?.company_name ? `Managing jobs for ${rp.company_name}` : "Set up your company profile to get started"}
          </p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn-primary hidden sm:flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post Job
        </Link>
      </div>

      {/* Profile warning */}
      {!profileComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 mb-6 border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
        >
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
            ⚠️ Complete your company profile
          </p>
          <p className="text-xs text-slate-500 mb-2">
            You need to complete your company profile before posting jobs.
          </p>
          <Link to="/recruiter/profile" className="text-xs text-amber-600 font-semibold hover:underline">
            Complete Profile →
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      {jobsLoading ? (
        <StatCardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard title="Total Jobs" value={myJobs?.total || 0} icon={Briefcase} color="blue" delay={0} />
          <StatCard title="Active Jobs" value={activeJobs} icon={TrendingUp} color="green" delay={0.05} />
          <StatCard title="Total Applicants" value={totalApplicants} icon={Users} color="purple" delay={0.1} />
          <StatCard
            title="Avg. Applicants"
            value={myJobs?.total ? Math.round(totalApplicants / myJobs.total) : 0}
            icon={Eye}
            color="orange"
            delay={0.15}
          />
        </div>
      )}

      {/* Recent Jobs */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent Job Postings</h2>
          <Link to="/recruiter/jobs" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {!myJobs?.items.length ? (
          <div className="text-center py-10">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-3">No jobs posted yet</p>
            <Link to="/recruiter/jobs/new" className="btn-primary text-sm">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myJobs.items.slice(0, 5).map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {job.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{job.title}</p>
                    <Badge className={`${getJobTypeColor(job.job_type)} text-xs`}>{job.job_type}</Badge>
                    {!job.is_active && <Badge className="bg-red-100 text-red-700 text-xs">Closed</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicant_count} applicants</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(job.created_at)}</span>
                  </div>
                </div>
                <Link
                  to={`/recruiter/jobs/${job.id}/applicants`}
                  className="btn-secondary text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  View Applicants
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
