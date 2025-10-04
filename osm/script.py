import osmnx as ox
import pandas as pd

# 1. Download road network for New Brunswick, NJ
G = ox.graph_from_place("New Brunswick, New Jersey, USA", network_type="drive")

# 2. Convert to GeoDataFrame (edges only)
edges = ox.graph_to_gdfs(G, nodes=False)

# 3. Configure pandas display so it doesn’t truncate columns
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 2000)

# 4. Print the column names
print("Columns in edges GeoDataFrame:")
print(edges.columns.tolist())

# 5. (Optional) preview first few rows for context
print("\nPreview of first 5 rows:")
print(edges.head())

# 6. (Optional) save for inspection
edges.to_csv("newbrunswick_edges.csv", index=False)

ox.shortest_path(G, origin_node, destination_node, weight='length')