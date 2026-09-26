curl -X GET \
  "https://api.figma.com/v1/files/{FILE_KEY}" \
  -H "X-Figma-Token: ${FIGMA_TOKEN}"
# ポイント:
# - FIGMA_TOKEN は個人アクセストークン
# - 応答にはファイル名、最終更新日時、thumbnailUrl、ドキュメントツリーなどが含まれる
