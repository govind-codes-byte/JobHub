import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Briefcase, Users, TrendingUp, ArrowRight, Star, Building2, Zap, Shield, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "../api";
import JobCard from "../components/jobs/JobCard";
import { JobCardSkeleton } from "../components/ui/Skeleton";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const COMPANIES = [
  { name: "Google", color: "from-blue-500 to-green-500" },
  { name: "Microsoft", color: "from-blue-600 to-blue-400" },
  { name: "Amazon", color: "from-orange-500 to-yellow-400" },
  { name: "Meta", color: "from-blue-600 to-indigo-600" },
  { name: "Apple", color: "from-slate-600 to-slate-400" },
  { name: "Netflix", color: "from-red-600 to-red-400" },
];

const STATS = [
  { value: "50K+", label: "Active Jobs", icon: Briefcase },
  { value: "20K+", label: "Companies", icon: Building2 },
  { value: "1M+", label: "Job Seekers", icon: Users },
  { value: "95%", label: "Success Rate", icon: TrendingUp },
];

const FEATURES = [
  { icon: Zap, title: "Smart Matching", desc: "AI-powered job recommendations based on your skills and experience." },
  { icon: Shield, title: "Verified Companies", desc: "All companies are vetted to ensure authentic job listings." },
  { icon: Globe, title: "Remote Friendly", desc: "Find remote, hybrid, or on-site roles from top companies worldwide." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const { data: featuredJobs, isLoading } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: () => jobsApi.featured(),
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (searchLocation) params.set("location", searchLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  const jobs = Array.isArray(featuredJobs) ? featuredJobs : [];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 pt-20 pb-28">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5" /> #1 Job Portal for Tech Professionals
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
              Find Your
              <span className="block bg-gradient-to-r from-primary-400 to-blue-300 bg-clip-text text-transparent">Dream Career</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              Connect with top companies and unlock opportunities that match your skills, passion, and ambition.
            </p>
          </motion.div>

          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white dark:bg-dark-card rounded-2xl shadow-2xl">
              <div className="flex-1 flex items-center gap-2 px-4">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input type="text" placeholder="Job title, skills, or keyword..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 text-slate-900 dark:text-white bg-transparent outline-none placeholder-slate-400 text-sm" />
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 border-l border-slate-200 dark:border-dark-border">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input type="text" placeholder="Location..." value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="w-36 text-slate-900 dark:text-white bg-transparent outline-none placeholder-slate-400 text-sm" />
              </div>
              <button type="submit" className="btn-primary rounded-xl px-6">
                Search Jobs <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-5 text-slate-400 text-sm">
            Popular:{" "}
            {["React Developer", "Python Engineer", "DevOps", "Data Scientist"].map((term) => (
              <button key={term} onClick={() => navigate(`/jobs?q=${term}`)} className="text-primary-400 hover:text-primary-300 transition-colors mx-1">{term}</button>
            ))}
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="card p-5 text-center hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Jobs</h2>
            <p className="text-slate-500 dark:text-dark-text mt-1">Hand-picked opportunities from top companies</p>
          </div>
          <Link to="/jobs" className="btn-secondary hidden sm:flex items-center gap-2">View All <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
            : jobs.map((job: any, i: number) => <JobCard key={job.id} job={job} delay={i * 0.06} />)}
        </div>
        <div className="text-center mt-8 sm:hidden">
          <Link to="/jobs" className="btn-primary">View All Jobs</Link>
        </div>
      </section>

      {/* Companies */}
      <section className="bg-slate-100 dark:bg-dark-card/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Trusted by World-Class Companies</h2>
          <p className="text-slate-500 mb-10">Join thousands of professionals working at top companies</p>
          <div className="flex flex-wrap justify-center gap-4">
            {COMPANIES.map((company) => (
              <div key={company.name} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-8 h-8 bg-gradient-to-br ${company.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>{company.name[0]}</div>
                <span className="font-semibold text-slate-800 dark:text-white">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="section-title">Why Choose JobHub?</h2>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">Everything you need to land your next opportunity</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="card p-6 hover:shadow-lg transition-shadow text-center">
              <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-dark-text leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl p-10 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Take the Next Step?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">Join over 1 million professionals who found their dream job on JobHub.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg">Get Started Free</Link>
            <Link to="/jobs" className="px-8 py-3 bg-white/20 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors">Browse Jobs</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
