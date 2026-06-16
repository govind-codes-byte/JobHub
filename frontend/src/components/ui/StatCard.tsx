import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "orange" | "red" | "teal";
  change?: string;
  changeType?: "up" | "down" | "neutral";
  delay?: number;
}

const colorMap = {
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
};

export default function StatCard({ title, value, icon: Icon, color, change, changeType = "neutral", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-dark-text font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={`text-xs mt-1 font-medium ${
              changeType === "up" ? "text-green-600" :
              changeType === "down" ? "text-red-500" : "text-slate-500"
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
