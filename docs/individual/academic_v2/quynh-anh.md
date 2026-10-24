# Nguyễn Quỳnh Anh

## ABSTRACT

This report examines my individual contribution to Finfolio 2.0 as Product Manager and Flow and Testing Lead. The project required financial, data, and interface requirements to be converted into observable behavior that could be tested across successful, alternative, and error paths. My responsibility covered user journeys, input validation, acceptance criteria, expected-versus-actual evidence, bug management, regression testing, and final production acceptance. I specified how the application should respond to valid multi-asset portfolios, provider or benchmark limitations, invalid values, duplicate instruments, stale results, and infeasible optimization constraints. I also translated financial reconciliation rules into machine-checkable and demonstrable conditions. The report explains how the quality process evolved from requirement synthesis to an integrated audit of 50 JavaScript and 35 Python tests on 23 October 2026. It recognizes the limits of this evidence: internal functional and regression checks do not replace external user acceptance, and free upstream services remain beyond the team's direct control. The contribution established a traceable relationship among a requirement, its expected visible result, the defect recorded when that result was not observed, and the regression evidence required to close the issue.

**Keywords:** product requirements; user journey; acceptance criteria; regression testing; validation; bug management.

## I. INTRODUCTION AND INDIVIDUAL RESPONSIBILITY

A portfolio application can produce numerically correct results while failing as a product. It may preserve stale analysis after the user changes an input, accept an invalid symbol, present an infeasible allocation, or conceal that the benchmark series is unavailable. These failures are especially serious in a financial context because a plausible interface can cause the user to trust an output that no longer corresponds to the visible conditions. Finfolio 2.0 therefore required a quality process that covered behavior and state, not only isolated formulas.

As Product Manager and Flow and Testing Lead, I converted the target-user problem and financial specifications into user journeys, validation rules, acceptance scenarios, bug records, and release checks. I owned the happy path from portfolio entry to decision recording, alternative paths involving source or benchmark fallback, and error paths involving invalid data or constraints. I also reviewed whether important methodology and limitation statements remained visible beside the outputs they qualify.

My role depended on other owners without replacing them. Hoàng Khánh Linh defined the financial identities, Trần Minh Ngọc established data admissibility, Lê Bảo An implemented the calculation and test code, and Nguyễn Ngọc Anh designed the interaction. I defined the conditions under which the integrated behavior could be accepted and maintained the evidence linking a reported defect to its correction.

