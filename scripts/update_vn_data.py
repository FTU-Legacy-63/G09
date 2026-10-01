"""Refresh real VN histories after the close; retain dated entries on partial failure."""

import argparse
import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from demo.vn_data import UNIVERSE, _snapshot, fetch_vn_series


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    old = _snapshot(int(datetime.now(timezone.utc).timestamp() // 300))
    series = dict(old.get("series", {}))
    errors = {}
    with ThreadPoolExecutor(max_workers=3) as pool:
        jobs = {pool.submit(fetch_vn_series, symbol): symbol for symbol in UNIVERSE}
        for future in as_completed(jobs):
            symbol = jobs[future]
            try:
                series[symbol] = future.result()
                print(f"{symbol}: {len(series[symbol]['prices'])} closes through {series[symbol]['prices'][-1][0]}")
            except Exception as exc:
                errors[symbol] = str(exc)
                print(f"{symbol}: refresh failed; dated previous entry retained", file=sys.stderr)
    if any(symbol in errors for symbol in ("VN30.VN", "VNINDEX.VN", "VIC.VN", "FRT.VN")):
        raise RuntimeError("Core VN refresh failed. Previous published snapshot remains unchanged.")
    payload = {"schema_version": 1, "updated_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"), "source": "TradingView via tvdatafeed", "series": series, "refresh_errors": errors}
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    main()
