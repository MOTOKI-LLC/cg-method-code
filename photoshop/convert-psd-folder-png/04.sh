#!/usr/bin/env bash
set -euo pipefail

# ===== 設定 =====
IN="$HOME/Desktop/psd"            # 変換元（再帰で辿る）
OUT="$HOME/Desktop/png"           # 出力先（フラット＝直下に並べる）
MAG="/opt/homebrew/bin/magick"    # Intelなら /usr/local/bin/magick

mkdir -p "$OUT"

# PSD / PSB を再帰で列挙（スペース対応）
find "$IN" -type f \( -iname '*.psd' -o -iname '*.psb' \) -print0 |
while IFS= read -r -d '' f; do
  base="$(basename "$f")"
  name="${base%.*}"

  # 同名衝突を避けたい場合は以下の2行を有効化（重複時に _1, _2... 付与）
  # out="$OUT/$name.png"; n=1
  # while [[ -e "$out" ]]; do out="$OUT/${name}_$n.png"; ((n++)); done

  # 統合ビューだけ（[0]）を1枚出力
  "$MAG" "$f[0]" -alpha on -define psd:preserve-opacity=true -colorspace sRGB \
    "$OUT/$name.png"
done

echo "完了：$OUT にフラット出力しました"
