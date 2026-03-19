import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#6366f1"];

export default function WinByOverChart({ data }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🎯 Win Rate by Over Virat Got Out</h3>
      <p style={styles.sub}>RCB win % based on which over Virat was dismissed</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
          <XAxis dataKey="over_category" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} unit="%" domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 8 }}
            formatter={(v) => [`${v}%`, "Win Rate"]}
            labelFormatter={(l) => `Over: ${l}`}
          />
          <Bar dataKey="win_rate" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={styles.footer}>
        {data.map((d, i) => (
          <div key={i} style={styles.tag}>
            <span style={{ color: COLORS[i] }}>●</span> Over {d.over_category}: {d.matches} matches
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: { background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 16, padding: 24 },
  title: { margin: "0 0 4px", fontSize: 17, fontWeight: 700 },
  sub: { margin: "0 0 20px", color: "#9ca3af", fontSize: 13 },
  footer: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 },
  tag: { fontSize: 12, color: "#6b7280" },
};