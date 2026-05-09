import { fetchGameById } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Trophy,
  Calendar,
  MapPin,
  Hash,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GamePdfExport } from "@/components/game/game-pdf-export";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params;
  let game;

  try {
    game = await fetchGameById(id);
  } catch (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="text-slate-500 text-sm">
            We couldn't retrieve the details for this game. It might have been
            moved or deleted.
          </p>
          <Link href="/">
            <Button className="w-full bg-slate-900 mt-4">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!game) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors gap-2 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Research
          </Link>
          <div className="flex items-center gap-4">
            <GamePdfExport game={game} />
            <Badge
              variant="outline"
              className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >
              Game ID: {game.id.slice(0, 8)}
            </Badge>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Forensic Game Analysis
            </h1>
            <p className="text-slate-500 text-sm">
              Deep dive into the match performance and opening context.
            </p>
          </div>
          <div className="flex shrink-0">
            <GamePdfExport game={game} variant="primary" />
          </div>
        </div>

        {/* Player Comparison Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* White Side */}
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-2 bg-slate-200 w-full" />
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto">
                <User className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {game.white?.name}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {game.white?.title || "No Title"}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full text-sm font-bold text-slate-600">
                Rating: {game.whiteElo}
              </div>
            </CardContent>
          </Card>

          {/* Black Side */}
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-2 bg-slate-900 w-full" />
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto">
                <User className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {game.black?.name}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {game.black?.title || "No Title"}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full text-sm font-bold text-slate-600">
                Rating: {game.blackElo}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match Result Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Final Result
              </p>
              <h2 className="text-2xl font-black text-slate-900">
                {game.result === "1-0"
                  ? "White Wins"
                  : game.result === "0-1"
                    ? "Black Wins"
                    : "Draw Decision"}
              </h2>
            </div>
          </div>

          <div className="flex gap-12 text-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Moves
              </p>
              <p className="text-lg font-bold text-slate-900">
                {game.plyCount}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Endgame
              </p>
              <p className="text-lg font-bold text-slate-900 capitalize">
                {game.endgame || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Termination
              </p>
              <p className="text-lg font-bold text-slate-900 truncate max-w-[120px]">
                {game.termination || "Normal"}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tournament Context */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Event Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-slate-300 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {game.tournament?.event}
                    </p>
                    <p className="text-xs text-slate-500">
                      {game.datePlayed
                        ? new Date(game.datePlayed).toLocaleDateString(
                            "en-US",
                            { dateStyle: "full" },
                          )
                        : "Date Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-slate-300 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {game.tournament?.place}
                    </p>
                    <p className="text-xs text-slate-500">
                      {game.tournament?.federation} Federation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Hash className="w-5 h-5 text-slate-300 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Round {game.round || "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {game.tournament?.type || "Official Tournament"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Space for additional details like PGN if provided later */}
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center opacity-40 grayscale">
              <p className="text-sm font-bold text-slate-400">
                Technical Move Analysis Integrations Pending
              </p>
            </div>
          </div>

          {/* Opening Theory Sidecard */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-indigo-100 text-black">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60">
                  Opening Theory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-3xl font-black text-indigo-200">
                    {game.ecoCode}
                  </h4>
                  <p className="text-lg font-bold leading-tight mt-1">
                    {game.eco?.name}
                  </p>
                </div>
                <div className="p-4 bg-indigo-200 rounded-xl border border-indigo-700/50">
                  <p className="text-[11px] font-bold text-indigo-900 uppercase mb-2">
                    Defining Moves
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {game.eco?.example
                      .split(" ")
                      .map((move: string, i: number) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 bg-indigo-900/50 rounded text-xs font-mono text-indigo-900 border border-indigo-600/30"
                        >
                          {move}
                        </span>
                      ))}
                  </div>
                </div>
                <p className="text-[10px] opacity-70 leading-relaxed italic">
                  This opening is classified under the {game.eco?.group} group,
                  typically focusing on {game.eco?.type.toLowerCase()}{" "}
                  structures.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
