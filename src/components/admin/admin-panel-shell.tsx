// components/admin/admin-panel-shell.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";

export function AdminPanelShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="w-64 p-4">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
        <div className="flex-1 p-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50/30 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}