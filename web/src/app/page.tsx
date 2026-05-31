"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, loading, router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-100">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
