import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { jobsApi } from "../api";
import JobCard from "../components/jobs/JobCard";
import JobSearchBar from "../components/jobs/JobSearchBar";
import { JobCardSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import type { JobFilters } from "../types";

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<JobFilters>({
    q: searchParams.get("q") || "",
    location: searchParams.get("location") || "",
    job_type: (searchParams.get("job_type") as any) || "",
    experience_level: (searchParams.get("experience_level") as any) || "",
    skills: searchParams.get("skills") || "",
    page: Number(searchParams.get("page")) || 1,
    per_page: 12,
  });

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.q) params.q = filters.q;
    if (filters.location) params.location = filters.location;
    if (filters.job_type) params.job_type = filters.job_type;
    if (filters.experience_level) params.experience_level = filters.experience_level;
    if (filters.skills) params.skills = filters.skills;
    if (filters.page && filters.page > 1) params.page = String(filters.page);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["jobs", cleanFilters],
    queryFn: () => jobsApi.list(cleanFilters),
    placeholderData: (prev: any) => prev,
  });

  const resetFilters = () =>
    setFilters({ q: "", location: "", job_type: "", experience_level: "", page: 1, per_page: 12 });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Browse Jobs</h1>
          <p className="text-slate-500 text-sm">
            {data ? `${data.total.toLocaleString()} jobs available` : "Find your next opportunity"}
          </p>
        </div>

        <div className="mb-6">
          <JobSearchBar filters={filters} onChange={setFilters} onReset={resetFilters} />
        </div>

        <div className={`transition-opacity ${isFetching && !isLoading ? "opacity-70" : "opacity-100"}`}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 12 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : !data?.items?.length ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs found"
              description="Try adjusting your search filters or browse all available positions."
              action={<button onClick={resetFilters} className="btn-primary">Clear Filters</button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.items.map((job: any, i: number) => (
                  <JobCard key={job.id} job={job} delay={i * 0.03} />
                ))}
              </div>

              {data.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
                    disabled={filters.page === 1}
                    className="btn-secondary p-2 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: Math.min(data.total_pages, 7) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setFilters((f) => ({ ...f, page }))}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${filters.page === page ? "bg-primary-600 text-white" : "btn-secondary"}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                    disabled={filters.page === data.total_pages}
                    className="btn-secondary p-2 disabled:opacity-40"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
