"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle
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
  const [agreed, setAgreed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

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

    return () => {
      // We don't necessarily want to revoke it immediately if the modal just closed 
      // but stay in memory, however for safety let's manage it carefully.
    };
  }, [isOpen]);

  // Clean up URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={cn(
          "bg-white rounded-lg shadow-lg border-none p-0 overflow-hidden flex flex-col transition-all duration-500 ease-in-out",
          showPreview 
            ? "max-w-7xl min-w-[1000px] h-[90vh]" 
            : "max-w-xl w-[90vw] h-auto"
        )}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>
                <span className="text-white text-2xl font-bold tracking-tight">
                  Review & Download
                </span>
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-1 font-medium">
                {title}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className={cn(
          "p-8 space-y-6 flex flex-col transition-all duration-500",
          showPreview ? "flex-1 overflow-y-auto custom-scrollbar" : ""
        )}>
          {/* Agreement Checkbox with Link */}
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
            <label htmlFor="terms-checkbox" className="text-base font-semibold text-slate-700 cursor-pointer select-none">
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

          {/* Conditional PDF Preview - Now much larger */}
          {showPreview && (
            <div className="flex-1 border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-top-4 duration-700 bg-white flex flex-col">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Official Document Viewer</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowPreview(false)} 
                  className="px-3 py-1 rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-red-500 hover:text-white transition-all uppercase tracking-wider"
                >
                  Close Preview
                </button>
              </div>
              <div className="flex-1 min-h-[500px] relative bg-slate-100 flex items-center justify-center">
                {loadingPdf ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <span className="text-sm text-slate-500 font-bold tracking-tight">Loading Agreement...</span>
                  </div>
                ) : pdfUrl ? (
                  <iframe 
                    src={`${pdfUrl}#toolbar=0&view=FitH`} 
                    className="w-full h-full border-none"
                    title="Terms and Conditions"
                  />
                ) : (
                  <div className="text-center p-12">
                    <p className="text-sm text-slate-400 font-bold">Unable to load terms and conditions. Please try again.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <DialogFooter className="bg-slate-50 p-6 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 border rounded font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
          >
            Cancel
          </Button>
          
          <div className="flex-1">
            <PDFDownloadLink
              document={pdfDocument}
              fileName={fileName}
              className="w-full"
              style={{ display: 'block' }}
            >
              {({ loading }) => (
                <Button
                  disabled={!agreed || loading}
                  onClick={() => {
                    if (agreed) setTimeout(onClose, 800);
                  }}
                  className={`w-full h-10 rounded font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    agreed && !loading 
                      ? "bg-black hover:bg-black/90 text-white" 
                      : "bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed border border-slate-300"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {loading && agreed ? "Preparing..." : "Generate & Download"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
