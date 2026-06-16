import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, LayoutDashboard, User, FileText, Search,
  Building2, PlusCircle, Users, BarChart3, Menu,
  LogOut, ChevronRight, Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const CANDIDATE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/candidate", icon: LayoutDashboard },
  { label: "My Profile", href: "/candidate/profile", icon: User },
  { label: "Browse Jobs", href: "/jobs", icon: Search },
  { label: "My Applications", href: "/candidate/applications", icon: FileText },
];

const RECRUITER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/recruiter", icon: LayoutDashboard },
  { label: "Company Profile", href: "/recruiter/profile", icon: Building2 },
  { label: "Post a Job", href: "/recruiter/jobs/new", icon: PlusCircle },
  { label: "My Jobs", href: "/recruiter/jobs", icon: Briefcase },
  { label: "Applicants", href: "/recruiter/applicants", icon: Users },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { label: "Applications", href: "/admin/applications", icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems =
    user?.role === "admin"
      ? ADMIN_NAV
      : user?.role === "recruiter"
      ? RECRUITER_NAV
      : CANDIDATE_NAV;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-dark-border">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="gradient-text">JobHub</span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-dark-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <Avatar name={user?.name || "User"} src={user?.avatar} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-dark-text capitalize flex items-center gap-1">
              {user?.role === "admin" && <Shield className="w-3 h-3" />}
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === location.pathname ||
            (item.href !== "/candidate" && item.href !== "/recruiter" && item.href !== "/admin" &&
              location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-dark-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-dark-bg overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-dark-card z-40 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-slate-900 dark:text-white">JobHub</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
