from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import json

app = FastAPI(title="Virat Dependency Index API", version="1.0.0")

# ── CORS so React can talk to FastAPI ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model and data once at startup ───────────────────────────────────────
model = joblib.load("virat_model.pkl")
df = pd.read_csv("rcb_virat_data.csv")

# ── Input schema ──────────────────────────────────────────────────────────────
class PredictInput(BaseModel):
    virat_runs: float
    virat_balls: float
    virat_out_over: float
    virat_dismissed: int
    rcb_batting_first: int
    opposition: str


# ── 1. Health check ───────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Virat Dependency Index API is running 🏏"}

@app.get("/health")
def health():
    return {"status": "ok"}


# ── 2. Predict win probability ────────────────────────────────────────────────
@app.post("/predict")
def predict(data: PredictInput):
    try:
        input_df = pd.DataFrame([{
            "virat_runs": data.virat_runs,
            "virat_balls": data.virat_balls,
            "virat_strike_rate": (data.virat_runs / max(data.virat_balls, 1)) * 100,
            "virat_out_over": data.virat_out_over,
            "virat_dismissed": data.virat_dismissed,
            "rcb_batting_first": data.rcb_batting_first,
            "opposition": data.opposition
        }])

        prob = model.predict_proba(input_df)[0][1]
        prediction = int(prob >= 0.5)

        return {
            "win_probability": round(float(prob) * 100, 1),
            "rcb_wins": bool(prediction),
            "verdict": "RCB likely wins 🟢" if prediction else "RCB likely loses 🔴"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 3. Dependency Score ───────────────────────────────────────────────────────
@app.get("/dependency-score")
def dependency_score():
    opposition = "Mumbai Indians"

    virat_fires = pd.DataFrame([{
        "virat_runs": 60, "virat_balls": 40, "virat_strike_rate": 150,
        "virat_out_over": 25, "virat_dismissed": 0,
        "rcb_batting_first": 1, "opposition": opposition
    }])

    virat_fails = pd.DataFrame([{
        "virat_runs": 5, "virat_balls": 10, "virat_strike_rate": 50,
        "virat_out_over": 3, "virat_dismissed": 1,
        "rcb_batting_first": 1, "opposition": opposition
    }])

    prob_fires = round(float(model.predict_proba(virat_fires)[0][1]) * 100, 1)
    prob_fails = round(float(model.predict_proba(virat_fails)[0][1]) * 100, 1)
    score = round(prob_fires - prob_fails, 1)

    return {
        "dependency_score": score,
        "win_prob_virat_fires": prob_fires,
        "win_prob_virat_fails": prob_fails,
        "interpretation": (
            "🔴 Extremely dependent" if score >= 60 else
            "🟠 Highly dependent" if score >= 40 else
            "🟡 Moderately dependent" if score >= 20 else
            "🟢 Not very dependent"
        )
    }


# ── 4. Win rate by Virat run category ─────────────────────────────────────────
@app.get("/win-by-runs")
def win_by_runs():
    bins = [-1, 10, 30, 50, 500]
    labels = ["0-10", "11-30", "31-50", "50+"]
    df["run_cat"] = pd.cut(df["virat_runs"], bins=bins, labels=labels)

    result = df.groupby("run_cat", observed=True)["rcb_won"].agg(
        ["mean", "count"]
    ).reset_index()
    result.columns = ["run_category", "win_rate", "matches"]
    result["win_rate"] = (result["win_rate"] * 100).round(1)

    return result.to_dict(orient="records")


# ── 5. Win rate by over Virat got out ─────────────────────────────────────────
@app.get("/win-by-over")
def win_by_over():
    dismissed = df[df["virat_dismissed"] == 1].copy()
    bins = [0, 6, 10, 15, 20, 26]
    labels = ["1-6", "7-10", "11-15", "16-20", "Not out"]
    dismissed["over_cat"] = pd.cut(
        dismissed["virat_out_over"], bins=bins, labels=labels
    )

    result = dismissed.groupby("over_cat", observed=True)["rcb_won"].agg(
        ["mean", "count"]
    ).reset_index()
    result.columns = ["over_category", "win_rate", "matches"]
    result["win_rate"] = (result["win_rate"] * 100).round(1)

    return result.to_dict(orient="records")


# ── 6. Season wise Virat average and RCB win rate ────────────────────────────
@app.get("/season-trend")
def season_trend():
    result = df.groupby("season").agg(
        virat_avg=("virat_runs", "mean"),
        rcb_win_rate=("rcb_won", "mean"),
        matches=("match_id", "count")
    ).reset_index()

    result["virat_avg"] = result["virat_avg"].round(1)
    result["rcb_win_rate"] = (result["rcb_win_rate"] * 100).round(1)

    return result.to_dict(orient="records")


# ── 7. All oppositions list ───────────────────────────────────────────────────
@app.get("/oppositions")
def oppositions():
    teams = sorted(df["opposition"].unique().tolist())
    return {"teams": teams}