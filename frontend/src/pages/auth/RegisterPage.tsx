import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Briefcase, Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { extractApiError } from "../../utils";
import type { UserRole } from "../../types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.union([z.literal("candidate"), z.literal("recruiter")]),
});
type FormData = z.infer<typeof schema>;

const ROLES: { value: UserRole; label: string; desc: string; color: string }[] = [
  { value: "candidate", label: "Job Seeker", desc: "Find and apply for jobs", color: "border-primary-500 bg-primary-50 dark:bg-primary-900/20" },
  { value: "recruiter", label: "Recruiter", desc: "Post jobs and hire talent", color: "border-green-500 bg-green-50 dark:bg-green-900/20" },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "candidate" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      login(res.access_token, res.user);
      toast.success("Account created! Welcome to JobHub 🎉");
      navigate((data as any).role === "recruiter" ? "/recruiter" : "/candidate", { replace: true });
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 dark:from-dark-bg dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="gradient-text">JobHub</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-5 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm">Start your journey with JobHub today</p>
        </div>

        <div className="card p-8 shadow-xl">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setValue("role", role.value as "candidate" | "recruiter")}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedRole === role.value
                    ? role.color
                    : "border-slate-200 dark:border-dark-border hover:border-slate-300"
                }`}
              >
                {selectedRole === role.value && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-primary-600 dark:text-primary-400" />
                )}
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{role.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{role.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              icon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                icon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                hint="Use a strong password with letters and numbers"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" className="w-full" loading={loading} size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            By registering, you agree to our{" "}
            <a href="#" className="text-primary-600 hover:underline">Terms</a> and{" "}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
          </p>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
