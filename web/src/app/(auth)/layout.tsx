"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && isAuthenticated) router.replace("/dashboard"); }, [loading, isAuthenticated, router]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
