"""
Cloudflare Analytics Agent
Pulls web traffic data for theinterestinggroup.com via Cloudflare GraphQL API.

Available data:
  - Daily unique visitors, page views, requests
  - 7-day trend with week-over-week comparison
  - Traffic spike detection (did an email campaign drive visits?)

Used by: daily_recap() in autonomous_pipeline.py
"""

import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

CLOUDFLARE_READ_TOKEN = os.getenv("CLOUDFLARE_CLAUDE_READ")
ZONE_ID = os.getenv("CLOUDFLARE_ZONE_ID")
GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {CLOUDFLARE_READ_TOKEN}",
        "Content-Type": "application/json",
    }


def get_daily_analytics(days: int = 7) -> list:
    """
    Pull daily web traffic for the last N days.
    Returns list of dicts sorted newest first:
      { date, uniques, page_views, requests, bytes }
    """
    since = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")

    query = """
    {
      viewer {
        zones(filter: {zoneTag: "%s"}) {
          httpRequests1dGroups(
            limit: %d
            orderBy: [date_DESC]
            filter: {date_gt: "%s"}
          ) {
            dimensions { date }
            sum { requests pageViews bytes }
            uniq { uniques }
          }
        }
      }
    }
    """ % (ZONE_ID, days + 1, since)

    resp = requests.post(GRAPHQL_URL, headers=_headers(), json={"query": query})
    resp.raise_for_status()

    data = resp.json()
    groups = (
        data.get("data", {})
            .get("viewer", {})
            .get("zones", [{}])[0]
            .get("httpRequests1dGroups", [])
    )

    results = []
    for g in groups:
        results.append({
            "date":       g["dimensions"]["date"],
            "uniques":    g["uniq"]["uniques"],
            "page_views": g["sum"]["pageViews"],
            "requests":   g["sum"]["requests"],
            "bytes":      g["sum"]["bytes"],
        })

    return results


def get_traffic_summary() -> dict:
    """
    Returns a summary dict for use in the daily recap:
      - today: uniques, page_views
      - yesterday: uniques, page_views
      - week_total: uniques, page_views
      - prev_week_total: uniques, page_views (for WoW comparison)
      - wow_change_pct: week-over-week % change in uniques
      - spike_today: bool — today's uniques > 2x daily average
      - trend: list of (date, uniques) for last 7 days
    """
    try:
        data = get_daily_analytics(days=14)
    except Exception as e:
        return {"error": str(e)}

    if not data:
        return {"error": "No data returned from Cloudflare"}

    # Sort newest first (already is, but be safe)
    data = sorted(data, key=lambda x: x["date"], reverse=True)

    today_str     = datetime.utcnow().strftime("%Y-%m-%d")
    yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

    today     = next((d for d in data if d["date"] == today_str),     {"uniques": 0, "page_views": 0})
    yesterday = next((d for d in data if d["date"] == yesterday_str), {"uniques": 0, "page_views": 0})

    # Last 7 days vs previous 7
    last_7  = [d for d in data if d["date"] >= (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")]
    prev_7  = [d for d in data if d["date"] <  (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")]

    week_uniques      = sum(d["uniques"]    for d in last_7)
    week_page_views   = sum(d["page_views"] for d in last_7)
    prev_week_uniques = sum(d["uniques"]    for d in prev_7)

    wow_pct = 0.0
    if prev_week_uniques > 0:
        wow_pct = round((week_uniques - prev_week_uniques) / prev_week_uniques * 100, 1)

    # Spike: today > 2x the 7-day daily average (excluding today)
    avg_daily = week_uniques / max(len(last_7), 1)
    spike_today = today["uniques"] > (avg_daily * 2) and today["uniques"] > 20

    trend = [(d["date"], d["uniques"]) for d in sorted(last_7, key=lambda x: x["date"])]

    return {
        "today":            today,
        "yesterday":        yesterday,
        "week_uniques":     week_uniques,
        "week_page_views":  week_page_views,
        "prev_week_uniques": prev_week_uniques,
        "wow_change_pct":   wow_pct,
        "spike_today":      spike_today,
        "avg_daily_uniques": round(avg_daily, 1),
        "trend":            trend,
    }


def format_recap_section() -> str:
    """
    Returns a formatted string block for insertion into the daily recap email.
    """
    sep = "─" * 52
    summary = get_traffic_summary()

    if "error" in summary:
        return f"\n{sep}\n  WEBSITE TRAFFIC\n{sep}\n  Could not load: {summary['error']}\n"

    today     = summary["today"]
    yesterday = summary["yesterday"]
    wow       = summary["wow_change_pct"]
    wow_arrow = "↑" if wow >= 0 else "↓"
    wow_str   = f"{wow_arrow} {abs(wow)}% vs last week"

    spike_alert = ""
    if summary["spike_today"]:
        spike_alert = f"\n  🔥 TRAFFIC SPIKE — {today['uniques']} visitors today (avg: {summary['avg_daily_uniques']})"

    # Mini sparkline from trend data
    trend_vals = [u for _, u in summary["trend"]]
    max_v = max(trend_vals) if trend_vals else 1
    bars = ["▁","▂","▃","▄","▅","▆","▇","█"]
    sparkline = "".join(bars[min(int(v / max_v * 7), 7)] for v in trend_vals)

    lines = [
        "",
        sep,
        "  WEBSITE  —  theinterestinggroup.com",
        sep,
        f"  Today           : {today['uniques']} visitors  |  {today['page_views']} page views",
        f"  Yesterday       : {yesterday['uniques']} visitors  |  {yesterday['page_views']} page views",
        f"  This week       : {summary['week_uniques']} visitors  |  {summary['week_page_views']} page views  ({wow_str})",
        f"  7-day trend     : {sparkline}",
        spike_alert,
        "",
    ]

    return "\n".join(l for l in lines if l is not None)


if __name__ == "__main__":
    import sys
    if "--summary" in sys.argv:
        import json
        print(json.dumps(get_traffic_summary(), indent=2))
    else:
        print(format_recap_section())
