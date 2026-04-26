"use client";

import React, { useEffect, useState } from "react";
import { useChessFilters } from "@/hooks/use-chess-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search, Filter } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { useDebounce } from "@/hooks/use-debounce";

const COUNTRIES = [
  "USA",
  "IND",
  "RUS",
  "CHN",
  "GER",
  "UKR",
  "FRA",
  "POL",
  "HUN",
  "ESP",
  "ARM",
  "BEL",
];

export function GamesFilter() {
  const { filters, setFilter, setFilters, clearFilters } = useChessFilters();

  // Local state for text inputs to handle debounced URL updates
  const [search, setSearch] = useState(filters.search || "");
  const [player, setPlayer] = useState(filters.player || "");
  const [tournament, setTournament] = useState(filters.tournament || "");

  const debouncedSearch = useDebounce(search, 500);
  const debouncedPlayer = useDebounce(player, 500);
  const debouncedTournament = useDebounce(tournament, 500);

  // Tracks whether the text change originated from the user typing
  const isDirty = React.useRef({ search: false, player: false, tournament: false });

  // Sync debounced values to URL ONLY if they were changed locally by typing
  useEffect(() => {
    if (isDirty.current.search && debouncedSearch !== (filters.search || "")) {
      setFilter("search", debouncedSearch);
      isDirty.current.search = false;
    }
  }, [debouncedSearch, setFilter, filters.search]);

  useEffect(() => {
    if (isDirty.current.player && debouncedPlayer !== (filters.player || "")) {
      setFilter("player", debouncedPlayer);
      isDirty.current.player = false;
    }
  }, [debouncedPlayer, setFilter, filters.player]);

  useEffect(() => {
    if (isDirty.current.tournament && debouncedTournament !== (filters.tournament || "")) {
      setFilter("tournament", debouncedTournament);
      isDirty.current.tournament = false;
    }
  }, [debouncedTournament, setFilter, filters.tournament]);

  // Sync local state when filters change externally (e.g. from table pivots)
  useEffect(() => {
    if (filters.search !== search) {
      setSearch(filters.search || "");
      isDirty.current.search = false; // Mark as clean so it doesn't trigger a loop
    }
    if (filters.player !== player) {
      setPlayer(filters.player || "");
      isDirty.current.player = false;
    }
    if (filters.tournament !== tournament) {
      setTournament(filters.tournament || "");
      isDirty.current.tournament = false;
    }
  }, [filters.search, filters.player, filters.tournament]);

  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (!filters.from) return undefined;
    return {
      from: new Date(filters.from),
      to: filters.to ? new Date(filters.to) : undefined,
    };
  });

  const handleDateChange = (newRange: DateRange | undefined) => {
    setDate(newRange);
    setFilters({
      from: newRange?.from?.toISOString(),
      to: newRange?.to?.toISOString(),
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) =>
      v !== undefined && v !== "" && v !== 1 && v !== 10 && v !== "datePlayed",
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 space-y-5">
        {/* Global Search */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-slate-400 px-1 flex items-center gap-1.5">
            <Search className="w-3 h-3" /> Search Games
          </label>
          <Input
            placeholder="Search name, event, opening..."
            value={search}
            onChange={(e) => {
              isDirty.current.search = true;
              setSearch(e.target.value);
            }}
            className="h-9 text-sm border-slate-200 focus:ring-blue-500"
          />
        </div>

        {/* Player Research */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-slate-400 px-1">
            Player
          </label>
          <Input
            placeholder="e.g. Carlsen, Magnus"
            value={player}
            onChange={(e) => {
              isDirty.current.player = true;
              setPlayer(e.target.value);
            }}
            className="h-9 text-sm"
          />
        </div>

        {/* Tournament */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-slate-400 px-1">
            Tournament
          </label>
          <Input
            placeholder="e.g. World Championship"
            value={tournament}
            onChange={(e) => {
              isDirty.current.tournament = true;
              setTournament(e.target.value);
            }}
            className="h-9 text-sm"
          />
        </div>

        {/* Result Filter */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-slate-400 px-1">
            Game Result
          </label>
          <Select
            value={filters.result || "all"}
            onValueChange={(v) => setFilter("result", v)}
          >
            <SelectTrigger className="h-9 text-sm w-full">
              <SelectValue placeholder="Any Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Result</SelectItem>
              <SelectItem value="1-0">1-0 (White Win)</SelectItem>
              <SelectItem value="0-1">0-1 (Black Win)</SelectItem>
              <SelectItem value="1/2-1/2">½-½ (Draw)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-slate-400 px-1">
              Country
            </label>
            <Select
              value={filters.country || "all"}
              onValueChange={(v) => setFilter("country", v)}
            >
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-slate-400 px-1">
              Title
            </label>
            <Select
              value={filters.title || "all"}
              onValueChange={(v) => setFilter("title", v)}
            >
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {["GM", "IM", "FM", "WGM", "WIM"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ranges */}
        <div className="space-y-4 pt-1">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-slate-400 px-1">
              Elo Range
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minElo || ""}
                onChange={(e) => setFilter("minElo", e.target.value)}
                className="h-9 text-sm"
              />
              <span className="text-slate-300">/</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxElo || ""}
                onChange={(e) => setFilter("maxElo", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-slate-400 px-1">
              Ply Count
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPly || ""}
                onChange={(e) => setFilter("minPly", e.target.value)}
                className="h-9 text-sm"
              />
              <span className="text-slate-300">/</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPly || ""}
                onChange={(e) => setFilter("maxPly", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-slate-400 px-1">
            Date Range
          </label>
          <DatePickerWithRange value={date} onChange={handleDateChange} />
        </div>

        {/* Sort By */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <label className="text-[11px] font-bold uppercase text-slate-400 px-1 flex items-center gap-1.5">
            <Filter className="w-3 h-3" /> Sort Order
          </label>
          <Select
            value={filters.sortBy || "datePlayed"}
            onValueChange={(v) => setFilter("sortBy", v)}
          >
            <SelectTrigger className="h-9 text-sm border-none bg-slate-50 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="datePlayed">Date Played</SelectItem>
              <SelectItem value="whiteElo">White Elo</SelectItem>
              <SelectItem value="blackElo">Black Elo</SelectItem>
              <SelectItem value="plyCount">Ply Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="rounded-none border-t border-slate-100 h-11 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <X className="w-3.5 h-3.5 mr-2" /> Clear All Filters
        </Button>
      )}
    </div>
  );
}
