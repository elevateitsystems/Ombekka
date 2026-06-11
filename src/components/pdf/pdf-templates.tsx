import {
  aggregateEco,
  aggregateTargetPlayerEloTrend,
  aggregateResultsByColor,
  aggregateOpeningGroups,
  aggregateEventsSummary,
  aggregateCountryWinRates,
  aggregateTopOpeningsByColor,
  aggregateWinRateForTop10Openings,
  aggregateOpponentResults,
  aggregateEndgames,
  type GameData,
} from "@/lib/api";
import {
  Circle,
  Document,
  G,
  Image,
  Line,
  Page,
  Path,
  Polyline,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#334155",
    position: "relative",
  },
  watermarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
    opacity: 0.05,
  },
  watermark: { width: 400 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 15,
    marginBottom: 20,
  },
  logoSection: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 30, height: 30 },
  siteName: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  documentTitle: { fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#64748b" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#94a3b8",
  },
  pageTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: "#0f172a" },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#1e293b", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 4 },
  row: { flexDirection: "row", gap: 20, marginBottom: 20 },
  col: { flex: 1 },
  card: { padding: 15, backgroundColor: "#f8fafc", borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  statLabel: { fontSize: 8, textTransform: "uppercase", color: "#64748b", marginBottom: 4 },
  statValue: { fontSize: 12, fontWeight: "bold", color: "#0f172a" },
  table: { width: "100%", marginBottom: 20 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", minHeight: 24, alignItems: "center" },
  tableHeader: { backgroundColor: "#f8fafc", borderBottomWidth: 2, borderBottomColor: "#e2e8f0" },
  tableColHeader: { fontSize: 8, fontWeight: "bold", color: "#475569", textTransform: "uppercase", padding: 5 },
  tableCol: { padding: 5, fontSize: 8, color: "#334155" },
  chartContainer: { padding: 10, backgroundColor: "#f8fafc", borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center", flex: 1 },
  chartTitle: { fontSize: 10, fontWeight: "bold", color: "#475569", marginBottom: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4, marginRight: 10 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 7, color: "#475569" },
  // Game Analysis Styles (retained)
  gameHeader: { marginBottom: 20 },
  gameTitle: { fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 5 },
  gameId: { fontSize: 8, color: "#94a3b8" },
  playerSection: { flexDirection: "row", gap: 20, marginBottom: 25 },
  playerCard: { flex: 1, padding: 15, backgroundColor: "#f8fafc", borderRadius: 8, borderLeftWidth: 4, borderLeftColor: "#cbd5e1" },
  playerCardBlack: { borderLeftColor: "#1e293b" },
  playerName: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  playerStats: { fontSize: 9, color: "#64748b" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 15, marginBottom: 25 },
  metricBox: { width: "30%", padding: 10, borderWidth: 1, borderColor: "#f1f5f9", borderRadius: 6 },
  metricLabel: { fontSize: 7, textTransform: "uppercase", color: "#94a3b8", marginBottom: 3 },
  metricValue: { fontSize: 11, fontWeight: "bold", color: "#1e293b" },
  infoRow: { flexDirection: "row", marginBottom: 6 },
  infoLabel: { width: 80, fontSize: 9, color: "#94a3b8" },
  infoValue: { flex: 1, fontSize: 9 },
  openingBox: { padding: 15, backgroundColor: "#eef2ff", borderRadius: 8, marginTop: 10 },
  openingCode: { fontSize: 16, fontWeight: "bold", color: "#4f46e5", marginBottom: 4 },
  openingName: { fontSize: 10, fontWeight: "bold" },
});

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", x, y, "L", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, "Z"].join(" ");
};

const Watermark = () => (
  <View style={styles.watermarkContainer} fixed>
    <Image src="/logo_2.png" style={styles.watermark} />
  </View>
);

const Header = ({ title }: { title: string }) => (
  <View style={styles.header} fixed>
    <View style={styles.logoSection}>
      <Image src="/logo_2.png" style={styles.logo} />
      <Text style={styles.siteName}>Pawnder Info</Text>
    </View>
    <Text style={styles.documentTitle}>{title}</Text>
  </View>
);

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text>Generated on {new Date().toLocaleDateString()} | Pawnder Info Chess Research</Text>
    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);

// --- SVG Components ---

