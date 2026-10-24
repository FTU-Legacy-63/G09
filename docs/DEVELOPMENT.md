# Local Development and Operations

This guide is for contributors running or maintaining Finfolio 2.0. The product overview is in the [root README](../README.md); current product behavior and financial assumptions are in [Product Scope](PRODUCT_SCOPE.md) and [Final Methods](FINAL_METHODS.md).

## Local setup

Run these commands from the repository root. Node.js and Python 3 are required.

```bash
npm ci
npm run build
python3 -m pip install -r demo/requirements.txt
python3 demo/server.py
```

The local application is served at <http://127.0.0.1:8123/>. Open `/portfolio` to enter holdings. `demo/server.py` serves the browser application and its local API routes together; opening `demo/index.html` with `file://` or using a static-only server does not provide the data APIs. Live market-data requests require internet access and may be limited by the providers.

`npm run build` generates local font assets and the browser Supabase bundle. The Python requirements file at `demo/requirements.txt` includes the shared pinned requirements from the repository root.

## Automated checks

Run the JavaScript and Python suites from the repository root:

```bash
npm test
python3 -m unittest discover -s demo -p 'test_*.py'
```

These tests validate arithmetic identities, input checks, API routing and provider behavior using fixtures or mocks where appropriate. A passing test suite does not establish that an external market-data provider is currently available or that the model predicts future returns.

## Application architecture

The browser interface is served from `demo/` and uses modular JavaScript for portfolio calculations, grouped attribution, optimization, metrics, Monte Carlo simulation, and UI behavior. Python routes under `api/` provide market data, symbol search, data-status metadata, and account configuration on Vercel. `demo/server.py` provides equivalent local routes for development. Deployment routing and security headers are defined in [`vercel.json`](../vercel.json).

The main application routes are `/`, `/portfolio`, `/analysis`, `/optimize`, `/simulation`, `/method`, and `/account`. The analysis page does not automatically run optimization or simulation; users open those tools separately.

## Market-data refresh and deployment notes

`.github/workflows/update-vn-data.yml` refreshes the curated Vietnam daily-price snapshot. It is scheduled for 09:17 and 13:47 UTC on weekdays (16:17 and 20:47 in Vietnam); GitHub Actions schedules are best-effort and can run late. The workflow publishes the snapshot to the `market-data` branch. The application source remains on `main`, and `vercel.json` disables deployments from the data-only branch.

The workflow updates the curated 26-symbol Vietnam universe; other supported symbols may be retrieved on demand. The app uses closed daily observations, and exchanges do not share a single closing time. There is no exchange-holiday calendar. Data age and actual session dates should be checked in the application before interpreting results. Provider errors are reported; the Week 3 files under `data/` are test fixtures and are not a live-data fallback.

The [final release](https://github.com/FTU-Legacy-63/G09/releases/tag/v2.0.0-final-20261023) records the verified deployment snapshot and reproduction commands. Confirm the release’s source commit and Vercel deployment status before describing a later checkout as deployed. Deployment status is separate from a successful local build or test run.

## Related operational documentation

- [Account configuration and privacy](ACCOUNT_SETUP.md)
- [Current scope and data coverage](PRODUCT_SCOPE.md)
- [Week 7 final verification record](WEEK7.md)
- [Data fixture boundary](../data/README.md)
