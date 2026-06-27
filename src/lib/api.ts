// @lib/api.ts
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

// On the server (SSR), use the real backend URL from .env since relative URLs don't work.
// On the client (browser), use /proxy-api which Next.js rewrites to the real backend.
function getBackendUrl() {
  if (typeof window === "undefined") {
    // Server-side: use the real backend URL from .env file
    // return process.env.BACKEND_URL || "https://ombekka-backend-ev.onrender.com/api";
    return process.env.BACKEND_URL || "https://api.pawnder.info/api";
    // return process.env.BACKEND_URL || "https://192.168.0.181:3030/api";
  }
  // Client-side: use the proxy path defined in next.config.ts
  // Client-side: use the proxy path defined in next.config.ts
  return process.env.NEXT_PUBLIC_PROXY_URL || "/proxy-api";
}

const BACKEND_URL = getBackendUrl();

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

  const normalizeResult = (res?: string) => {
    if (!res) return "";
    // Normalize unicode fraction ½ to 1/2 and trim
    const r = res.replace(/\u00BD/g, "1/2").trim();
    if (/1\s*[-\/\s]?0/.test(r)) return "1-0";
    if (/0\s*[-\/\s]?1/.test(r)) return "0-1";
    if (r.includes("1/2") || r.includes("draw")) return "1/2-1/2";
    return r;
  };

  games.forEach((g) => {
    const r = normalizeResult(g.result);
    if (r === "1-0") map["Wins"]++;
    else if (r === "0-1") map["Losses"]++;
    else map["Draws"]++;
  });

  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function aggregateEloTrend(games: GameData[]) {
  // Use datePlayed where available, otherwise fall back to tournament.startDate
  const withDates = games
    .map((g) => ({
      ...g,
      _date: g.datePlayed || g.tournament?.startDate || null,
    }))
    .filter((g) => g._date)
    .sort((a, b) => new Date(a._date!).getTime() - new Date(b._date!).getTime());

  return withDates.slice(-10).map((g) => ({
    date: new Date(g._date!).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
    avgElo: Math.round((g.whiteElo + g.blackElo) / 2),
  }));
}

export function aggregateTargetPlayerEloTrend(games: GameData[], targetPlayerName: string) {
  const withDates = [...games]
    .map((g) => ({ ...g, _date: g.datePlayed || g.tournament?.startDate || null }))
    .filter((g) => g._date)
    .sort((a, b) => new Date(a._date!).getTime() - new Date(b._date!).getTime());

  return withDates.map((g) => {
    const isWhite = g.white.name === targetPlayerName;
    return {
      date: new Date(g._date!).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      elo: isWhite ? g.whiteElo : g.blackElo,
    };
  });
}

export function aggregateResultsByColor(games: GameData[], targetPlayerName: string) {
  const white = { Wins: 0, Losses: 0, Draws: 0, total: 0 };
  const black = { Wins: 0, Losses: 0, Draws: 0, total: 0 };

  games.forEach((g) => {
    const isWhite = g.white.name === targetPlayerName;
    if (isWhite) {
      white.total++;
      if (g.result === "1-0") white.Wins++;
      else if (g.result === "0-1") white.Losses++;
      else white.Draws++;
    } else {
      black.total++;
      if (g.result === "0-1") black.Wins++;
      else if (g.result === "1-0") black.Losses++;
      else black.Draws++;
    }
  });

  return { white, black };
}

export function aggregateOpeningGroups(games: GameData[]) {
  const groups = { Flank: 0, Indian: 0, Open: 0, SemiOpen: 0, Closed: 0, Unknown: 0 };
  
  games.forEach(g => {
    const ecoCode = g.ecoCode.toUpperCase();
    if (!ecoCode) groups.Unknown++;
    else if (ecoCode.startsWith("A")) groups.Flank++;
    else if (ecoCode.startsWith("B")) groups.SemiOpen++;
    else if (ecoCode.startsWith("C")) groups.Open++;
    else if (ecoCode.startsWith("D")) groups.Closed++;
    else if (ecoCode.startsWith("E")) groups.Indian++;
    else groups.Unknown++;
  });
  
  return groups;
}

