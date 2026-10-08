"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, getStoredAccessToken } from "@/lib/api";
import { User, UserRole } from "@/types";
import { Loading } from "@/components/ui/Loading";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = getStoredAccessToken();
    const storedUser = getStoredUser();

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    setUser(storedUser);

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(storedUser.role)) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }
    }

    setIsAuthorized(true);
    setIsChecking(false);
  }, [allowedRoles, router]);

  if (isChecking) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <Loading message="Verifying authentication session..." />
      </PageContainer>
    );
  }

  if (!isAuthorized) {
    return (
      <PageContainer className="max-w-xl text-center py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 p-8 shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 mb-4">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Access Restricted
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Your current account ({user?.role}) does not have permission to view this section.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                if (user?.role === "candidate") {
                  router.push("/dashboard");
                } else if (user?.role === "recruiter") {
                  router.push("/recruiter");
                } else {
                  router.push("/login");
                }
              }}
            >
              Go to Your Dashboard
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return <>{children}</>;
}
