import { apiClient } from "./client";
import { Job } from "@/types";

/**
 * Fetches the list of jobs from Django API.
 * - Candidates receive only OPEN jobs.
 * - Recruiters receive all jobs.
 */
export async function getJobs(): Promise<Job[]> {
  return apiClient.get<Job[]>("/jobs/");
}

/**
 * Fetches a single job by ID.
 */
export async function getJobById(id: number | string): Promise<Job> {
  const jobs = await getJobs();
  const job = jobs.find((j) => String(j.id) === String(id));
  if (!job) {
    throw new Error("Job not found.");
  }
  return job;
}
