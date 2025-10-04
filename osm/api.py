# shortest_path_api.py

from flask import Flask, request, jsonify
import pandas as pd
import networkx as nx
from shapely import wkt

# -------------------------------
# 1. Load data once at startup
# -------------------------------
edges_path = "newbrunswick_edges_weighted.csv"
df = pd.read_csv(edges_path)
df["geometry"] = df["geometry"].apply(wkt.loads)

# Extract start & end coordinates
df["start"] = df["geometry"].apply(lambda x: (x.coords[0][0], x.coords[0][1]))
df["end"]   = df["geometry"].apply(lambda x: (x.coords[-1][0], x.coords[-1][1]))

# Build weighted graph
G = nx.Graph()
for _, row in df.iterrows():
    u, v = row["start"], row["end"]
    G.add_edge(u, v, weight=row["length"])

print(f"✅ Graph initialized: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

# -------------------------------
# 2. Initialize Flask app
# -------------------------------
app = Flask(__name__)

def nearest_node(G, point):
    """Find nearest graph node to a (lon, lat) point."""
    return min(G.nodes, key=lambda n: (n[0] - point[0]) ** 2 + (n[1] - point[1]) ** 2)

# -------------------------------
# 3. API endpoint
# -------------------------------
@app.route("/shortest_path", methods=["POST"])
def shortest_path():
    data = request.get_json(force=True)
    
    try:
        start_point = tuple(data["start"])  # [lon, lat]
        end_point   = tuple(data["end"])    # [lon, lat]
    except (KeyError, TypeError):
        return jsonify({"error": "Input JSON must have 'start' and 'end' fields as [lon, lat]"}), 400

    # Find nearest nodes
    start_node = nearest_node(G, start_point)
    end_node   = nearest_node(G, end_point)

    try:
        # Compute shortest path
        path_nodes = nx.shortest_path(G, source=start_node, target=end_node, weight="weight")
        coords_list = [{"lon": lon, "lat": lat} for lon, lat in path_nodes]

        return jsonify({
            "status": "success",
            "path_length": nx.shortest_path_length(G, start_node, end_node, weight="weight"),
            "coordinates": coords_list
        })

    except nx.NetworkXNoPath:
        return jsonify({"status": "error", "message": "No path found between given coordinates"}), 404


# -------------------------------
# 4. Run server
# -------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
