# Final Individual Contribution Verification

**Project:** Finfolio 2.0  
**Group:** G09 — Foreign Trade University  
**Purpose:** Identify each member’s most important contribution and trace a selected financial feature from methodology through implementation and verification.

## Question 1 — Each member’s most important contribution

Finfolio 2.0 analyzes hypothetical multi-asset portfolios using supported historical market data. The final application combines financial methodology, data controls, software calculations, product verification, and an interface that explains results. The descriptions below distinguish those responsibilities and point to repository evidence that can be reviewed alongside the application.

<a id="linh"></a>

### Hoàng Khánh Linh — Financial methodology and product ownership

Linh’s central contribution was specifying what the application’s financial outputs mean and the conditions under which they can be interpreted. She defined the buy-and-hold basis for portfolio value and return contributions, including the requirement that the holding-level contributions reconcile to the portfolio result. For risk attribution, she specified the covariance-based Euler decomposition: component contributions should add back to annualized portfolio volatility. For foreign-currency holdings, she set the three-part decomposition into local-price return, FX return, and their interaction, so that the VND result can be explained without assigning the entire movement to the asset price alone.

She also defined the objectives and interpretation of the minimum-volatility and maximum-Sharpe allocation exercises. The optimizer uses historical inputs and long-only weights that total 100%, with per-instrument and commodity-proxy limits. Linh’s product boundary is that these weights are analytical reference allocations, not personalized advice or instructions to trade; the application must disclose assumptions and avoid presenting an estimated result as a guaranteed improvement. These specifications are used in the Methods and Optimization explanations and form the financial contract implemented by the calculation layer.

**Evidence:** [Final methods](docs/FINAL_METHODS.md), [optimization methodology](docs/OPTIMIZATION.md), [FX attribution](docs/FX_ATTRIBUTION.md), [Week 4 financial logic](docs/WEEK4.md), and [Linh’s individual contribution record](docs/individual/en/linh.md).

<a id="minh-ngoc"></a>

### Trần Minh Ngọc — Data requirements and provenance

Ngọc’s most important contribution was defining when market observations are suitable for analysis and how their origin should be identified. She documented the supported instrument universe and the fields needed to describe each instrument, including symbol, market, asset type, quote currency, and classification. She also established source and fallback rules for Vietnam benchmarks, international instruments, and FX observations. A benchmark remains a comparison series rather than becoming a portfolio holding, and a commodity ETF is labelled as a traded proxy rather than a direct spot commodity price.

Her data contract requires holdings, benchmarks, and required FX series to use compatible observations and a common effective date range before comparative metrics are calculated. It also distinguishes user-input currency from an instrument’s quote currency and calls for validation of missing, duplicate, stale, or otherwise unusable observations. Those rules support the application’s provider adapters, instrument search, benchmark comparison, currency conversion, classification-based contribution views, and data-freshness messages. In the final product, the report should make clear which dates were actually available rather than silently substituting test data for market observations.

**Evidence:** [Week 3 information and data readiness](docs/WEEK3.md), [Week 5 feature and data contract](docs/WEEK5.md), [Week 7 final audit](docs/WEEK7.md), [data and product scope](docs/PRODUCT_SCOPE.md), and [Ngọc’s individual contribution record](docs/individual/en/minh-ngoc.md).

<a id="bao-an"></a>

### Lê Bảo An — Calculation engine and software integration

Bảo An’s most important contribution was turning the approved financial and data requirements into an integrated application. His implementation connects portfolio inputs and market-data adapters to the calculation paths used for VND portfolio values, historical returns, contribution analysis, risk measures, optimization, and simulation. He also integrated the browser interface with the application’s service routes and background computation so that heavier research tasks can run without making the main interface unresponsive.

For the selected optimization feature, Bảo An implemented the constrained calculation in `demo/optimizer.mjs`: minimum volatility uses a conditional-gradient method over the feasible allocation region, while maximum Sharpe is an approximate multi-start search. The implementation checks feasibility and reports convergence status; it does not claim that the approximate maximum-Sharpe search finds a global optimum. The final application presents the calculation as an optional research view, and the generated weights are not silently applied to the user’s current portfolio. His work therefore supplies the executable behavior behind the methodology and its disclosed limits.

**Evidence:** [optimizer implementation](demo/optimizer.mjs), [research worker](demo/research-worker.mjs), [research tests](demo/research.test.mjs), [Week 6 integration evidence](docs/WEEK6.md), [Week 7 audit](docs/WEEK7.md), and [Bảo An’s individual contribution record](docs/individual/en/bao-an.md).

<a id="quynh-anh"></a>

### Nguyễn Quỳnh Anh — Product requirements and verification

Quỳnh Anh’s central contribution was converting the product goals into observable user flows, acceptance conditions, and defect follow-up. Her work covers valid and invalid portfolio inputs, required-data gaps, financial reconciliation, feasible and infeasible allocation limits, and consistency of before-and-after comparisons. For each case, the expected behavior is meant to be visible: the application should calculate, explain, block, or report an error as appropriate rather than leaving an unexplained stale result on screen.

She also coordinated verification across the integrated build and maintained evidence of expected versus actual behavior. For optimization, her acceptance focus includes weights summing to 100%, all configured caps being respected, infeasible constraints returning an error, and comparisons using the same observation period and assumptions. This verification role is distinct from specifying the financial objective and writing the optimizer: it checks that the delivered behavior matches those requirements. The repository records automated and production checks, but those records should not be read as a large external user-acceptance study or as proof of investment performance.

