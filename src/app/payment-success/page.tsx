"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { capturePaypalOrder } from "@/lib/api";

import { HomeResultsPDF } from "@/components/pdf/pdf-templates";
import { CheckCircle2, Download, Loader2, AlertCircle, Home } from "lucide-react";
import { toast } from "react-hot-toast";

type PaymentState = "verifying" | "downloading" | "success" | "error";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<PaymentState>("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [gamesData, setGamesData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const captureStarted = useRef(false);

  // Programmatic PDF download
  const triggerPdfDownload = async (games: any[], name: string) => {
    try {
      setStatus("downloading");
      const { pdf } = await import("@react-pdf/renderer");
      const doc = <HomeResultsPDF games={games} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name || "Forensic_Analysis_Report.pdf";
      link.click();
      URL.revokeObjectURL(url);
      
      setStatus("success");
      toast.success("Forensic report downloaded successfully!");
    } catch (err) {
      console.error("PDF programmatic download error:", err);
      // Still show success panel, but notify user they can trigger manually
      setStatus("success");
      toast.error("Automatic download was blocked, please click 'Download Again' below.");
    }
  };

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing payment reference. Please return to the dashboard and try again.");
      return;
    }

    if (captureStarted.current) return;
    captureStarted.current = true;

    // Secure Single-Window check
    const pendingSession = sessionStorage.getItem(`pdf_pending_${token}`);
    
    if (!pendingSession) {
      setStatus("error");
      setErrorMessage("This download session has expired or is invalid. To ensure report security, PDF downloads are restricted to a single active window session.");
      return;
    }

    // Immediately remove key to prevent reuse/refresh downloads
    sessionStorage.removeItem(`pdf_pending_${token}`);

    const context = JSON.parse(pendingSession);
    const games = context.games || [];
    const name = context.fileName || "Forensic_Analysis_Report.pdf";
    
    setGamesData(games);
    setFileName(name);

    const performCapture = async () => {
      try {
        const res = await capturePaypalOrder(token);
        if (res.success) {
          // Trigger the automatic download
          await triggerPdfDownload(games, name);
        } else {
          throw new Error("Unable to capture the PayPal transaction.");
        }
      } catch (err: any) {
        console.error("Payment capture error:", err);
        setStatus("error");
        setErrorMessage(err.message || "Something went wrong while capturing your payment.");
      }
    };

    performCapture();
  }, [token]);

  const handleDownloadAgain = async () => {
    const toastId = toast.loading("Generating report...");
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const doc = <HomeResultsPDF games={gamesData} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "Forensic_Analysis_Report.pdf";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Forensic report downloaded!", { id: toastId });
    } catch (err) {
      console.error("Manual PDF download error:", err);
      toast.error("Failed to generate report. Please try again.", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500">
        
        {/* Top Accent bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500" />
        
        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
          
          {/* Status Icon & Header */}
          {status === "verifying" && (
            <div className="space-y-6 py-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center shadow-inner relative">
                <Loader2 className="w-10 h-10 animate-spin text-slate-800" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verifying Payment</h2>
                <p className="text-slate-400 text-sm mt-2 font-medium max-w-xs leading-relaxed">
                  Securing your transaction with PayPal. Please do not close or reload this window.
                </p>
              </div>
            </div>
          )}

          {status === "downloading" && (
            <div className="space-y-6 py-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-teal-50/50 border border-teal-100 rounded-3xl flex items-center justify-center shadow-inner relative">
                <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight text-teal-600">Generating PDF</h2>
                <p className="text-slate-400 text-sm mt-2 font-medium max-w-xs leading-relaxed">
                  Your premium Chess Forensic Analysis Report is generating. Your download will start momentarily.
                </p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6 py-4 flex flex-col items-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Complete</h2>
                <p className="text-slate-500 text-sm mt-2 font-medium max-w-xs leading-relaxed">
                  Your forensic report has been compiled and downloaded automatically.
                </p>
              </div>

              <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left mt-2">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] block mb-1">
                  Purchased Document
                </span>
                <span className="text-xs font-bold text-slate-700 block truncate">
                  {fileName}
                </span>
              </div>

              <div className="grid grid-cols-1 w-full gap-3 mt-6">
                <Button
                  onClick={handleDownloadAgain}
                  className="h-12 bg-black hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md group"
                >
                  <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  Download Again
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin-panel")}
                  className="h-12 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95"
                >
                  <Home className="w-4 h-4" />
                  Go Back Home
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6 py-4 flex flex-col items-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center border border-rose-100 shadow-inner">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Something went wrong</h2>
                <p className="text-slate-400 text-sm mt-3 font-medium max-w-xs leading-relaxed">
                  {errorMessage || "We are unable to fulfill your PDF download request."}
                </p>
              </div>

              <div className="w-full mt-6">
                <Button
                  onClick={() => router.push("/admin-panel")}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95"
                >
                  <Home className="w-4 h-4" />
                  Go Back Home
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
