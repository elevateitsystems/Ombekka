// src/app/(admin)/eula/page.tsx
import { EulaViewer } from "@/components/dashboard/eula-viewer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EULA Manager | Admin Panel",
  description: "Manage End User License Agreement",
};

export default function EulaAdminPage() {
  return (
    <div className="p-6">
      <EulaViewer />
    </div>
  );
}