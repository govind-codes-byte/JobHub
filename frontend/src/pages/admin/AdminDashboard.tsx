import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Briefcase, FileText, TrendingUp, UserCheck, UserPlus, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { adminApi } from "../../api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import { StatCardSkeleton } from "../../components/ui/Skeleton";
import { useTheme } from "../../context/ThemeContext";

const STATUS_COLORS: Record<string, string> = {
  Applied: "#3b82f6",
  "Under Review": "#f59e0b",
  Shortlisted: "#8b5cf6",
  Rejected: "#ef4444",
  Selected: "#22c55e",
};

const JOB_TYPE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function AdminDashboard() {
  const { isDark } = useTheme();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.stats,
    refetchInterval: 60_000,
  });

  const appStatusData = stats
    ? Object.entries(stats.applications_by_status).map(([name, value]) => ({ name, value }))
    : [];

  const jobTypeData = stats
    ? Object.entries(stats.jobs_by_type).map(([name, value]) => ({ name, value }))
    : [];

  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#334155" : "#e2e8f0";

  return (
    <DashboardLayout>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview and analytics</p>
      </div>

      {isLoading ? (
        <StatCardSkeleton count={6} />
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-7">
            <StatCard title="Total Users" value={stats?.total_users || 0} icon={Users} color="blue" delay={0} />
            <StatCard title="Candidates" value={stats?.total_candidates || 0} icon={UserCheck} color="green" delay={0.05} />
            <StatCard title="Recruiters" value={stats?.total_recruiters || 0} icon={UserPlus} color="purple" delay={0.1} />
            <StatCard title="Total Jobs" value={stats?.total_jobs || 0} icon={Briefcase} color="orange" delay={0.15} />
            <StatCard title="Active Jobs" value={stats?.active_jobs || 0} icon={Activity} color="teal" delay={0.2} />
            <StatCard title="Applications" value={stats?.total_applications || 0} icon={FileText} color="blue" delay={0.25} />
            <StatCard
              title="New Users (7d)"
              value={stats?.recent_registrations || 0}
              icon={TrendingUp}
              color="green"
              delay={0.3}
              change={`+${stats?.recent_registrations} this week`}
              changeType="up"
            />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Application Status Pie */}
            {appStatusData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-5"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-5">Applications by Status</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={appStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {appStatusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[entry.name] || "#64748b"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1e293b" : "#fff",
                        border: "1px solid " + gridColor,
                        borderRadius: "12px",
                        color: isDark ? "#f1f5f9" : "#0f172a",
                      }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: textColor, fontSize: 12 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Jobs by Type Bar Chart */}
            {jobTypeData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="card p-5"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-5">Jobs by Type</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={jobTypeData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: textColor }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: textColor }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1e293b" : "#fff",
                        border: "1px solid " + gridColor,
                        borderRadius: "12px",
                        color: isDark ? "#f1f5f9" : "#0f172a",
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {jobTypeData.map((_, i) => (
                        <Cell key={i} fill={JOB_TYPE_COLORS[i % JOB_TYPE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
