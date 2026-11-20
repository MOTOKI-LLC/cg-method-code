import csv
import json
import os
import re
import tempfile
from pathlib import Path

import requests


def csv_text(value):
    text = "" if value is None else str(value)
    if text.lstrip().startswith(("=", "+", "-", "@")):
        return "'" + text
    return text


def write_comments(comments, destination):
    by_id = {str(c["id"]): c for c in comments}
    destination = Path(destination)
    columns = ["id", "parent_id", "user", "created_at",
               "resolved_at", "thread_resolved_at", "message", "client_meta"]
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", newline="", encoding="utf-8-sig",
            dir=destination.parent, delete=False
        ) as handle:
            temporary = Path(handle.name)
            writer = csv.writer(handle)
            writer.writerow(columns)
            for comment in comments:
                parent_id = str(comment.get("parent_id") or "")
                root = by_id.get(parent_id, comment)
                values = [comment["id"], parent_id,
                          (comment.get("user") or {}).get("handle", ""),
                          comment.get("created_at", ""),
                          comment.get("resolved_at", ""),
                          root.get("resolved_at", ""),
                          comment.get("message", ""),
                          json.dumps(comment.get("client_meta"), ensure_ascii=False)]
                writer.writerow([csv_text(v) for v in values])
        temporary.replace(destination)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main():
    key = os.environ["FIGMA_FILE_KEY"]
    if not re.fullmatch(r"[A-Za-z0-9_-]+", key):
        raise SystemExit("FIGMA_FILE_KEYにはURL全体ではなくファイルキーを設定してください")
    response = requests.get(
        f"https://api.figma.com/v1/files/{key}/comments",
        headers={"X-Figma-Token": os.environ["FIGMA_TOKEN"]},
        params={"as_md": "true"}, timeout=60
    )
    if response.status_code == 429:
        retry_after = response.headers.get("Retry-After", "取得できませんでした")
        raise SystemExit(f"API制限に達しました。Retry-After（秒）: {retry_after}。指定時間後に再実行してください")
    response.raise_for_status()
    comments = response.json()["comments"]
    if not isinstance(comments, list):
        raise ValueError("commentsの形式が想定と異なります")
    write_comments(comments, "comments.csv")
    print(f"{len(comments)}件をcomments.csvへ保存しました")


if __name__ == "__main__":
    main()
