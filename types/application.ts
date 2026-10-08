export type ApplicationStage =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEWED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export interface Application {
  id: number;
  candidate: string; // Candidate username
  job: number; // Job ID
  job_title: string;
  stage: ApplicationStage;
  version: number; // Concurrency version
  created_at: string;
  updated_at: string;
}

export interface ApplicationHistoryItem {
  id: number;
  application: number;
  actor: string; // Actor username
  timestamp: string;
  previous_stage: ApplicationStage;
  new_stage: ApplicationStage;
}

export interface CreateApplicationPayload {
  job_id: number;
}

export interface UpdateStagePayload {
  stage: ApplicationStage;
  version: number;
}

// Business rule transition constants
export const WITHDRAWABLE_STAGES: readonly ApplicationStage[] = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEWED",
];

export const TERMINAL_STAGES: readonly ApplicationStage[] = [
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
];

export const VALID_STAGE_TRANSITIONS: Record<
  ApplicationStage,
  readonly ApplicationStage[]
> = {
  APPLIED: ["SHORTLISTED", "REJECTED", "WITHDRAWN"],
  SHORTLISTED: ["INTERVIEWED", "REJECTED", "WITHDRAWN"],
  INTERVIEWED: ["HIRED", "REJECTED", "WITHDRAWN"],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};
