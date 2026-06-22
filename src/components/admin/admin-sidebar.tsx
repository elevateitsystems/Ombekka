// src/components/admin/admin-sidebar.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Database, FileText, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: "EULA Manager",
    href: "/admin/eula",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: "Data Import",
    href: "/admin/import",
    icon: <Database className="w-5 h-5" />,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline shrink-0 flex-col"
        >
          <Image
            src="/logo_2.webp"
            className="w-7 h-auto"
            alt="Logo"
            width={100}
            height={10}
          />
          <span className="mt-0.5 font-bold text-[1.2rem] text-slate-900 uppercase tracking-tight whitespace-nowrap hidden sm:inline">
            Pawnder Info
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0",
                  isActive ? "text-blue-600" : "text-slate-400",
                )}
              >
                {item.icon}
              </span>
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-900">
              {user?.name || "Admin User"}
            </p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
