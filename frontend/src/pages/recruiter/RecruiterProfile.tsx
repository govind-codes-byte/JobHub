import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Building2, Globe, MapPin, Users } from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { extractApiError } from "../../utils";

const COMPANY_SIZES = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
];

const INDUSTRIES = [
  { value: "Technology", label: "Technology" },
  { value: "Finance", label: "Finance & Banking" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Education", label: "Education" },
  { value: "E-commerce", label: "E-commerce & Retail" },
  { value: "Media", label: "Media & Entertainment" },
  { value: "Consulting", label: "Consulting" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Other", label: "Other" },
];

export default function RecruiterProfile() {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const rp = user?.recruiter_profile || {};

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      name: user?.name || "",
      company_name: rp.company_name || "",
      company_description: rp.company_description || "",
      company_website: rp.company_website || "",
      company_location: rp.company_location || "",
      company_size: rp.company_size || "",
      industry: rp.industry || "",
    },
  });

  // Watch for live preview
  const watchedCompanyName = watch("company_name");
  const watchedIndustry = watch("industry");
  const watchedLocation = watch("company_location");
  const watchedSize = watch("company_size");

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => usersApi.updateProfile(data),
    onSuccess: (updatedUser: any) => {
      // Update context so navbar + dashboard reflect new company name immediately
      updateUser(updatedUser);
      // Also invalidate any cached profile queries
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
      toast.success("Company profile saved! You can now post jobs.");
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const onSubmit = (data: Record<string, unknown>) => {
    // Ensure all recruiter fields are sent explicitly
    const payload = {
      name: data.name,
      company_name: data.company_name,
      company_description: data.company_description,
      company_website: data.company_website,
      company_location: data.company_location,
      company_size: data.company_size,
      industry: data.industry,
    };
    mutation.mutate(payload);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Company Profile</h1>
          <p className="text-slate-500 mt-1">This information appears on all your job postings</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Recruiter info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" /> Your Information
            </h2>
            <Input label="Your Name" {...register("name")} placeholder="Your full name" />
          </motion.div>

          {/* Company info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-500" /> Company Details
            </h2>
            <div className="space-y-4">
              <Input
                label="Company Name"
                {...register("company_name")}
                placeholder="Acme Corp"
                required
              />
              <div>
                <label className="label">Company Description</label>
                <textarea
                  {...register("company_description")}
                  rows={4}
                  placeholder="Describe your company, culture, mission, and what makes it a great place to work..."
                  className="input resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Company Website"
                  icon={<Globe className="w-4 h-4" />}
                  {...register("company_website")}
                  placeholder="https://company.com"
                />
                <Input
                  label="Headquarters"
                  icon={<MapPin className="w-4 h-4" />}
                  {...register("company_location")}
                  placeholder="San Francisco, CA"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Company Size"
                  options={COMPANY_SIZES}
                  placeholder="Select size..."
                  {...register("company_size")}
                />
                <Select
                  label="Industry"
                  options={INDUSTRIES}
                  placeholder="Select industry..."
                  {...register("industry")}
                />
              </div>
            </div>
          </motion.div>

          {/* Live Preview */}
          {watchedCompanyName && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Preview — how you appear on job cards
              </h2>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {watchedCompanyName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{watchedCompanyName}</p>
                  <p className="text-xs text-slate-500">
                    {watchedIndustry && `${watchedIndustry} · `}
                    {watchedLocation && `${watchedLocation} · `}
                    {watchedSize && `${watchedSize} employees`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Status banner */}
          {!rp.company_name && (
            <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300">
              ⚠️ You must save a <strong>Company Name</strong> before you can post jobs.
            </div>
          )}
          {rp.company_name && (
            <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-300">
              ✅ Company profile is set. You can now <a href="/recruiter/jobs/new" className="font-semibold underline">post jobs</a>.
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={mutation.isPending} size="lg">
              Save Company Profile
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
