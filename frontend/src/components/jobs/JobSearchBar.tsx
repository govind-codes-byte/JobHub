import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import type { JobFilters, JobType, ExperienceLevel } from "../../types";
import Button from "../ui/Button";

interface JobSearchBarProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
  onReset: () => void;
}

const JOB_TYPES: JobType[] = ["Full-Time", "Part-Time", "Contract", "Freelance", "Internship", "Remote"];
const EXP_LEVELS: ExperienceLevel[] = ["Entry Level", "Junior", "Mid Level", "Senior", "Lead", "Manager"];

export default function JobSearchBar({ filters, onChange, onReset }: JobSearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = !!(filters.job_type || filters.experience_level || filters.skills || filters.is_remote !== undefined);

  return (
    <div className="space-y-3">
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Job title, skills, keywords..."
            value={filters.q || ""}
            onChange={(e) => onChange({ ...filters, q: e.target.value, page: 1 })}
            className="input pl-10"
          />
        </div>
        <div className="relative w-52 hidden sm:block">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Location..."
            value={filters.location || ""}
            onChange={(e) => onChange({ ...filters, location: e.target.value, page: 1 })}
            className="input pl-10"
          />
        </div>
        <Button
          variant={showFilters || hasActiveFilters ? "primary" : "secondary"}
          onClick={() => setShowFilters((p) => !p)}
          icon={<SlidersHorizontal className="w-4 h-4" />}
        >
          Filters
          {hasActiveFilters && (
            <span className="ml-1 bg-white/30 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="card p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="label text-xs">Job Type</label>
            <select
              value={filters.job_type || ""}
              onChange={(e) => onChange({ ...filters, job_type: e.target.value as JobType | "", page: 1 })}
              className="input text-sm"
            >
              <option value="">All Types</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Experience</label>
            <select
              value={filters.experience_level || ""}
              onChange={(e) => onChange({ ...filters, experience_level: e.target.value as ExperienceLevel | "", page: 1 })}
              className="input text-sm"
            >
              <option value="">All Levels</option>
              {EXP_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Min Salary ($)</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={filters.salary_min || ""}
              onChange={(e) => onChange({ ...filters, salary_min: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="label text-xs">Skills (comma-separated)</label>
            <input
              type="text"
              placeholder="React, Python..."
              value={filters.skills || ""}
              onChange={(e) => onChange({ ...filters, skills: e.target.value, page: 1 })}
              className="input text-sm"
            />
          </div>
          <div className="col-span-2 md:col-span-4 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.is_remote === true}
                onChange={(e) => onChange({ ...filters, is_remote: e.target.checked ? true : undefined, page: 1 })}
                className="w-4 h-4 rounded accent-primary-600"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">Remote only</span>
            </label>
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium"
              >
                <X className="w-4 h-4" /> Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
