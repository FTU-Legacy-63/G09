# Week 3 sample data

## Purpose

This folder contains a small traceable fixture for the Week 3 information-readiness checkpoint.

- `sample_portfolio.csv` is a **team-created sample portfolio**, not customer information and not problem evidence.
- `sample_config.csv` records the shared calculation context.
- `sample_market_data.csv` contains **real historical close observations** retrieved through `yahoo-finance2` on 2026-08-26 UTC.

## Dataset boundary

The fixture uses 10 common session dates from 2026-07-01 to 2026-07-15 for FPT, HPG, GLD, BTC-USD, E1VFVN30 and USD/VND. It is intentionally small so another member can inspect and reproduce the early logic test.

The 10-date window is not sufficient for a decision-grade CAGR or volatility estimate. It tests parsing, currency conversion, allocation, return aggregation and risk-contribution arithmetic only. A longer approved window is required before user-facing interpretation.

## Price convention

- Field used: unadjusted daily `close`.
- Return claim: price return only; dividends and transaction costs are excluded.
- USD assets are converted to VND using the same-date `USDVND` close.
- Dates are normalized to a session-date key before the common-date intersection.
- Values are rounded only when written to CSV; source precision is retained to six decimal places where relevant.

## Reproducibility note

The source adapter is provisional. Yahoo Finance coverage and responses can change, so the committed CSV is the stable evidence for this checkpoint. Source URLs, use and limitations are documented in [`SOURCE_REGISTER.md`](../docs/SOURCE_REGISTER.md).
