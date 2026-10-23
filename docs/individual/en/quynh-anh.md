# Individual Contribution Report — Nguyễn Quỳnh Anh

## I. Role and accountability

As Product Manager and Flow & Testing Lead, I converted product and financial requirements into user journeys, acceptance criteria and verifiable test cases. I owned the happy, alternative and error paths; validation behavior; regression coverage; bug governance; and production acceptance evidence. My contribution ensured that the application did not merely calculate values but behaved predictably when data or constraints were incomplete.

## II. Distinctive contribution to Finfolio 2.0

### 2.1 Three-path user-flow specification

I documented the successful flow from portfolio input to analysis and decision recording, alternative flows for fallbacks or limited benchmark data, and error flows for invalid symbols, non-positive values, duplicates and infeasible caps. Each error must be attached to an actionable user message rather than becoming a silent backend failure.

### 2.2 Acceptance criteria for financial identities

I translated financial methodology into observable pass/fail conditions. Return contributions must reconcile with portfolio return; Euler components must reconcile with portfolio volatility; optimized weights must sum to 100% and satisfy all caps; before/after comparisons must use the same observations and assumptions.

### 2.3 Regression and bug governance

I maintained a bug log that records symptom, severity, cause, owner, correction and regression evidence. Issues included provider failure, stale result state after input changes, missing Vietnam benchmark data and infeasible optimization caps. A fix is considered complete only after the relevant test or production check passes.

## III. Work completed across the project

### 3.1 Requirement synthesis — Weeks 1–2

- Consolidated candidate problems and instructor feedback.
- Converted the selected concept into a traceable user journey.
- Distinguished core MVP behavior from deferred features such as brokerage execution.

### 3.2 Validation matrix — Week 3

- Defined ticker normalization, positive-value checks, duplicate detection and currency validation.
- Defined feasibility checks, including the case where the sum of permitted maximum weights is below 100%.
- Specified that invalid input clears or blocks stale analysis output.

### 3.3 Acceptance scenarios — Week 5

- Created scenarios covering valid multi-asset portfolios, invalid totals, benchmark gaps, return and risk reconciliation, feasible and infeasible optimization, before/after consistency and prohibited recommendation language.
- Connected each scenario to an expected visible result.

### 3.4 Build testing and bug log — Week 6

- Executed the first integrated test matrix against the working product.
- Recorded provider, calculation and state-management defects and followed them through correction.
- Distinguished expected and actual results rather than recording unsupported “Pass” labels.

### 3.5 Final audit — Week 7

- Reviewed JavaScript and Python verification results and production smoke tests.
- Checked core routes and responsive behavior at representative viewport sizes.
- Confirmed that methodology and limitation text remained visible next to advanced outputs.

## IV. Evidence and reproducibility

| Deliverable | Actual contribution | Repository evidence | How to reproduce or explain it |
| --- | --- | --- | --- |
| User flows | Happy, alternative and error paths | `docs/WEEK5.md` | Walk through one path of each type |
| Acceptance criteria | Nine core scenarios and visible outcomes | `docs/WEEK5.md` | Map each requirement to its acceptance result |
| Week 6 test matrix | Integrated functional and boundary cases | `docs/WEEK6.md` | Re-run the documented cases |
| Freshness regression | Prevented a recent download timestamp from hiding an old market session | `demo/freshness.test.mjs` | Run `node --test demo/freshness.test.mjs` |
| Research regression | Feasibility and seeded-simulation checks | `demo/research.test.mjs` | Run `node --test demo/research.test.mjs` |
| Final audit | Expected-versus-actual release evidence | `docs/WEEK7.md` | Review the final acceptance table and production routes |

## V. Weekly evidence trail

| Week | Verified output | Personal significance |
| --- | --- | --- |
| W1 | Candidate-problem and feedback synthesis | Supported a feasible project decision |
| W2 | Requirement breakdown and user journey | Converted the concept into observable steps |
| W3 | Validation register | Prevented invalid data from reaching the engine |
| W4 | Reconciliation acceptance logic | Defined machine-checkable financial consistency |
| W5 | Nine acceptance scenarios | Established the build contract |
| W6 | Integrated test table and bug log | Governed defects in the first working demo |
| W7 | Final audit and production smoke checks | Supported release readiness |

## VI. Limitations and lessons learned

Testing was primarily internal and did not include a large external user-acceptance sample. Upstream provider outages can be handled transparently but cannot always be eliminated on a free-data stack. These limitations mean that a passing automated suite is necessary but not sufficient evidence of universal usability.

My main lesson was the difference between a requirement that sounds correct and a result that can be demonstrated. Each important behavior needs an input, expected outcome, actual observation and regression check. I can personally reproduce the core error paths and explain how the bug log links a reported defect to its final verification.
