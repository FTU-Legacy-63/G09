# Individual Contribution Report — Trần Minh Ngọc

## I. Role and accountability

As Business Analyst and Data & Provenance Lead, I owned the contract between market observations and the financial engine. My responsibilities covered the input dictionary, source register, supported instrument universe, benchmark and fallback policy, currency mapping, common-date alignment, sector/industry classification, validation and data-freshness monitoring. Hoàng Khánh Linh owned the financial formulas applied after these checks; I owned whether the data supplied to those formulas were identifiable, compatible and traceable.

## II. Distinctive contribution to Finfolio 2.0

### 2.1 Resolving the Vietnam benchmark blocker

Yahoo Finance did not provide a stable VN-Index history for the required period. I evaluated alternatives and specified TradingView through `tvdatafeed` for VN30 and VN-Index, with `E1VFVN30.VN` as a clearly labelled ETF-proxy fallback. The benchmark is treated as a comparison series, never silently inserted into portfolio holdings.

### 2.2 Multi-asset universe and provenance

I established the supported Vietnam universe and international instrument catalog, including commodity ETF proxies. Each entry records symbol, market, instrument type, quote currency and classification status. The distinction between a commodity and an exchange-traded proxy is retained in the product explanation so the user is not led to believe that an ETF price is a physical spot quotation.

### 2.3 Benchmark, currency and common-date compatibility

I specified that holdings, benchmark and USD/VND observations must be aligned to a shared set of valid dates before relative metrics are calculated. FX conversion, quote currency and user-input currency are separate fields. Active return, tracking error, beta and alpha are accepted only when portfolio and benchmark series use the same effective period and sufficient common observations.

## III. Work completed across the project

### 3.1 Input dictionary and canonical fields — Week 3

- Defined identifiers, exchanges, asset classes, position values, currencies, sector/industry labels, price dates, benchmark fields and optimization caps.
- Documented data type, unit, source, example and validation rule for each field.
- Separated user-entered currency from the instrument's native quote currency.

### 3.2 Source register and fallback policy — Week 3

- Registered user inputs, TradingView Vietnam prices, Yahoo Finance international series, FX data, exchange disclosures and fixed test fixtures.
- Documented expected latency, limitations and fallback behavior.
- Established provenance labels so cached, fallback and live provider results are distinguishable.

### 3.3 Classification and symbol search — Weeks 5–6

- Built the sector/industry classification rules used for grouped attribution.
- Defined “Not applicable” for commodities, ETFs and crypto rather than assigning a corporate industry.
- Supported ticker and Vietnamese company-name search with normalized accents and case.

### 3.4 Data validation, benchmark and alignment — Weeks 4–7

- Specified positive-price, duplicate-date, missing-value and minimum-observation checks.
- Defined inner alignment across Vietnam, international, benchmark and FX calendars.
- Assigned benchmark source, fallback and label rules and prevented benchmark/holding confusion.

### 3.5 Freshness monitoring — Week 7

- Defined the distinction between the latest market session and the file download timestamp.
- Supported the `/api/data-status` response without sending portfolio holdings.
- Contributed tests for classification, Vietnam data, symbol search and freshness behavior.

## IV. Evidence and reproducibility

| Deliverable | Actual contribution | Repository evidence | How to reproduce or explain it |
| --- | --- | --- | --- |
| Input dictionary | Defined fields, units, validation and ownership | `docs/WEEK3.md` | Trace each portfolio form field to the dictionary |
| Source register | Documented provider, purpose, fallback and limitation | `docs/WEEK3.md` | Compare TradingView and Yahoo responsibilities |
| Vietnam universe | Defined supported symbols and benchmark coverage | `demo/vn_universe.json`, `demo/vn_data.py` | Run `python3 -m unittest demo/test_vn_data.py` |
| International catalog | Classified global equities, ETFs, commodity proxies and crypto | `demo/instrument_catalog.json`, `demo/global_data.py` | Inspect metadata and run global-data tests |
| Classification | Defined sector/industry behavior and non-corporate labels | `demo/classification.py` | Run `python3 -m unittest demo/test_classification.py` |
| Benchmark and compatibility | Specified fallback, FX mapping and common-date rules | `docs/WEEK3.md`, `demo/server.py` | Compare effective dates before relative metrics |
| Freshness | Distinguished session date from refresh timestamp | `demo/data_status.py`, `demo/freshness.mjs` | Run `node --test demo/freshness.test.mjs` |

## V. Weekly evidence trail

| Week | Verified output | Personal significance |
| --- | --- | --- |
| W1 | Initial multi-asset data questions | Identified provider and currency risk early |
| W2 | Data requirements for holdings and benchmark | Ensured proposed features had available inputs |
| W3 | Input dictionary and source register | Created the core data-readiness evidence |
| W4 | Benchmark, FX and observation dependencies | Defined when financial calculations are admissible |
| W5 | Labels, units and instrument suggestions | Reduced input ambiguity |
| W6 | TradingView Vietnam integration requirements | Resolved Vietnam stock and index coverage |
| W7 | Classification and freshness monitoring | Completed traceability and operational checks |

## VI. Limitations and lessons learned

The application does not yet maintain a dedicated exchange-holiday calendar, classifications are current rather than point-in-time, and automatic daily snapshots prioritize a finite Vietnam universe. Free data providers may also rate-limit or revise historical observations. These are documented limitations rather than hidden failures.

My principal lesson was that a financial formula is only as defensible as the observations supplied to it. A valid data contract must record source, currency, effective date, alignment and fallback status. I can personally trace an output back to its input fields and providers and explain why a benchmark comparison is accepted or rejected.
