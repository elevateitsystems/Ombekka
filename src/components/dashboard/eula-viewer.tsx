import React, { useState, useEffect, useRef } from "react";
import { fetchEula, uploadEula } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2, Upload, FileUp } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";

export function EulaViewer() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [dbPdfUrl, setDbPdfUrl] = useState<string | null>(null);
  const [pendingBase64, setPendingBase64] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadEula = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const base64Data = await fetchEula(token);
      
      if (base64Data && typeof base64Data === "string" && base64Data.length > 0) {
        if (dbPdfUrl) URL.revokeObjectURL(dbPdfUrl);
        const blob = base64ToBlob(base64Data, "application/pdf");
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setDbPdfUrl(url); 
        setIsPreview(false);
        setPendingBase64(null);
      } else {
        setPdfUrl(null);
        setDbPdfUrl(null);
      }
    } catch (error) {
      console.error("Error loading EULA:", error);
      setPdfUrl(null);
      setDbPdfUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEula();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      if (dbPdfUrl) URL.revokeObjectURL(dbPdfUrl);
    };
  }, []);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setPendingBase64(base64String);
      const blob = base64ToBlob(base64String, "application/pdf");
      const previewUrl = URL.createObjectURL(blob);
      if (isPreview && pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(previewUrl);
      setIsPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelPreview = () => {
    if (isPreview && pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(dbPdfUrl);
    setIsPreview(false);
    setPendingBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!pendingBase64) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      setUploading(true);
      await uploadEula(token, pendingBase64);
      toast.success("EULA updated successfully");
      if (dbPdfUrl) URL.revokeObjectURL(dbPdfUrl);
      setDbPdfUrl(pdfUrl); 
      setIsPreview(false);
      setPendingBase64(null);
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[350px]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>
        <Skeleton className="w-full h-[800px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isPreview ? "Previewing New EULA" : "End User License Agreement"}
          </h2>
          <p className="text-slate-500 mt-1">
            {isPreview 
              ? "Review your changes before making them live." 
              : "Review and manage the terms and conditions."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
          
          {!isPreview ? (
            <Button
              variant="outline"
              className="flex items-center gap-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <FileUp className="w-4 h-4" />
              Change PDF
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-slate-700"
                onClick={handleCancelPreview}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Save & Publish
              </Button>
            </>
          )}

          {pdfUrl && !isPreview && (
            <Button
              variant="default"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white"
              onClick={() => {
                const link = document.createElement("a");
                link.href = pdfUrl;
                link.download = "EULA.pdf";
                link.click();
              }}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      <div className={cn(
        "border rounded-2xl overflow-hidden min-h-[600px] flex items-center justify-center transition-all duration-300",
        isPreview ? "border-blue-400 bg-blue-50/20 shadow-lg ring-4 ring-blue-50" : "border-slate-200 bg-slate-50/50"
      )}>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-[800px] border-none"
            title="EULA PDF Preview"
            key={pdfUrl} // Force iframe reload when URL changes
          />
        ) : (
          <div className="text-center p-20">
            <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No EULA Uploaded</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Upload a PDF document to set the license agreement for all users.
            </p>
            <Button
              variant="outline"
              className="mt-6 gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Upload Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
