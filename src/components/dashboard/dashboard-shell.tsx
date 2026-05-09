"use client";

import { Button } from "@/components/ui/button";
import { useChessFilters } from "@/hooks/use-chess-filters";
import { useGames } from "@/hooks/use-games";
import { cn } from "@/lib/utils";
import { FileText, Filter, RefreshCw } from "lucide-react";
import { useState } from "react";
import { GamesFilter } from "../games-filter";
import { ChartsSection } from "./charts-section";
import { GamesTable } from "./games-table";
import { StatsGrid } from "./stats-grid";
import { PDFConsentModal } from "../pdf/pdf-consent-modal";
import { HomeResultsPDF } from "../pdf/pdf-templates";

export function DashboardShell() {
  const { filters, setFilter, clearFilters } = useChessFilters();
  const { games, pagination, isLoading, error } = useGames(filters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const hasActiveFilters = Object.values(filters).some(
    (v) =>
      v !== undefined && v !== "" && v !== 1 && v !== 10 && v !== "datePlayed",
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Player Research
            </h1>
            <p className="text-slate-500 mt-1">
              Transforming chess games into actionable insights.
            </p>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all rounded-full h-8 px-4"
            >
              <RefreshCw className="w-3 h-3" />
              Reset All
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            className="lg:hidden flex items-center gap-2 text-xs font-bold"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="w-3.5 h-3.5" />
            {showMobileFilters ? "Hide Filters" : "Filter Research"}
          </Button>

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Updating analysis...
            </div>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsPdfModalOpen(true)}
            disabled={games.length === 0 || isLoading}
            className="hidden md:flex items-center gap-2 bg-black hover:bg-black/80 text-white font-bold h-10 px-6 rounded-lg transition-all active:scale-95"
          >
            <FileText className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 mx-auto max-w-2xl p-6 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-300">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Something went wrong</h3>
            <p className="text-sm text-slate-500 mt-1">
              We couldn&apos;t load your research data. Please reload the page.
            </p>
          </div>
          <Button
            variant="default"
            onClick={() => window.location.reload()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8"
          >
            Reload Analysis
          </Button>
        </div>
      )}

      {/* Stats Overview */}
      <StatsGrid
        games={games}
        totalGames={pagination?.total || 0}
        isLoading={isLoading}
        onFilterChange={(key, value) => {
          if (key === "clear") clearFilters();
          else setFilter(key as any, value);
        }}
      />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <aside
          className={cn(
            "lg:col-span-3 space-y-6",
            !showMobileFilters && "hidden lg:block",
            showMobileFilters &&
              "block animate-in slide-in-from-top-4 duration-300",
          )}
        >
          <div className="sticky top-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">
              Research Filters
            </h2>
            <GamesFilter />

            <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-blue-900/70">
              <h4 className="text-xs font-bold uppercase mb-2">Pro Tip</h4>
              <p className="text-[11px] leading-relaxed">
                Filter by <strong>ELO</strong> and <strong>ECO</strong> to
                identify an player&apos;s specific opening weaknesses across
                different time controls.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8">
          {/* Visualizations Section */}
          <ChartsSection
            games={games}
            isLoading={isLoading}
            onFilterChange={(key, value) => {
              if (key === "clear") clearFilters();
              else setFilter(key as any, value);
            }}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-slate-900">Search Results</h3>
              <span className="text-xs text-slate-400">
                {games.length} games in current view
              </span>
            </div>
            <GamesTable
              games={games}
              pagination={pagination}
              onPageChange={(page) => setFilter("page", page)}
              onFilterChange={(key, value) => {
                if (key === "clear") clearFilters();
                else setFilter(key as any, value);
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      <PDFConsentModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title="Search Results Analysis Report"
        fileName={`Pawnder Info_Search_Results_${new Date().toISOString().split('T')[0]}.pdf`}
        pdfDocument={<HomeResultsPDF games={games} />}
      />
    </div>
  );
}
