import { aggregateEloTrend, aggregateResults, aggregateEco, type GameData } from "@/lib/api";
import {
  Circle,
  Document,
  G,
  Image,
  Line,
  Page,
  Path,
  Polyline,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

// Helvetica is built-in and professional

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#334155", // slate-700
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
  watermark: {
    width: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 15,
    marginBottom: 20,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  siteName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a", // slate-900
  },
  documentTitle: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#64748b", // slate-500
  },
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
  // Table Styles
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    minHeight: 30,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0",
  },
  tableColHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    padding: 5,
  },
  tableCol: {
    padding: 5,
  },
  // Game Analysis Styles
  gameHeader: {
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 5,
  },
  gameId: {
    fontSize: 8,
    color: "#94a3b8",
    fontFamily: "Helvetica-Oblique",
  },
  playerSection: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 25,
  },
  playerCard: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#cbd5e1",
  },
  playerCardBlack: {
    borderLeftColor: "#1e293b",
  },
  playerName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  playerStats: {
    fontSize: 9,
    color: "#64748b",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 25,
  },
  metricBox: {
    width: "30%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    borderRadius: 6,
  },
  metricLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    width: 80,
    fontSize: 9,
    color: "#94a3b8",
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
    fontWeight: "medium",
  },
  openingBox: {
    padding: 15,
    backgroundColor: "#eef2ff",
    borderRadius: 8,
    marginTop: 10,
  },
  openingCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 4,
  },
  openingName: {
    fontSize: 10,
    fontWeight: "bold",
  },
  // Chart Styles
  chartSection: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 30,
    height: 180,
  },
  chartContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chartTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: "center",
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 7,
    color: "#475569",
  },
});

