import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Pawnder Info",
  description: "Administrative management for Pawnder Info.",
};

export default function AdminPanelPage() {
  return (
    <main className="min-h-screen bg-slate-50/30">
      <AdminPanelShell />
    </main>
  );
}
