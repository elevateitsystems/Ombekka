"use client";
import Link from "next/link";
import PlayerSearch from "./player-search";
import Image from "next/image";
import { Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="border-b-2 border-b-[#0071bc] bg-white sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline shrink-0"
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

        <div className="flex-1 max-w-[400px] mx-4">
          <Suspense
            fallback={
              <div className="h-9 w-full bg-slate-100 animate-pulse rounded-md" />
            }
          >
            <PlayerSearch compact placeholder="Search players..." />
          </Suspense>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <Link 
                  href="/" 
                  className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin-panel" 
                  className="text-sm font-bold text-slate-500 hover:text-[#0071bc] transition-colors"
                >
                  Admin Panel
                </Link>
              </div>

              <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                  {user?
                    <UserIcon className="w-4 h-4 text-slate-400" />:''
                  }
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden md:inline">
                  {user.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-bold text-slate-600"
                >
                  Log In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