[[FIGURE:diagram_user_flow|Core, alternative, and error paths used for Finfolio 2.0 acceptance testing|Source: Author's diagram based on Weeks 5-7 requirements and test evidence.]]

## II. DISTINCTIVE CONTRIBUTIONS TO FINFOLIO 2.0

### 2.1 Three-path user-flow specification

The successful path begins when the user enters a small supported portfolio with positive monetary values and valid currencies. The application validates and normalizes the identifiers, retrieves market and exchange-rate data, aligns the observations, and presents the current allocation and portfolio result. The user can then inspect return, risk, and foreign-exchange contribution, compare the portfolio with the selected benchmark, and optionally examine an optimized reference allocation or a simulation. If authenticated, the user may record a decision and rationale in a private journal.

Alternative paths address conditions that do not necessarily invalidate the entire analysis. A direct index series may be unavailable while a clearly labelled ETF proxy remains acceptable; an international market may have a different latest session; or a cached snapshot may still satisfy the selected historical range. The requirement in each case is transparency. The interface must identify the source, effective period, and fallback, and it must withhold any relative metric that cannot be calculated on compatible observations.

Error paths prevent invalid state from reaching the numerical engine. Unsupported symbols, non-positive position values, duplicate instruments, unknown currency codes, insufficient observations, and infeasible caps produce actionable messages. When the user changes an input after an analysis has been generated, the old result must be cleared or marked invalid. This rule prevents a mismatch between the visible portfolio and the figures retained from a previous request.

[[FIGURE:portfolio_input|Portfolio-entry fields covered by validation and alternative-path requirements|Source: Finfolio 2.0 application, project screenshot.]]

### 2.2 Acceptance criteria for financial and allocation identities

Financial methodology was converted into observable pass or fail conditions. Holding-level or grouped return contributions must reconcile with portfolio return. Euler component risks must reconcile with annualized portfolio volatility. Foreign-exchange components must reconcile with the VND-denominated holding return. These conditions are more useful than checking a hard-coded output because market data can change while the identity remains valid.

Optimization acceptance combines mathematical and interface conditions. Proposed weights must sum to 100%, remain non-negative, obey per-instrument and commodity-group caps, and use the same observations as the current allocation. The application must detect infeasibility before showing a proposal. Minimum-volatility and approximate maximum-Sharpe objectives are tested separately, and convergence status must be displayed rather than inferred from the existence of a result.

Simulation acceptance focuses on reproducibility and interpretation. A fixed seed must generate identical percentile bands and tail statistics. Flat historical returns must produce a flat result, and short or invalid samples must be rejected. The interface must state that the percentile fan and loss proportion are outputs of the bootstrap model rather than validated probabilities of future market events.

### 2.3 Bug governance and regression evidence

The bug log records symptom, severity, affected flow, expected behavior, actual behavior, cause, owner, correction, and regression evidence. This structure prevented a defect from being closed merely because the interface appeared improved in one manual attempt. A fix was accepted only when the original trigger was repeated and the related automated or production check passed.

Examples included a scheduled refresh that downloaded data successfully but failed while publishing a missing branch, a recent cache timestamp that concealed an old market session, a result remaining visible after an input change, and allocation caps that could not sum to 100%. Each issue connected product behavior with a technical correction. The freshness defect, for example, led to a separate latest-session check and regression tests that distinguish download time from market recency.

Figure 3 shows how the resulting application state keeps data timing, limitations, headline output, and contribution controls visible together.

[[FIGURE:analysis|Analysis state containing data timing, limitations, headline output, and contribution controls|Source: Finfolio 2.0 application, project screenshot.]]

## III. IMPLEMENTATION AND DEVELOPMENT PROCESS

### 3.1 Requirement synthesis and validation matrix

During Weeks 1 and 2, I consolidated candidate problems, instructor feedback, and the selected MVP into an observable sequence. The user need was narrowed to understanding return and risk across a multi-asset portfolio and comparing a constrained alternative. Features such as brokerage execution and personalized automated advice were kept outside the core path because they were not necessary to demonstrate the analytical value.

In Week 3, the sequence became a validation matrix. Every critical input received a rule, expected response, and downstream consequence. A missing or invalid value had to block the affected calculation, while an acceptable fallback had to remain visible. This matrix created a bridge between the Data Lead's dictionary and the Lead Developer's input handlers and API errors.

### 3.2 Integrated scenarios and final audit

Week 5 introduced integrated acceptance scenarios covering a valid multi-asset portfolio, invalid amounts, benchmark gaps, reconciliation, feasible and infeasible optimization, before-and-after consistency, and prohibited advice-like language. Each case recorded the input, action, expected visible result, and evidence. During Week 6, these cases were executed against the first working build, and deviations were recorded in the bug log rather than summarized as an unsupported pass percentage.

The final Week 7 audit reviewed the automated suites, representative desktop and mobile routes, data freshness, optimization, simulation, and production deployment. On 23 October 2026, the repository recorded 50 JavaScript and 35 Python tests passing. The audit also checked a provider-backed FPT, HPG, and GLD portfolio, VN30 comparison, optimization under 80% instrument and 60% commodity limits, and a seeded 2,000-path simulation. Figure 4 illustrates the form in which simulation limitations remain adjacent to the model output.

[[FIGURE:monte_carlo|Simulation output with reproducible inputs, percentile fan, and visible limitations|Source: Finfolio 2.0 application, project screenshot.]]

## IV. EVIDENCE, VERIFICATION AND PROJECT OUTCOMES

The principal evidence is retained in `docs/WEEK5.md`, `docs/WEEK6.md`, and `docs/WEEK7.md`, supported by the automated tests. `freshness.test.mjs` covers the distinction between a recent download and an old session. `research.test.mjs` covers constraint feasibility and deterministic simulation. Financial and attribution tests protect the reconciliation conditions, while the Python tests cover provider, API, search, and classification behavior.

| Quality output | Repository evidence | Verification procedure |
| --- | --- | --- |
| User and error flows | `docs/WEEK5.md` | Walk through one successful, one alternative, and one blocked path. |
| Integrated test matrix | `docs/WEEK6.md` | Compare expected and actual results for the documented cases. |
| Financial regression | `demo/finance.test.mjs`, `demo/attribution.test.mjs` | Reconcile portfolio, component, and FX totals. |
| Research regression | `demo/research.test.mjs` | Test feasible caps, fixed seed, flat data, and tail calculations. |
| Release audit | `docs/WEEK7.md` | Review test counts, workflow status, production routes, and open limitations. |

The quality process changed the product in visible ways. Errors became specific to the invalid condition; stale outputs were cleared; fallback and freshness information became explicit; optimizer convergence was disclosed; and simulation carried an interpretation boundary. These outcomes demonstrate that testing was not performed only after development. Acceptance criteria affected the design and implementation of the final product.

## V. LIMITATIONS AND LESSONS LEARNED

Testing was primarily internal and did not include a large external user-acceptance sample. The test suite verifies defined behavior but cannot prove that all retail investors understand the explanations. Provider outages and revisions can be handled transparently but cannot be eliminated by application testing. Production checks also depend on representative routes and viewports rather than every possible browser and device combination.

The main lesson was the difference between a plausible requirement and a verifiable result. A requirement becomes useful when it has a trigger, expected visible behavior, actual observation, and regression check. Numerical identities are particularly valuable because they remain stable when market values change. The process also showed that limitations should be tested as content: an advanced metric without its assumption can be a product defect even when the number is calculated correctly.

## VI. CONCLUSION

My contribution established the behavioral and verification framework of Finfolio 2.0. I defined the user journeys, validation responses, financial acceptance identities, optimization and simulation cases, bug-governance process, and release audit. These artifacts connected the product specification to observable evidence.

The final application is therefore supported by more than a successful demonstration. Its central behaviors can be reproduced through documented flows and automated tests, and its known limitations remain visible. The remaining need is broader external usability testing, which should build on the same traceable relationship between requirement, observation, defect, and regression evidence.