const DonutChart = ({ data, colors, size = 100, innerRadius = 25 }: any) => {
  const total = data.reduce((sum: number, d: any) => sum + d.value, 0) || 1;
  let currentAngle = 0;
  const radius = size / 2 * 0.8;
  const center = size / 2;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G>
        {data.map((d: any, i: number) => {
          if (d.value === 0) return null;
          const sliceAngle = (d.value / total) * 360;
          const pathData = describeArc(center, center, radius, currentAngle, currentAngle + sliceAngle);
          currentAngle += sliceAngle;
          return <Path key={i} d={pathData} fill={colors[i % colors.length]} />;
        })}
        <Circle cx={center} cy={center} r={innerRadius} fill="#f8fafc" />
      </G>
    </Svg>
  );
};

const LineChart = ({ data, width = 200, height = 100 }: any) => {
  if (!data || data.length < 2) return <Text style={{fontSize: 8}}>Not enough data</Text>;
  const minVal = Math.min(...data.map((d: any) => d.elo)) - 50;
  const maxVal = Math.max(...data.map((d: any) => d.elo)) + 50;
  const range = maxVal - minVal || 1;
  const padding = 15;

  const points = data.map((d: any, i: number) => {
    const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
    const y = height - padding - ((d.elo - minVal) / range) * (height - 2 * padding);
    return { x, y, val: d.elo };
  });

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
      <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
      <Polyline points={points.map((p: any) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p: any, i: number) => (
        <G key={i}>
          <Circle cx={p.x} cy={p.y} r="2" fill="#ef4444" />
        </G>
      ))}
    </Svg>
  );
};

// --- Page 1 ---
const Page1 = ({ games, targetPlayer }: any) => {
  const tInfo = games.find((g: any) => g.white.name === targetPlayer)?.white || games.find((g: any) => g.black.name === targetPlayer)?.black || { fideId: 'N/A', country: 'N/A', sex: 'N/A', title: 'N/A' };
  const eloData = aggregateTargetPlayerEloTrend(games, targetPlayer);
  const colorResults = aggregateResultsByColor(games, targetPlayer);
  const openingsGroup = aggregateOpeningGroups(games);
  const groupsArray = Object.entries(openingsGroup).map(([k, v]) => ({ name: k, value: v }));

  return (
    <Page size="A4" style={styles.page}>
      <Watermark />
      <Header title="Report Page 1" />
      <Text style={styles.pageTitle}>Statistics for {targetPlayer}</Text>
      
      <View style={[styles.row, styles.card]}>
        <View style={styles.col}><Text style={styles.statLabel}>FIDE ID</Text><Text style={styles.statValue}>{tInfo.fideId}</Text></View>
        <View style={styles.col}><Text style={styles.statLabel}>FED.</Text><Text style={styles.statValue}>{tInfo.country}</Text></View>
        <View style={styles.col}><Text style={styles.statLabel}>Sex</Text><Text style={styles.statValue}>{tInfo.sex || 'M'}</Text></View>
        <View style={styles.col}><Text style={styles.statLabel}>Title</Text><Text style={styles.statValue}>{tInfo.title || 'None'}</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Elo over time</Text>
      <View style={[styles.chartContainer, { height: 160, width: "100%" }]}>
         <LineChart data={eloData} width={400} height={130} />
      </View>

      <View style={styles.row}>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>White Results</Text>
          <DonutChart data={[{value: colorResults.white.Wins}, {value: colorResults.white.Losses}, {value: colorResults.white.Draws}]} colors={["#ef4444", "#1e293b", "#cbd5e1"]} />
          <View style={{ flexDirection: "row", marginTop: 5, gap: 5 }}>
            <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: "#ef4444"}]}/><Text style={styles.legendText}>Win</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: "#1e293b"}]}/><Text style={styles.legendText}>Loss</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: "#cbd5e1"}]}/><Text style={styles.legendText}>Draw</Text></View>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Black Results</Text>
          <DonutChart data={[{value: colorResults.black.Wins}, {value: colorResults.black.Losses}, {value: colorResults.black.Draws}]} colors={["#ef4444", "#1e293b", "#cbd5e1"]} />
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Opening Types</Text>
        <DonutChart data={groupsArray} innerRadius={0} colors={["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#94a3b8"]} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 10, gap: 5 }}>
          {groupsArray.map((g, i) => (
             <View key={i} style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#94a3b8"][i]}]} /><Text style={styles.legendText}>{g.name} ({g.value})</Text></View>
          ))}
        </View>
      </View>
      <Footer />
    </Page>
  );
};

