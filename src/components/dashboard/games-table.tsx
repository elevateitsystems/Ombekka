"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { type GameData, type PaginationInfo } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface GamesTableProps {
  games: GameData[];
  pagination?: PaginationInfo;
  onPageChange: (page: number) => void;
  onFilterChange: (key: any, value: any) => void;
  isLoading: boolean;
}

export function GamesTable({ games, pagination, onPageChange, onFilterChange, isLoading }: GamesTableProps) {
  const getResultBadge = (result: string) => {
    switch (result) {
      case "1-0":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">1-0</Badge>;
      case "0-1":
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">0-1</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-600">½-½</Badge>;
    }
  };

  if (isLoading && games.length === 0) {
    return (
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm space-y-px">
        <Skeleton className="h-12 w-full rounded-none" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-none" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Event</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Players</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Result</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Opening</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-slate-900">No matches found</p>
                      <p className="text-sm text-slate-500 max-w-[280px] mx-auto">
                        Your current research filters are too specific. Try adjusting them to broaden your search.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => onFilterChange("clear", true)}
                      className="mt-2 text-xs font-bold uppercase tracking-wider h-9 px-6 hover:bg-slate-50 transition-all rounded-full"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              games.map((game) => (
                <TableRow key={game.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-sm text-slate-600 py-4">
                    {game.datePlayed ? new Date(game.datePlayed).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <p 
                      className="text-sm font-medium text-slate-900 truncate hover:text-blue-600 cursor-pointer" 
                      title={game.tournament?.event}
                      onClick={() => onFilterChange("tournament", game.tournament?.event)}
                    >
                      {game.tournament?.event || "—"}
                    </p>
                    <p className="text-[11px] text-slate-500">{game.tournament?.place || "—"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 group">
                        <span className="w-2 h-2 rounded-full bg-white border border-slate-300" title="White" />
                        <span 
                          className="text-sm font-medium truncate max-w-[120px] group-hover:text-blue-600 cursor-pointer" 
                          title={game.white.name}
                          onClick={() => onFilterChange("player", game.white.name)}
                        >
                          {game.white.name}
                        </span>
                        <span className="text-[10px] text-slate-400">({game.whiteElo})</span>
                      </div>
                      <div className="flex items-center gap-2 group">
                        <span className="w-2 h-2 rounded-full bg-slate-900" title="Black" />
                        <span 
                          className="text-sm font-medium truncate max-w-[120px] group-hover:text-blue-600 cursor-pointer" 
                          title={game.black.name}
                          onClick={() => onFilterChange("player", game.black.name)}
                        >
                          {game.black.name}
                        </span>
                        <span className="text-[10px] text-slate-400">({game.blackElo})</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{getResultBadge(game.result)}</TableCell>
                  <TableCell>
                    <span 
                      className="text-[11px] font-bold text-indigo-600 uppercase hover:underline cursor-pointer"
                      onClick={() => onFilterChange("eco", game.ecoCode)}
                    >
                      {game.ecoCode}
                    </span>
                    <p className="text-xs text-slate-600 truncate max-w-[140px]" title={game.eco.name}>
                      {game.eco.name}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/game/${game.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="font-medium text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
            <span className="font-medium text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
            <span className="font-medium text-slate-900">{pagination.total}</span> games
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevious || isLoading}
              onClick={() => onPageChange(pagination.page - 1)}
              className="h-8 px-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <div className="text-xs font-medium text-slate-600 px-2">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext || isLoading}
              onClick={() => onPageChange(pagination.page + 1)}
              className="h-8 px-2"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
