import os
import re
import tempfile
from pathlib import Path
from urllib.parse import urlparse

import requests


def save_png(url, destination):
    if urlparse(url).scheme != "https":
        raise ValueError("画像URLはHTTPSである必要があります")
    # ダウンロード先にFigmaトークンを渡さない。
    response = requests.get(url, timeout=60)
    if response.status_code != 200:
        raise RuntimeError(f"画像取得失敗: HTTP {response.status_code}")
    data = response.content
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("取得結果がPNGではありません")
    destination = Path(destination)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(data)
        temporary.replace(destination)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main():
    key = os.environ["FIGMA_FILE_KEY"]
    ids = list(dict.fromkeys(x.strip().replace("-", ":")
                            for x in os.environ["FIGMA_NODE_IDS"].split(",")))
    if not re.fullmatch(r"[A-Za-z0-9_-]+", key):
        raise SystemExit("ファイルキーを確認してください")
    if not ids or any(not re.fullmatch(r"\d+:\d+", x) for x in ids):
        raise SystemExit("node IDを1:2,3:4の形式で設定してください")
    response = requests.get(
        f"https://api.figma.com/v1/images/{key}",
        headers={"X-Figma-Token": os.environ["FIGMA_TOKEN"]},
        params={"ids": ",".join(ids), "format": "png", "scale": 2}, timeout=60
    )
    if response.status_code == 429:
        retry_after = response.headers.get("Retry-After", "取得できませんでした")
        raise SystemExit(f"API制限に達しました。Retry-After（秒）: {retry_after}。指定時間後に再実行してください")
    if response.status_code != 200:
        raise SystemExit(f"レンダリング要求失敗: HTTP {response.status_code}")
    result = response.json()
    if result.get("err"):
        raise SystemExit("APIがレンダリングエラーを返しました")
    images = result["images"]
    directory = Path("figma-images")
    directory.mkdir(exist_ok=True)
    for node_id in ids:
        url = images.get(node_id)
        if not url:
            print(node_id, "レンダリング結果なし")
            continue
        try:
            save_png(url, directory / (node_id.replace(":", "-") + ".png"))
        except (requests.RequestException, OSError, ValueError, RuntimeError):
            print(node_id, "保存失敗。HTTP結果・接続・出力先を確認してください")
        else:
            print(node_id, "保存しました")


if __name__ == "__main__":
    main()
