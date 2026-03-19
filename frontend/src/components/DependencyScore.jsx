export default function DependencyScore({ data }) {
  const color =
    data.dependency_score >= 60 ? "#ef4444" :
    data.dependency_score >= 40 ? "#f97316" :
    data.dependency_score >= 20 ? "#eab308" : "#22c55e";

  return (
    <div style={styles.card}>
      <div style={styles.left}>
        <h2 style={styles.title}>⚡ Virat Dependency Score</h2>
        <p style={styles.desc}>
          Difference in RCB's win probability when Virat fires vs when he fails.
          Higher score = RCB more dependent on Virat.
        </p>
        <div style={styles.interpretation}>{data.interpretation}</div>

        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: "#22c55e" }}>{data.win_prob_virat_fires}%</div>
            <div style={styles.statLabel}>Win % when Virat scores 60+</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: "#ef4444" }}>{data.win_prob_virat_fails}%</div>
            <div style={styles.statLabel}>Win % when Virat scores under 10</div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={{ ...styles.scoreMeter, borderColor: color }}>
          <div style={{ ...styles.scoreNumber, color }}>{data.dependency_score}</div>
          <div style={styles.scoreLabel}>out of 100</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 16, padding: 28, display: "flex", gap: 32, alignItems: "center" },
  left: { flex: 1 },
  right: { display: "flex", alignItems: "center", justifyContent: "center" },
  title: { margin: "0 0 8px", fontSize: 22, fontWeight: 800 },
  desc: { margin: "0 0 16px", color: "#9ca3af", fontSize: 14, lineHeight: 1.6 },
  interpretation: { fontSize: 16, fontWeight: 600, marginBottom: 24 },
  statsRow: { display: "flex", gap: 20 },
  statBox: { background: "#0f0f13", border: "1px solid #2d2d44", borderRadius: 10, padding: "14px 20px" },
  statValue: { fontSize: 28, fontWeight: 800 },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  scoreMeter: { width: 160, height: 160, borderRadius: "50%", border: "6px solid", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  scoreNumber: { fontSize: 52, fontWeight: 900, lineHeight: 1 },
  scoreLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },
};