export function aggregateEventsSummary(games: GameData[], targetPlayerName: string) {
  const map = new Map<number, { event: string, date: string | null, wins: number, losses: number, draws: number, total: number }>();
  
  games.forEach(g => {
    const tId = g.tournamentId;
    if (!map.has(tId)) {
      map.set(tId, { event: g.tournament?.event || "Unknown", date: g.datePlayed, wins: 0, losses: 0, draws: 0, total: 0 });
    }
    const t = map.get(tId)!;
    t.total++;
    const isWhite = g.white.name === targetPlayerName;
    if (isWhite) {
      if (g.result === "1-0") t.wins++;
      else if (g.result === "0-1") t.losses++;
      else t.draws++;
    } else {
      if (g.result === "0-1") t.wins++;
      else if (g.result === "1-0") t.losses++;
      else t.draws++;
    }
  });
  
  const sorted = Array.from(map.values()).sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  return sorted.slice(-10); // Last 10 events
}

export function aggregateCountryWinRates(games: GameData[], targetPlayerName: string) {
  const map = new Map<string, { wins: number, draws: number, total: number }>();
  
  games.forEach(g => {
    const fed = g.tournament?.federation || "Unknown";
    if (!map.has(fed)) map.set(fed, { wins: 0, draws: 0, total: 0 });
    
    const c = map.get(fed)!;
    c.total++;
    const isWhite = g.white.name === targetPlayerName;
    if (isWhite) {
      if (g.result === "1-0") c.wins++;
      else if (g.result === "1/2-1/2" || g.result === "½-½") c.draws++;
    } else {
      if (g.result === "0-1") c.wins++;
      else if (g.result === "1/2-1/2" || g.result === "½-½") c.draws++;
    }
  });
  
  return Array.from(map.entries()).map(([country, stats]) => {
    const score = stats.wins + stats.draws * 0.5;
    const winRate = stats.total > 0 ? (score / stats.total) * 100 : 0;
    return { country, winRate, total: stats.total };
  }).sort((a, b) => b.total - a.total);
}

export function aggregateTopOpeningsByColor(games: GameData[], targetPlayerName: string) {
  const whiteMap = new Map<string, { count: number, name: string, wins: number, losses: number, draws: number }>();
  const blackMap = new Map<string, { count: number, name: string, wins: number, losses: number, draws: number }>();
  
  games.forEach(g => {
    const isWhite = g.white.name === targetPlayerName;
    const map = isWhite ? whiteMap : blackMap;
    const code = g.ecoCode;
    
    if (!map.has(code)) map.set(code, { count: 0, name: g.eco.name, wins: 0, losses: 0, draws: 0 });
    const stat = map.get(code)!;
    stat.count++;
    
    if (isWhite) {
      if (g.result === "1-0") stat.wins++;
      else if (g.result === "0-1") stat.losses++;
      else stat.draws++;
    } else {
      if (g.result === "0-1") stat.wins++;
      else if (g.result === "1-0") stat.losses++;
      else stat.draws++;
    }
  });
  
  return {
    white: Array.from(whiteMap.entries()).map(([code, stat]) => ({ code, ...stat })).sort((a, b) => b.count - a.count).slice(0, 5),
    black: Array.from(blackMap.entries()).map(([code, stat]) => ({ code, ...stat })).sort((a, b) => b.count - a.count).slice(0, 5)
  };
}

