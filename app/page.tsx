import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <PageContainer>
      <div className="py-12 md:py-20 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          Semesteria Hiring Dashboard
        </h1>

        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          A secure, concurrent, and role-driven hiring management platform. Explore
          available engineering roles or manage candidate application lifecycles in real time.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Sign In to Portal
            </Button>
          </Link>
        </div>

        {/* Two Role Feature Preview Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="p-7 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-800 transition-all">
            <div className="h-11 w-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-400 font-black mb-5 text-base">
              C
            </div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Candidate Experience
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Browse open job postings, apply to available positions, track your application stages in real-time, and withdraw active applications when permitted.
            </p>
          </div>

          <div className="p-7 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-800 transition-all">
            <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white font-black mb-5 text-base">
              R
            </div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Recruiter Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Review applications for assigned jobs, filter by stage and position, transition candidate stages with optimistic concurrency control, and audit application timeline history.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
