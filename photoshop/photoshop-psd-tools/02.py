from pathlib import Path

target = Path("output_layers")
target.mkdir(parents=True, exist_ok=True)
for index, layer in enumerate(psd.descendants()):
    if layer.kind != "pixel" or not layer.is_visible():
        continue
    image = layer.composite()
    if image is None:
        continue
    safe = "".join(c if c.isalnum() or c in "-_" else "_"
                   for c in layer.name)[:80] or "layer"
    file = target / f"{index:03d}_{safe}.png"
    with file.open("xb") as stream:
        image.save(stream, format="PNG")