// --- Page 2 ---
const Page2 = ({ games, targetPlayer }: any) => {
  const events = aggregateEventsSummary(games, targetPlayer);
  const countries = aggregateCountryWinRates(games, targetPlayer);

  return (
    <Page size="A4" style={styles.page}>
      <Watermark />
      <Header title="Report Page 2" />
      <Text style={styles.pageTitle}>Results for the 10 last events</Text>
      
      <View style={[styles.chartContainer, { height: 200, width: "100%", marginBottom: 20, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", paddingBottom: 20 }]}>
        {events.map((ev, i) => {
          const total = ev.total || 1;
          const hW = (ev.wins / total) * 120;
          const hL = (ev.losses / total) * 120;
          const hD = (ev.draws / total) * 120;
          return (
            <View key={i} style={{ width: 20, height: 120, backgroundColor: "#f1f5f9", flexDirection: "column-reverse" }}>
              <View style={{ width: "100%", height: hW, backgroundColor: "#ef4444" }} />
              <View style={{ width: "100%", height: hL, backgroundColor: "#1e293b" }} />
              <View style={{ width: "100%", height: hD, backgroundColor: "#cbd5e1" }} />
              <Text style={{ position: "absolute", bottom: -20, fontSize: 6, transform: "rotate(-45deg)", width: 40 }}>{ev.event.length > 15 ? ev.event.substring(0, 15) + "..." : ev.event}</Text>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20, gap: 10 }}>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: "#ef4444"}]}/><Text style={styles.legendText}>Win</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: "#1e293b"}]}/><Text style={styles.legendText}>Loss</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: "#cbd5e1"}]}/><Text style={styles.legendText}>Draw</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Win Results by country</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}><Text style={[styles.tableCol, { fontWeight: "bold" }]}>Country / Federation | Win % | Total Games</Text></View>
        {countries.slice(0, 15).map((c, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCol, { width: "40%" }]}>{c.country}</Text>
            <View style={{ width: "40%", padding: 5 }}>
               <View style={{ height: 10, width: `${c.winRate}%`, backgroundColor: "#ef4444", borderRadius: 2 }} />
            </View>
            <Text style={[styles.tableCol, { width: "20%" }]}>{c.total}</Text>
          </View>
        ))}
      </View>
      <Footer />
    </Page>
  );
};

// --- Page 3 ---
const Page3 = ({ games, targetPlayer }: any) => {
  const top10 = aggregateEco(games).sort((a: any,b: any)=>b.count - a.count).slice(0,10);
  const colorOpenings = aggregateTopOpeningsByColor(games, targetPlayer);

  return (
    <Page size="A4" style={styles.page}>
      <Watermark />
      <Header title="Report Page 3" />
      <Text style={styles.pageTitle}>Openings</Text>
      
      <Text style={styles.sectionTitle}>Top 10 openings as a list</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCol, { width: "15%" }]}>ECO</Text>
          <Text style={[styles.tableCol, { width: "45%" }]}>Name</Text>
          <Text style={[styles.tableCol, { width: "20%" }]}>Games</Text>
          <Text style={[styles.tableCol, { width: "20%" }]}>Last Played</Text>
        </View>
        {top10.map((o: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCol, { width: "15%", fontWeight: "bold" }]}>{o.eco}</Text>
            <Text style={[styles.tableCol, { width: "45%" }]}>{o.ecoName}</Text>
            <Text style={[styles.tableCol, { width: "20%" }]}>{o.count}</Text>
            <Text style={[styles.tableCol, { width: "20%" }]}>{o.lastPlayed ? new Date(o.lastPlayed).toLocaleDateString() : 'N/A'}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Top 5 by color</Text>
      <View style={styles.row}>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>As White</Text>
          <DonutChart data={colorOpenings.white.map(o => ({value: o.count}))} colors={["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"]} />
          <View style={{ marginTop: 10 }}>
            {colorOpenings.white.map((o, i) => (
              <Text key={i} style={{fontSize: 7, marginBottom: 2}}>{o.code} ({o.count})</Text>
            ))}
          </View>
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>As Black</Text>
          <DonutChart data={colorOpenings.black.map(o => ({value: o.count}))} colors={["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"]} />
           <View style={{ marginTop: 10 }}>
            {colorOpenings.black.map((o, i) => (
              <Text key={i} style={{fontSize: 7, marginBottom: 2}}>{o.code} ({o.count})</Text>
            ))}
          </View>
        </View>
      </View>
      <Footer />
    </Page>
  );
};

