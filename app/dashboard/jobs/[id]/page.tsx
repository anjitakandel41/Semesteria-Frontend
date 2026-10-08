"use client";

import React, { useEffect, useState, useCallback, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageContainer } from "@/components/layout/PageContainer";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { getJobById, getMyApplications, createApplication, getStoredUser } from "@/lib/api";
import { Job, Application, User } from "@/types";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

function JobDetailContent({ params }: JobDetailPageProps) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isRecruiter = user?.role === "recruiter";

  const loadJobData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storedUser = getStoredUser();
      setUser(storedUser);

      if (storedUser?.role === "candidate") {
        const [jobData, appsData] = await Promise.all([
          getJobById(jobId),
          getMyApplications().catch(() => []),
        ]);
        setJob(jobData);
        const matchedApp = appsData.find((a) => String(a.job) === String(jobId));
        setExistingApplication(matchedApp || null);
      } else {
        const jobData = await getJobById(jobId);
        setJob(jobData);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load job details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJobData();
  }, [loadJobData]);

  const handleApply = async () => {
    if (!job || isRecruiter) return;
    setIsApplying(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newApp = await createApplication(job.id);
      setSuccessMessage("Application submitted successfully.");
      setExistingApplication(newApp);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit application.");
      }
    } finally {
      setIsApplying(false);
    }
  };

  const backHref = isRecruiter ? "/recruiter" : "/dashboard";
  const backLabel = isRecruiter ? "Back to Recruiter Portal" : "Back to Jobs";

  return (
    <PageContainer
      actions={
        <Link href={backHref}>
          <Button variant="outline">{backLabel}</Button>
        </Link>
      }
    >
      {isLoading ? (
        <Loading message="Loading position details..." />
      ) : error && !job ? (
        <div className="py-8">
          <ErrorMessage message={error} />
          <div className="mt-4">
            <Button onClick={() => router.push(backHref)}>
              Return to Portal
            </Button>
          </div>
        </div>
      ) : job ? (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {job.title}
                  </h1>
                  <JobStatusBadge status={job.status} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Posted on {new Date(job.created_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Apply / Status CTA (Only rendered for Candidates) */}
              {!isRecruiter && (
                <div>
                  {existingApplication ? (
                    <div className="flex flex-col sm:items-end gap-2">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        Application Active: {existingApplication.stage}
                      </span>
                      <Link href={`/dashboard/applications/${existingApplication.id}`}>
                        <Button variant="outline" size="sm">
                          View Application →
                        </Button>
                      </Link>
                    </div>
                  ) : job.status === "OPEN" ? (
                    <Button
                      size="lg"
                      variant="primary"
                      onClick={handleApply}
                      isLoading={isApplying}
                    >
                      Apply for this Position
                    </Button>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Position Closed
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Success / Error Alerts for Candidate */}
            {!isRecruiter && successMessage && (
              <div className="my-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center justify-between">
                <span className="font-medium">{successMessage}</span>
                {existingApplication && (
                  <Link
                    href={`/dashboard/applications/${existingApplication.id}`}
                    className="text-xs font-semibold underline text-emerald-900 hover:text-emerald-950"
                  >
                    Track Application
                  </Link>
                )}
              </div>
            )}

            <ErrorMessage
              message={error}
              className="my-6"
              onDismiss={() => setError(null)}
            />

            {/* Job Description */}
            <div className="pt-6">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
                Job Description & Requirements
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed text-sm">
                {job.description}
              </div>
            </div>
          </div>

          {/* Candidate Application Guidelines (Only shown to candidate) */}
          {!isRecruiter && (
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Semesteria Hiring Policy
              </h3>
              <p>
                Candidates can submit one application per position. Applications submitted to closed positions will be rejected. You can track all your submissions under the My Applications tab.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </PageContainer>
  );
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  return (
    <AuthGuard allowedRoles={["candidate", "recruiter"]}>
      <Suspense fallback={<Loading message="Loading position..." />}>
        <JobDetailContent params={params} />
      </Suspense>
    </AuthGuard>
  );
}
