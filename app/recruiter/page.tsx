"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageContainer } from "@/components/layout/PageContainer";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { getJobs, getRecruiterApplications, getStoredUser } from "@/lib/api";
import { Application, Job, User, ApplicationStage } from "@/types";

export default function RecruiterDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [jobsData, appsData] = await Promise.all([
        getJobs(),
        getRecruiterApplications({
          job_id: selectedJobId ? Number(selectedJobId) : undefined,
          stage: selectedStage ? (selectedStage as ApplicationStage) : undefined,
        }),
      ]);
      setJobs(jobsData);
      setApplications(appsData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load recruiter applications.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedJobId, selectedStage]);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetFilters = () => {
    setSelectedJobId("");
    setSelectedStage("");
  };

  const jobOptions = [
    { label: "All Assigned Jobs", value: "" },
    ...jobs.map((j) => ({
      label: `${j.title} (${j.status})`,
      value: String(j.id),
    })),
  ];

  const stageOptions = [
    { label: "All Stages", value: "" },
    { label: "Applied", value: "APPLIED" },
    { label: "Shortlisted", value: "SHORTLISTED" },
    { label: "Interviewed", value: "INTERVIEWED" },
    { label: "Hired", value: "HIRED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Withdrawn", value: "WITHDRAWN" },
  ];

  return (
    <AuthGuard allowedRoles={["recruiter"]}>
      <PageContainer
        title={`Recruiter Portal - ${user?.username || "Recruiter"}`}
        description="Review candidate applications assigned to your positions, filter pipelines, and transition candidate stages."
        actions={
          <Button variant="ghost" size="sm" onClick={loadData}>
            Refresh Applications
          </Button>
        }
      >
        <ErrorMessage
          message={error}
          className="mb-6"
          onDismiss={() => setError(null)}
        />

        {/* Recruiter Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Assigned Applications
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {applications.length}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Initial Review
            </div>
            <div className="mt-2 text-3xl font-extrabold text-sky-600 dark:text-sky-400">
              {applications.filter((a) => a.stage === "APPLIED").length}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              In Interview Funnel
            </div>
            <div className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {applications.filter((a) => ["SHORTLISTED", "INTERVIEWED"].includes(a.stage)).length}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Hired
            </div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {applications.filter((a) => a.stage === "HIRED").length}
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <Select
                label="Filter by Job"
                options={jobOptions}
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <Select
                label="Filter by Stage"
                options={stageOptions}
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
              />
            </div>

            {(selectedJobId || selectedStage) && (
              <div className="sm:self-end">
                <Button variant="ghost" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recruiter Applications List */}
        {isLoading ? (
          <Loading message="Filtering recruiter applications..." />
        ) : applications.length === 0 ? (
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
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              No matching applications found
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {selectedJobId || selectedStage
                ? "Try adjusting or clearing your filters to see more applications."
                : "There are currently no applications submitted for your assigned positions."}
            </p>
            {(selectedJobId || selectedStage) && (
              <div className="mt-6">
                <Button variant="outline" onClick={handleResetFilters}>
                  Clear Active Filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                baseDetailUrl="/recruiter/applications"
                showCandidateName={true}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </AuthGuard>
  );
}
