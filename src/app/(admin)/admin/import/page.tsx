// app/admin/import/page.tsx
import { DataImportWizard } from "@/components/admin/data-import-wizard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Import | Admin Panel",
  description: "Import chess data from CSV files",
};

export default function DataImportPage() {
  return (
    <div className="p-6">
      <DataImportWizard />
    </div>
  );
}