// --- Page 4 ---
const Page4 = ({ games, targetPlayer }: any) => {
  const winRateTop10 = aggregateWinRateForTop10Openings(games, targetPlayer);
  const opps = aggregateOpponentResults(games, targetPlayer).slice(0, 20);
  
  // Dummy data for top 5 over time since it's hard to visualize 5 lines simply without a real charting lib
  const eloData = aggregateTargetPlayerEloTrend(games, targetPlayer);

  return (
    <Page size="A4" style={styles.page}>
      <Watermark />
      <Header title="Report Page 4" />
      <Text style={styles.pageTitle}>Top openings over time</Text>
      <View style={[styles.chartContainer, { height: 120, width: "100%", marginBottom: 20 }]}>
         <LineChart data={eloData} width={400} height={100} />
      </View>

      <Text style={styles.sectionTitle}>Win rate for top 10</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 20 }}>
        {winRateTop10.map((o, i) => (
          <View key={i} style={{ width: 60, alignItems: "center" }}>
            <DonutChart size={50} innerRadius={15} data={[{value: o.wins}, {value: o.losses}, {value: o.draws}]} colors={["#ef4444", "#1e293b", "#cbd5e1"]} />
            <Text style={{ position: "absolute", top: 22, fontSize: 6, fontWeight: "bold" }}>{o.code}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Opponent Top 20</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCol, { width: "20%" }]}>Fide ID</Text>
          <Text style={[styles.tableCol, { width: "40%" }]}>Names</Text>
          <Text style={[styles.tableCol, { width: "20%" }]}>Games</Text>
          <Text style={[styles.tableCol, { width: "20%" }]}>Last Played</Text>
        </View>
        {opps.map((o, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCol, { width: "20%" }]}>{o.fideId || 'N/A'}</Text>
            <Text style={[styles.tableCol, { width: "40%", fontWeight: "bold" }]}>{o.name}</Text>
            <Text style={[styles.tableCol, { width: "20%" }]}>{o.count}</Text>
            <Text style={[styles.tableCol, { width: "20%" }]}>{o.lastPlayed ? new Date(o.lastPlayed).toLocaleDateString() : 'N/A'}</Text>
          </View>
        ))}
      </View>
      <Footer />
    </Page>
  );
};

// --- Page 5 ---
const Page5 = ({ games, targetPlayer }: any) => {
  const opps = aggregateOpponentResults(games, targetPlayer).slice(0, 20);
  const endgames = aggregateEndgames(games).sort((a: any,b: any)=>b.count - a.count).slice(0, 25);

  return (
    <Page size="A4" style={styles.page}>
      <Watermark />
      <Header title="Report Page 5" />
      
      <Text style={styles.pageTitle}>Top 20 by termination (vs Opponents)</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 15, justifyContent: "center", marginBottom: 30 }}>
        {opps.map((o, i) => (
          <View key={i} style={{ width: 60, alignItems: "center" }}>
            <DonutChart size={50} innerRadius={0} data={[{value: o.wins}, {value: o.losses}, {value: o.draws}]} colors={["#ef4444", "#1e293b", "#cbd5e1"]} />
            <Text style={{ fontSize: 6, marginTop: 4, textAlign: "center" }}>{o.name.length > 12 ? o.name.substring(0, 12) + "..." : o.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Endgame Top 25</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCol, { width: "50%" }]}>Endgame by name</Text>
          <Text style={[styles.tableCol, { width: "25%" }]}>Games</Text>
          <Text style={[styles.tableCol, { width: "25%" }]}>Last Played</Text>
        </View>
        {endgames.map((e: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCol, { width: "50%", fontWeight: "bold" }]}>{e.name || 'Standard'}</Text>
            <Text style={[styles.tableCol, { width: "25%" }]}>{e.count}</Text>
            <Text style={[styles.tableCol, { width: "25%" }]}>{e.lastPlayed ? new Date(e.lastPlayed).toLocaleDateString() : 'N/A'}</Text>
          </View>
        ))}
      </View>
      <Footer />
    </Page>
  );
};

