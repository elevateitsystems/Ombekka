export interface PlayerInfo {
  fideId: number;
  name: string;
  country: string;
  sex: string | null;
  title: string | null;
}

export interface EcoInfo {
  id: string;
  name: string;
  example: string;
  type: string;
  group: string;
}

export interface TournamentInfo {
  eventId: number;
  event: string;
  place: string;
  federation: string;
  startDate: string | null;
  endDate: string | null;
  type: string | null;
}

export interface GameData {
  id: string;
  tournamentId: number;
  datePlayed: string | null;
  round: number | null;
  whiteId: number;
  blackId: number;
  result: string;
  whiteElo: number;
  blackElo: number;
  ecoCode: string;
  plyCount: number;
  termination: string;
  endgame: string;
  endgameCount: number;
  white: PlayerInfo;
  black: PlayerInfo;
  eco: EcoInfo;
  tournament: TournamentInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface GamesApiResponse {
  success: boolean;
  message: string;
  meta: {
    requestId: string;
    timestamp: string;
    pagination: PaginationInfo;
  };
  data: GameData[];
}

const BACKEND_URL =
  typeof window !== "undefined"
    ? "/api/proxy"
    : process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://ombekka-backend.onrender.com/api" ||
      "http://localhost:3030/api";

export interface GamesFilterParams {
  search?: string;
  tournament?: string;
  minElo?: string | number;
  maxElo?: string | number;
  country?: string;
  title?: string;
  minPly?: string | number;
  maxPly?: string | number;
  sortBy?: string;
  sortOrder?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  player?: string;
  eco?: string;
  result?: string;
}

export async function fetchPlayerGames(
  params: GamesFilterParams = {},
  signal?: AbortSignal,
): Promise<GamesApiResponse> {
  const { page = 1, limit = 10, ...restParams } = params;

  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());

  Object.entries(restParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value.toString());
    }
  });

  const url = `${BACKEND_URL}/games?${searchParams.toString()}`;
  // console.log({ backendcallUrl: url });

  try {
    const res = await fetch(url, { cache: "no-store", signal });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      // console.log('Fetch aborted');
      throw error;
    }
    console.error("Search failed", error);
    throw error;
  }
}

export async function fetchGameById(id: string) {
  const url = `${BACKEND_URL}/games/${id}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  // Assume backend returns { success: true, data: GameData }
  return json.data as GameData;
}

// Aggregation helpers
export function aggregateEco(games: GameData[]) {
  const map = new Map<
    string,
    { eco: string; ecoName: string; count: number; lastPlayed: string | null }
  >();
  for (const g of games) {
    const existing = map.get(g.ecoCode);
    if (existing) {
      existing.count++;
      if (
        g.datePlayed &&
        (!existing.lastPlayed || g.datePlayed > existing.lastPlayed)
      ) {
        existing.lastPlayed = g.datePlayed;
      }
    } else {
      map.set(g.ecoCode, {
        eco: g.ecoCode,
        ecoName: g.eco.name,
        count: 1,
        lastPlayed: g.datePlayed,
      });
    }
  }
  return Array.from(map.values());
}

export function aggregateResults(games: GameData[]) {
  const map = {
    Wins: 0,
    Losses: 0,
    Draws: 0,
  };

  games.forEach((g) => {
    if (g.result === "1-0") map["Wins"]++;
    else if (g.result === "0-1") map["Losses"]++;
    else map["Draws"]++;
  });

  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function aggregateEloTrend(games: GameData[]) {
  const sorted = [...games]
    .filter((g) => g.datePlayed)
    .sort(
      (a, b) =>
        new Date(a.datePlayed!).getTime() - new Date(b.datePlayed!).getTime(),
    );

  return sorted.slice(-10).map((g) => ({
    date: new Date(g.datePlayed!).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
    avgElo: Math.round((g.whiteElo + g.blackElo) / 2),
  }));
}

export function aggregatePlayers(games: GameData[], targetId: number) {
  const map = new Map<
    string,
    { name: string; count: number; lastPlayed: string | null }
  >();
  for (const g of games) {
    const player = g.whiteId === targetId ? g.black : g.white;
    const existing = map.get(player.name);
    if (existing) {
      existing.count++;
      if (
        g.datePlayed &&
        (!existing.lastPlayed || g.datePlayed > existing.lastPlayed)
      ) {
        existing.lastPlayed = g.datePlayed;
      }
    } else {
      map.set(player.name, {
        name: player.name,
        count: 1,
        lastPlayed: g.datePlayed,
      });
    }
  }
  return Array.from(map.values());
}

export function aggregateEndgames(games: GameData[]) {
  const map = new Map<
    string,
    { name: string; count: number; lastPlayed: string | null }
  >();
  for (const g of games) {
    const existing = map.get(g.endgame);
    if (existing) {
      existing.count++;
      if (
        g.datePlayed &&
        (!existing.lastPlayed || g.datePlayed > existing.lastPlayed)
      ) {
        existing.lastPlayed = g.datePlayed;
      }
    } else {
      map.set(g.endgame, {
        name: g.endgame,
        count: 1,
        lastPlayed: g.datePlayed,
      });
    }
  }
  return Array.from(map.values());
}

export function computeResultPercentile(
  games: GameData[],
  targetId: number,
): string {
  if (games.length === 0) return "0.0";
  let wins = 0;
  let draws = 0;
  for (const g of games) {
    const isWhite = g.whiteId === targetId;
    if ((g.result === "1-0" && isWhite) || (g.result === "0-1" && !isWhite))
      wins++;
    else if (g.result === "1/2-1/2" || g.result === "½-½") draws++;
  }
  return (((wins + draws * 0.5) / games.length) * 100).toFixed(1);
}

// Authentication methods
export async function login(credentials: any) {
  const url = `${BACKEND_URL}/auth/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");
  return json;
}

export async function register(formData: FormData) {
  const url = `${BACKEND_URL}/auth/register`;
  const res = await fetch(url, {
    method: "POST",
    body: formData, // FormData will set the correct multipart/form-data header
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json;
}

export async function getProfile(token: string) {
  const url = `${BACKEND_URL}/auth/profile`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch profile");
  return json.data;
}

export async function logout(token: string) {
  const url = `${BACKEND_URL}/auth/logout`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || "Logout failed");
  }
  return true;
}
