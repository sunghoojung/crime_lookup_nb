import json
from collections import defaultdict
import os

# read input JSON file
with open(os.path.join(os.getcwd(), "data_scraper", "crime_list.json"), "r") as f:
    data = json.load(f)

# nested dictionary: {street: {category: count}}
counts = defaultdict(lambda: defaultdict(int))

for record in data:
    street = record["location"].strip()
    category = record["category"].strip()
    counts[street][category] += 1

# convert defaultdicts to normal dicts for JSON output
output = {street: dict(categories) for street, categories in counts.items()}

# save to file
with open(os.path.join(os.getcwd(), "data_scraper", "crime_counts_by_street.json"), "w") as f:
    json.dump(output, f, indent=4)

print(json.dumps(output, indent=4))
