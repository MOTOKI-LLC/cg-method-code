from pathlib import Path
from psd_tools import PSDImage

SOURCE = Path("C:/work/input_psd").resolve()
DEST = Path("C:/work/output_png").resolve()

if not SOURCE.is_dir():
    raise SystemExit("入力フォルダーがありません")
if SOURCE == DEST or SOURCE in DEST.parents or DEST in SOURCE.parents:
    raise SystemExit("入力と出力は互いを含まない別フォルダーにしてください")

files = sorted(p for p in SOURCE.rglob("*")
               if p.is_file() and p.suffix.lower() in (".psd", ".psb"))
ok = skipped = failed = 0
for source in files:
    target = DEST / source.relative_to(SOURCE).with_suffix(".png")
    if target.exists():
        skipped += 1
        print("既存ファイルを保留:", target)
        continue
    try:
        image = PSDImage.open(source).composite()
    except Exception as error:
        failed += 1
        print("変換失敗:", source, error)
        continue
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("xb") as stream:
        image.save(stream, format="PNG")
    ok += 1
    print("変換:", source, "->", target)

print(f"対象={len(files)} 成功={ok} 保留={skipped} 失敗={failed}")
