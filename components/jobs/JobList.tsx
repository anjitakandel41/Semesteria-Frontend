import React from "react";
import { Job } from "@/types";
import { JobCard } from "./JobCard";
import { Loading } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface JobListProps {
  jobs: Job[];
  appliedJobIds?: number[];
  onApply?: (jobId: number) => void;
  applyingJobId?: number | null;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  showApply?: boolean;
}

export function JobList({
  jobs,
  appliedJobIds = [],
  onApply,
  applyingJobId,
  isLoading = false,
  error,
  emptyMessage = "No jobs available at this time.",
  showApply,
}: JobListProps) {
  if (isLoading) {
    return <Loading message="Loading available jobs..." />;
  }

  if (error) {
    return <ErrorMessage message={error} className="my-4" />;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <svg
          className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
        <h3 className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
          No jobs found
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isApplied={appliedJobIds.includes(job.id)}
          onApply={onApply}
          isApplying={applyingJobId === job.id}
          showApply={showApply}
        />
      ))}
    </div>
  );
}
