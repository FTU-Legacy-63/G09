# Lê Bảo An

## ABSTRACT

This report examines my individual contribution to Finfolio 2.0 as Team Representative and Lead Developer. The project was developed as a multi-asset portfolio analysis application for self-directed retail investors who need to understand where return and risk originate before considering a change in allocation. My work concentrated on translating the team's financial and data specifications into an integrated software system. The principal areas of responsibility were application architecture, the numerical computation layer, constrained portfolio optimization, the complete Monte Carlo simulation workflow, Web Worker execution, backend integration, automated verification, and production deployment. The report explains the reasoning behind these technical choices, identifies the repository artifacts through which they can be reproduced, and distinguishes my implementation responsibility from the methodology, data, quality-assurance, and interface responsibilities held by other members. The evidence shows that the final product connects market-data acquisition, financial computation, explanation, and user decision recording in one demonstrable workflow. It also establishes the limits of the implementation: the outputs rely on historical end-of-day observations, free upstream data services, and in-sample estimation, and therefore should be interpreted as analytical evidence rather than forecasts or investment recommendations.

**Keywords:** portfolio analytics; software architecture; constrained optimization; Monte Carlo simulation; Web Worker; reproducibility.

## I. INTRODUCTION AND INDIVIDUAL RESPONSIBILITY

Finfolio 2.0 was designed to address a practical interpretation problem. A retail investor may know the market value of a portfolio and its overall gain or loss, yet still be unable to explain which holdings generated the result, where risk is concentrated, or how a constrained alternative allocation would have behaved over the same historical observations. The product therefore had to connect several layers that are often treated separately: heterogeneous market data, currency conversion, portfolio mathematics, interactive visualization, and language that communicates uncertainty responsibly. The technical challenge was not limited to implementing isolated formulas. It required a stable architecture in which each layer could be inspected, tested, and replaced without obscuring the meaning of the final output.

As Team Representative and Lead Developer, I was accountable for converting the approved specifications into a working, testable, and deployable application. I structured the repository, established the interfaces between Python data adapters and browser-side JavaScript modules, implemented the core computation, and integrated the results into the product routes. I also owned the constrained optimization engine and the complete Monte Carlo implementation, including seeded random sampling, percentile aggregation, tail-risk measures, Web Worker execution, and the simulation interface data contract. These responsibilities are evidenced by `demo/finance.mjs`, `demo/optimizer.mjs`, `demo/simulation.mjs`, `demo/research-worker.mjs`, the Python data modules, the test suites, and the production configuration.

The contribution remained collaborative in a controlled sense. Hoàng Khánh Linh approved the financial definitions, assumptions, and permissible claims; Trần Minh Ngọc defined source provenance, currency, benchmark, and compatibility requirements; Nguyễn Quỳnh Anh converted requirements into acceptance and regression cases; and Nguyễn Ngọc Anh established the information hierarchy and visual system. My responsibility was to implement and integrate these specifications without silently changing their meaning. This separation matters because a technically functioning application can still be methodologically invalid if its data conditions, assumptions, or explanatory boundaries are ignored.

