export type JobStatus = "OPEN" | "CLOSED";

export interface Job {
  id: number;
  title: string;
  description: string;
  status: JobStatus;
  assigned_recruiter: number;
  created_at: string;
  updated_at: string;
}
