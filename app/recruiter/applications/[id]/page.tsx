"use client";

import React, { useEffect, useState, useCallback, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageContainer } from "@/components/layout/PageContainer";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { ApplicationHistory } from "@/components/applications/ApplicationHistory";
import { StageSelector } from "@/components/applications/StageSelector";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  getApplicationById,
  getApplicationHistory,
  getJobById,
  updateApplicationStage,
} from "@/lib/api";
import {
  Application,
  ApplicationHistoryItem,
  ApplicationStage,
  Job,
} from "@/types";

interface RecruiterApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

function RecruiterApplicationDetailContent({
  params,
}: RecruiterApplicationDetailPageProps) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [history, setHistory] = useState<ApplicationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConflictError(null);
    try {
      const appData = await getApplicationById(applicationId);
      setApplication(appData);

      const [jobData, historyData] = await Promise.all([
        getJobById(appData.job).catch(() => null),
        getApplicationHistory(applicationId).catch(() => []),
      ]);

      setJob(jobData);
      setHistory(historyData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load application details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStage = async (newStage: ApplicationStage) => {
    if (!application) return;
    setIsUpdatingStage(true);
    setError(null);
    setConflictError(null);
    setSuccessMessage(null);

    try {
      // Optimistic concurrency: sends expected version along with new stage
      const updatedApp = await updateApplicationStage(
        application.id,
        newStage,
        application.version
      );

      setApplication(updatedApp);
      setSuccessMessage(
        `Application stage updated to ${newStage} successfully (new version v${updatedApp.version}).`
      );

      // Reload timeline history
      const historyData = await getApplicationHistory(application.id);
      setHistory(historyData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const isConflict =
          ("status" in err && (err as { status: number }).status === 409) ||
          err.message.toLowerCase().includes("conflict") ||
          err.message.toLowerCase().includes("another user");

        if (isConflict) {
          setConflictError(
            "This application was updated by another recruiter. Your change was not applied. Please refresh the application and review the latest stage."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to update application stage.");
      }
    } finally {
      setIsUpdatingStage(false);
    }
  };

  return (
    <PageContainer
      actions={
        <div className="flex items-center gap-2">
          <Link href="/recruiter">
            <Button variant="outline">Back to Recruiter Portal</Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={loadData}>
            Refresh Application
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <Loading message="Loading candidate application..." />
      ) : error && !application ? (
        <div className="py-8">
          <ErrorMessage message={error} />
          <div className="mt-4">
            <Button onClick={() => router.push("/recruiter")}>
              Return to Portal
            </Button>
          </div>
        </div>
      ) : application ? (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Alert */}
          {successMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center justify-between">
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

          {/* Standard Error Alert */}
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
          />

          {/* Concurrency 409 Conflict Banner */}
          {conflictError && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40 p-6 shadow-xs">
              <div className="flex items-start gap-3">
                <svg className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    409 Conflict: Concurrent Modification Detected
                  </h3>
                  <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    {conflictError}
                  </p>
                  <div className="mt-3">
                    <Button variant="primary" size="sm" onClick={loadData}>
                      Refresh Latest Application State
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Application Header Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {application.job_title}
                  </h1>
                  <ApplicationStatusBadge stage={application.stage} />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Candidate: <span className="font-bold text-slate-900 dark:text-white">{application.candidate}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  Concurrency Version: v{application.version}
                </span>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Application ID</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  #{application.id}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Submitted Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(application.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Last Transition</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(application.updated_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Position Status</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {job ? `${job.status}` : "Loading..."}
                </span>
              </div>
            </div>

            {/* Stage Selector Action Block */}
            <div className="pt-6">
              <StageSelector
                currentStage={application.stage}
                currentVersion={application.version}
                onUpdateStage={handleUpdateStage}
                isLoading={isUpdatingStage}
              />
            </div>
          </div>

          {/* Timeline Audit History Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Candidate Transition Timeline History
            </h2>
            <ApplicationHistory history={history} />
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

export default function RecruiterApplicationDetailPage({
  params,
}: RecruiterApplicationDetailPageProps) {
  return (
    <AuthGuard allowedRoles={["recruiter"]}>
      <Suspense fallback={<Loading message="Loading candidate application..." />}>
        <RecruiterApplicationDetailContent params={params} />
      </Suspense>
    </AuthGuard>
  );
}
