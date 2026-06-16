import { motion } from "framer-motion";
import { MapPin, Clock, DollarSign, Users, Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import type { Job } from "../../types";
import { formatSalary, timeAgo, getJobTypeColor } from "../../utils";
import Badge from "../ui/Badge";

interface JobCardProps {
  job: Job;
  delay?: number;
  showApplicants?: boolean;
}

export default function JobCard({ job, delay = 0, showApplicants = false }: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Link to={`/jobs/${job.id}`} className="block group">
        <div className="card p-5 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={job.company_name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-dark-border"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                {(job.company_name || "J")[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-dark-text truncate">
                {job.company_name}
              </p>
            </div>
            {job.is_remote && (
              <span className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded-lg flex-shrink-0">
                <Wifi className="w-3 h-3" /> Remote
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-dark-text mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
            </span>
            {showApplicants && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {job.applicant_count} applicants
              </span>
            )}
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 4 && (
                <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500">
                  +{job.skills.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-dark-border">
            <Badge className={getJobTypeColor(job.job_type)}>{job.job_type}</Badge>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {timeAgo(job.created_at)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
