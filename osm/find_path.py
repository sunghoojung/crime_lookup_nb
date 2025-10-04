# shortest_path_crime_weighted.py

import pandas as pd
import geopandas as gpd
import networkx as nx
from shapely import wkt
from shapely.geometry import LineString, Point

# -------------------------------
# 1. Load your weighted edges
# -------------------------------
edges_path = "newbrunswick_edges_weighted.csv"

df = pd.read_csv(edges_path)
df["geometry"] = df["geometry"].apply(wkt.loads)

# Each LINESTRING represents a road segment
# Extract start & end coordinates for graph edges
df["start"] = df["geometry"].apply(lambda x: (x.coords[0][0], x.coords[0][1]))
df["end"] = df["geometry"].apply(lambda x: (x.coords[-1][0], x.coords[-1][1]))

# -------------------------------
# 2. Build a NetworkX weighted graph
# -------------------------------
G = nx.Graph()

for _, row in df.iterrows():
    u, v = row["start"], row["end"]
    length = row["length"]  # already adjusted for crime
    name = row.get("name", "")
    G.add_edge(u, v, weight=length, street=name)

print(f"✅ Graph built with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges")

# -------------------------------
# 3. Define a helper to find nearest graph node to a point
# -------------------------------
def nearest_node(G, point):
    """Find the graph node (u,v) nearest to a given (lon,lat) point."""
    return min(G.nodes, key=lambda n: (n[0] - point[0]) ** 2 + (n[1] - point[1]) ** 2)

# Example coordinates (longitude, latitude)
# Replace with your desired start and end points
start_point = (-74.4517, 40.4898)  # near Joyce Kilmer Ave
end_point = (-74.4442, 40.4968)    # near Albany Street

start_node = nearest_node(G, start_point)
end_node = nearest_node(G, end_point)

print(f"Start node: {start_node}")
print(f"End node:   {end_node}")

# -------------------------------
# 4. Compute shortest path using Dijkstra
# -------------------------------
try:
    path_nodes = nx.shortest_path(G, source=start_node, target=end_node, weight="weight")
    path_length = nx.shortest_path_length(G, source=start_node, target=end_node, weight="weight")
    print(f"✅ Shortest path found! Weighted distance: {path_length:.2f} meters")

    # Convert to GeoDataFrame for visualization
    path_edges = []
    for i in range(len(path_nodes) - 1):
        path_edges.append(LineString([path_nodes[i], path_nodes[i + 1]]))

    path_gdf = gpd.GeoDataFrame(geometry=path_edges, crs="EPSG:4326")
    base = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:4326").plot(
        figsize=(10, 10), color="lightgray", linewidth=0.5
    )
    path_gdf.plot(ax=base, color="red", linewidth=3)
except nx.NetworkXNoPath:
    print("❌ No path found between the given points.")
