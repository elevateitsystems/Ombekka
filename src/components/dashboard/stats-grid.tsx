"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameData } from "@/lib/api";
import { Trophy, Users, Hash, TrendingUp, Activity, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsGridProps {
  games: GameData[];
  totalGames: number;
  isLoading: boolean;
  onFilterChange: (key: string, value: string) => void;
}

export function StatsGrid({ games, totalGames, isLoading, onFilterChange }: StatsGridProps) {
  const avgElo = games.length > 0 
    ? Math.round(games.reduce((acc, g) => acc + ((g.whiteElo || 0) + (g.blackElo || 0)) / 2, 0) / games.length)
    : 0;
  
  const winCount = games.filter(g => {
    const targetId = games[0]?.whiteId;
    if (!targetId) return false;
    const isWhite = g.whiteId === targetId;
    return (g.result === "1-0" && isWhite) || (g.result === "0-1" && !isWhite);
  }).length;
  
  const drawCount = games.filter(g => g.result === "1/2-1/2" || g.result === "½-½").length;
  const winRate = games.length > 0 ? (((winCount + drawCount * 0.5) / games.length) * 100).toFixed(1) : "0.0";

  const ecoCounts = games.reduce((acc, g) => {
    if (g.ecoCode) acc[g.ecoCode] = (acc[g.ecoCode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topOpening = Object.entries(ecoCounts).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      label: "Total Games",
      value: totalGames.toLocaleString(),
      icon: <Hash className="w-4 h-4 text-blue-500" />,
      description: "Search matches",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: <Trophy className="w-4 h-4 text-amber-500" />,
      description: "Match percentage",
    },
    {
      label: "Avg. Match Elo",
      value: avgElo.toLocaleString(),
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
      description: "Difficulty level",
    },
    {
      label: "Top Opening",
      value: topOpening ? topOpening[0] : "—",
      icon: <Activity className="w-4 h-4 text-indigo-500" />,
      description: topOpening ? `Used ${topOpening[1]} times` : "No data",
      onClick: () => topOpening && onFilterChange("eco", topOpening[0]),
      clickable: !!topOpening,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <Card 
          key={i} 
          className={cn(
            "border-slate-200 shadow-sm transition-all",
            stat.clickable && "cursor-pointer hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/10"
          )}
          onClick={stat.onClick}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              {stat.label}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
            )}
            <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
