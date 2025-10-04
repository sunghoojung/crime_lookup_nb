from bs4 import BeautifulSoup
import json

with open("list.html", "r", encoding="utf-8") as file:
    html = file.read()

soup = BeautifulSoup(html, "html.parser")

# Find the table with crimes
table = soup.find("table")
rows = table.find_all("tr")

# Skip the header row (first row)
crime_data = []
for row in rows[1:]:
    cells = row.find_all("td")
    if len(cells) < 4:
        continue  # Skip malformed rows

    # Extract and clean data
    crime_type_raw = cells[0].get_text(strip=True)
    record_id = cells[1].get_text(strip=True)
    time = cells[2].get_text(strip=True)
    location = cells[3].get_text(strip=True)

    crime = {
        "type": crime_type_raw,
        "record_id": record_id,
        "time": time,
        "location": location
    }

    crime_data.append(crime)

# Output JSON

json_output = json.dumps(crime_data, indent=2)
with open("file.json", "w", encoding="utf-8") as file:
    json.dump(crime_data, file, indent=2)
print(json_output)