# roads_weighted_length_replace.py

import pandas as pd
import json

# -------------------------------
# 1. Load data
# -------------------------------
roads_path = "newbrunswick_edges.csv"
crime_path = "../data_scraper/crime_counts_by_street.json"

df = pd.read_csv(roads_path)

with open(crime_path, "r") as f:
    crime_data = json.load(f)

# -------------------------------
# 2. Define weights for each crime type
# -------------------------------
crime_weights = {
    "Murder": 5.0,
    "Aggravated Assault": 3.0,
    "Robbery": 2.5,
    "Burglary": 1.5,
    "Arson": 1.5,
    "Simple Assault": 1.0
}

# -------------------------------
# 3. Compute weighted crime score per street
# -------------------------------
crime_scores = {}
for street, categories in crime_data.items():
    score = 0
    for category, count in categories.items():
        weight = crime_weights.get(category, 1.0)
        score += count * weight
    crime_scores[street] = score

# -------------------------------
# 4. Normalize street names (all words except the last)
# -------------------------------
def normalize_street_name(name):
    """Normalize street name using all words except the last one (case-insensitive)."""
    if not name or not isinstance(name, str):
        return ""
    parts = name.lower().strip().split()
    if len(parts) <= 1:
        return parts[0] if parts else ""
    return " ".join(parts[:-1])  # all words except the last

# Build lookup dictionary
crime_lookup = {normalize_street_name(street): score for street, score in crime_scores.items()}

# -------------------------------
# 5. Assign crime scores to OSM data
# -------------------------------
def match_crime_score(street_name):
    key = normalize_street_name(street_name)
    return crime_lookup.get(key, 0)

df["crime_score"] = df["name"].apply(match_crime_score)

# -------------------------------
# 6. Scale the length directly
# -------------------------------
scale_factor = 0.05  # +5% per weighted crime unit
df["length"] = df["length"] * (1 + scale_factor * df["crime_score"])

# -------------------------------
# 7. Save updated CSV
# -------------------------------
out_path = "newbrunswick_edges_weighted.csv"
df.to_csv(out_path, index=False)
print(f"✅ Saved file with updated lengths to {out_path}")

# -------------------------------
# 8. Optional visualization
# -------------------------------
try:
    import geopandas as gpd
    from shapely import wkt

    df["geometry"] = df["geometry"].apply(wkt.loads)
    gdf = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:4326")

    print("🗺️  Previewing map (line width = crime_score)")
    gdf.plot(figsize=(12, 10), linewidth=gdf["crime_score"] * 0.3 + 0.5)
except ImportError:
    print("ℹ️  Install geopandas + shapely to enable map plotting.")
