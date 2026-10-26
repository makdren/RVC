"""Суточный снимок счётчиков GitHub Releases для страницы «Статистика».

Приложение ничего не отправляет разработчику. Источник — открытые счётчики скачиваний GitHub:
APK по версиям и архитектурам и update.json, который каждая установка RVC запрашивает раз в сутки.
Прирост скачиваний update.json за день ≈ число активных установок.
"""
import datetime
import json
import os
import sys
import urllib.request

REPO = os.environ.get("GITHUB_REPOSITORY", "makdren/RVC")
OUT = sys.argv[1] if len(sys.argv) > 1 else "stats.json"


def releases():
    req = urllib.request.Request(
        f"https://api.github.com/repos/{REPO}/releases?per_page=100",
        headers={"Accept": "application/vnd.github+json", "Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def main():
    snap = {"date": datetime.date.today().isoformat(), "releases": {}}
    for rel in releases():
        assets = {}
        for a in rel.get("assets", []):
            name = a["name"]
            if name == "update.json":
                assets["update.json"] = a["download_count"]
            elif name.startswith("RVC-") and name.endswith(".apk"):
                # RVC-1.0.3-arm64-v8a.apk → arm64-v8a (в имени ABI тоже бывают дефисы).
                abi = name.removesuffix(".apk").split("-", 2)[2]
                assets[abi] = a["download_count"]
        snap["releases"][rel["tag_name"]] = assets
    history = []
    if os.path.exists(OUT):
        with open(OUT, encoding="utf8") as f:
            history = json.load(f)
    history = [h for h in history if h["date"] != snap["date"]] + [snap]
    with open(OUT, "w", encoding="utf8") as f:
        json.dump(history, f, ensure_ascii=False, indent=1)
    print(f"{snap['date']}: {len(snap['releases'])} releases, {len(history)} snapshots")


main()
