import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SeasonTrendChart({ data }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>📈 Season Trend — Virat Average vs RCB Win Rate</h3>
      <p style={styles.sub}>How Virat's performance across seasons correlates with RCB's success</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
          <XAxis dataKey="season" stroke="#6b7280" fontSize={12} />
          <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
          <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} unit="%" />
          <Tooltip
            contentStyle={{ background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 8 }}
            formatter={(v, n) => n === "virat_avg" ? [`${v} runs`, "Virat Avg"] : [`${v}%`, "RCB Win Rate"]}
          />
          <Legend
            formatter={(v) => v === "virat_avg" ? "Virat Avg Runs" : "RCB Win Rate %"}
            wrapperStyle={{ color: "#9ca3af", fontSize: 13 }}
          />
          <Line yAxisId="left" type="monotone" dataKey="virat_avg" stroke="#f97316" strokeWidth={3} dot={{ fill: "#f97316", r: 5 }} />
          <Line yAxisId="right" type="monotone" dataKey="rcb_win_rate" stroke="#dc2626" strokeWidth={3} dot={{ fill: "#dc2626", r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
      <div style={styles.insight}>
        💡 <strong>Key Insight:</strong> 2016 was Virat's best season ever (avg 60.8) yet RCB still couldn't win the IPL trophy — the ultimate proof of team dependency.
      </div>
    </div>
  );
}

const styles = {
  card: { background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 16, padding: 24 },
  title: { margin: "0 0 4px", fontSize: 17, fontWeight: 700 },
  sub: { margin: "0 0 20px", color: "#9ca3af", fontSize: 13 },
  insight: { marginTop: 16, background: "#0f0f13", border: "1px solid #2d2d44", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#9ca3af", lineHeight: 1.6 },
};