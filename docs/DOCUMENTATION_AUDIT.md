# Finfolio 2.0 documentation audit

Audit date: 24 October 2026. Scope: visitor-facing product documentation, current product and methodology claims, project requirements and weekly evidence, contributor records, and generated academic deliverables. Source code was inspected to verify claims but not changed as part of the documentation audit.

## Executive summary

The final application is a historical, hypothetical multi-asset portfolio analysis tool. Its implemented flow covers supported holdings, VND conversion, return and fixed-allocation risk contributions, benchmark comparison, constrained reference optimization, Monte Carlo resampling, and a decision journal. It is not a brokerage ledger, trade executor, investment adviser, or price forecast.

The main documentation problem was navigation and mixed audiences: the root README led with project evidence and implementation details rather than explaining the product to a visitor. It has been replaced with a concise English product entry point, and operational instructions now live in [Development](DEVELOPMENT.md). Older dated verification in [Product Scope](PRODUCT_SCOPE.md) is explicitly labeled historical. Weekly and individual academic evidence remains intact and is linked rather than rewritten as marketing copy.

The implementation does not include a dedicated stress-scenario builder or full multi-period Brinson attribution. Those are stated as limitations, not implied by broader portfolio analytics language. Several evidence and sign-off issues remain open below; they require source-owner confirmation and were not “fixed” by inventing facts.

## Requirements reconstruction and implementation traceability

