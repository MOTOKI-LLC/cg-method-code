from pathlib import Path
from psd_tools import PSDImage

psd = PSDImage.open("sample.psd")
image = psd.composite()
with Path("output.png").open("xb") as stream:
    image.save(stream, format="PNG")
