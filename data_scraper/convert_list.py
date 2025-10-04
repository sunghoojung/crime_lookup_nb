from bs4 import BeautifulSoup
import json
import re

def clean_type(type_str: str) -> str:
    """
    Keeps only the part after '::' in a type string, removes punctuation,
    and converts it to title case.
    
    Examples:
      "2C:18-2A(1) MV::Burglary By Entering Motor Vehicle." -> "Burglary By Entering Motor Vehicle"
      "39:4-50 DUI::Driving Under The Influence" -> "Driving Under The Influence"
      "ASSAULT::SIMPLE" -> "Simple"
    """
    if not type_str:
        return ""

    # Keep only the part after the last '::' if it exists
    if "::" in type_str:
        type_str = type_str.split("::")[-1]

    # Remove trailing punctuation (e.g., periods)
    type_str = re.sub(r'[^\w\s]', '', type_str)

    # Normalize whitespace
    type_str = re.sub(r'\s+', ' ', type_str).strip()

    # Convert to title case
    type_str = type_str.title()

    return type_str


def clean_location(location: str) -> str:
    """
    Cleans a location string to keep only the street name.
    Examples:
      "00 block of Chester CIR" -> "Chester CIR"
      "Townsend ST ,New Brunswick ,NJ ,08901" -> "Townsend ST"
      "200 block of French ST" -> "French ST"
    """
    if not location:
        return ""
    
    loc = location.strip()

    # Remove everything after a comma (city/state info)
    loc = loc.split(",")[0].strip()

    # Remove patterns like "00 block of", "200 block of", etc.
    loc = re.sub(r'\b\d+\s*block\s+of\s+', '', loc, flags=re.IGNORECASE)

    # Remove leading block numbers like "400 block" (in case "of" is missing)
    loc = re.sub(r'^\d+\s*block\s*', '', loc, flags=re.IGNORECASE)

    # Remove leading numbers (e.g., "100 " or "1200 ")
    loc = re.sub(r'^\d+\s+', '', loc)

    # Normalize spacing
    loc = re.sub(r'\s+', ' ', loc).strip()
    
    if "phelps ave" in loc.lower():
        loc = "Phelps Ave"
    loc = loc.title()
    return loc

with open("data_scraper/list.html", "r", encoding="utf-8") as file:
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
    crime_type_raw = clean_type(crime_type_raw)
    record_id = cells[1].get_text(strip=True)
    time = cells[2].get_text(strip=True)
    location = cells[3].get_text(strip=True)
    location = clean_location(location)

    crime = {
        "type": crime_type_raw,
        "record_id": record_id,
        "time": time,
        "location": location
    }

    crime_data.append(crime)

# Output JSON

json_output = json.dumps(crime_data, indent=2)
with open("data_scraper/crime_list.json", "w", encoding="utf-8") as file:
    json.dump(crime_data, file, indent=2)
print(json_output)