# ファイル内スタイル一覧（色/文字/効果/グリッド）
curl -X GET \
  "https://api.figma.com/v1/files/{FILE_KEY}/styles" \
  -H "X-Figma-Token: ${FIGMA_TOKEN}"
# 返却: styles[]（style_key, name, style_typeなど）
