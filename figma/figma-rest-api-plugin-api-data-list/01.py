import os
import requests

token = os.environ["FIGMA_TOKEN"]
file_key = os.environ["FIGMA_FILE_KEY"]

response = requests.get(
    f"https://api.figma.com/v1/files/{file_key}",
    headers={"X-Figma-Token": token},
    params={"depth": 1},
    timeout=30,
)
response.raise_for_status()
data = response.json()
print({"name": data["name"], "version": data["version"]})
