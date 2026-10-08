"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const validate = () => {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = "Username is required.";
    }
    if (!password) {
      errors.password = "Password is required.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const { user } = await login({
        username: username.trim(),
        password,
      });

      // Role-based redirection
      if (user.role === "candidate") {
        router.push("/dashboard");
      } else if (user.role === "recruiter") {
        router.push("/recruiter");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
    setFieldErrors({});
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign In
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Enter your credentials to access your dashboard
        </p>
      </div>

      <ErrorMessage
        message={errorMessage}
        className="mb-5"
        onDismiss={() => setErrorMessage(null)}
      />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Username"
          type="text"
          id="username"
          autoComplete="username"
          placeholder="e.g. candidate1 or recruiter1"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (fieldErrors.username) {
              setFieldErrors((prev) => ({ ...prev, username: undefined }));
            }
          }}
          error={fieldErrors.username}
          required
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          error={fieldErrors.password}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                // Eye with slash (Hide)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                // Eye open (Show)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          }
        />

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      {/* Quick Demo Test Accounts for Review / Assessment */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-left">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Demo Test Accounts (Click to Autofill):
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickFill("candidate1", "Candidate@123")}
            className="p-2.5 text-left rounded-xl bg-sky-50 text-sky-950 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-200 border border-sky-200/70 dark:border-sky-800/60 transition-colors cursor-pointer"
          >
            <div className="font-semibold text-sky-800 dark:text-sky-300">Candidate 1</div>
            <div className="text-[10px] text-sky-600 dark:text-sky-400 font-mono mt-0.5">candidate1</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill("recruiter1", "Recruiter@123")}
            className="p-2.5 text-left rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <div className="font-semibold text-slate-800 dark:text-slate-200">Recruiter 1</div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">recruiter1</div>
          </button>
        </div>
      </div>
    </div>
  );
}
