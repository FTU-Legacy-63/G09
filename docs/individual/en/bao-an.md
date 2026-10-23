# Individual Contribution Report — Lê Bảo An

## I. Role and accountability

As Team Representative and Lead Developer, I was accountable for converting the group's financial specifications into a working, testable and deployable product. My scope covered system architecture, core computation, constrained optimization, the complete Monte Carlo simulation workflow, integration, automated testing and production deployment. I also coordinated the technical hand-offs between the data, methodology, QA and interface workstreams.

My responsibility was implementation rather than unilateral ownership of every business assumption. Hoàng Khánh Linh approved the financial meaning and claim boundaries; Trần Minh Ngọc specified data provenance and compatibility; Nguyễn Quỳnh Anh defined acceptance tests; and Nguyễn Ngọc Anh designed the information hierarchy. I implemented and integrated those specifications into the application.

## II. Distinctive contribution to Finfolio 2.0

### 2.1 Non-blocking quantitative architecture

I separated optimization and simulation from the browser's main thread through `research-worker.mjs`. Frank-Wolfe optimization and 2,000 Monte Carlo paths over a 252-session horizon require substantial repeated matrix operations. Executing them in a Web Worker prevents the interface from freezing and allows progress and results to be communicated asynchronously through `postMessage`.

### 2.2 Constrained optimization engine

I implemented the minimum-volatility and approximate maximum-Sharpe workflows in `optimizer.mjs`. The feasible set is long-only, sums to 100%, and applies both per-instrument and commodity-group caps. The implementation checks feasibility before searching, reports convergence diagnostics, and presents the result as a reference allocation rather than an investment recommendation.

### 2.3 Full ownership of Monte Carlo simulation

I designed, implemented and tested the Joint Moving-Block Bootstrap workflow in `simulation.mjs` and its Web Worker integration. Common blocks of five historical daily-return observations are sampled across all assets, preserving contemporaneous cross-asset dependence and short volatility clusters better than independent normal draws. A seeded linear congruential generator makes results reproducible. The output includes 5th, 25th, 50th, 75th and 95th percentiles, loss probability, simulated VaR/CVaR, a fan chart and a terminal-value histogram. This technical scope belongs to my footprint, not to the UI/UX footprint.

## III. Work completed across the project

### 3.1 Architecture and repository foundation — Weeks 1–2

- Structured the repository into application, documentation and CI/CD areas.
- Selected a lightweight Vanilla JavaScript ES Modules frontend with a Python data API and Vercel serverless deployment.
- Defined the end-to-end flow from portfolio input to market data, calculation, explanation and decision recording.

### 3.2 Data contracts and API integration — Week 3

- Implemented canonical objects for portfolio holdings, price matrices, FX series and benchmark series.
- Built API routes for market data, symbol search and data-status metadata.
- Integrated the data requirements defined by the Data Lead without exposing a user's portfolio in freshness checks.

### 3.3 Financial computation engine — Weeks 4–5

- Implemented buy-and-hold value paths, portfolio weights and return contribution in `finance.mjs`.
- Implemented sample covariance, annualized volatility, marginal contribution to risk and Euler component risk.
- Implemented the three-part FX attribution identity in `attribution.mjs`: local-asset effect, exchange-rate effect and interaction effect.

### 3.4 Optimization and Monte Carlo — Weeks 6–7

- Implemented Frank-Wolfe conditional-gradient logic for constrained minimum variance.
- Implemented multi-start approximate maximum Sharpe using equal-weight, inverse-volatility and minimum-volatility initial points.
- Implemented seeded Joint Moving-Block Bootstrap simulation, percentile aggregation and tail-risk outputs.
- Connected optimization and simulation to a Web Worker and the `/optimize` and `/simulation` pages.

### 3.5 Deployment, visualization integration and verification — Week 7

- Integrated the native-SVG PnL chart and the seven-page application routing.
- Configured Vercel rewrites and GitHub Actions market-data refresh jobs.
- Integrated the JavaScript and Python verification suites and monitored production deployments.

## IV. Evidence and reproducibility

| Deliverable | Actual contribution | Repository evidence | How to reproduce or explain it |
| --- | --- | --- | --- |
| Core financial engine | Implemented portfolio return, covariance and Euler risk calculations | `demo/finance.mjs` | Run `node --test demo/finance.test.mjs`; explain the Euler reconciliation |
| Optimization | Implemented constrained min-volatility and approximate max-Sharpe routines | `demo/optimizer.mjs` | Run `node --test demo/research.test.mjs`; demonstrate feasible caps on `/optimize` |
| Monte Carlo simulation | Designed and implemented seeded moving-block bootstrap and tail outputs | `demo/simulation.mjs`, `demo/research-worker.mjs` | Fix a seed, rerun, and show identical percentiles and VaR/CVaR |
| API and integration | Connected Python data adapters to the browser calculation pipeline | `demo/server.py`, `demo/global_data.py`, `demo/vn_data.py` | Start the local server and inspect `/api/market-data` and `/api/data-status` |
| Deployment | Configured routes, scheduled refresh and production delivery | `vercel.json`, `.github/workflows/update-vn-data.yml` | Open each production route and inspect Actions history |

## V. Weekly evidence trail

| Week | Verified output | Personal significance |
| --- | --- | --- |
| W1 | Repository structure and version-control conventions | Established the technical foundation |
| W2 | System and data-computation architecture | Converted the product concept into an implementable design |
| W3 | Canonical data objects and initial API routing | Stabilized interfaces between team workstreams |
| W4 | First working `finance.mjs` engine | Converted financial formulas into executable logic |
| W5 | Input-to-analysis integration | Produced an interactive end-to-end build |
| W6 | First production deployment and build verification | Made the demo externally accessible |
| W7 | Optimization, complete Monte Carlo workflow, Web Worker and final integration | Delivered the final technical release |

## VI. Limitations and lessons learned

The product uses end-of-day observations rather than tick-level real-time data. Serverless execution and free upstream sources also impose latency and rate-limit constraints. Optimization and Monte Carlo are historical scenario tools: neither constitutes an out-of-sample forecast or guaranteed return. The current implementation should therefore be read as a reproducible diagnostic environment.

The principal lesson was that numerical correctness must be protected by interfaces and tests, not by developer confidence. Separating computation from the UI improved responsiveness, while seeded simulation and reconciliation identities made complex results defensible. I can personally demonstrate the full path from input data through worker execution to the rendered output and reproduce the related automated checks.
