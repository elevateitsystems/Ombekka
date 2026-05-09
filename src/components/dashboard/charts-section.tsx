"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { 
  aggregateResults, 
  aggregateEloTrend, 
  aggregateEco, 
  type GameData 
} from "@/lib/api";

import { Skeleton } from "@/components/ui/skeleton";

interface ChartsSectionProps {
  games: GameData[];
  isLoading: boolean;
  onFilterChange: (key: string, value: string) => void;
}

export function ChartsSection({ games, isLoading, onFilterChange }: ChartsSectionProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [activeFormat, setActiveFormat] = useState<string>("Classical");

  useEffect(() => {
    // We wait for two frames to ensure Next.js hydration AND 
    // browser initial layout are 100% complete
    const handle = requestAnimationFrame(() => {
       requestAnimationFrame(() => setHasMounted(true));
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const resultData = aggregateResults(games).filter(d => d.value > 0);
  
  // Segment Elo Trend by active format (Classical, Rapid, Blitz, Other)
  const filteredEloGames = games.filter(g => {
    const type = g.tournament?.type?.toLowerCase() || "";
    if (activeFormat === "Other") {
      return !type || !["classical", "rapid", "blitz"].includes(type);
    }
    return type === activeFormat.toLowerCase();
  });
  
  const eloTrendData = aggregateEloTrend(filteredEloGames);
  const ecoData = aggregateEco(games)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const COLORS = ["#10b981", "#f43f5e", "#64748b"]; // Wins (Green), Losses (Red), Draws (Slate)
  const RESULT_MAP: Record<string, string> = { "Wins": "1-0", "Losses": "0-1", "Draws": "1/2-1/2" };

  if (!hasMounted || isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[350px] md:col-span-2 rounded-xl" />
      </div>
    );
  }

  // Global check: If no games, don't render anything
  if (games.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* 1. Win/Loss Distribution - Only render if we have results */}
      {resultData.length > 0 && (
        <Card className="border-slate-200 shadow-sm overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Outcome Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] pt-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <PieChart>
                <Pie
                  data={resultData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                  stroke="none"
                  onClick={(data) => {
                     if (data && data.name) {
                        const resultValue = RESULT_MAP[data.name];
                        if (resultValue) onFilterChange("result", resultValue);
                     }
                  }}
                  className="cursor-pointer"
                >
                  {resultData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    borderRadius: "12px", 
                    border: "none", 
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-500 -mt-2 uppercase tracking-tighter">
              {resultData.map((d, i) => (
                <div 
                  key={d.name} 
                  className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => {
                    const val = RESULT_MAP[d.name];
                    if (val) onFilterChange("result", val);
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Rating Development - Only if we have trend data */}
      <Card className="border-slate-200 shadow-sm relative">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Elo Trend ({activeFormat})</CardTitle>
          <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-100">
            {["Classical", "Rapid", "Blitz", "Other"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveFormat(type)}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md transition-all ${
                  activeFormat === type 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="h-[250px] pt-0">
          <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <LineChart data={eloTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8" }}
              />
              <YAxis 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8" }}
                domain={["auto", "auto"]} 
              />
              <Tooltip
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "none", 
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" 
                }}
                labelStyle={{ fontWeight: "bold", fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="avgElo"
                stroke={activeFormat === "Classical" ? "#3B82F6" : activeFormat === "Rapid" ? "#10B981" : activeFormat === "Blitz" ? "#F59E0B" : "#64748b"}
                strokeWidth={3}
                dot={{ r: 4, fill: activeFormat === "Classical" ? "#3B82F6" : activeFormat === "Rapid" ? "#10B981" : activeFormat === "Blitz" ? "#F59E0B" : "#64748b", strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
          {eloTrendData.length === 0 && (
            <div className="absolute inset-x-0 bottom-12 flex items-center justify-center pointer-events-none">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-white/80 px-4 py-1 rounded-full">No {activeFormat} data discovered</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Favorite Openings - Only if we have eco data */}
      {ecoData.length > 0 && (
        <Card className="border-slate-200 shadow-sm md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Opening Repertoire (Click to pivot)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <BarChart 
                data={ecoData} 
                layout="vertical" 
                margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                onClick={(data: any) => {
                   if (data && data.activePayload && data.activePayload[0]) {
                      onFilterChange("eco", data.activePayload[0].payload.eco);
                   }
                }}
                className="cursor-pointer"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="eco"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  className="font-bold text-slate-700"
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ 
                    borderRadius: "12px", 
                    border: "none", 
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" 
                  }}
                  formatter={(value) => [value, "Games Handled"]}
                />
                <Bar
                  dataKey="count"
                  fill="#818CF8"
                  radius={[0, 6, 6, 0]}
                  barSize={32}
                  animationDuration={2000}
                  className="hover:fill-indigo-500 transition-colors"
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="px-4 pb-2">
               <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {ecoData.map((eco, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 cursor-pointer group/item"
                      onClick={() => onFilterChange("eco", eco.eco)}
                    >
                      <span className="text-[11px] font-bold text-indigo-600 group-hover/item:text-indigo-800 underline decoration-indigo-200">{eco.eco}:</span>
                      <span className="text-[11px] text-slate-500 truncate max-w-[150px] group-hover/item:text-slate-800 transition-colors">{eco.ecoName}</span>
                    </div>
                  ))}
               </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

