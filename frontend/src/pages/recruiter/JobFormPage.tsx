import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { jobsApi } from "../../api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { extractApiError } from "../../utils";
import type { Job, JobType, ExperienceLevel } from "../../types";

const JOB_TYPES = ["Full-Time","Part-Time","Contract","Freelance","Internship","Remote"].map((v) => ({ value: v, label: v }));
const EXP_LEVELS = ["Entry Level","Junior","Mid Level","Senior","Lead","Manager"].map((v) => ({ value: v, label: v }));
const CURRENCIES = ["USD","EUR","GBP","INR","CAD","AUD"].map((v) => ({ value: v, label: v }));

export default function JobFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<JobType>("Full-Time");
  const [expLevel, setExpLevel] = useState<ExperienceLevel>("Mid Level");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isRemote, setIsRemote] = useState(false);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [reqInput, setReqInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useQuery({
    queryKey: ["job", id],
    queryFn: () => jobsApi.get(id!),
    enabled: isEdit,
    onSuccess: (job: Job) => {
      setTitle(job.title);
      setDescription(job.description);
      setLocation(job.location);
      setJobType(job.job_type);
      setExpLevel(job.experience_level);
      setSalaryMin(job.salary_min?.toString() || "");
      setSalaryMax(job.salary_max?.toString() || "");
      setCurrency(job.salary_currency || "USD");
      setIsRemote(job.is_remote);
      setRequirements(job.requirements || []);
      setSkills(job.skills || []);
    },
  } as any);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      isEdit ? jobsApi.update(id!, data as any) : jobsApi.create(data as any),
    onSuccess: () => {
      toast.success(isEdit ? "Job updated!" : "Job posted! 🎉");
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
      navigate("/recruiter/jobs");
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (title.trim().length < 3) errs.title = "Title must be at least 3 characters";
    if (description.trim().length < 50) errs.description = "Description must be at least 50 characters";
    if (!location.trim()) errs.location = "Location is required";
    if (!requirements.length) errs.requirements = "Add at least one requirement";
    if (!skills.length) errs.skills = "Add at least one skill";
    if (salaryMin && salaryMax && Number(salaryMax) < Number(salaryMin)) errs.salary = "Max salary must be greater than min";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      title, description, location,
      job_type: jobType,
      experience_level: expLevel,
      salary_min: salaryMin ? Number(salaryMin) : undefined,
      salary_max: salaryMax ? Number(salaryMax) : undefined,
      salary_currency: currency,
      is_remote: isRemote,
      requirements,
      skills,
    });
  };

  const addItem = (list: string[], setList: (v: string[]) => void, value: string, setInput: (v: string) => void) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) { setList([...list, trimmed]); setInput(""); }
  };

  const removeItem = (list: string[], setList: (v: string[]) => void, item: string) =>
    setList(list.filter((i) => i !== item));

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isEdit ? "Edit Job" : "Post a New Job"}</h1>
            <p className="text-slate-500 mt-0.5">Fill in the details to attract the right candidates</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Job Title <span className="text-red-500">*</span></label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior React Developer" className={`input ${errors.title ? "border-red-400" : ""}`} />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="label">Job Description <span className="text-red-500">*</span></label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Describe the role, responsibilities, team culture..." className={`input resize-none ${errors.description ? "border-red-400" : ""}`} />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Job Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Job Type" options={JOB_TYPES} value={jobType} onChange={(e) => setJobType(e.target.value as JobType)} />
              <Select label="Experience Level" options={EXP_LEVELS} value={expLevel} onChange={(e) => setExpLevel(e.target.value as ExperienceLevel)} />
              <div>
                <label className="label">Location <span className="text-red-500">*</span></label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York, NY" className={`input ${errors.location ? "border-red-400" : ""}`} />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} className="w-4 h-4 accent-primary-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Remote / Hybrid available</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Salary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Salary Range</h2>
            <p className="text-xs text-slate-500 mb-4">Optional — jobs with salary info get 30% more applicants</p>
            {errors.salary && <p className="text-xs text-red-500 mb-2">{errors.salary}</p>}
            <div className="grid grid-cols-3 gap-3">
              <Select label="Currency" options={CURRENCIES} value={currency} onChange={(e) => setCurrency(e.target.value)} />
              <Input label="Min Salary" type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="e.g. 50000" />
              <Input label="Max Salary" type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="e.g. 80000" />
            </div>
          </motion.div>

          {/* Requirements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Requirements <span className="text-red-500">*</span></h2>
            {errors.requirements && <p className="text-xs text-red-500 mb-2">{errors.requirements}</p>}
            <div className="flex gap-2 mb-3">
              <input type="text" value={reqInput} onChange={(e) => setReqInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(requirements, setRequirements, reqInput, setReqInput))} placeholder="e.g. 3+ years of React experience..." className="input flex-1" />
              <Button type="button" variant="secondary" onClick={() => addItem(requirements, setRequirements, reqInput, setReqInput)} icon={<Plus className="w-4 h-4" />}>Add</Button>
            </div>
            <div className="space-y-2">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm">
                  <span className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <span className="flex-1 text-slate-700 dark:text-slate-300">{req}</span>
                  <button type="button" onClick={() => removeItem(requirements, setRequirements, req)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Required Skills <span className="text-red-500">*</span></h2>
            {errors.skills && <p className="text-xs text-red-500 mb-2">{errors.skills}</p>}
            <div className="flex gap-2 mb-3">
              <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(skills, setSkills, skillInput, setSkillInput))} placeholder="e.g. React, TypeScript, Node.js..." className="input flex-1" />
              <Button type="button" variant="secondary" onClick={() => addItem(skills, setSkills, skillInput, setSkillInput)} icon={<Plus className="w-4 h-4" />}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  {skill}
                  <button type="button" onClick={() => removeItem(skills, setSkills, skill)} className="hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
          </motion.div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending} size="lg">
              {isEdit ? "Update Job" : "Post Job"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
