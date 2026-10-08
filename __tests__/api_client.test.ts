import { describe, it, expect } from "vitest";
import { extractErrorMessage, ApiClientError } from "@/lib/api/client";

describe("API Client Error Extraction & Normalization", () => {
  it("normalizes 401 Unauthorized errors", () => {
    const msg = extractErrorMessage({ detail: "Invalid token" }, 401);
    expect(msg).toBe("Your session has expired. Please login again.");
  });

  it("normalizes 403 Forbidden errors", () => {
    const msg = extractErrorMessage(
      { detail: "You do not have permission to access this application." },
      403
    );
    expect(msg).toBe("You do not have permission to access this application.");
  });

  it("normalizes 404 Not Found errors", () => {
    const msg = extractErrorMessage({ detail: "Application not found." }, 404);
    expect(msg).toBe("Application not found.");
  });

  it("normalizes 409 Conflict errors (Optimistic Locking)", () => {
    const msg = extractErrorMessage(
      { detail: "Application was updated by another user. Please refresh and try again." },
      409
    );
    expect(msg).toBe("Application was updated by another user. Please refresh and try again.");
  });

  it("normalizes 500 Internal Server errors", () => {
    const msg = extractErrorMessage({ error: "DB crash" }, 500);
    expect(msg).toBe("Something went wrong on the server. Please try again.");
  });

  it("formats Django field validation errors", () => {
    const msg = extractErrorMessage(
      {
        username: ["This field is required."],
        password: ["Password must be at least 8 characters."],
      },
      400
    );
    expect(msg).toContain("username: This field is required.");
    expect(msg).toContain("password: Password must be at least 8 characters.");
  });

  it("creates ApiClientError with status code and data", () => {
    const err = new ApiClientError("Custom error", 400, { detail: "Custom" });
    expect(err.name).toBe("ApiClientError");
    expect(err.status).toBe(400);
    expect(err.message).toBe("Custom error");
    expect(err.data).toEqual({ detail: "Custom" });
  });
});

describe("JWT Decoding and Role Assignment", () => {
  const makeToken = (payload: object) => {
    const b64Header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const b64Payload = btoa(JSON.stringify(payload));
    return `${b64Header}.${b64Payload}.mockSignature`;
  };

  it("assigns recruiter role to admin username and recruiter users", async () => {
    const { saveAuthSession } = await import("@/lib/api/auth");
    
    // admin user
    const adminToken = makeToken({ user_id: 1, username: "admin", role: "candidate" });
    const adminUser = saveAuthSession({ access: adminToken, refresh: "mock" });
    expect(adminUser.role).toBe("recruiter");

    // recruiter user
    const recruiterToken = makeToken({ user_id: 2, username: "recruiter1", role: "recruiter" });
    const recruiterUser = saveAuthSession({ access: recruiterToken, refresh: "mock" });
    expect(recruiterUser.role).toBe("recruiter");

    // candidate user
    const candidateToken = makeToken({ user_id: 3, username: "candidate1", role: "candidate" });
    const candidateUser = saveAuthSession({ access: candidateToken, refresh: "mock" });
    expect(candidateUser.role).toBe("candidate");
  });
});
