"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageContainer } from "@/components/layout/PageContainer";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { Loading } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Button } from "@/components/ui/Button";
import { getMyApplications, getStoredUser } from "@/lib/api";
import { Application, ApplicationStage } from "@/types";

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load your applications.");
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
    loadApplications();
  }, [loadApplications, router]);

  const filteredApplications = applications.filter((app) => {
    if (stageFilter === "ALL") return true;
    return app.stage === stageFilter;
  });

  const stagesList: { label: string; value: string }[] = [
    { label: "All Stages", value: "ALL" },
    { label: "Applied", value: "APPLIED" },
    { label: "Shortlisted", value: "SHORTLISTED" },
    { label: "Interviewed", value: "INTERVIEWED" },
    { label: "Hired", value: "HIRED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Withdrawn", value: "WITHDRAWN" },
  ];

  return (
    <AuthGuard allowedRoles={["candidate"]}>
      <PageContainer
        title="My Applications"
        description="Track the real-time stage, version history, and details of all your submissions."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/dashboard/jobs">
              <Button variant="primary">Browse More Jobs</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={loadApplications}>
              Refresh
            </Button>
          </div>
        }
      >
        <ErrorMessage
          message={error}
          className="mb-6"
          onDismiss={() => setError(null)}
        />

        {/* Stage Filter Buttons */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
          {stagesList.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStageFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                stageFilter === tab.value
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">
                (
                {tab.value === "ALL"
                  ? applications.length
                  : applications.filter((a) => a.stage === (tab.value as ApplicationStage)).length}
                )
              </span>
            </button>
          ))}
        </div>

        {/* Applications List */}
        {isLoading ? (
          <Loading message="Loading your applications..." />
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <svg
              className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              No applications found
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {stageFilter !== "ALL"
                ? `You have no applications in "${stageFilter}" stage.`
                : "You have not submitted any job applications yet."}
            </p>
            <div className="mt-6">
              <Link href="/dashboard">
                <Button variant="primary">Explore Open Positions</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                baseDetailUrl="/dashboard/applications"
              />
            ))}
          </div>
        )}
      </PageContainer>
    </AuthGuard>
  );
}
