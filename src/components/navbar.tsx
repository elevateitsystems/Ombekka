import Link from "next/link";
import PlayerSearch from "./player-search";
import Image from "next/image";
import { Suspense } from "react";

export default function Navbar() {
  return (
    <div className="border-b-2 border-b-[#0071bc] ">
      <div className="max-w-[1200px] mx-auto px-2 sm:px-0 py-3 flex items-center justify-between ">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline shrink-0"
        >
          <Image
            src="/logo_2.png"
            className="w-10 h-auto"
            alt="Logo"
            width={50}
            height={50}
          />
          <span className="font-medium text-[1.2rem] text-[#1a1a1a] uppercase tracking-tight whitespace-nowrap">
            Pawnder Info
          </span>
        </Link>
        <div className="w-full max-w-[320px]">
          <Suspense
            fallback={
              <div className="h-9 w-full bg-slate-100 animate-pulse rounded-md" />
            }
          >
            <PlayerSearch compact placeholder="Search..." />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
