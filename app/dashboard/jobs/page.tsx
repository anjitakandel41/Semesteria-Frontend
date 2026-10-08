"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageContainer } from "@/components/layout/PageContainer";
import { JobList } from "@/components/jobs/JobList";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Button } from "@/components/ui/Button";
import { getJobs, getMyApplications, createApplication, getStoredUser } from "@/lib/api";
import { Job, Application } from "@/types";

export default function CandidateJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [jobsData, appsData] = await Promise.all([
        getJobs(),
        getMyApplications(),
      ]);
      setJobs(jobsData);
      setApplications(appsData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load jobs list.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getStoredUser();
    if (user?.role === "recruiter" || user?.username?.toLowerCase() === "admin") {
      router.replace("/recruiter");
      return;
    }
    loadData();
  }, [loadData, router]);

  const handleApply = async (jobId: number) => {
    setError(null);
    setSuccessMessage(null);
    setApplyingJobId(jobId);

    try {
      await createApplication(jobId);
      setSuccessMessage("Application submitted successfully.");
      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit application.");
      }
    } finally {
      setApplyingJobId(null);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const appliedJobIds = applications.map((app) => app.job);

  return (
    <AuthGuard allowedRoles={["candidate"]}>
      <PageContainer
        title="Open Positions"
        description="Explore all open career opportunities at Semesteria."
        actions={
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        }
      >
        {successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center justify-between">
            <span className="font-medium">{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <ErrorMessage
          message={error}
          className="mb-6"
          onDismiss={() => setError(null)}
        />

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search positions by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-md rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 text-slate-900 dark:text-white"
          />
        </div>

        <JobList
          jobs={filteredJobs}
          appliedJobIds={appliedJobIds}
          onApply={handleApply}
          applyingJobId={applyingJobId}
          isLoading={isLoading}
          emptyMessage={
            searchQuery
              ? `No openings matching "${searchQuery}".`
              : "There are currently no open positions listed."
          }
        />
      </PageContainer>
    </AuthGuard>
  );
}
