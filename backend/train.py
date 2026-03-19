import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, classification_report
import joblib
import warnings
warnings.filterwarnings("ignore")

# ── Load data ──────────────────────────────────────────────────────────────────
matches = pd.read_csv("../data/matches.csv")
deliveries = pd.read_csv("../data/deliveries.csv")

print("✅ Data loaded")

# ── Step 1: Get all RCB matches ───────────────────────────────────────────────
rcb_matches = matches[
    (matches["team1"] == "Royal Challengers Bangalore") |
    (matches["team2"] == "Royal Challengers Bangalore")
].copy()

# ── Step 2: Get Virat's stats per match ───────────────────────────────────────
virat_batting = deliveries[deliveries["batsman"] == "V Kohli"].copy()

# Runs scored per match
virat_runs = virat_batting.groupby("match_id")["batsman_runs"].sum().reset_index()
virat_runs.columns = ["match_id", "virat_runs"]

# Balls faced per match
virat_balls = virat_batting.groupby("match_id")["ball"].count().reset_index()
virat_balls.columns = ["match_id", "virat_balls"]

# Over in which Virat got out
virat_dismissed = deliveries[
    (deliveries["player_dismissed"] == "V Kohli") &
    (deliveries["dismissal_kind"].notna()) &
    (deliveries["dismissal_kind"] != "run out")
][["match_id", "over"]].copy()
virat_dismissed.columns = ["match_id", "virat_out_over"]
virat_dismissed["virat_dismissed"] = 1

print("✅ Virat stats calculated")

# ── Step 3: Build match level dataset ────────────────────────────────────────
df = rcb_matches[["id", "season", "team1", "team2",
                   "toss_winner", "toss_decision", "winner"]].copy()
df.columns = ["match_id", "season", "team1", "team2",
              "toss_winner", "toss_decision", "winner"]

# Add RCB won column
df["rcb_won"] = (df["winner"] == "Royal Challengers Bangalore").astype(int)

# Add opposition team
df["opposition"] = df.apply(
    lambda r: r["team2"] if r["team1"] == "Royal Challengers Bangalore" else r["team1"],
    axis=1
)

# Add RCB batting first or second
df["rcb_batting_first"] = (
    (df["toss_winner"] == "Royal Challengers Bangalore") &
    (df["toss_decision"] == "bat") |
    (df["toss_winner"] != "Royal Challengers Bangalore") &
    (df["toss_decision"] == "field")
).astype(int)

# ── Step 4: Merge Virat stats ─────────────────────────────────────────────────
df = df.merge(virat_runs, on="match_id", how="left")
df = df.merge(virat_balls, on="match_id", how="left")
df = df.merge(virat_dismissed, on="match_id", how="left")

# Fill matches where Virat didn't bat or wasn't dismissed
df["virat_runs"] = df["virat_runs"].fillna(0)
df["virat_balls"] = df["virat_balls"].fillna(0)
df["virat_dismissed"] = df["virat_dismissed"].fillna(0)
df["virat_out_over"] = df["virat_out_over"].fillna(25)  # 25 = not dismissed

# ── Step 5: Add strike rate ───────────────────────────────────────────────────
df["virat_strike_rate"] = (
    df["virat_runs"] / df["virat_balls"].replace(0, 1) * 100
).round(2)

# ── Step 6: Add run category ──────────────────────────────────────────────────
df["virat_run_category"] = pd.cut(
    df["virat_runs"],
    bins=[-1, 10, 30, 50, 500],
    labels=["0-10", "11-30", "31-50", "50+"]
)

print("✅ Feature engineering done")
print(f"\nDataset shape: {df.shape}")
print(f"RCB win rate: {df['rcb_won'].mean():.2%}")
print(f"\nSample data:\n{df[['match_id', 'virat_runs', 'virat_out_over', 'virat_dismissed', 'rcb_won']].head()}")

# ── Step 7: Prepare features for model ───────────────────────────────────────
features = ["virat_runs", "virat_balls", "virat_strike_rate",
            "virat_out_over", "virat_dismissed", "rcb_batting_first",
            "opposition"]

X = df[features].copy()
y = df["rcb_won"]

# ── Step 8: Build pipeline ────────────────────────────────────────────────────
categorical = ["opposition"]
numerical = ["virat_runs", "virat_balls", "virat_strike_rate",
             "virat_out_over", "virat_dismissed", "rcb_batting_first"]

preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
    ("num", "passthrough", numerical)
])

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", RandomForestClassifier(n_estimators=100, random_state=42))
])

# ── Step 9: Train and evaluate ────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)

print(f"\n✅ Model trained!")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2%}")
print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")

# ── Step 10: Calculate Dependency Score ───────────────────────────────────────
# Win prob when Virat scores 50+ vs 0-10
sample_opposition = "Mumbai Indians"

virat_fires = pd.DataFrame([{
    "virat_runs": 60, "virat_balls": 40, "virat_strike_rate": 150,
    "virat_out_over": 25, "virat_dismissed": 0,
    "rcb_batting_first": 1, "opposition": sample_opposition
}])

virat_fails = pd.DataFrame([{
    "virat_runs": 5, "virat_balls": 10, "virat_strike_rate": 50,
    "virat_out_over": 3, "virat_dismissed": 1,
    "rcb_batting_first": 1, "opposition": sample_opposition
}])

prob_fires = pipeline.predict_proba(virat_fires)[0][1]
prob_fails = pipeline.predict_proba(virat_fails)[0][1]
dependency_score = round((prob_fires - prob_fails) * 100, 1)

print(f"\n🏏 VIRAT DEPENDENCY INDEX RESULTS")
print(f"Win prob when Virat fires (60+ runs): {prob_fires:.2%}")
print(f"Win prob when Virat fails (under 10):  {prob_fails:.2%}")
print(f"⚡ Dependency Score: {dependency_score}/100")

# ── Step 11: Save model and processed data ────────────────────────────────────
joblib.dump(pipeline, "virat_model.pkl")
df.to_csv("../data/rcb_virat_data.csv", index=False)

print("\n✅ Model saved as virat_model.pkl")
print("✅ Processed data saved as rcb_virat_data.csv")