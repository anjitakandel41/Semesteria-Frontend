import { apiClient } from "./client";
import {
  Application,
  ApplicationHistoryItem,
  ApplicationStage,
  RecruiterApplicationFilter,
} from "@/types";

/**
 * Fetches the logged-in candidate's applications.
 */
export async function getMyApplications(): Promise<Application[]> {
  return apiClient.get<Application[]>("/applications/my/");
}

/**
 * Fetches a single application by ID (Candidate owner or assigned Recruiter).
 */
export async function getApplicationById(
  id: number | string
): Promise<Application> {
  return apiClient.get<Application>(`/applications/${id}/`);
}

/**
 * Submits a new job application for the current candidate.
 */
export async function createApplication(jobId: number): Promise<Application> {
  return apiClient.post<Application>("/applications/", {
    job_id: jobId,
  });
}

/**
 * Withdraws an application by ID (Candidate only).
 */
export async function withdrawApplication(
  id: number | string
): Promise<Application> {
  return apiClient.post<Application>(`/applications/${id}/withdraw/`, {});
}

/**
 * Fetches recruiter applications assigned to the logged-in recruiter,
 * optionally filtered by job_id and stage.
 */
export async function getRecruiterApplications(
  filter: RecruiterApplicationFilter = {}
): Promise<Application[]> {
  return apiClient.get<Application[]>("/recruiter/applications/", {
    params: {
      job_id: filter.job_id,
      stage: filter.stage,
    },
  });
}

/**
 * Updates application stage with optimistic concurrency check.
 * Sends both new stage and current expected version to the Django API.
 */
export async function updateApplicationStage(
  id: number | string,
  stage: ApplicationStage,
  version: number
): Promise<Application> {
  return apiClient.patch<Application>(`/applications/${id}/stage/`, {
    stage,
    version,
  });
}

/**
 * Fetches timeline audit history for an application.
 */
export async function getApplicationHistory(
  id: number | string
): Promise<ApplicationHistoryItem[]> {
  return apiClient.get<ApplicationHistoryItem[]>(
    `/applications/${id}/history/`
  );
}
