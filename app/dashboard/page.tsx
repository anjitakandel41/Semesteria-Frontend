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
import { Job, Application, User } from "@/types";

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
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
        setError("Failed to load dashboard data.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (
      storedUser?.role === "recruiter" ||
      storedUser?.username?.toLowerCase() === "admin"
    ) {
      router.replace("/recruiter");
      return;
    }
    setUser(storedUser);
    loadData();
  }, [loadData, router]);

  const handleApply = async (jobId: number) => {
    setError(null);
    setSuccessMessage(null);
    setApplyingJobId(jobId);

    try {
      await createApplication(jobId);
      setSuccessMessage("Application submitted successfully.");
      // Refresh applications and jobs
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

  const appliedJobIds = applications.map((app) => app.job);

  return (
    <AuthGuard allowedRoles={["candidate"]}>
      <PageContainer
        title={`Welcome back, ${user?.username || "Candidate"}`}
        description="Browse available engineering openings and track your application progress."
        actions={
          <Link href="/dashboard/applications">
            <Button variant="outline">
              View My Applications ({applications.length})
            </Button>
          </Link>
        }
      >
        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        <ErrorMessage
          message={error}
          className="mb-6"
          onDismiss={() => setError(null)}
        />

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Available Openings
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {jobs.length}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              My Total Applications
            </div>
            <div className="mt-2 text-3xl font-extrabold text-sky-600 dark:text-sky-400">
              {applications.length}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Reviews
            </div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {applications.filter((a) => !["HIRED", "REJECTED", "WITHDRAWN"].includes(a.stage)).length}
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Available Positions
          </h2>
          <Button variant="ghost" size="sm" onClick={loadData}>
            Refresh
          </Button>
        </div>

        {/* Job List Component */}
        <JobList
          jobs={jobs}
          appliedJobIds={appliedJobIds}
          onApply={handleApply}
          applyingJobId={applyingJobId}
          isLoading={isLoading}
        />
      </PageContainer>
    </AuthGuard>
  );
}