The reconstruction used the original project proposal and solution structure in the adjacent `Finfolio_Week_1_Week_2_Submission/docs/` folder, repository Weeks 1–7, final methods and scope documents, current application modules, and the course’s [Week 7 brief](https://github.com/FTU-Legacy-63/NHA408E/blob/master/docs/weeks/week-7.md) and [final repository readiness checklist](https://github.com/FTU-Legacy-63/NHA408E/blob/master/docs/assessment/final-repo-readiness.md). The full original grading/assignment brief was not present in the workspace; no missing rubric details are inferred. The adjacent source folder is outside this repository and is therefore not a navigable link in the shipped project.

| Reconstructed requirement or decision | Evidence | Final implementation and documentation status |
| --- | --- | --- |
| Help finance students and early/self-directed investors understand portfolio return and risk drivers | Project proposal; `docs/WEEK1.md`; `docs/WEEK7.md` | Implemented as a hypothetical portfolio analysis and contribution report. The README now states the visitor value first. |
| Historical return, risk, allocation and contribution views with defensible data/method notes | Proposal; `docs/WEEK2.md`–`docs/WEEK5.md`; `docs/FINAL_METHODS.md`; `demo/attribution.mjs` | Implemented for supported holdings and available common history. The product docs explain assumptions, price-return limits and sample dependence. |
| Scope evolved to a feasible MVP; supported classes/proxies must be distinguished from aspirational scope | Week 2–5 decisions; `docs/PRODUCT_SCOPE.md`; `demo/instrument_catalog.json`; `demo/instruments.mjs` | Final catalog and implementation define a finite supported universe. Commodity and bond exposure is via funds/proxies, not direct spot commodities or individual bonds. |
| Optimization is constrained and inspectable; it is not automatically applied or personalized advice | `docs/OPTIMIZATION.md`; `demo/optimizer.mjs`; `demo/app.js` | Minimum-volatility and approximate maximum-Sharpe reference allocations are separate from initial analysis. The README calls them reference allocations, not recommendations. |
| Monte Carlo is a historical resampling scenario, not a forecast | `docs/FINAL_METHODS.md`; `demo/simulation.mjs`; `docs/WEEK7.md` | Seeded joint moving-block bootstrap is implemented. Generated paths do not establish future probability or cover shocks absent from the sample. |
| Present project methodology, verification, limitations, release and individual/group footprints | Course Week 7 brief and readiness checklist; `docs/WEEK7.md`; footprint files; release | Evidence is retained and linked. Current local/release/source commit identifiers do not fully reconcile; see the high-severity item below. |
| Dedicated stress scenario and full Brinson attribution | Original proposal and later scope revisions; current source and `docs/PRODUCT_SCOPE.md` | Not present in the final application. Documentation explicitly identifies both as unimplemented rather than describing them as product capability. |

The original proposal is a historical source, not a promise that every proposed analysis shipped. Week 2 scope choices and later implementation are used to distinguish initial ambition from final product behavior.

## Documentation inventory

| Audience / role | Documents reviewed | Audit disposition |
| --- | --- | --- |
| Prospective user / evaluator | `README.md`, `demo/index.html` | README reorganized as the product landing page; actual UI claims checked against source and the product-scope record. |
| User methodology and limitations | `docs/PRODUCT_SCOPE.md`, `docs/FINAL_METHODS.md`, `docs/OPTIMIZATION.md`, `docs/FX_ATTRIBUTION.md`, `docs/ACCOUNT_SETUP.md`, `data/README.md` | Retained as detailed references; scope now labels early October checks as historical. Fixture documentation correctly separates test fixtures from live market prices. |
| Developer / operator | `docs/DEVELOPMENT.md`, `package.json`, `demo/server.py`, `.github/workflows/update-vn-data.yml`, `vercel.json` | Added a focused local setup, test, architecture, data-refresh, and release guide. Refresh is described as best effort. |
| Project history and course evidence | `docs/WEEK1.md`–`docs/WEEK7.md`, `docs/GROUP_FOOTPRINT.md` | Preserved as dated evidence. Week reports are not silently rewritten to align historical dates or ownership after the fact. Presentation working files are intentionally excluded from GitHub. |
| Individual contribution evidence | `docs/individual/README.md`; five Vietnamese files under `docs/individual/`; five English files under `docs/individual/en/`; five V2 source files under `docs/individual/academic_v2/` | Kept distinct and linked. Contribution ownership follows the supplied footprints/evidence, not Git authorship. Statements needing author confirmation remain flagged. |
| Generated academic deliverables | Published [`docs/submissions/`](submissions/) (five named personal-report PDFs and the group slide deck); prior DOCX generations remain local working artefacts | The canonical repository submission set is PDF-only. Signatures and dates still require each student. |
| Additional editable visual deliverable | `output/slide_assets/finfolio_asset_class_attribution_mindmap_editable.pptx`, `scripts/create_asset_class_mindmap_pptx.py` | Present as a separate requested slide asset; not treated as product documentation. |

## Issue register

Line references for the README below refer to the pre-refactor file where explicitly marked. Other references identify the current evidence location.

| File / evidence location | Issue and evidence | Severity | Action / status |
| --- | --- | :---: | --- |
| Root `README.md`, pre-refactor lines 3–17, 19–27, 37, 40–70 | Academic evidence and contributor details preceded the product explanation; SHB comparison and extensive setup/deployment diary distracted from visitor needs. | Medium | Replaced with visitor-first product overview, honest scope/limits, concise local run instructions, and links to evidence and developer docs. Historical academic material remains in its proper documents. |
| `docs/PRODUCT_SCOPE.md`, former “Verification” section, records dated 1–5 Oct | Older refresh schedule and tests appeared adjacent to a 23 Oct final state without a clear date/supersession label. | Medium | Renamed and prefaced as earlier historical verification; directs readers to Week 7 and release for later evidence. The old records remain preserved. |
| `docs/WEEK7.md` verification/release section and GitHub release `v2.0.0-final-20261023` | Week 7 names source commit `28a3f0e`, while the release record identifies `bf6db17`. Later `main` commits are normal post-release changes but do not resolve which commit the dated verification statement intended. | High | Unresolved historical evidence issue. Do not rewrite the dated record. The release owner should verify the tag target, deployment source, and intended evaluation commit, then add a dated correction with links. |
| `docs/individual/en/bao-an.md` Monte Carlo method section; `demo/simulation.mjs` | The individual report previously called the PRNG a linear congruential generator; the source's integer-multiply/xorshift sequence is Mulberry32. | Medium | Corrected the algorithm label to seeded Mulberry32; no contribution ownership was inferred or changed. |
| `docs/individual/quynh-anh.md:21` | “đảm bảo hệ thống đạt độ tin cậy tuyệt đối” (“ensuring absolute reliability”) was an unbounded claim inconsistent with the documented test and data limitations. | Medium | Replaced with a bounded statement that the test suite provides pre-release evidence and cannot guarantee absolute reliability. |
| Local report QA records | QA records explicitly say student signature and date fields remain incomplete. | High for submission readiness | Open human action: each student must review and personally sign/date the intended report. No signature was fabricated. |
| Published [`docs/submissions/`](submissions/) and local report generations | Several generations and copies coexist; the repository now identifies a single canonical PDF submission set. | Medium | The named PDFs and slide deck are the only submission artefacts linked publicly. Local variants remain outside GitHub. |
| Original project assignment / marking rubric | Proposal and weekly derivative evidence are available, but the complete original course assignment/rubric is not in the workspace. | Medium | Reconstructed requirements only from available sources; obtain the canonical brief if line-by-line rubric compliance must be certified. |
| Historical SHB mentions in weekly evidence | SHB appears as a historical benchmark/reference in project records, not as a current Finfolio integration requirement. | Low | Kept in dated project history; excluded from the visitor-facing product overview. |

## Documentation refactor summary

Before: the root README mixed project narrative, contributor evidence, product claims and run/deployment notes, so a visitor had to infer what the application does. Older product-scope verification also lacked a clear separation from the final state.

After: the root README now gives the target user, core tasks, supported universe, method summary, limitations, preview, local launch and documentation map. [Development](DEVELOPMENT.md) carries operational detail; [Product Scope](PRODUCT_SCOPE.md) distinguishes historical checks from the later audit; this report provides traceability, inventory and unresolved findings. Historical and individual evidence was preserved.

The README preview is a dated application screenshot, not a live-data promise. It is labeled as one historical run. Root documentation is in English for visitor accessibility; existing Vietnamese academic evidence remains in its original language.

## Claim verification notes

- Supported asset classes and proxy caveats were compared with `demo/instrument_catalog.json`, `demo/instruments.mjs`, and product scope. A catalog entry is not a guarantee of current provider availability.
- Portfolio, FX, grouped contribution, risk, optimizer and simulation wording was compared with `demo/attribution.mjs`, `demo/optimizer.mjs`, `demo/simulation.mjs`, `demo/app.js`, and method documents. No claim of full Brinson decomposition, direct commodities, brokerage accounting, trade execution, or stress-builder capability is made.
- Historical values in the screenshot and reports are identified as dated examples, not current quotes or expected returns.
- Monte Carlo seed is an input for reproducible pseudo-random draws under the implementation; it does not make a scenario more likely or more accurate.
- Automated test counts and release verification are attributed to the dated Week 7 record, not represented as newly rerun results by this documentation audit.
- Git commit authorship was not used to infer individual contribution ownership.

## Verification and remaining actions

Documentation checks for this audit: source links and implementation claims were reviewed; the preview image is a captured application screen; `docs/DEVELOPMENT.md` lists repository commands and service boundaries. A live-site HTTP response and prior release/Week 7 verification are evidence of availability at their recorded times only, not an end-to-end user acceptance test performed by this audit.

Open actions are: reconcile Week 7, release tag and intended final commit; collect student signatures and dates; and obtain the complete original assignment if formal rubric certification is needed.
