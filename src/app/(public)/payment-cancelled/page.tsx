"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

function PaymentCancelledContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 animate-in zoom-in-95 duration-500">
        
        {/* Top Accent bar */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-red-500" />
        
        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
          
          {/* Cancelled Icon */}
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center border border-rose-100 shadow-inner mb-6">
            <AlertTriangle className="w-10 h-10 text-rose-500 animate-pulse" />
          </div>

          {/* Title & Description */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Cancelled</h2>
            <p className="text-slate-400 text-sm mt-3 font-medium max-w-xs leading-relaxed">
              Your transaction was cancelled or interrupted. No charges were made, and your premium Chess Forensic Report was not generated.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 w-full gap-3 mt-8">
            <Button
              onClick={() => router.push("/admin-panel")}
              className="h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md"
            >
              <Home className="w-4 h-4" />
              Go Back Home
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-12 hover:bg-slate-50 text-slate-500 font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Try Again
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    }>
      <PaymentCancelledContent />
    </Suspense>
  );
}