**Evidence:** [Week 5 acceptance scenarios](docs/WEEK5.md), [Week 6 integration and test evidence](docs/WEEK6.md), [Week 7 final audit](docs/WEEK7.md), [research tests](demo/research.test.mjs), and [Quỳnh Anh’s individual contribution record](docs/individual/en/quynh-anh.md).

<a id="ngoc-anh"></a>

### Nguyễn Ngọc Anh — Interface and information architecture

Ngọc Anh’s most important contribution was organizing a complex set of portfolio calculations into a usable interface. She shaped the application’s page structure and visual system so users can move from portfolio input to analysis, optimization, simulation, and methodology without placing every control and result on one screen. Her design work includes the Forest/Paper visual language, Vietnamese-compatible typography, responsive layouts, and progressive disclosure of the result, its explanation, and its limitations.

She also designed how important analytical comparisons appear to users, including portfolio value over time, benchmark context, grouped contribution views, and a before-and-after view for a reference allocation. These interface choices help users inspect actual values and understand what changed when they request an optimization. The design presents an allocation as something to examine, not an action that is automatically taken. This contribution complements the financial specification and implementation by making the outputs and their caveats accessible in the final application.

**Evidence:** [application structure](demo/index.html), [design tokens](demo/tokens.css), [typography](demo/typography.css), [product styles](demo/product.css), [responsive redesign styles](demo/redesign.css), [chart utilities](demo/chart-utils.mjs), and [Ngọc Anh’s individual contribution record](docs/individual/en/ngoc-anh.md).

## Question 2 — Selected feature: constrained portfolio optimization

The selected feature is the optional portfolio optimizer on `/optimize`. It combines financial methodology and software implementation: it estimates a reference allocation from historical returns and covariance, then compares that allocation with the current one under disclosed assumptions. Its contribution chain is identifiable in the project evidence.

### Methodology, implementation, and verification

**Methodology — Hoàng Khánh Linh.** Linh specified minimum-volatility and approximate maximum-Sharpe objectives, long-only weights summing to 100%, per-instrument limits, a total cap for commodity proxies, and the use of a disclosed risk-free-rate assumption for Sharpe calculations. She also set the interpretation boundary: the output is a historical, in-sample reference allocation, not an investment recommendation. These decisions are recorded in [Optimization](docs/OPTIMIZATION.md) and [Final Methods](docs/FINAL_METHODS.md).

**Data readiness — Trần Minh Ngọc.** Ngọc’s data requirements ensure that the historical observations used by the optimizer are identified, sufficiently available, and aligned across holdings before the calculation proceeds. This matters because the mean returns and covariance matrix are meaningful only in relation to the actual sample and compatible dates. The data and sample limitations are recorded in [Week 3](docs/WEEK3.md), [Product Scope](docs/PRODUCT_SCOPE.md), and [Week 7](docs/WEEK7.md).

**Software implementation — Lê Bảo An.** Bảo An implemented the optimization routines and feasibility behavior in [the optimizer module](demo/optimizer.mjs), with research computation connected through [the worker](demo/research-worker.mjs). The minimum-volatility solver uses conditional gradient over the constrained feasible region and exposes convergence information. Maximum Sharpe is an approximate search from multiple starting points; it does not guarantee a global optimum. The interface runs optimization only when requested and keeps the generated allocation separate from the current portfolio.

**Verification — Nguyễn Quỳnh Anh.** Quỳnh Anh’s acceptance and audit evidence checks whether the output obeys the requested constraints and whether the comparison is made on a consistent basis. The documented cases include a two-asset analytic fixture, feasible and infeasible caps, a 100% total-weight check, and separate handling of the two objectives. The test fixture provides evidence about arithmetic and software behavior; it is not evidence that the optimizer will outperform a market or portfolio. See [research tests](demo/research.test.mjs), [Week 5 acceptance scenarios](docs/WEEK5.md), and [Week 7 expected-versus-actual checks](docs/WEEK7.md).

**Interface — Nguyễn Ngọc Anh.** Ngọc Anh’s design work makes the current and optimized allocations and their historical comparison inspectable, while preserving the distinction between analysis and action. The comparison is presented as a reference scenario, and the application does not apply the weights or place trades. Relevant evidence is in [the application interface](demo/index.html), [the product styles](demo/product.css), and the [Week 7 audit](docs/WEEK7.md).

### What is better than Finfolio 1.0

The documented improvement is constraint correctness and clearer error handling. The Finfolio 1.0 workflow normalized heuristic weights after calculation; normalization could change those weights in a way that left configured per-instrument or commodity caps unsatisfied. Finfolio 2.0 searches or validates within the feasible allocation set, checks the individual and aggregate limits together, and reports infeasible constraints instead of presenting an invalid allocation as a result. It also supports distinct minimum-volatility and approximate maximum-Sharpe objectives and lets users compare the reference allocation with the current one under the same selected observations and assumptions. The comparison is grounded in the project’s [Week 6 record](docs/WEEK6.md), [optimization specification](docs/OPTIMIZATION.md), and [Week 7 verification table](docs/WEEK7.md).

This improvement is about producing a more valid, inspectable, and constraint-aware analysis. It does not establish higher returns or lower realized risk. Both objectives rely on historical estimates; results are in-sample, maximum Sharpe is approximate, and the optimizer has no out-of-sample performance validation. Fees, taxes, and turnover are not included. The documented two-asset values are analytic test fixtures, not live-market results or evidence of future performance.

## Evidence and attribution notes

The links above point to project records, implementation, and test artefacts so a reviewer can distinguish a specification from code and code from verification. Individual contribution records describe each person’s assigned work; members should be prepared to open and explain their cited artefacts. Automated checks support claims about the tested software behavior only, while production smoke checks and local fixtures have their own stated scope and limitations.
