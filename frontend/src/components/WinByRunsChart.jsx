import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

export default function WinByRunsChart({ data }) {
  return (
    <div className="card">
      <h3 className="card-title">📊 Win Rate by Virat's Runs</h3>
      <p className="card-sub">RCB win % based on how many runs Virat scored</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
          <XAxis dataKey="run_category" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} unit="%" domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 8 }}
            formatter={(v) => [`${v}%`, "Win Rate"]}
            labelFormatter={(l) => `Runs: ${l}`}
          />
          <Bar dataKey="win_rate" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="card-footer">
        {data.map((d, i) => (
          <div key={i} className="card-tag">
            <span style={{ color: COLORS[i] }}>●</span> {d.run_category}: {d.matches} matches
          </div>
        ))}
      </div>
    </div>
  );
}