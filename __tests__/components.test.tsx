import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JobCard } from "@/components/jobs/JobCard";
import { StageSelector } from "@/components/applications/StageSelector";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Modal } from "@/components/ui/Modal";
import { Job } from "@/types";

describe("Frontend Component Integration Tests", () => {
  const mockOpenJob: Job = {
    id: 1,
    title: "Senior Backend Engineer",
    description: "Django REST and PostgreSQL assessment role.",
    status: "OPEN",
    assigned_recruiter: 2,
    created_at: "2026-10-07T10:00:00Z",
    updated_at: "2026-10-07T10:00:00Z",
  };

  const mockClosedJob: Job = {
    id: 2,
    title: "Closed Frontend Role",
    description: "No longer taking applications.",
    status: "CLOSED",
    assigned_recruiter: 2,
    created_at: "2026-10-07T10:00:00Z",
    updated_at: "2026-10-07T10:00:00Z",
  };

  describe("JobCard Component", () => {
    it("renders open job with enabled Apply button when candidate has not applied", () => {
      const handleApply = vi.fn();
      render(<JobCard job={mockOpenJob} isApplied={false} onApply={handleApply} />);

      expect(screen.getByText("Senior Backend Engineer")).toBeDefined();
      expect(screen.getByText("OPEN")).toBeDefined();
      const applyBtn = screen.getByRole("button", { name: "Apply" });
      expect(applyBtn).toBeDefined();

      fireEvent.click(applyBtn);
      expect(handleApply).toHaveBeenCalledWith(1);
    });

    it("displays '✓ Applied' badge and hides Apply button when candidate already applied", () => {
      render(<JobCard job={mockOpenJob} isApplied={true} />);
      expect(screen.getByText("✓ Applied")).toBeDefined();
      expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
    });

    it("displays 'Closed' text and disables application for closed jobs", () => {
      render(<JobCard job={mockClosedJob} isApplied={false} />);
      expect(screen.getByText("CLOSED")).toBeDefined();
      expect(screen.getByText("Closed")).toBeDefined();
      expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
    });

    it("hides Apply button and shows only View Details when showApply is false (admin / recruiter view)", () => {
      render(<JobCard job={mockOpenJob} showApply={false} />);
      expect(screen.getByText("Senior Backend Engineer")).toBeDefined();
      expect(screen.getByRole("button", { name: "View Details" })).toBeDefined();
      expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
      expect(screen.queryByText("✓ Applied")).toBeNull();
      expect(screen.queryByText("Closed")).toBeNull();
    });
  });

  describe("StageSelector Component", () => {
    it("renders valid transitions and expected concurrency version", () => {
      const handleUpdate = vi.fn();
      render(
        <StageSelector
          currentStage="APPLIED"
          currentVersion={3}
          onUpdateStage={handleUpdate}
        />
      );

      expect(screen.getByText("Expected: v3")).toBeDefined();
      expect(screen.getByText(/Allowed transitions from/)).toBeDefined();
      expect(screen.getByRole("button", { name: "Update Stage" })).toBeDefined();
    });

    it("locks stage updates and renders terminal message for terminal stages", () => {
      render(
        <StageSelector
          currentStage="HIRED"
          currentVersion={5}
          onUpdateStage={vi.fn()}
        />
      );

      expect(screen.getByText(/Terminal Stage Reached/)).toBeDefined();
      expect(screen.queryByRole("button", { name: "Update Stage" })).toBeNull();
    });
  });

  describe("ApplicationStatusBadge Component", () => {
    it("renders correct stage labels and styles", () => {
      render(<ApplicationStatusBadge stage="SHORTLISTED" />);
      expect(screen.getByText("SHORTLISTED")).toBeDefined();
    });
  });

  describe("ErrorMessage Component", () => {
    it("renders error message and handles dismiss", () => {
      const handleDismiss = vi.fn();
      render(
        <ErrorMessage
          message="Invalid stage transition from APPLIED to HIRED."
          onDismiss={handleDismiss}
        />
      );

      expect(
        screen.getByText("Invalid stage transition from APPLIED to HIRED.")
      ).toBeDefined();

      const dismissBtn = screen.getByLabelText("Dismiss error");
      fireEvent.click(dismissBtn);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("Modal Component", () => {
    it("renders confirmation modal when open and handles confirm action", () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();

      render(
        <Modal
          isOpen={true}
          title="Withdraw Application"
          description="Are you sure you want to withdraw?"
          confirmText="Yes, Withdraw"
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      );

      expect(screen.getByText("Withdraw Application")).toBeDefined();
      expect(screen.getByText("Are you sure you want to withdraw?")).toBeDefined();

      const confirmBtn = screen.getByRole("button", { name: "Yes, Withdraw" });
      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it("does not render when isOpen is false", () => {
      render(
        <Modal
          isOpen={false}
          title="Hidden Modal"
          onClose={vi.fn()}
        />
      );

      expect(screen.queryByText("Hidden Modal")).toBeNull();
    });
  });
});
