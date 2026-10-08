import { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In - Semesteria Hiring",
  description: "Sign in to access your Semesteria recruitment portal.",
};

export default function LoginPage() {
  return (
    <PageContainer className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <LoginForm />
    </PageContainer>
  );
}
