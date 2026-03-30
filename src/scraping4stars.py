import requests
from bs4 import BeautifulSoup
import json

url = "https://www.stellarcatalog.com/stars.php"
headers = {"User-Agent": "Mozilla/5.0"}

response = requests.get(url, headers=headers, timeout=20)
soup = BeautifulSoup(response.content, "html.parser")
star = []

colors = {
  "O": "#8099ff",
  "B": "#a0b8ff",
  "A": "#f0f4ff",
  "F": "#fff4c2",
  "G": "#ffdd80",
  "K": "#ff9050",
  "M": "#ff6030",
  "L": "#8B4513",
  "T": "#4a3728",
  "Y": "#2a2a2a"
}
sizes = {
  "O": 12,
  "B": 10,
  "A": 8,
  "F": 7,
  "G": 6,
  "K": 5,
  "M": 4,
  "L": 3,
  "T": 2,
  "Y": 2
}


for row in soup.find_all("tr"):
    cells = row.find_all("td")
    if len(cells) > 0:
        link = cells[1].find("a")
        name = link.find(string=True, recursive=False)
        distance = (float)(cells[-1].get_text(strip=True).strip("ly"))
        star_type = cells[-3].get_text(strip=True)
        star.append({
  "name": name,
  "distance": distance,
  "star_type": star_type,
  "size": sizes.get(star_type[0]),
  "color": colors.get(star_type[0])
})

with open("/Users/zianamac/star_project/star-viz/src/starInfo.json", "w", encoding="utf-8") as f:
    json.dump(star, f, indent=4)


                
