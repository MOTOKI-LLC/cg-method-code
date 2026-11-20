"""Compare cached preview and recomposition; never edit input or follow external links."""
import argparse
import hashlib
import json
import platform
from importlib.metadata import version
from pathlib import Path
import numpy as np
from PIL import Image
from psd_tools import PSDImage

def compare(source, output):
    source = Path(source)
    output = Path(output)
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    psd = PSDImage.open(source)
    output.mkdir(parents=True, exist_ok=False)
    report = {
        "source_sha256": digest,
        "python": platform.python_version(),
        "psd_tools": version("psd-tools"),
        "pillow": version("Pillow"),
        "numpy": version("numpy"),
        "size": list(psd.size),
        "has_preview": psd.has_preview(),
        "layers": [],
        "results": {},
    }
    for layer in psd.descendants():
        report["layers"].append({
            "name": layer.name, "kind": layer.kind,
            "visible": layer.is_visible(), "has_effects": layer.has_effects(),
        })
    images = {}
    operations = {
        "preview": lambda: psd.topil(apply_icc=True),
        "recomposed": lambda: psd.composite(ignore_preview=True, force=True, apply_icc=True),
    }
    for name, operation in operations.items():
        try:
            image = operation()
            if image is None:
                report["results"][name] = {"status": "no_image"}
                continue
            image.save(output / (name + ".png"))
            images[name] = image.convert("RGBA")
            report["results"][name] = {"status": "saved", "mode": image.mode, "size": list(image.size)}
        except Exception as error:
            report["results"][name] = {"status": "error", "type": type(error).__name__, "message": str(error)}
    if len(images) == 2:
        a, b = images["preview"], images["recomposed"]
        if a.size != b.size:
            report["comparison"] = {"status": "size_mismatch"}
        else:
            def on_white(image):
                bg = Image.new("RGBA", image.size, (255, 255, 255, 255))
                return np.asarray(Image.alpha_composite(bg, image).convert("RGB"), dtype=np.int16)
            delta = np.abs(on_white(a) - on_white(b))
            alpha_delta = np.abs(np.asarray(a.getchannel("A"), dtype=np.int16) -
                                 np.asarray(b.getchannel("A"), dtype=np.int16))
            report["comparison"] = {
                "status": "compared", "background": "white",
                "rgb_mae_0_255": float(delta.mean()), "rgb_max_0_255": int(delta.max()),
                "rgb_changed_pixel_percent": float(np.any(delta != 0, axis=2).mean() * 100),
                "alpha_mae_0_255": float(alpha_delta.mean()), "alpha_max_0_255": int(alpha_delta.max()),
            }
    report["source_unchanged"] = hashlib.sha256(source.read_bytes()).hexdigest() == digest
    (output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input_psd")
    parser.add_argument("new_output_folder")
    args = parser.parse_args()
    report = compare(args.input_psd, args.new_output_folder)
    print(json.dumps(report.get("comparison", {"status": "not_compared"}), ensure_ascii=True))
