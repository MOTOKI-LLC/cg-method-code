curl -X POST "https://api.figma.com/v1/files/{FILE_KEY}/comments" \
  -H "X-Figma-Token: ${FIGMA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "このボタンの角丸を+4pxに",
    "client_meta": { "x": 120, "y": 300 }  // キャンバス座標にピン留め
  }'
# 注意: 座標はページ／ズームに依存。client_meta 省略も可
