// src/app/(admin)/layout.tsx
"use client";

import { AdminPanelShell } from "@/components/admin/admin-panel-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPanelShell>{children}</AdminPanelShell>;
}