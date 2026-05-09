"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { PDFConsentModal } from "../pdf/pdf-consent-modal";
import { GameAnalysisPDF } from "../pdf/pdf-templates";
import { type GameData } from "@/lib/api";

interface GamePdfExportProps {
  game: GameData;
  variant?: "outline" | "primary";
}

export function GamePdfExport({ game, variant = "outline" }: GamePdfExportProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant === "primary" ? "default" : "outline"}
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className={
          variant === "primary"
            ? "h-11 gap-2 text-sm font-bold uppercase tracking-wider bg-black hover:bg-black/80 text-white rounded-lg px-6 shadow-lg shadow-black-200 transition-all active:scale-95"
            : "h-9 gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black hover:border-black transition-all rounded-lg px-4"
        }
      >
        <FileText className="w-4 h-4" />
        Download PDF
      </Button>

      <PDFConsentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Forensic Analysis: Game ${game.id.slice(0, 8)}`}
        fileName={`Pawnder Info_Analysis_${game.id.slice(0, 8)}.pdf`}
        pdfDocument={<GameAnalysisPDF game={game} />}
      />
    </>
  );
}
