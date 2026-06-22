import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchGameById } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default async function MatchDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  let game = null;
  try {
    game = await fetchGameById(id);
  } catch (err) {
    // Failed to fetch or not found
    console.error(err);
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
        <p className="text-gray-500 mb-8">Could not find match with ID: {id}</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6 print:p-0 print:max-w-full">
      {/* Top Nav */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#666] no-underline text-base transition-colors duration-200 hover:text-[#0071bc]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-[2.25rem] font-bold text-[#1a1a1a]">
          Match Details
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          {game.white?.name} vs {game.black?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-[#e1e4e8] p-5 flex flex-col rounded shadow-sm">
          <div className="text-[0.75rem] uppercase text-[#888] tracking-wider font-semibold mb-1">
            Result
          </div>
          <div className="text-[1.25rem] font-bold text-[#0060A9]">
            {game.result || "—"}
          </div>
        </div>
        <div className="bg-white border border-[#e1e4e8] p-5 flex flex-col rounded shadow-sm">
          <div className="text-[0.75rem] uppercase text-[#888] tracking-wider font-semibold mb-1">
            Date Played
          </div>
          <div className="text-[1.1rem] font-semibold text-gray-800">
            {game?.datePlayed ? new Date(game?.datePlayed).toDateString() : "—"}
          </div>
        </div>
        <div className="bg-white border border-[#e1e4e8] p-5 flex flex-col rounded shadow-sm">
          <div className="text-[0.75rem] uppercase text-[#888] tracking-wider font-semibold mb-1">
            Event
          </div>
          <div className="text-[1.1rem] font-semibold text-gray-800">
            {game.tournament?.event || "—"}
          </div>
        </div>
        <div className="bg-white border border-[#e1e4e8] p-5 flex flex-col rounded shadow-sm">
          <div className="text-[0.75rem] uppercase text-[#888] tracking-wider font-semibold mb-1">
            ECO
          </div>
          <div className="text-[1.1rem] font-semibold text-gray-800">
            {game.ecoCode || "—"} {game.eco?.name ? `- ${game.eco.name}` : ""}
          </div>
        </div>
        <div className="bg-white border border-[#e1e4e8] p-5 flex flex-col rounded shadow-sm">
          <div className="text-[0.75rem] uppercase text-[#888] tracking-wider font-semibold mb-1">
            ECO Type
          </div>
          <div className="text-[1.1rem] font-semibold text-gray-800">
            {game.eco?.type || "—"}
          </div>
        </div>
        <div className="bg-white border border-[#e1e4e8] p-5 flex flex-col rounded shadow-sm">
          <div className="text-[0.75rem] uppercase text-[#888] tracking-wider font-semibold mb-1">
            Ply Count
          </div>
          <div className="text-[1.1rem] font-semibold text-gray-800">
            {game.plyCount || "—"}
          </div>
        </div>
        <div className="bg-white border border-[#e1e4e8] p-5 flex flex-col rounded shadow-sm">
          <div className="text-[0.75rem] uppercase text-[#888] tracking-wider font-semibold mb-1">
            Game Length
          </div>
          <div className="text-[1.1rem] font-semibold text-gray-800">
            {game.plyCount ? `${Math.ceil(game.plyCount / 2)} moves` : "—"}
          </div>
        </div>
        <div className="bg-white border border-[#e1e4e8] p-5 flex flex-col rounded shadow-sm">
          <div className="text-[0.75rem] uppercase text-[#888] tracking-wider font-semibold mb-1">
            Termination
          </div>
          <div className="text-[1.1rem] font-semibold text-gray-800">
            {game.termination || "—"}
          </div>
        </div>
        <div className="bg-white border border-[#e1e4e8] p-5 flex flex-col rounded shadow-sm">
          <div className="text-[0.75rem] uppercase text-[#888] tracking-wider font-semibold mb-1">
            Endgame
          </div>
          <div className="text-[1.1rem] font-semibold text-gray-800">
            {game.endgame || "—"}
          </div>
        </div>
      </div>

      {/* Player Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e1e4e8] p-6 rounded shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-[#0060A9] border-b pb-2">
            White Player
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs uppercase text-gray-500 font-semibold block">
                Name
              </span>
              <span className="font-medium text-lg">
                {game.white?.name || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase text-gray-500 font-semibold block">
                FIDE ID
              </span>
              <span className="font-mono text-base">
                {game.white?.fideId || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase text-gray-500 font-semibold block">
                Country
              </span>
              <span className="font-medium text-base">
                {game.white?.country || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase text-gray-500 font-semibold block">
                Title
              </span>
              <span className="font-medium text-base">
                {game.white?.title || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase text-gray-500 font-semibold block">
                ELO
              </span>
              <span className="font-medium text-base">
                {game.whiteElo || "—"}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#e1e4e8] p-6 rounded shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-[#333] border-b pb-2">
            Black Player
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs uppercase text-gray-500 font-semibold block">
                Name
              </span>
              <span className="font-medium text-lg">
                {game.black?.name || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase text-gray-500 font-semibold block">
                FIDE ID
              </span>
              <span className="font-mono text-base">
                {game.black?.fideId || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase text-gray-500 font-semibold block">
                Country
              </span>
              <span className="font-medium text-base">
                {game.black?.country || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase text-gray-500 font-semibold block">
                Title
              </span>
              <span className="font-medium text-base">
                {game.black?.title || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase text-gray-500 font-semibold block">
                ELO
              </span>
              <span className="font-medium text-base">
                {game.blackElo || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
