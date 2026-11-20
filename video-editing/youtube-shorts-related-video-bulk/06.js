"""YouTube ショートの「関連動画」を YouTube Studio の画面操作でまとめて設定する（記事のサンプル）。

前提
  - pip install playwright（ブラウザーは手元の Chrome を使うので playwright install は不要）
  - YouTube Studio の表示言語が日本語（画面の文言で要素を探すため）
  - 対応表 pairs.csv（1行目は見出し）: short_id,main_id,main_title

使い方
  python shorts_related.py chrome            専用の Chrome を開く → その Chrome で Studio にログインしておく
  python shorts_related.py scan pairs.csv    今の関連動画を読むだけ（変更しない）
  python shorts_related.py set pairs.csv     関連動画を設定する（済んだものは飛ばす。記録は log.json）
  python shorts_related.py set pairs.csv --only <ショートID>   1本だけ試す
"""
import csv
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE = os.path.join(HERE, "studio-profile")  # ログイン情報が入るので Git などに入れない
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 9333
LOG = os.path.join(HERE, "log.json")


def open_chrome():
    subprocess.Popen([CHROME, f"--remote-debugging-port={PORT}", f"--user-data-dir={PROFILE}",
                      "--no-first-run", "--no-default-browser-check", "https://studio.youtube.com/"])


def studio_page(p):
    # つながったまま固まることがある。30秒で諦めて、専用の Chrome を開き直す
    browser = p.chromium.connect_over_cdp(f"http://127.0.0.1:{PORT}", timeout=30000)
    pages = [x for x in browser.contexts[0].pages if "studio.youtube.com" in x.url]
    page = pages[-1] if pages else browser.contexts[0].new_page()
    # 失敗して未保存のまま次へ移るときの「このサイトを離れますか？」は離れる
    page.on("dialog", lambda d: d.accept())
    return page


def open_edit(page, vid):
    """ショートの編集画面を開き、「関連動画」の欄を返す。"""
    url = f"https://studio.youtube.com/video/{vid}/edit"
    for k in range(3):
        try:
            page.goto(url, wait_until="domcontentloaded")
            break
        except Exception as e:
            # Studio 自身の画面遷移と重なると "interrupted by another navigation" になる
            if "interrupted" not in str(e) or k == 2:
                raise
            page.wait_for_timeout(3000)
    if "accounts.google.com" in page.url:
        sys.exit("Studio からログアウトしています。専用の Chrome でログインし直してください")
    field = page.locator("ytcp-video-metadata-editor-sidepanel ytcp-dropdown-trigger",
                         has=page.locator(".label-text", has_text="関連動画"))
    field.wait_for(timeout=30000)
    page.wait_for_timeout(1500)
    return field


def current(field):
    """欄に出ている動画の題。未設定のときは「なし」と出るので空にする。"""
    lines = [s.strip() for s in field.inner_text().split("\n") if s.strip()]
    lines = [s for s in lines if s not in ("関連動画", "なし")]
    return lines[0] if lines else ""


def set_one(page, row):
    field = open_edit(page, row["short_id"])
    if current(field) == row["main_title"]:
        return "設定済み（変更なし）"
    field.scroll_into_view_if_needed()
    field.click()
    dialog = page.locator("ytcp-dialog.ytcp-video-pick-dialog")
    box = dialog.locator("input[placeholder='自分の動画を検索']")
    box.wait_for(timeout=15000)
    box.fill(row["main_title"][:40])
    # サムネイル画像の URL に入っている動画 ID で選ぶ（題の似た動画を選び間違えない）
    card = dialog.locator(f"ytcp-entity-card:has(div.thumbnail[style*='/{row['main_id']}/'])").first
    card.wait_for(timeout=15000)
    card.click()
    dialog.locator("tp-yt-paper-dialog").wait_for(state="hidden", timeout=15000)
    if current(field) != row["main_title"]:
        raise RuntimeError(f"選んだあとの表示が違う：{current(field)}")
    page.locator("ytcp-button#save").click()
    # 保存が終わると「保存」ボタンが押せない状態に戻る
    page.wait_for_function("() => document.querySelector('ytcp-button#save')?.getAttribute('aria-disabled') === 'true'",
                           timeout=30000)
    page.wait_for_timeout(1500)
    after = current(open_edit(page, row["short_id"]))  # 開き直して確かめる
    if after != row["main_title"]:
        raise RuntimeError(f"保存後に開き直すと違う：{after or '（未設定）'}")
    return "設定した（開き直して確認）"


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "chrome":
        open_chrome()
        return
    if cmd not in ("scan", "set") or len(sys.argv) < 3:
        sys.exit(__doc__)
    rows = list(csv.DictReader(open(sys.argv[2], encoding="utf-8-sig")))
    if "--only" in sys.argv:
        rows = [r for r in rows if r["short_id"] == sys.argv[sys.argv.index("--only") + 1]]
    log = json.load(open(LOG, encoding="utf-8")) if os.path.exists(LOG) else {}

    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        page = studio_page(p)
        fails = 0
        for i, row in enumerate(rows, 1):
            if cmd == "scan":
                now = current(open_edit(page, row["short_id"]))
                state = "一致" if now == row["main_title"] else ("未設定" if not now else "別の動画")
                print(f"{i:3d} {state} {row['short_id']} -> {now}", flush=True)
                continue
            if log.get(row["short_id"], "").startswith("設定"):
                continue
            try:
                result = set_one(page, row)
            except Exception as e:
                result = f"失敗：{type(e).__name__}: {str(e).splitlines()[0][:150]}"
                fails += 1
            log[row["short_id"]] = result
            json.dump(log, open(LOG, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            print(f"{i:3d} {row['short_id']} {result}", flush=True)
            if fails >= 3:
                sys.exit("失敗が3本になったので止めました")
            time.sleep(1)


if __name__ == "__main__":
    main()
