# Individual Contribution Report — Hoàng Khánh Linh

## I. Role and accountability

As Product Owner and Financial Logic Lead, I defined the product scope and approved the financial meaning of Finfolio 2.0 outputs. My work focused on return attribution, Euler risk attribution, FX attribution, optimization assumptions and claim boundaries. I did not own benchmark data engineering or Monte Carlo implementation: benchmark, currency and common-date requirements belong to Trần Minh Ngọc, while the Monte Carlo algorithm and implementation belong to Lê Bảo An.

## II. Distinctive contribution to Finfolio 2.0

### 2.1 Euler risk-attribution methodology

I specified the relationship between portfolio volatility, marginal contribution to risk and component risk. For a daily covariance matrix Σ and portfolio weights w, annualized volatility is σₚ = √(252 · wᵀΣw). Component risk is RCᵢ = wᵢ(Σw)ᵢ√252 / √(wᵀΣw), with the acceptance identity ∑RCᵢ = σₚ. This converts a single volatility number into an attributable and reconcilable explanation.

### 2.2 Three-part FX attribution

For foreign-currency assets, I specified the exact identity rVND = (1 + rlocal)(1 + rFX) − 1. The contribution is separated into local-asset return, FX return and their interaction. The three components must reconcile with the VND-denominated holding return, preventing an international asset's performance from being incorrectly attributed only to its market price.

### 2.3 Responsible optimization framing

I defined minimum-volatility and maximum-Sharpe as historical reference-allocation exercises subject to long-only weights, a 100% total, per-instrument caps and a commodity-group cap. I also established the terminology “reference allocation” and rejected claims such as “best portfolio” or guaranteed improvement. This boundary is essential because estimated means and covariance matrices are sample-dependent.

## III. Work completed across the project

### 3.1 Problem and product scope — Weeks 1–2

- Helped select Finfolio 2.0 from the candidate project ideas and defined the target user as a self-directed retail investor with a multi-asset portfolio.
- Specified the core sequence: essential inputs, validation, current analysis, attribution, comparison, explanation and user decision.
- Limited the product to supported stocks and commodity proxies with transparent data coverage.

### 3.2 Return and contribution logic — Week 4

- Defined the buy-and-hold portfolio value path and period return.
- Required return contributions to reconcile with total portfolio return.
- Defined mutually exclusive grouping rules for instrument, asset class, sector and industry views.

### 3.3 Risk methodology — Week 4

- Specified sample covariance and annualization conventions.
- Defined marginal and Euler component risk with a numerical reconciliation tolerance.
- Required the financial engine to calculate only after the data layer has passed compatibility and common-date checks.

### 3.4 Optimization assumptions — Weeks 4–7

- Defined the minimum-variance and maximum-Sharpe objectives and their constraints.
- Approved the inherited 3% annual risk-free-rate default, with explicit disclosure and an advanced override rather than a mandatory user input.
- Required before/after comparisons to use the same period, observations and assumptions.

### 3.5 Method approval and claim boundaries — Week 7

- Reviewed definitions and explanations for CAGR, drawdown, Sharpe, Sortino, Calmar, historical VaR/CVaR, skewness, excess kurtosis, beta, alpha, tracking error and information ratio.
- Required each advanced metric to show its unit, assumption and limitation.
- Approved analytical wording while excluding personalized investment advice.

## IV. Evidence and reproducibility

| Deliverable | Actual contribution | Repository evidence | How to reproduce or explain it |
| --- | --- | --- | --- |
| Return methodology | Buy-and-hold value and return-contribution reconciliation | `docs/WEEK4.md`, `demo/finance.mjs` | Explain why contributions sum to portfolio return |
| Euler risk | Covariance, marginal risk and component-risk identity | `docs/WEEK4.md`, `demo/finance.mjs` | Reconcile ∑RCᵢ with annualized portfolio volatility |
| FX attribution | Local-price, FX and interaction decomposition | `docs/FX_ATTRIBUTION.md`, `demo/attribution.mjs` | Use a VND stock plus a USD commodity proxy example |
| Optimization assumptions | Objectives, constraints, risk-free-rate and in-sample boundary | `docs/OPTIMIZATION.md` | Explain feasible caps and why the output is only a reference |
| Metric and claim review | Definitions, units, assumptions and permitted wording | `docs/FINAL_METHODS.md`, `docs/WEEK5.md` | Trace each visible metric to its disclosed method |

## V. Weekly evidence trail

| Week | Verified output | Personal significance |
| --- | --- | --- |
| W1 | Problem statement and target user | Grounded the project in a specific investor need |
| W2 | MVP logic and product boundary | Prevented uncontrolled feature expansion |
| W3 | Financial conditions to be satisfied by the data layer | Separated methodology from data ownership |
| W4 | Return, Euler risk, FX and optimization specifications | Provided the core financial contract for implementation |
| W5 | Claim-boundary and explanation review | Prevented advice-like language |
| W6 | Financial reconciliation acceptance | Checked implementation against the approved method |
| W7 | Final method and optimization review | Finalized the defensible analytical scope |

## VI. Limitations and lessons learned

The model currently focuses on price return and does not fully model dividend reinvestment. The 3% risk-free rate is a disclosed static assumption, and maximum-Sharpe weights remain exposed to in-sample estimation error. These limitations are visible because an analytically correct formula can still be inappropriate if its assumptions are hidden.

My main lesson was to separate three responsibilities: financial methodology, data readiness and software implementation. A Product Owner should approve what a measure means and what may be claimed from it, while the Data Lead establishes valid observations and the Lead Developer builds the reproducible calculation.