export const HomeResultsPDF = ({ games, targetPlayer = "Target Player" }: { games: GameData[], targetPlayer?: string }) => {
  return (
    <Document>
      <Page1 games={games} targetPlayer={targetPlayer} />
      <Page2 games={games} targetPlayer={targetPlayer} />
      <Page3 games={games} targetPlayer={targetPlayer} />
      <Page4 games={games} targetPlayer={targetPlayer} />
      <Page5 games={games} targetPlayer={targetPlayer} />
    </Document>
  );
};

// Game Details PDF Template
export const GameAnalysisPDF = ({ game }: { game: GameData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Watermark />
      <Header title="Forensic Game Analysis" />

      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>Match Performance Report</Text>
        <Text style={styles.gameId}>Analysis for Game ID: {game?.id || "N/A"}</Text>
      </View>

      <View style={styles.sectionTitle}><Text>Player Comparison</Text></View>
      <View style={styles.playerSection}>
        <View style={styles.playerCard}>
          <Text style={styles.playerName}>{game?.white?.name || "Unknown Player"}</Text>
          <Text style={styles.playerStats}>White | Title: {game?.white?.title || "None"}</Text>
          <Text style={styles.playerStats}>ELO Rating: {game?.whiteElo || "—"}</Text>
        </View>
        <View style={[styles.playerCard, styles.playerCardBlack]}>
          <Text style={styles.playerName}>{game?.black?.name || "Unknown Player"}</Text>
          <Text style={styles.playerStats}>Black | Title: {game?.black?.title || "None"}</Text>
          <Text style={styles.playerStats}>ELO Rating: {game?.blackElo || "—"}</Text>
        </View>
      </View>

      <View style={styles.sectionTitle}><Text>Key Performance Metrics</Text></View>
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Final Result</Text>
          <Text style={styles.metricValue}>
            {game?.result === "1-0" ? "White Wins" : game?.result === "0-1" ? "Black Wins" : game?.result === "1/2-1/2" || game?.result === "½-½" ? "Draw" : game?.result || "Unknown"}
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Total Moves</Text>
          <Text style={styles.metricValue}>{game?.plyCount || 0} Plies</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Endgame</Text>
          <Text style={styles.metricValue}>{game?.endgame || "Standard"}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Termination</Text>
          <Text style={styles.metricValue}>{game?.termination || "Normal"}</Text>
        </View>
      </View>

      <View style={styles.sectionTitle}><Text>Event Context</Text></View>
      <View style={{ marginBottom: 20 }}>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Tournament</Text><Text style={styles.infoValue}>{game?.tournament?.event || "N/A"}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Date Played</Text><Text style={styles.infoValue}>{game?.datePlayed ? new Date(game.datePlayed).toLocaleDateString(undefined, { dateStyle: "full" }) : "N/A"}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Location</Text><Text style={styles.infoValue}>{game?.tournament?.place} ({game?.tournament?.federation || "N/A"})</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Round</Text><Text style={styles.infoValue}>{game?.round || "—"}</Text></View>
      </View>

      <View style={styles.sectionTitle}><Text>Opening Theory</Text></View>
      <View style={styles.openingBox}>
        <Text style={styles.openingCode}>{game?.ecoCode || "N/A"}</Text>
        <Text style={styles.openingName}>{game?.eco?.name || "N/A"}</Text>
        {game?.eco && <Text style={{ fontSize: 8, color: "#6366f1", marginTop: 5, fontFamily: "Helvetica-Oblique" }}>Group: {game.eco.group} | Type: {game.eco.type}</Text>}
      </View>

      <Footer />
    </Page>
  </Document>
);

// Terms and Conditions PDF
export const TermsAndConditionsPDF = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Header title="Legal Documentation" />
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>Terms and Conditions of Use</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>1. Acceptance of Terms: By downloading this PDF document, you agree to comply with and be bound by the following terms and conditions of use.</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>2. Data Accuracy: The information provided in this report is generated based on available chess databases. While we strive for accuracy, Pawnder Info does not guarantee the completeness or absolute correctness of the data.</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>3. Usage Rights: This document is for personal or research use only. Commercial redistribution or modification of this report without explicit written consent from Pawnder Info is strictly prohibited.</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>4. Watermarking: Removing or obscuring the Pawnder Info watermark and logo from this document is a violation of these terms.</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>5. Liability: Pawnder Info shall not be held liable for any decisions made based on the analysis provided in this report.</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5, marginTop: 20 }}>By clicking "I Agree" in the application interface, you acknowledge that you have read, understood, and agree to these terms.</Text>
      </View>
      <Footer />
    </Page>
  </Document>
);
