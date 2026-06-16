import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, UserX, Shield, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "../../api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { timeAgo, extractApiError } from "../../utils";
import type { User } from "../../types";

const ROLE_COLORS: Record<string, string> = {
  candidate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  recruiter: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export default function AdminUsers() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, roleFilter],
    queryFn: () => usersApi.listUsers({ page, per_page: 20, role: roleFilter || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted");
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => usersApi.toggleUserStatus(id),
    onSuccess: (data: any) => {
      toast.success(data.message);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const filteredItems = search
    ? (data?.items || []).filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : data?.items || [];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-slate-500 mt-1">{data?.total || 0} registered users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["", "candidate", "recruiter", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                roleFilter === role
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 hover:border-primary-400"
              }`}
            >
              {role === "" ? "All" : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Role</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {filteredItems.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} src={user.avatar} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <Badge className={ROLE_COLORS[user.role] || ""}>{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-sm text-slate-500">
                      {timeAgo(user.created_at)}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (user as any).is_active !== false
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}>
                        {(user as any).is_active !== false ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.role !== "admin" && (
                          <>
                            <button
                              onClick={() => toggleMutation.mutate(user.id)}
                              title={(user as any).is_active !== false ? "Suspend user" : "Activate user"}
                              className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-600 transition-colors"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {user.role === "admin" && (
                          <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                            <Shield className="w-3.5 h-3.5" /> Admin
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-dark-border">
              <p className="text-sm text-slate-500">
                Page {page} of {data.total_pages} · {data.total} users
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

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" size="sm">
        <p className="text-slate-600 dark:text-slate-400 mb-5 text-sm">
          Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>? This will also remove all their jobs and applications.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">Cancel</Button>
          <Button
            variant="danger"
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            loading={deleteMutation.isPending}
            className="flex-1"
          >
            Delete User
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
