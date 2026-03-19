import { useState, useEffect } from "react";
import axios from "axios";
import DependencyScore from "./components/DependencyScore";
import WinByRunsChart from "./components/WinByRunsChart";
import WinByOverChart from "./components/WinByOverChart";
import SeasonTrendChart from "./components/SeasonTrendChart";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [dependencyData, setDependencyData] = useState(null);
  const [winByRuns, setWinByRuns] = useState([]);
  const [winByOver, setWinByOver] = useState([]);
  const [seasonTrend, setSeasonTrend] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="loader">
      <div className="loader-text">🏏 Loading Virat Dependency Index...</div>
    </div>
  );

  return (
    <div>
      {/* ── Header ── */}
      <div className="header">
        <div className="header-inner">
          <div className="header-logo">🏏</div>
          <div>
            <h1 className="header-title">Virat Dependency Index</h1>
            <p className="header-subtitle">
              How much does RCB rely on Virat Kohli? — ML powered analysis (2008–2019)
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        {/* ── Dependency Score ── */}
        {dependencyData && <DependencyScore data={dependencyData} />}

        {/* ── Charts Grid ── */}
        <div className="charts-grid">
          <WinByRunsChart data={winByRuns} />
          <WinByOverChart data={winByOver} />
        </div>

        <SeasonTrendChart data={seasonTrend} />

        {/* ── Predict Section ── */}
        <div className="predict-card">
          <h2 className="predict-title">🎯 Live Match Predictor</h2>
          <p className="predict-subtitle">
            Enter Virat's stats from any match and predict if RCB wins
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Virat's Runs</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 45"
                value={form.virat_runs}
                onChange={e => setForm({ ...form, virat_runs: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Balls Faced</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 32"
                value={form.virat_balls}
                onChange={e => setForm({ ...form, virat_balls: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Over He Got Out</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 8 (25 = not out)"
                value={form.virat_out_over}
                onChange={e => setForm({ ...form, virat_out_over: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Was Virat Dismissed?</label>
              <select
                className="form-input"
                value={form.virat_dismissed}
                onChange={e => setForm({ ...form, virat_dismissed: e.target.value })}
              >
                <option value={1}>Yes</option>
                <option value={0}>No (Not Out)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">RCB Batting</label>
              <select
                className="form-input"
                value={form.rcb_batting_first}
                onChange={e => setForm({ ...form, rcb_batting_first: e.target.value })}
              >
                <option value={1}>First</option>
                <option value={0}>Second</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Opposition</label>
              <select
                className="form-input"
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
            className="predict-btn"
            onClick={handlePredict}
            disabled={predicting}
          >
            {predicting ? "Predicting..." : "⚡ Predict Outcome"}
          </button>

          {prediction && (
            <div
              className="prediction-result"
              style={{ borderColor: prediction.rcb_wins ? "#22c55e" : "#ef4444" }}
            >
              <div className="prediction-verdict">{prediction.verdict}</div>
              <div className="prediction-prob">
                Win Probability: <strong>{prediction.win_probability}%</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}