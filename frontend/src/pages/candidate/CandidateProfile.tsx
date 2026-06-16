import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Upload, Download, Plus, X, Camera, FileText, Globe, GitBranch, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Avatar from "../../components/ui/Avatar";
import { extractApiError } from "../../utils";

const POPULAR_SKILLS = [
  "JavaScript","TypeScript","React","Node.js","Python","FastAPI",
  "MongoDB","PostgreSQL","Docker","AWS","Git","REST API",
];

export default function CandidateProfile() {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const resumeRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [skills, setSkills] = useState<string[]>(user?.candidate_profile?.skills || []);
  const [skillInput, setSkillInput] = useState("");

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || "",
      bio: user?.candidate_profile?.bio || "",
      location: user?.candidate_profile?.location || "",
      portfolio_url: user?.candidate_profile?.portfolio_url || "",
      github_url: user?.candidate_profile?.github_url || "",
      linkedin_url: user?.candidate_profile?.linkedin_url || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser as any);
      toast.success("Profile updated!");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const resumeMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadResume(file),
    onSuccess: () => {
      toast.success("Resume uploaded!");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (data) => {
      updateUser({ ...user!, avatar: (data as any).avatar_url });
      toast.success("Photo updated!");
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const onSubmit = (data: Record<string, unknown>) => {
    updateMutation.mutate({ ...data, skills });
  };

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !skills.includes(s) && skills.length < 20) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const cp = user?.candidate_profile;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-slate-500 mt-1">Keep your profile updated to get better opportunities</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Avatar & Basic Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h2>
            <div className="flex items-start gap-5 mb-5">
              <div className="relative group">
                <Avatar name={user?.name || "User"} src={user?.avatar} size="xl" />
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && avatarMutation.mutate(e.target.files[0])}
                />
              </div>
              <div className="flex-1 space-y-3">
                <Input label="Full Name" {...register("name")} placeholder="Your full name" />
                <Input label="Location" {...register("location")} placeholder="e.g. San Francisco, CA" />
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea
                {...register("bio")}
                rows={3}
                placeholder="Tell recruiters about yourself..."
                className="input resize-none"
              />
            </div>
          </motion.div>

          {/* Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Links & Portfolio</h2>
            <div className="space-y-3">
              <Input label="Portfolio URL" icon={<Globe className="w-4 h-4" />} {...register("portfolio_url")} placeholder="https://yourportfolio.com" />
              <Input label="GitHub URL" icon={<GitBranch className="w-4 h-4" />} {...register("github_url")} placeholder="https://github.com/username" />
              <Input label="LinkedIn URL" icon={<Link2 className="w-4 h-4" />} {...register("linkedin_url")} placeholder="https://linkedin.com/in/username" />
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Skills</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))}
                placeholder="Add a skill and press Enter..."
                className="input flex-1"
              />
              <Button type="button" onClick={() => addSkill(skillInput)} variant="secondary" icon={<Plus className="w-4 h-4" />}>
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill) => (
                  <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-2">Popular skills:</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="px-2.5 py-1 text-xs rounded-full border border-slate-200 dark:border-dark-border hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Resume */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Resume</h2>
            {cp?.resume_url ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 mb-3">
                <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300 truncate">{cp.resume_filename || "resume.pdf"}</p>
                  <p className="text-xs text-green-600">Resume uploaded ✓</p>
                </div>
                <a
                  href={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${cp.resume_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm py-1.5 px-3"
                >
                  <Download className="w-4 h-4" /> View
                </a>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-3">
                <p className="text-sm text-amber-700 dark:text-amber-300">⚠️ No resume uploaded. Upload one to start applying for jobs.</p>
              </div>
            )}
            <div
              onClick={() => resumeRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-dark-border rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {resumeMutation.isPending ? "Uploading..." : "Click to upload resume (PDF, max 5MB)"}
              </p>
              <input
                ref={resumeRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && resumeMutation.mutate(e.target.files[0])}
              />
            </div>
          </motion.div>

          <div className="flex justify-end">
            <Button type="submit" loading={updateMutation.isPending} size="lg">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
