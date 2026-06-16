import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Briefcase, FileText, Search, TrendingUp, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { applicationsApi, jobsApi } from "../../api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import { getStatusColor, timeAgo } from "../../utils";
import Badge from "../../components/ui/Badge";
import { StatCardSkeleton } from "../../components/ui/Skeleton";

export default function CandidateDashboard() {
  const { user } = useAuth();

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.myApplications({ page: 1 }),
  });

  const { data: featuredJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: jobsApi.featured,
  });

  const statusCounts = applications?.items.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const profileComplete = (() => {
    const cp = user?.candidate_profile;
    if (!cp) return 0;
    let score = 0;
    if (user?.name) score += 20;
    if (cp.bio) score += 15;
    if (cp.skills?.length) score += 15;
    if (cp.education?.length) score += 15;
    if (cp.experience?.length) score += 15;
    if (cp.resume_url) score += 20;
    return score;
  })();

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-slate-500 dark:text-dark-text mt-1">
          {applications?.total
            ? `You have ${applications.total} application${applications.total !== 1 ? "s" : ""}`
            : "Start exploring opportunities today"}
        </p>
      </div>

      {/* Profile completion banner */}
      {profileComplete < 100 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 mb-6 border-l-4 border-l-primary-500 bg-primary-50/50 dark:bg-primary-900/10"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Profile {profileComplete}% complete
            </p>
            <Link to="/candidate/profile" className="text-xs text-primary-600 font-semibold hover:underline">
              Complete Profile →
            </Link>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${profileComplete}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Complete your profile to get better job matches and stand out to recruiters.
          </p>
        </motion.div>
      )}

      {/* Stats */}
      {appsLoading ? (
        <StatCardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard title="Total Applied" value={applications?.total || 0} icon={Briefcase} color="blue" delay={0} />
          <StatCard title="Under Review" value={statusCounts?.["Under Review"] || 0} icon={Search} color="orange" delay={0.05} />
          <StatCard title="Shortlisted" value={statusCounts?.["Shortlisted"] || 0} icon={TrendingUp} color="purple" delay={0.1} />
          <StatCard title="Selected" value={statusCounts?.["Selected"] || 0} icon={FileText} color="green" delay={0.15} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Applications</h2>
            <Link to="/candidate/applications" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!applications?.items.length ? (
            <div className="text-center py-8">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No applications yet</p>
              <Link to="/jobs" className="btn-primary mt-3 text-sm">Browse Jobs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.items.slice(0, 4).map((app) => (
                <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(app.job?.company_name || "J")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{app.job?.title || "Job"}</p>
                    <p className="text-xs text-slate-500 truncate">{app.job?.company_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />{timeAgo(app.applied_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recommended Jobs</h2>
            <Link to="/jobs" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {jobsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {featuredJobs?.slice(0, 4).map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(job.company_name || "J")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.company_name} · {job.location}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