// Helper for Pie Chart Paths
const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    x,
    y,
    "L",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "Z",
  ].join(" ");
};

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const PieChartPDF = ({ games }: { games: GameData[] }) => {
  const resultData = aggregateResults(games).filter((d) => d.value > 0);
  const total = resultData.reduce((acc, d) => acc + d.value, 0);
  const COLORS = ["#10b981", "#f43f5e", "#64748b"]; // Wins, Losses, Draws

  let currentAngle = 0;

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Outcome Distribution</Text>
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
        <Svg width="120" height="120" viewBox="0 0 100 100">
          <G transform="translate(0, 0)">
            {resultData.map((d, i) => {
              const sliceAngle = (d.value / total) * 360;
              const pathData = describeArc(
                50,
                50,
                40,
                currentAngle,
                currentAngle + sliceAngle,
              );
              const color = COLORS[i % COLORS.length];
              currentAngle += sliceAngle;
              return <Path key={i} d={pathData} fill={color} />;
            })}
            {/* Inner circle for donut effect */}
            <Circle cx="50" cy="50" r="25" fill="#f8fafc" />
          </G>
        </Svg>
      </View>
      <View style={styles.chartLegend}>
        {resultData.map((d, i) => (
          <View key={i} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: COLORS[i % COLORS.length] },
              ]}
            />
            <Text style={styles.legendText}>
              {d.name} ({d.value})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const EloTrendPDF = ({ games }: { games: GameData[] }) => {
  const eloTrendData = aggregateEloTrend(games);
  if (eloTrendData.length < 2) return null;

  const minElo = Math.min(...eloTrendData.map((d) => d.avgElo)) - 50;
  const maxElo = Math.max(...eloTrendData.map((d) => d.avgElo)) + 50;
  const range = maxElo - minElo;

  const width = 160;
  const height = 80;
  const padding = 10;

  const points = eloTrendData.map((d, i) => {
    const x = padding + (i * (width - 2 * padding)) / (eloTrendData.length - 1);
    const y =
      height - padding - ((d.avgElo - minElo) / range) * (height - 2 * padding);
    return { x, y, val: d.avgElo, label: d.date };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Elo Performance Trend</Text>
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          <Line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <Line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Trend Line */}
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {points.map((p, i) => (
            <G key={i}>
              <Circle cx={p.x} cy={p.y} r="3" fill="#4f46e5" />
              {/* Tooltip-like labels (too small for full text, maybe just last and first) */}
              {(i === 0 || i === points.length - 1) && (
                <Text
                  x={p.x - 10}
                  y={p.y - 8}
                  style={{ fontSize: 5, fill: "#64748b" }}
                >
                  {p.val}
                </Text>
              )}
            </G>
          ))}
        </Svg>
      </View>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#4f46e5" }]} />
          <Text style={styles.legendText}>
            Avg Match Elo ({eloTrendData.length} games)
          </Text>
        </View>
      </View>
    </View>
  );
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
    <Text>
      Generated on {new Date().toLocaleDateString()} | Pawnder Info Chess
      Research
    </Text>
    <Text
      render={({ pageNumber, totalPages }) =>
        `Page ${pageNumber} of ${totalPages}`
      }
    />
  </View>
);

// Opening Repertoire PDF component
const OpeningRepertoirePDF = ({ games }: { games: GameData[] }) => {
  const ecoData = aggregateEco(games)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (ecoData.length === 0) return null;

  const maxCount = Math.max(...ecoData.map((d) => d.count)) || 1;

  return (
    <View style={[styles.chartContainer, { width: "100%", height: "auto", marginBottom: 20, padding: 12 }]}>
      <Text style={styles.chartTitle}>Opening Repertoire</Text>
      <View style={{ gap: 8, paddingVertical: 4 }}>
        {ecoData.map((item, idx) => {
          const percentage = (item.count / maxCount) * 100;
          return (
            <View key={idx} style={{ flexDirection: "column", gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                {/* ECO Code */}
                <Text style={{ fontSize: 8.5, fontWeight: "bold", color: "#1e293b", width: 35 }}>
                  {item.eco}
                </Text>
                {/* Bar Chart Row */}
                <View style={{ flex: 1, height: 14, backgroundColor: "#f1f5f9", borderRadius: 4, position: "relative", justifyContent: "center" }}>
                  <View
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      backgroundColor: "#818cf8",
                      borderRadius: 4,
                      position: "absolute",
                      left: 0,
                      top: 0,
                    }}
                  />
                  <Text style={{ fontSize: 7.5, fontWeight: "bold", color: percentage > 15 ? "#ffffff" : "#475569", marginLeft: percentage > 15 ? 6 : percentage + 4, zIndex: 1 }}>
                    {item.count} {item.count === 1 ? "game" : "games"}
                  </Text>
                </View>
              </View>
              {/* Full Opening Name */}
              <Text style={{ fontSize: 7, color: "#64748b", marginLeft: 45 }}>
                {item.ecoName}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Home Page PDF Template
export const HomeResultsPDF = ({ games }: { games: GameData[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Watermark />
      <Header title="Search Results Analysis" />

      <View style={styles.chartSection}>
        <PieChartPDF games={games} />
        <EloTrendPDF games={games} />
      </View>

      <OpeningRepertoirePDF games={games} />

      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: "15%" }]}>
            <Text style={styles.tableColHeader}>Date</Text>
          </View>
          <View style={[styles.tableCol, { width: "25%" }]}>
            <Text style={styles.tableColHeader}>Event</Text>
          </View>
          <View style={[styles.tableCol, { width: "30%" }]}>
            <Text style={styles.tableColHeader}>Players</Text>
          </View>
          <View
            style={[styles.tableCol, { width: "10%", textAlign: "center" }]}
          >
            <Text style={styles.tableColHeader}>Result</Text>
          </View>
          <View style={[styles.tableCol, { width: "20%" }]}>
            <Text style={styles.tableColHeader}>Opening</Text>
          </View>
        </View>

        {/* Rows */}
        {games.map((game, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={{ fontSize: 8 }}>
                {game.datePlayed
                  ? new Date(game.datePlayed).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                {game.tournament?.event || "—"}
              </Text>
              <Text style={{ fontSize: 7, color: "#64748b" }}>
                {game.tournament?.place || ""}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "30%" }]}>
              <Text style={{ fontSize: 8 }}>
                W: {game.white.name} ({game.whiteElo})
              </Text>
              <Text style={{ fontSize: 8 }}>
                B: {game.black.name} ({game.blackElo})
              </Text>
            </View>
            <View
              style={[styles.tableCol, { width: "10%", textAlign: "center" }]}
            >
              <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                {game.result}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text
                style={{ fontSize: 8, color: "#4f46e5", fontWeight: "bold" }}
              >
                {game.ecoCode}
              </Text>
              <Text style={{ fontSize: 7 }}>{game.eco.name}</Text>
            </View>
          </View>
        ))}
      </View>

      <Footer />
    </Page>
  </Document>
);

// Game Details PDF Template
export const GameAnalysisPDF = ({ game }: { game: GameData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Watermark />
      <Header title="Forensic Game Analysis" />

      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>Match Performance Report</Text>
        <Text style={styles.gameId}>
          Analysis for Game ID: {game?.id || "N/A"}
        </Text>
      </View>

      <View style={styles.sectionTitle}>
        <Text>Player Comparison</Text>
      </View>
      <View style={styles.playerSection}>
        <View style={styles.playerCard}>
          <Text style={styles.playerName}>
            {game?.white?.name || "Unknown Player"}
          </Text>
          <Text style={styles.playerStats}>
            White | Title: {game?.white?.title || "None"}
          </Text>
          <Text style={styles.playerStats}>
            ELO Rating: {game?.whiteElo || "—"}
          </Text>
        </View>
        <View style={[styles.playerCard, styles.playerCardBlack]}>
          <Text style={styles.playerName}>
            {game?.black?.name || "Unknown Player"}
          </Text>
          <Text style={styles.playerStats}>
            Black | Title: {game?.black?.title || "None"}
          </Text>
          <Text style={styles.playerStats}>
            ELO Rating: {game?.blackElo || "—"}
          </Text>
        </View>
      </View>

      <View style={styles.sectionTitle}>
        <Text>Key Performance Metrics</Text>
      </View>
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Final Result</Text>
          <Text style={styles.metricValue}>
            {game?.result === "1-0"
              ? "White Wins"
              : game?.result === "0-1"
                ? "Black Wins"
                : game?.result === "1/2-1/2" || game?.result === "½-½"
                  ? "Draw"
                  : game?.result || "Unknown"}
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
          <Text style={styles.metricValue}>
            {game?.termination || "Normal"}
          </Text>
        </View>
      </View>

      <View style={styles.sectionTitle}>
        <Text>Event Context</Text>
      </View>
      <View style={{ marginBottom: 20 }}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tournament</Text>
          <Text style={styles.infoValue}>
            {game?.tournament?.event || "N/A"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date Played</Text>
          <Text style={styles.infoValue}>
            {game?.datePlayed
              ? new Date(game.datePlayed).toLocaleDateString(undefined, {
                  dateStyle: "full",
                })
              : "N/A"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>
            {game?.tournament?.place} ({game?.tournament?.federation || "N/A"})
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Round</Text>
          <Text style={styles.infoValue}>{game?.round || "—"}</Text>
        </View>
      </View>

      <View style={styles.sectionTitle}>
        <Text>Opening Theory</Text>
      </View>
      <View style={styles.openingBox}>
        <Text style={styles.openingCode}>{game?.ecoCode || "N/A"}</Text>
        <Text style={styles.openingName}>{game?.eco?.name || "N/A"}</Text>
        {game?.eco && (
          <Text
            style={{
              fontSize: 8,
              color: "#6366f1",
              marginTop: 5,
              fontFamily: "Helvetica-Oblique",
            }}
          >
            Group: {game.eco.group} | Type: {game.eco.type}
          </Text>
        )}
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
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>
          Terms and Conditions of Use
        </Text>

        <Text style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>
          1. Acceptance of Terms: By downloading this PDF document, you agree to
          comply with and be bound by the following terms and conditions of use.
        </Text>

        <Text style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>
          2. Data Accuracy: The information provided in this report is generated
          based on available chess databases. While we strive for accuracy,
          Pawnder Info does not guarantee the completeness or absolute
          correctness of the data.
        </Text>

        <Text style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>
          3. Usage Rights: This document is for personal or research use only.
          Commercial redistribution or modification of this report without
          explicit written consent from Pawnder Info is strictly prohibited.
        </Text>

        <Text style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>
          4. Watermarking: Removing or obscuring the Pawnder Info watermark and
          logo from this document is a violation of these terms.
        </Text>

        <Text style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>
          5. Liability: Pawnder Info shall not be held liable for any decisions
          made based on the analysis provided in this report.
        </Text>

        <Text style={{ fontSize: 10, lineHeight: 1.5, marginTop: 20 }}>
          By clicking "I Agree" in the application interface, you acknowledge
          that you have read, understood, and agree to these terms.
        </Text>
      </View>

      <Footer />
    </Page>
  </Document>
);
