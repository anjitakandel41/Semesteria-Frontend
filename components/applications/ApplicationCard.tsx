import React from "react";
import Link from "next/link";
import { Application } from "@/types";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { Button } from "@/components/ui/Button";

interface ApplicationCardProps {
  application: Application;
  baseDetailUrl?: string; // "/dashboard/applications" or "/recruiter/applications"
  showCandidateName?: boolean;
}

export function ApplicationCard({
  application,
  baseDetailUrl = "/dashboard/applications",
  showCandidateName = false,
}: ApplicationCardProps) {
  const appliedDate = new Date(application.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const updatedDate = new Date(application.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-300 dark:hover:border-sky-800 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {application.job_title}
          </h3>
          <ApplicationStatusBadge stage={application.stage} />
        </div>

        {showCandidateName && (
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Applicant:</span>
            <span>{application.candidate}</span>
          </div>
        )}

        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div>Applied: <span className="font-medium text-slate-700 dark:text-slate-300">{appliedDate}</span></div>
          <div>Last Updated: <span className="font-medium text-slate-700 dark:text-slate-300">{updatedDate}</span></div>
          <div>Version: <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold">v{application.version}</span></div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Link href={`${baseDetailUrl}/${application.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            View Application Details →
          </Button>
        </Link>
      </div>
    </div>
  );
}
