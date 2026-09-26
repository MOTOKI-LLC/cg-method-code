#!/usr/bin/env bash
set -euo pipefail

# ===== 設定 =====
IN="$HOME/Desktop/psd"
OUT="$HOME/Desktop/png"
MAG="/opt/homebrew/bin/magick"    # Intelなら /usr/local/bin/magick

mkdir -p "$OUT"

find "$IN" -type f \( -iname '*.psd' -o -iname '*.psb' \) -print0 |
while IFS= read -r -d '' f; do
  base="$(basename "$f")"
  name="${base%.*}"

  # レイヤー/コンプを展開（name-0.png, name-1.png ... が OUT 直下に並ぶ）
  "$MAG" "$f" -alpha on -define psd:preserve-opacity=true -colorspace sRGB \
    "$OUT/$name.png"
done

echo "完了：$OUT にフラット出力しました（レイヤー展開あり）"
