import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Briefcase, Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { extractApiError } from "../../utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      login(res.access_token, res.user);
      toast.success(`Welcome back, ${res.user.name.split(" ")[0]}!`);
      const dest = res.user.role === "admin" ? "/admin" : res.user.role === "recruiter" ? "/recruiter" : "/candidate";
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 dark:from-dark-bg dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="gradient-text">JobHub</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-5 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
        </div>

        <div className="card p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email address" type="email" placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} error={errors.email?.message} {...register("email")} />
            <div className="relative">
              <Input label="Password" type={showPassword ? "text" : "password"} placeholder="••••••••" icon={<Lock className="w-4 h-4" />} error={errors.password?.message} {...register("password")} />
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-9 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full" loading={loading} size="lg">Sign In</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Create one free</Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-dark-border">
            <p className="text-xs font-semibold text-slate-500 mb-2">Demo Accounts</p>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <p><span className="font-medium">Candidate:</span> candidate@demo.com / password123</p>
              <p><span className="font-medium">Recruiter:</span> recruiter@demo.com / password123</p>
              <p><span className="font-medium">Admin:</span> admin@demo.com / password123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
