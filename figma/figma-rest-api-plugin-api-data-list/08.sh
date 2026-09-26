# ids=ノードID（カンマ区切り可）、format=png/svg/jpg、scale=倍率
curl -X GET \
  "https://api.figma.com/v1/images/{FILE_KEY}?ids=12:34,56:78&format=png&scale=2" \
  -H "X-Figma-Token: ${FIGMA_TOKEN}"

# 応答例:
# { "images": { "12:34": "https://figma-alpha.imgix.net/....", "56:78": "..." } }
# 注意: このURLは短期有効（数分）。長期保存は自前でダウンロード→保管が必要
