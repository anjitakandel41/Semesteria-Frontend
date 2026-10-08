import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Semesteria Hiring Dashboard",
  description: "Recruitment and Job Application Management Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('semesteria_theme');
                if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col font-sans`}
      >
        <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white dark:bg-slate-900" />}>
          <Navbar />
        </Suspense>
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
