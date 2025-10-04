import os
import pandas as pd
import networkx as nx
from shapely import wkt
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pyngrok import ngrok
import uvicorn

# -------------------------------
# 1. Load weighted road edges once
# -------------------------------
edges_path = "osm/newbrunswick_edges_weighted.csv"

df = pd.read_csv(edges_path)
df["geometry"] = df["geometry"].apply(wkt.loads)

# Extract start & end coordinates
df["start"] = df["geometry"].apply(lambda x: (x.coords[0][0], x.coords[0][1]))
df["end"]   = df["geometry"].apply(lambda x: (x.coords[-1][0], x.coords[-1][1]))

# Build graph
G = nx.Graph()
for _, row in df.iterrows():
    u, v = row["start"], row["end"]
    G.add_edge(u, v, weight=row["length"])

print(f"✅ Graph built with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges")

# -------------------------------
# 2. Helper: find nearest node
# -------------------------------
def nearest_node(G, point):
    return min(G.nodes, key=lambda n: (n[0] - point[0]) ** 2 + (n[1] - point[1]) ** 2)

# -------------------------------
# 3. FastAPI setup
# -------------------------------
app = FastAPI(title="Shortest Path API (simple JSON output)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/shortest_path")
def shortest_path(
    start_lon: float = Query(...),
    start_lat: float = Query(...),
    end_lon: float = Query(...),
    end_lat: float = Query(...),
):
    """Return just the list of coordinates for the shortest path"""
    try:
        start_node = nearest_node(G, (start_lon, start_lat))
        end_node   = nearest_node(G, (end_lon, end_lat))

        path_nodes = nx.shortest_path(G, source=start_node, target=end_node, weight="weight")

        coords_list = [{"lon": lon, "lat": lat} for lon, lat in path_nodes]
        return coords_list

    except nx.NetworkXNoPath:
        raise HTTPException(status_code=404, detail="No path found between points.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------
# 4. Run FastAPI + ngrok
# -------------------------------
if __name__ == "__main__":
    # (optional) ngrok.set_auth_token("YOUR_NGROK_AUTHTOKEN")
    port = 8000
    public_url = ngrok.connect(port)
    print(f"\n🌍 Public URL: {public_url.public_url}")
    print(f"🔗 Example:")
    print(f"{public_url.public_url}/shortest_path?start_lon=-74.4517&start_lat=40.4898&end_lon=-74.4442&end_lat=40.4968\n")

    uvicorn.run(app, host="0.0.0.0", port=port)