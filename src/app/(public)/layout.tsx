// src/app/(public)/layout.tsx
import Navbar from "@/components/navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="print:hidden">
        <div className="min-h-full">{children}</div>
      </main>
    </>
  );
}