export function aggregateWinRateForTop10Openings(games: GameData[], targetPlayerName: string) {
  const map = new Map<string, { count: number, wins: number, losses: number, draws: number }>();
  
  games.forEach(g => {
    const code = g.ecoCode;
    if (!map.has(code)) map.set(code, { count: 0, wins: 0, losses: 0, draws: 0 });
    
    const stat = map.get(code)!;
    stat.count++;
    
    const isWhite = g.white.name === targetPlayerName;
    if (isWhite) {
      if (g.result === "1-0") stat.wins++;
      else if (g.result === "0-1") stat.losses++;
      else stat.draws++;
    } else {
      if (g.result === "0-1") stat.wins++;
      else if (g.result === "1-0") stat.losses++;
      else stat.draws++;
    }
  });
  
  return Array.from(map.entries())
    .map(([code, stat]) => ({ code, ...stat }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function aggregateOpponentResults(games: GameData[], targetPlayerName: string) {
  const map = new Map<string, { name: string, fideId: number, count: number, lastPlayed: string | null, wins: number, losses: number, draws: number }>();
  
  games.forEach(g => {
    const isWhite = g.white.name === targetPlayerName;
    const opponent = isWhite ? g.black : g.white;
    const oppName = opponent.name;
    
    if (!map.has(oppName)) {
      map.set(oppName, { name: oppName, fideId: opponent.fideId, count: 0, lastPlayed: null, wins: 0, losses: 0, draws: 0 });
    }
    
    const stat = map.get(oppName)!;
    stat.count++;
    if (g.datePlayed && (!stat.lastPlayed || g.datePlayed > stat.lastPlayed)) stat.lastPlayed = g.datePlayed;
    
    if (isWhite) {
      if (g.result === "1-0") stat.wins++;
      else if (g.result === "0-1") stat.losses++;
      else stat.draws++;
    } else {
      if (g.result === "0-1") stat.wins++;
      else if (g.result === "1-0") stat.losses++;
      else stat.draws++;
    }
  });
  
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
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

export async function register(userData: any) {
  const url = `${BACKEND_URL}/auth/register`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
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

// User CRUD operations
export async function fetchUsers(token: string) {
  const url = `${BACKEND_URL}/users`; // Assuming /users for listing
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch users");
  return json.data;
}

export async function createUser(token: string, userData: any) {
  // We can use the same register logic but with admin token if required
  return register(userData);
}

export async function updateUser(token: string, userId: string, userData: any) {
  const url = `${BACKEND_URL}/users/${userId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Update failed");
  return json.data;
}

export async function deleteUser(token: string, userId: string) {
  const url = `${BACKEND_URL}/users/${userId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || "Delete failed");
  }
  return true;
}

// EULA
export async function fetchEula(token: string) {
  const url = `${BACKEND_URL}/eula`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch EULA");

  // Handle specific structure: json.data.data[0].eulaFileString
  let eulaData = null;

  if (json.data && Array.isArray(json.data.data)) {
    eulaData = json.data.data[0]?.eulaFileString;
  } else if (Array.isArray(json.data)) {
    eulaData = json.data[0]?.eulaFileString;
  } else if (json.data?.eulaFileString) {
    eulaData = json.data.eulaFileString;
  } else if (json.eulaFileString) {
    eulaData = json.eulaFileString;
  }

  return eulaData;
}

export async function uploadEula(token: string, base64Data: string) {
  const url = `${BACKEND_URL}/eula`;
  const res = await fetch(url, {
    method: "POST", // Assuming POST for creation/update
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ eulaFileString: base64Data }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Upload failed");
  return json.data;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: string;
    links: {
      href: string;
      rel: string;
      method: string;
    }[];
  };
}

export interface CaptureOrderResponse {
  success: boolean;
  message: string;
  data: {
    captureData: any;
    paymentRecord: any;
  };
}

export async function createPaypalOrder(): Promise<CreateOrderResponse> {
  const url = `${BACKEND_URL}/payments/create-order`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create order");
  return json;
}

export async function capturePaypalOrder(
  orderId: string,
): Promise<CaptureOrderResponse> {
  const url = `${BACKEND_URL}/payments/capture-order`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to capture payment");
  return json;
}


// File upload imports
export async function importEcoFile(token: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = `${BACKEND_URL}/import/eco`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'ECO import failed');
  return json;
}

export async function importPlayersFile(token: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = `${BACKEND_URL}/import/players`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Players import failed');
  return json;
}

export async function importTournamentsFile(token: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = `${BACKEND_URL}/import/tournaments`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Tournaments import failed');
  return json;
}

export async function importGamesFile(token: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = `${BACKEND_URL}/import/games`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Games import failed');
  return json;
}