import { useState, useEffect } from "react";
import axios from "axios";
import DependencyScore from "./components/DependencyScore";
import WinByRunsChart from "./components/WinByRunsChart";
import WinByOverChart from "./components/WinByOverChart";
import SeasonTrendChart from "./components/SeasonTrendChart";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [dependencyData, setDependencyData] = useState(null);
  const [winByRuns, setWinByRuns] = useState([]);
  const [winByOver, setWinByOver] = useState([]);
  const [seasonTrend, setSeasonTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Predict form state ───────────────────────────────────────────────────
  const [form, setForm] = useState({
    virat_runs: "",
    virat_balls: "",
    virat_out_over: "",
    virat_dismissed: 0,
    rcb_batting_first: 1,
    opposition: "Mumbai Indians",
  });
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [oppositions, setOppositions] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dep, runs, over, season, opp] = await Promise.all([
          axios.get(`${API}/dependency-score`),
          axios.get(`${API}/win-by-runs`),
          axios.get(`${API}/win-by-over`),
          axios.get(`${API}/season-trend`),
          axios.get(`${API}/oppositions`),
        ]);
        setDependencyData(dep.data);
        setWinByRuns(runs.data);
        setWinByOver(over.data);
        setSeasonTrend(season.data);
        setOppositions(opp.data.teams);
      } catch (e) {
        console.error("API error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const res = await axios.post(`${API}/predict`, {
        virat_runs: parseFloat(form.virat_runs),
        virat_balls: parseFloat(form.virat_balls),
        virat_out_over: parseFloat(form.virat_out_over),
        virat_dismissed: parseInt(form.virat_dismissed),
        rcb_batting_first: parseInt(form.rcb_batting_first),
        opposition: form.opposition,
      });
      setPrediction(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setPredicting(false);
    }
  };

  if (loading) return (
    <div style={styles.loader}>
      <div style={styles.loaderText}>🏏 Loading Virat Dependency Index...</div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>🏏</div>
          <div>
            <h1 style={styles.title}>Virat Dependency Index</h1>
            <p style={styles.subtitle}>How much does RCB rely on Virat Kohli? — ML powered analysis (2008–2019)</p>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* ── Dependency Score ── */}
        {dependencyData && <DependencyScore data={dependencyData} />}

        {/* ── Charts Grid ── */}
        <div style={styles.grid}>
          <WinByRunsChart data={winByRuns} />
          <WinByOverChart data={winByOver} />
        </div>
        <SeasonTrendChart data={seasonTrend} />

        {/* ── Predict Section ── */}
        <div style={styles.predictCard}>
          <h2 style={styles.cardTitle}>🎯 Live Match Predictor</h2>
          <p style={styles.cardSubtitle}>Enter Virat's stats from any match and predict if RCB wins</p>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Virat's Runs</label>
              <input
                style={styles.input}
                type="number"
                placeholder="e.g. 45"
                value={form.virat_runs}
                onChange={e => setForm({ ...form, virat_runs: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Balls Faced</label>
              <input
                style={styles.input}
                type="number"
                placeholder="e.g. 32"
                value={form.virat_balls}
                onChange={e => setForm({ ...form, virat_balls: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Over He Got Out</label>
              <input
                style={styles.input}
                type="number"
                placeholder="e.g. 8 (25 = not out)"
                value={form.virat_out_over}
                onChange={e => setForm({ ...form, virat_out_over: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Was Virat Dismissed?</label>
              <select
                style={styles.input}
                value={form.virat_dismissed}
                onChange={e => setForm({ ...form, virat_dismissed: e.target.value })}
              >
                <option value={1}>Yes</option>
                <option value={0}>No (Not Out)</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>RCB Batting</label>
              <select
                style={styles.input}
                value={form.rcb_batting_first}
                onChange={e => setForm({ ...form, rcb_batting_first: e.target.value })}
              >
                <option value={1}>First</option>
                <option value={0}>Second</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Opposition</label>
              <select
                style={styles.input}
                value={form.opposition}
                onChange={e => setForm({ ...form, opposition: e.target.value })}
              >
                {oppositions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            style={predicting ? styles.btnDisabled : styles.btn}
            onClick={handlePredict}
            disabled={predicting}
          >
            {predicting ? "Predicting..." : "⚡ Predict Outcome"}
          </button>

          {prediction && (
            <div style={{
              ...styles.predictionResult,
              borderColor: prediction.rcb_wins ? "#22c55e" : "#ef4444"
            }}>
              <div style={styles.predictionVerdict}>{prediction.verdict}</div>
              <div style={styles.predictionProb}>
                Win Probability: <strong>{prediction.win_probability}%</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0f0f13", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" },
  loader: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f13" },
  loaderText: { color: "#e2e8f0", fontSize: 20 },
  header: { background: "#1a1a2e", borderBottom: "1px solid #2d2d44", padding: "20px 32px" },
  headerInner: { maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 },
  logo: { fontSize: 40 },
  title: { margin: 0, fontSize: 28, fontWeight: 800, color: "#fff" },
  subtitle: { margin: "4px 0 0", color: "#9ca3af", fontSize: 14 },
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 28 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  predictCard: { background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 16, padding: 28 },
  cardTitle: { margin: "0 0 6px", fontSize: 20, fontWeight: 700 },
  cardSubtitle: { margin: "0 0 24px", color: "#9ca3af", fontSize: 14 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { background: "#0f0f13", border: "1px solid #2d2d44", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 14, outline: "none" },
  btn: { padding: "12px 28px", background: "linear-gradient(135deg, #dc2626, #b91c1c)", border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  btnDisabled: { padding: "12px 28px", background: "#374151", border: "none", borderRadius: 8, color: "#9ca3af", fontSize: 15, fontWeight: 700, cursor: "not-allowed" },
  predictionResult: { marginTop: 20, background: "#0f0f13", border: "2px solid", borderRadius: 12, padding: 20, textAlign: "center" },
  predictionVerdict: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  predictionProb: { fontSize: 16, color: "#9ca3af" },
};