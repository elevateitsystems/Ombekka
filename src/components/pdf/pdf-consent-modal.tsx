"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchEula } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CheckCircle2, Download, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

interface PDFConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfDocument: any;
  fileName: string;
}

export function PDFConsentModal({
  isOpen,
  onClose,
  title,
  pdfDocument,
  fileName,
}: PDFConsentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agreed, setAgreed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const base64ToBlob = (base64: string, type: string) => {
    const pureBase64 = base64.split(",")[1] || base64;
    const binStr = atob(pureBase64);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    return new Blob([arr], { type });
  };

  useEffect(() => {
    if (isOpen && !pdfUrl) {
      const loadEula = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        try {
          setLoadingPdf(true);
          const base64Data = await fetchEula(token);
          if (base64Data) {
            const blob = base64ToBlob(base64Data, "application/pdf");
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
          }
        } catch (error) {
          console.error("Error loading EULA for modal:", error);
        } finally {
          setLoadingPdf(false);
        }
      };
      loadEula();
    }
  }, [isOpen, pdfUrl]);

  // Clean up URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  // Reset modal state when closed
  const handleClose = () => {
    setStep(1);
    setAgreed(false);
    setShowPreview(false);
    onClose();
  };

  const simulatePayment = () => {
    setIsProcessingPayment(true);
    // Fake delay for realistic feel
    setTimeout(() => {
      setIsProcessingPayment(false);
      setStep(3);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className={cn(
          "bg-white rounded-lg shadow-lg border-none p-0 overflow-hidden flex flex-col transition-all duration-500 ease-in-out",
          showPreview
            ? "max-w-7xl min-w-[1000px] h-[90vh]"
            : "max-w-xl w-[90vw] h-auto",
        )}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
              {step === 1 ? (
                <ShieldAlert className="w-6 h-6 text-white" />
              ) : step === 2 ? (
                <Loader2 className="w-6 h-6 text-white animate-pulse" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            <div>
              <DialogTitle>
                <span className="text-white text-2xl font-bold tracking-tight">
                  {step === 1
                    ? "Step 1: Review Terms"
                    : step === 2
                      ? "Step 2: Analysis Access"
                      : "Step 3: Ready for Download"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-1 font-medium">
                {step === 1
                  ? "Please accept our license agreement to proceed."
                  : step === 2
                    ? "Unlock your premium report with a one-time access fee."
                    : "Your Forensic Report has been generated successfully."}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-800 w-full flex">
          <div
            className={cn(
              "h-full bg-blue-500 transition-all duration-500",
              step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full",
            )}
          />
        </div>

        <div
          className={cn(
            "p-8 space-y-6 flex flex-col transition-all duration-500",
            showPreview ? "flex-1 overflow-y-auto custom-scrollbar" : "",
          )}
        >
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-sm sticky top-0 z-10">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-blue-600 checked:bg-blue-600 focus:ring-0 shadow-sm"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <CheckCircle2 className="absolute h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100 left-1 pointer-events-none" />
                </div>
                <label
                  htmlFor="terms-checkbox"
                  className="text-base font-semibold text-slate-700 cursor-pointer select-none"
                >
                  I have read and accept the{" "}
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-blue-600 font-bold hover:text-blue-700 underline underline-offset-4 decoration-2 decoration-blue-200 hover:decoration-blue-600 transition-all"
                  >
                    terms & conditions
                  </button>
                </label>
              </div>

              {showPreview && (
                <div className="flex-1 min-h-[400px] border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-top-4 duration-700 bg-white flex flex-col mt-4">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        Official Document Viewer
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 relative bg-slate-100 flex items-center justify-center">
                    {loadingPdf ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <span className="text-sm text-slate-500 font-bold tracking-tight">
                          Loading Agreement...
                        </span>
                      </div>
                    ) : pdfUrl ? (
                      <iframe
                        src={`${pdfUrl}#toolbar=0&view=FitH`}
                        className="w-full h-full border-none min-h-[500px]"
                        title="Terms and Conditions"
                      />
                    ) : (
                      <div className="text-center p-12">
                        <p className="text-sm text-slate-400 font-bold">
                          Unable to load terms and conditions. Please try again.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
              <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col items-center shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  Service Fee
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-slate-900 text-5xl font-black tracking-tighter">
                    $4.99
                  </span>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">
                    USD
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={simulatePayment}
                  disabled={isProcessingPayment}
                  className="h-16 bg-[#ffc439] hover:bg-[#f2ba36] text-[#003087] font-black rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl shadow-amber-500/20 border-b-4 border-amber-600/30 group"
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center gap-4">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="uppercase tracking-[0.2em] text-[10px] font-black">
                        Securing Transaction...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="italic text-2xl flex items-center group-hover:scale-105 transition-transform">
                        <span className="font-black">Pay</span>
                        <span className="font-extrabold text-[#0070ba]">
                          Pal
                        </span>
                      </div>
                      <div className="h-8 w-px bg-[#003087]/10" />
                      <span className="text-sm uppercase tracking-widest">
                        Checkout Now
                      </span>
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-slate-400 font-medium px-8">
                  By clicking pay, you will be redirected to a secure payment
                  gateway. All transactions are encrypted and secured.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in slide-in-from-bottom-8 duration-700">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Payment Confirmed
                </h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  Your premium analysis report is ready for download. You can
                  now access all charts and forensic data.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <DialogFooter className="bg-slate-50 p-6 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
          {step !== 3 && (
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-10 border rounded font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
            >
              Cancel
            </Button>
          )}

          <div className="flex-1">
            {step === 1 ? (
              <Button
                disabled={!agreed}
                onClick={() => setStep(2)}
                className={cn(
                  "w-full h-10 rounded font-bold flex items-center justify-center gap-2 transition-all active:scale-95",
                  agreed
                    ? "bg-black text-white hover:bg-slate-800"
                    : "bg-slate-200 text-slate-400 opacity-50",
                )}
              >
                Proceed to Payment
              </Button>
            ) : step === 3 ? (
              <PDFDownloadLink
                document={pdfDocument}
                fileName={fileName}
                className="w-full"
                style={{ display: "block" }}
              >
                {({ loading }) => (
                  <Button
                    disabled={loading}
                    className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-black/10"
                  >
                    <Download className="w-4 h-4" />
                    {loading
                      ? "Generating Insight..."
                      : "Download Full Analysis"}
                  </Button>
                )}
              </PDFDownloadLink>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