[[FIGURE:diagram_system_architecture|Finfolio 2.0 system architecture and responsibility hand-offs|Source: Author's diagram based on the Finfolio 2.0 repository.]]

## II. DISTINCTIVE CONTRIBUTIONS TO FINFOLIO 2.0

### 2.1 Modular financial computation architecture

The numerical layer was implemented as a set of JavaScript ES modules rather than embedded directly in interface event handlers. `finance.mjs` constructs portfolio value paths, holding weights, return contributions, covariance estimates, annualized volatility, and Euler component risk. `attribution.mjs` handles the decomposition of foreign-currency returns. `metrics.mjs` calculates the supplementary risk and relative-performance statistics disclosed in the methods documentation. This division allowed the same calculations to be called by the interface and by automated tests, reducing the risk that a displayed number would use logic different from the verified numerical procedure.

The architecture also imposed explicit data contracts. Holdings, price matrices, exchange-rate series, and benchmark observations are received as separate objects with date and currency metadata. Before relative or risk calculations are performed, the application checks that the series contain sufficient common observations and that invalid values have been removed. This approach made the calculation layer dependent on declared inputs rather than on provider-specific response shapes. It also supported a clear hand-off from the Data Lead: the data layer establishes whether observations are traceable and compatible, after which the financial engine performs the approved calculation.

The portfolio value path is based on an initial allocation and buy-and-hold quantities. In simplified form, the value at date t is represented as follows:

[[EQUATION:portfolio_value]]

This construction allows the chart to display actual portfolio value in VND rather than a normalized base-100 index. It also creates a common numerical foundation for period return, contribution, benchmark comparison, optimization comparison, and simulation starting value.

### 2.2 Constrained optimization engine

I implemented two reference-allocation workflows in `optimizer.mjs`: constrained minimum volatility and approximate maximum Sharpe. Both use a long-only feasible set, require weights to sum to 100%, and apply limits to each instrument and to the commodity-proxy group. The implementation first evaluates whether the constraints are feasible. For example, an allocation cannot be formed when the sum of permitted maximum weights is below 100%. Detecting this condition before numerical search prevents the system from presenting a plausible-looking vector that violates the user's stated limits.

The minimum-volatility routine uses a conditional-gradient approach suited to linear constraints. The maximum-Sharpe workflow evaluates multiple starting points, including equal-weight, inverse-volatility, and minimum-volatility candidates, because the ratio objective is more sensitive to estimated means and initialization. The interface reports convergence information and labels the result as an estimated reference allocation. When the iteration limit is reached, the application discloses that the numerical threshold was not attained rather than describing the candidate as an exact global optimum.

[[EQUATION:optimization_objectives]]

The before-and-after comparison uses the same historical observations and assumptions for both allocations. This design isolates the effect of weights from changes in sample period or data availability. Figure 2 shows the optimization interface through which the user selects the objective and reviews both the estimated metrics and the proposed weights.

[[FIGURE:optimize|Constrained allocation interface for minimum-volatility and approximate maximum-Sharpe analysis|Source: Finfolio 2.0 application, project screenshot.]]

### 2.3 Joint moving-block bootstrap Monte Carlo simulation

The Monte Carlo workflow represents my most distinctive individual technical contribution. A conventional simulation based on independent normal draws would suppress several characteristics visible in financial returns, including fat tails, short volatility clusters, and contemporaneous dependence between holdings. I therefore implemented a joint moving-block bootstrap. The algorithm samples common blocks of five consecutive historical return observations across all assets. Sampling the same dates for every asset preserves their cross-sectional relationship, while retaining short sequences preserves part of the observed temporal dependence.

The simulation uses 2,000 paths over a 252-session horizon. A seeded linear congruential generator makes the result reproducible: running the same portfolio, history, horizon, path count, and seed produces the same percentile bands and tail statistics. Each simulated path begins at the actual final portfolio value and evolves using the sampled multivariate returns. The aggregation stage reports the 5th, 25th, 50th, 75th, and 95th percentiles, the proportion of terminal values below starting capital, simulated VaR and CVaR, and a terminal-value histogram. These values describe outcomes inside the resampling model; the interface explicitly avoids presenting them as verified future probabilities.

The computation is executed through `research-worker.mjs`. Running thousands of paths and repeated matrix operations on the browser's main thread would temporarily block pointer, keyboard, and rendering events. The Web Worker receives a structured message, performs the numerical loop outside the interface thread, and returns serializable results through `postMessage`. This architecture preserved interface responsiveness and provided one execution path for both optimization and simulation without allowing UI state to alter the numerical method.

Figure 3 presents the resulting percentile fan, terminal distribution, and disclosed tail-risk outputs in the application.

[[FIGURE:monte_carlo|Monte Carlo fan chart, terminal distribution, and disclosed tail-risk outputs|Source: Finfolio 2.0 application, project screenshot.]]

## III. IMPLEMENTATION AND DEVELOPMENT PROCESS

### 3.1 Repository foundation and integration contracts

During the first project stages, I organized the repository into application, documentation, data, test, and deployment areas. The browser application uses lightweight JavaScript modules and native SVG rendering, while Python modules provide provider-specific data retrieval and serverless API routes. This structure was selected because the project required transparent numerical logic and direct deployment rather than a large framework. It also allowed the team to inspect individual modules during verification and to trace a displayed result back through the calculation and data layers.

By Week 3, the central task was to stabilize interfaces between workstreams. I implemented canonical representations for holdings, time series, exchange rates, and benchmark data; created routes for market data, symbol search, account configuration, and data-status metadata; and preserved provider and freshness information. The data-status endpoint deliberately excludes the user's holdings. Its purpose is to state the latest available market session and snapshot time, allowing the application to determine whether data may be stale without exposing portfolio content.

### 3.2 Verification, CI/CD, and production delivery

The implementation was protected by JavaScript and Python test suites. The final audit recorded 50 JavaScript tests and 35 Python tests passing on 23 October 2026. These tests cover numerical identities, constraint feasibility, deterministic simulation, freshness behavior, symbol search, classification, and API boundaries. They do not prove universal financial accuracy or usability; they provide reproducible evidence that defined invariants remain stable when code changes.

Deployment required coordination between GitHub Actions and Vercel. The scheduled data workflow retrieves and validates closed daily observations before publishing a dated snapshot. The Vercel configuration maps the static application and serverless routes to one public project. When the earlier refresh job attempted to publish to a missing branch, I corrected the publication logic and verified the workflow against a complete Vietnam universe snapshot. The final release also exposed source timestamps inside the application so a successful deployment could not be mistaken for current market data when the underlying session was old.

## IV. EVIDENCE, VERIFICATION AND PROJECT OUTCOMES

The repository evidence provides a reproducible chain from specification to output. The most direct numerical checks are `demo/finance.test.mjs` for portfolio and Euler calculations, `demo/research.test.mjs` for optimization and simulation, and the Python unit tests for provider and API behavior. A reviewer can run `npm test` and `python3 -m unittest discover -s demo -p 'test_*.py'`, then open the corresponding routes to compare the machine-checked invariants with the visible product behavior.

| Deliverable | Repository evidence | Verification procedure |
| --- | --- | --- |
| Financial computation | `demo/finance.mjs`, `demo/attribution.mjs` | Run the finance and attribution tests; reconcile return and Euler component totals. |
| Optimization | `demo/optimizer.mjs`, `demo/research.test.mjs` | Compare minimum-volatility and maximum-Sharpe results under feasible caps. |
| Monte Carlo | `demo/simulation.mjs`, `demo/research-worker.mjs` | Repeat seed 42 and confirm identical percentiles, VaR, and CVaR. |
| Data and API integration | `demo/server.py`, `demo/vn_data.py`, `demo/global_data.py` | Start the local server and inspect market-data and data-status responses. |
| Deployment | `vercel.json`, `.github/workflows/update-vn-data.yml` | Inspect the production routes and the corresponding workflow run. |

The final outcome was a seven-route application covering portfolio entry, analysis, optimization, simulation, methodology, and private decision recording. The main analytical flow processes actual instrument values and currencies, converts observations to a common VND basis, and presents contribution and risk evidence alongside benchmark comparison. Optimization and simulation are accessible as optional analytical extensions, which prevents them from obscuring the core attribution task.

## V. LIMITATIONS AND LESSONS LEARNED

The system operates on end-of-day observations rather than intraday data, and its international and Vietnamese series may close at different times. Free providers introduce rate limits and possible historical revisions. The current calculation assumes buy-and-hold quantities, excludes transaction costs and taxes, and does not fully model dividend reinvestment. The maximum-Sharpe procedure and covariance estimates remain in-sample, while the bootstrap can only resample regimes represented in the historical record. These conditions constrain interpretation even when the software executes correctly.

The main technical lesson was that numerical correctness requires an observable contract. A formula needs admissible inputs, a testable invariant, a defined unit, and an explanation of what the output permits the user to conclude. Modular computation and seeded simulation made the system reproducible; explicit convergence and freshness disclosures made its uncertainty visible. Separating background computation from the interface also demonstrated that performance is part of analytical reliability: an unresponsive page can prevent a user from inspecting or challenging the result.

## VI. CONCLUSION

My contribution connected the project's methodological, data, quality, and interface specifications into an operational system. I implemented the core financial engine, constrained optimization, the complete Monte Carlo workflow, Web Worker execution, backend integration, automated verification, and production configuration. The resulting artifacts can be inspected independently and reproduced through the repository tests and application routes.

The work also clarified the boundary of a Lead Developer's accountability in a financial application. I was responsible for faithful and reproducible implementation, while the meaning of financial measures, the admissibility of data, the acceptance conditions, and the visual hierarchy remained governed by the respective team owners. This division enabled Finfolio 2.0 to present complex analysis without treating software output as financial advice.
