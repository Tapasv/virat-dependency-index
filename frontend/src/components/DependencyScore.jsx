export default function DependencyScore({ data }) {
  const color =
    data.dependency_score >= 60 ? "#ef4444" :
    data.dependency_score >= 40 ? "#f97316" :
    data.dependency_score >= 20 ? "#eab308" : "#22c55e";

  return (
    <div className="dep-card">
      <div className="dep-left">
        <h2 className="dep-title">⚡ Virat Dependency Score</h2>
        <p className="dep-desc">
          Difference in RCB's win probability when Virat fires vs when he fails.
          Higher score = RCB more dependent on Virat.
        </p>
        <div className="dep-interpretation">{data.interpretation}</div>

        <div className="dep-stats-row">
          <div className="dep-stat-box">
            <div className="dep-stat-value" style={{ color: "#22c55e" }}>
              {data.win_prob_virat_fires}%
            </div>
            <div className="dep-stat-label">Win % when Virat scores 60+</div>
          </div>
          <div className="dep-stat-box">
            <div className="dep-stat-value" style={{ color: "#ef4444" }}>
              {data.win_prob_virat_fails}%
            </div>
            <div className="dep-stat-label">Win % when Virat scores under 10</div>
          </div>
        </div>
      </div>

      <div className="dep-right">
        <div className="dep-score-meter" style={{ borderColor: color }}>
          <div className="dep-score-number" style={{ color }}>
            {data.dependency_score}
          </div>
          <div className="dep-score-label">out of 100</div>
        </div>
      </div>
    </div>
  );
}