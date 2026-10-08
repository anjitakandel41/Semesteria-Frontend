import React, { useState, useEffect } from "react";
import { ApplicationStage, VALID_STAGE_TRANSITIONS, TERMINAL_STAGES } from "@/types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface StageSelectorProps {
  currentStage: ApplicationStage;
  currentVersion: number;
  onUpdateStage: (newStage: ApplicationStage) => Promise<void>;
  isLoading?: boolean;
}

const ALL_STAGES: ApplicationStage[] = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEWED",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
];

export function StageSelector({
  currentStage,
  currentVersion,
  onUpdateStage,
  isLoading = false,
}: StageSelectorProps) {
  const isTerminal = TERMINAL_STAGES.includes(currentStage);
  const allowedTransitions = VALID_STAGE_TRANSITIONS[currentStage] || [];

  const [selectedStage, setSelectedStage] = useState<ApplicationStage | "">("");
  const [showAllStagesForTesting, setShowAllStagesForTesting] = useState(false);

  useEffect(() => {
    if (allowedTransitions.length > 0) {
      setSelectedStage(allowedTransitions[0]);
    } else {
      setSelectedStage("");
    }
  }, [currentStage, allowedTransitions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStage || selectedStage === currentStage) return;
    await onUpdateStage(selectedStage as ApplicationStage);
  };

  const stageDisplayNames: Record<ApplicationStage, string> = {
    APPLIED: "Applied",
    SHORTLISTED: "Shortlisted",
    INTERVIEWED: "Interviewed",
    HIRED: "Hired (Terminal)",
    REJECTED: "Rejected (Terminal)",
    WITHDRAWN: "Withdrawn (Terminal)",
  };

  if (isTerminal && !showAllStagesForTesting) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-semibold">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            <span>Terminal Stage Reached ({currentStage})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllStagesForTesting(true)}
            className="text-[11px] text-sky-600 hover:text-sky-700 dark:text-sky-400 underline cursor-pointer"
          >
            Test Invalid Transition
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          This application is in the <span className="font-bold text-slate-800 dark:text-slate-200">{currentStage}</span> stage. Terminal stages cannot be transitioned.
        </p>
      </div>
    );
  }

  const activeOptionsList = showAllStagesForTesting ? ALL_STAGES : allowedTransitions;

  const selectOptions = [
    { label: "-- Select Target Stage --", value: "" },
    ...activeOptionsList.map((stg) => ({
      label: `${stageDisplayNames[stg] || stg} ${
        !allowedTransitions.includes(stg) && showAllStagesForTesting ? "⚠️ (Invalid)" : ""
      }`,
      value: stg,
    })),
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Update Candidate Stage
        </h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAllStagesForTesting((prev) => !prev)}
            className="text-[11px] text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 underline cursor-pointer"
          >
            {showAllStagesForTesting ? "Show Only Valid Stages" : "Test Invalid Transition"}
          </button>
          <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            Expected: v{currentVersion}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <Select
            label="Target Stage"
            options={selectOptions}
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as ApplicationStage)}
            disabled={isLoading}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={!selectedStage || selectedStage === currentStage || isLoading}
          isLoading={isLoading}
          className="sm:w-auto"
        >
          Update Stage
        </Button>
      </div>

      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>
          Allowed transitions from <strong className="text-slate-700 dark:text-slate-300">{currentStage}</strong>:{" "}
          {allowedTransitions.length > 0 ? allowedTransitions.join(", ") : "None (Terminal Stage)"}
        </span>
        {showAllStagesForTesting && (
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            Test mode enabled
          </span>
        )}
      </div>
    </form>
  );
}
