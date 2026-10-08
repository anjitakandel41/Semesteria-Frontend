"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Job } from "@/types";
import { JobStatusBadge } from "./JobStatusBadge";
import { Button } from "@/components/ui/Button";
import { getStoredUser } from "@/lib/api";

interface JobCardProps {
  job: Job;
  isApplied?: boolean;
  onApply?: (jobId: number) => void;
  isApplying?: boolean;
  showApply?: boolean;
}

export function JobCard({
  job,
  isApplied = false,
  onApply,
  isApplying = false,
  showApply,
}: JobCardProps) {
  const [isCandidate, setIsCandidate] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (user?.role === "recruiter" || user?.username?.toLowerCase() === "admin") {
      setIsCandidate(false);
    } else {
      setIsCandidate(true);
    }
  }, []);

  const canApply = showApply !== undefined ? showApply : isCandidate;
  const isOpen = job.status === "OPEN";
  const formattedDate = new Date(job.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-300 dark:hover:border-sky-800 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {job.title}
          </h3>
          <JobStatusBadge status={job.status} />
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
          {job.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <span>Posted {formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/jobs/${job.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>

          {canApply && (
            <>
              {isApplied ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  ✓ Applied
                </span>
              ) : isOpen ? (
                onApply && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onApply(job.id)}
                    isLoading={isApplying}
                  >
                    Apply
                  </Button>
                )
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                  Closed
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
