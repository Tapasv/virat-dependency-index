import pandas as pd
import numpy as np

# ── Load both datasets ─────────────────────────────────────────────────────────
matches = pd.read_csv("../data/matches.csv")
deliveries = pd.read_csv("../data/deliveries.csv")

# ── Basic info ─────────────────────────────────────────────────────────────────
print("===== MATCHES =====")
print(f"Total matches: {len(matches)}")
print(f"Columns: {list(matches.columns)}")
print()
print(matches.head(3))

print("\n===== DELIVERIES =====")
print(f"Total deliveries: {len(deliveries)}")
print(f"Columns: {list(deliveries.columns)}")
print()
print(deliveries.head(3))

# ── Filter only RCB matches ────────────────────────────────────────────────────
rcb_matches = matches[
    (matches["team1"] == "Royal Challengers Bangalore") |
    (matches["team2"] == "Royal Challengers Bangalore")
]
print(f"Total RCB matches: {len(rcb_matches)}")

# ── Filter only Virat's deliveries ────────────────────────────────────────────
virat_deliveries = deliveries[deliveries["batsman"] == "V Kohli"]
print(f"Total balls Virat faced: {len(virat_deliveries)}")

# ── Check Virat's name spelling in dataset ────────────────────────────────────
kohli_names = deliveries[deliveries["batsman"].str.contains("Kohli", na=False)]["batsman"].unique()
print(f"Kohli name in dataset: {kohli_names}")

# ── Check RCB name spelling in dataset ────────────────────────────────────────
rcb_names = matches[matches["team1"].str.contains("Bangalore", na=False)]["team1"].unique()
print(f"RCB name in dataset: {rcb_names}")

# ── Check seasons available ───────────────────────────────────────────────────
print(f"Seasons available: {sorted(matches['season'].unique())}")

# ── Check winner column sample ────────────────────────────────────────────────
print(f"\nSample winners:\n{matches['winner'].value_counts().head(10)}")