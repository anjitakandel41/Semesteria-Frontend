import { ApplicationStage } from "./application";

export interface ApiErrorResponse {
  detail?: string;
  [key: string]: unknown;
}

export interface RecruiterApplicationFilter {
  job_id?: number | string;
  stage?: ApplicationStage | string;
}
