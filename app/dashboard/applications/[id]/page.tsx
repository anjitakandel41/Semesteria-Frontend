"use client";

import React, { useEffect, useState, useCallback, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageContainer } from "@/components/layout/PageContainer";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { ApplicationHistory } from "@/components/applications/ApplicationHistory";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Loading } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  getApplicationById,
  getApplicationHistory,
  getJobById,
  withdrawApplication,
} from "@/lib/api";
import {
  Application,
  ApplicationHistoryItem,
  Job,
  WITHDRAWABLE_STAGES,
} from "@/types";

interface CandidateApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

function ApplicationDetailContent({
  params,
}: CandidateApplicationDetailPageProps) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [history, setHistory] = useState<ApplicationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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

  const handleWithdraw = async () => {
    if (!application) return;
    setIsWithdrawing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedApp = await withdrawApplication(application.id);
      setApplication(updatedApp);
      setSuccessMessage("Application withdrawn successfully.");
      setIsModalOpen(false);
      // Reload timeline history
      const historyData = await getApplicationHistory(application.id);
      setHistory(historyData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to withdraw application.");
      }
      setIsModalOpen(false);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isWithdrawable =
    application && WITHDRAWABLE_STAGES.includes(application.stage);

  return (
    <PageContainer
      actions={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/applications">
            <Button variant="outline">Back to My Applications</Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={loadData}>
            Refresh
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <Loading message="Loading application details..." />
      ) : error && !application ? (
        <div className="py-8">
          <ErrorMessage message={error} />
          <div className="mt-4">
            <Button onClick={() => router.push("/dashboard/applications")}>
              Return to Applications
            </Button>
          </div>
        </div>
      ) : application ? (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success / Error Alerts */}
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

          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
          />

          {/* Main Application Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {application.job_title}
                  </h1>
                  <ApplicationStatusBadge stage={application.stage} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Application ID: #{application.id} • Candidate: {application.candidate}
                </p>
              </div>

              {/* Withdraw Button */}
              <div>
                {isWithdrawable ? (
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Withdraw Application
                  </Button>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Withdrawal Not Allowed ({application.stage})
                  </span>
                )}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Applied Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(application.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Last Updated</span>
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
                <span className="text-slate-400 block mb-1">Current Version</span>
                <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                  v{application.version}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Job Details</span>
                <Link
                  href={`/dashboard/jobs/${application.job}`}
                  className="font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 underline"
                >
                  View Job Posting →
                </Link>
              </div>
            </div>

            {/* Job Description Excerpt */}
            {job && (
              <div className="pt-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Position Overview
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                  {job.description}
                </p>
              </div>
            )}
          </div>

          {/* Timeline Audit History Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Application Timeline & Stage History
            </h2>
            <ApplicationHistory history={history} />
          </div>

          {/* Withdrawal Confirmation Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Withdraw Application"
            description="Are you sure you want to withdraw your application for this position?"
            confirmText="Yes, Withdraw"
            confirmVariant="danger"
            onConfirm={handleWithdraw}
            isLoading={isWithdrawing}
          >
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                Withdrawing is a <strong>permanent action</strong>. Your application status will become <span className="font-semibold text-slate-800 dark:text-slate-200">WITHDRAWN</span> and recruiters will be notified.
              </p>
            </div>
          </Modal>
        </div>
      ) : null}
    </PageContainer>
  );
}

export default function CandidateApplicationDetailPage({
  params,
}: CandidateApplicationDetailPageProps) {
  return (
    <AuthGuard allowedRoles={["candidate"]}>
      <Suspense fallback={<Loading message="Loading application details..." />}>
        <ApplicationDetailContent params={params} />
      </Suspense>
    </AuthGuard>
  );
}
