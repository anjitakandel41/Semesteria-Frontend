"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );

  // Sync user state from localStorage on client side
  useEffect(() => {
    const syncAuth = () => {
      try {
        const storedUser = localStorage.getItem("semesteria_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-change", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-change", syncAuth);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("semesteria_access_token");
    localStorage.removeItem("semesteria_refresh_token");
    localStorage.removeItem("semesteria_user");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/login");
  };

  const isLinkActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs dark:border-slate-800/80 dark:bg-slate-950/95 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-lg font-bold text-slate-900 hover:text-sky-600 transition-colors dark:text-white dark:hover:text-sky-400"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white font-black text-sm shadow-sm shadow-sky-500/30">
                S
              </div>
              <span className="tracking-tight">Semesteria Hiring</span>
            </Link>

            {/* Navigation links based on role */}
            <nav className="hidden md:flex items-center gap-1.5">
              {user?.role === "candidate" && (
                <>
                  <Link
                    href="/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isLinkActive("/dashboard") && !pathname.startsWith("/dashboard/applications")
                        ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/70 dark:border-sky-900/60"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
                    }`}
                  >
                    Open Jobs
                  </Link>
                  <Link
                    href="/dashboard/applications"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isLinkActive("/dashboard/applications")
                        ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/70 dark:border-sky-900/60"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
                    }`}
                  >
                    My Applications
                  </Link>
                </>
              )}

              {user?.role === "recruiter" && (
                <Link
                  href="/recruiter"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isLinkActive("/recruiter")
                      ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/70 dark:border-sky-900/60"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  }`}
                >
                  Recruiter Portal
                </Link>
              )}
            </nav>
          </div>

          {/* Right actions / Auth state & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {user.username}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      user.role === "recruiter" || user.username?.toLowerCase() === "admin"
                        ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                        : "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                    }`}
                  >
                    {user.username?.toLowerCase() === "admin" ? "ADMIN" : user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg hover:bg-rose-50 hover:border-rose-200 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-lg shadow-sm shadow-sky-500/20 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
