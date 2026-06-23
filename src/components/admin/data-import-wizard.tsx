// components/admin/data-import-wizard.tsx
"use client";

import React, { useState, useRef } from "react";
import {
  importEcoFile,
  importPlayersFile,
  importTournamentsFile,
  importGamesFile,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Database,
  Users,
  Trophy,
  Gamepad2,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  importFn: (token: string, file: File) => Promise<any>;
  fileLabel: string;
  requiredColumns: string[];
}

const steps: Step[] = [
  // {
  //   id: "eco",
  //   title: "Import ECO Openings",
  //   description: "Upload the ECO codes CSV file",
  //   icon: <Database className="w-5 h-5" />,
  //   importFn: importEcoFile,
  //   fileLabel: "ECO CSV File",
  //   requiredColumns: [
  //     "eco",
  //     "eco_name",
  //     "eco_example",
  //     "eco_type",
  //     "eco_group",
  //   ],
  // },
  {
    id: "players",
    title: "Import Players",
    description: "Upload the players CSV file",
    icon: <Users className="w-5 h-5" />,
    importFn: importPlayersFile,
    fileLabel: "Players CSV File",
    requiredColumns: ["fide_id", "name", "country", "sex", "title"],
  },
  {
    id: "tournaments",
    title: "Import Tournaments",
    description: "Upload the tournaments CSV file",
    icon: <Trophy className="w-5 h-5" />,
    importFn: importTournamentsFile,
    fileLabel: "Tournaments CSV File",
    requiredColumns: [
      "event_id",
      "event",
      "place",
      "federation",
      "startdate",
      "enddate",
    ],
  },
  {
    id: "games",
    title: "Import Games",
    description: "Upload the games CSV file (this may take a while)",
    icon: <Gamepad2 className="w-5 h-5" />,
    importFn: importGamesFile,
    fileLabel: "Games CSV File",
    requiredColumns: [
      "game_id",
      "event",
      "date_played",
      "round",
      "white",
      "black",
      "result",
      "white_elo",
      "black_elo",
      "eco",
      "ply_count",
      "termination",
      "endgame",
      "endgame_count",
    ],
  },
];

export function DataImportWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [status, setStatus] = useState<
    Record<string, { success: boolean; message: string; count?: number }>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const handleFileSelect = (stepId: string, file: File) => {
    setSelectedFiles((prev) => ({ ...prev, [stepId]: file }));
    setStatus((prev) => ({
      ...prev,
      [stepId]: { success: false, message: `File selected: ${file.name}` },
    }));
    // Reset file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (step: Step) => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    const file = selectedFiles[step.id];
    if (!file) {
      toast.error(`Please select a file for ${step.title}`);
      return;
    }

    setUploading(true);
    try {
      const result = await step.importFn(token, file);

      setStatus((prev) => ({
        ...prev,
        [step.id]: {
          success: true,
          message: result.message || `${step.title} imported successfully`,
          count: result.count || result.data?.length || 0,
        },
      }));

      setCompletedSteps((prev) => new Set([...prev, step.id]));
      toast.success(`${step.title} imported successfully`);

      // Auto-advance to next step after success
      if (currentStep < steps.length - 1) {
        setTimeout(() => setCurrentStep(currentStep + 1), 500);
      }
    } catch (error: any) {
      setStatus((prev) => ({
        ...prev,
        [step.id]: {
          success: false,
          message: 'Import failed. Please use the required CSV format.',
        },
      }));
      console.log({ error: error?.message });
      toast.error("Import failed. Please use the required CSV format.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(steps[currentStep].id, file);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = "";
  };

  const handleTriggerFileInput = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedFiles({});
    setCompletedSteps(new Set());
    setStatus({});
    setCurrentStep(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const step = steps[currentStep];
  const isStepCompleted = completedSteps.has(step.id);
  const stepStatus = status[step.id];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Data Import Wizard
        </h1>
        <p className="text-slate-500 mt-2">
          Import chess data from CSV files. Follow the steps in order.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, index) => {
          const isCompleted = completedSteps.has(s.id);
          const isActive = index === currentStep;
          const isPast = index < currentStep;

          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-slate-200 text-slate-500",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 font-medium text-center",
                    isCompleted
                      ? "text-green-600"
                      : isActive
                        ? "text-blue-600"
                        : "text-slate-400",
                  )}
                >
                  {s.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2",
                    isPast ? "bg-green-500" : "bg-slate-200",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              {step.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
              <p className="text-sm text-slate-500">{step.description}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
              selectedFiles[step.id]
                ? "border-green-400 bg-green-50/50"
                : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/50",
            )}
          >
            {selectedFiles[step.id] ? (
              <div className="space-y-3">
                <FileSpreadsheet className="w-12 h-12 text-green-500 mx-auto" />
                <div>
                  <p className="font-medium text-slate-900">
                    {selectedFiles[step.id].name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {(selectedFiles[step.id].size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFiles((prev) => {
                      const newFiles = { ...prev };
                      delete newFiles[step.id];
                      return newFiles;
                    });
                    setStatus((prev) => {
                      const newStatus = { ...prev };
                      delete newStatus[step.id];
                      return newStatus;
                    });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Change File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Select {step.fileLabel}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Click to browse or drag and drop
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Only .csv files are accepted
                  </p>
                </div>
                <Button variant="outline" onClick={handleTriggerFileInput}>
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {/* Required Columns Information */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Important: Required Columns</p>
                <p className="mt-1">
                  Your CSV file must contain exactly these column headers in the
                  correct order:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {step.requiredColumns.map((col, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white border border-amber-300 rounded-md text-xs font-mono text-amber-900"
                    >
                      {col}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-amber-700">
                  ⚠️ If your CSV has additional columns or missing columns, the
                  upload will fail. Please ensure your CSV matches the required
                  format exactly.
                </p>
              </div>
            </div>
          </div>

          {stepStatus && (
            <div
              className={cn(
                "mt-4 p-4 rounded-xl flex items-start gap-3",
                stepStatus.success
                  ? "bg-green-50 text-green-800"
                  : "bg-blue-50 text-blue-800",
              )}
            >
              {stepStatus.success ? (
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{stepStatus.message}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              {isStepCompleted && currentStep < steps.length - 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {!isStepCompleted && selectedFiles[step.id] && (
                <Button
                  onClick={() => handleUpload(step)}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {step.fileLabel}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Status */}
      {completedSteps.size === steps.length && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-bold text-green-800">
            All Data Imported Successfully!
          </h3>
          <p className="text-sm text-green-600 mt-1">
            All CSV files have been processed. You can now use the application
            with the imported data.
          </p>
          <Button
            variant="outline"
            className="mt-3 border-green-300 text-green-700 hover:bg-green-100"
            onClick={handleReset}
          >
            Import Another Set
          </Button>
        </div>
      )}
    </div>
  );
}
