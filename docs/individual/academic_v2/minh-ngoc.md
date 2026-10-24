# Trần Minh Ngọc

## ABSTRACT

This report documents my contribution to Finfolio 2.0 as Business Analyst and Data and Provenance Lead. The financial outputs of the application depend on observations drawn from different markets, currencies, trading calendars, and provider conventions. My responsibility was to establish the data contract that makes those observations identifiable, compatible, and traceable before they enter the financial engine. The work included the input dictionary, source register, supported instrument universe, Vietnam benchmark and fallback policy, currency mapping, common-date alignment, classification rules, validation, and freshness monitoring. A central project issue was the unstable availability of Vietnam index history through Yahoo Finance. The team therefore adopted TradingView through `tvdatafeed` for Vietnam equities and indices, retained Yahoo Finance for international instruments and foreign exchange where appropriate, and defined a labelled ETF proxy fallback. The report explains these decisions, connects them to repository artifacts, and clarifies their limitations. It shows that data readiness is not a preliminary administrative task but a condition for interpreting attribution, benchmark comparison, risk, and optimization correctly.

**Keywords:** data provenance; market data; benchmark policy; currency alignment; instrument classification; data quality.

## I. INTRODUCTION AND INDIVIDUAL RESPONSIBILITY

Finfolio 2.0 accepts portfolios that can contain Vietnamese equities and internationally traded commodity proxies. This scope creates a data problem before it creates a calculation problem. Instruments are identified under different symbol conventions, their prices are quoted in different currencies, and their markets do not share identical holidays or closing times. A portfolio series, a benchmark series, and an exchange-rate series can each appear individually valid while remaining incompatible for a relative-performance calculation. The project therefore required a documented contract that connects user input to provider observations and states when a calculation may proceed.

As Business Analyst and Data and Provenance Lead, I owned that contract. I defined the input dictionary, source register, instrument metadata, benchmark roles, currency fields, alignment rules, data-quality checks, and freshness language. I also specified the behavior of sector and industry classification for instruments that do not represent operating companies. The financial formulas themselves were owned by Hoàng Khánh Linh, and their software implementation was owned by Lê Bảo An. My responsibility was to ensure that the observations supplied to those formulas were traceable to a source, expressed in a declared unit, and aligned over an admissible period.

The evidence is distributed across `docs/WEEK3.md`, the Vietnam and international catalog files, provider modules, classification logic, and freshness tests. These artifacts record not only the preferred source but also the fallback and the limitation. This distinction is important because a silent fallback can change the economic meaning of an output. For example, an ETF that tracks a large-cap index is not identical to the index itself and must be labelled accordingly.

[[FIGURE:diagram_data_pipeline|Data provenance and validation path from user input to the financial engine|Source: Author's diagram based on Finfolio 2.0 data modules and Week 3 documentation.]]

## II. DISTINCTIVE CONTRIBUTIONS TO FINFOLIO 2.0

### 2.1 Input dictionary and multi-asset data contract

The input dictionary translated the product's user-facing fields into unambiguous data requirements. It records the instrument identifier, exchange or provider namespace, asset class, initial position value, user-entered currency, native quote currency, sector and industry labels, price dates, benchmark selection, and allocation caps. Each field is accompanied by a type, unit, example, validation rule, and source or owner. Separating initial value from market price was necessary because the final product accepts a monetary position value rather than requiring the user to know a historical quantity.

Currency required two different fields. The user may express the starting position in VND or USD, while the security itself has a native quote currency determined by the market. Conflating these fields would distort quantity and return. The data contract therefore converts the user-entered starting value to the base currency at the initial date, derives the appropriate quantity from the native price, and retains the native quote currency for subsequent foreign-exchange attribution.

Figure 2 shows the portfolio-entry interface that implements this contract. Each row separates instrument type, searchable identifier, monetary value, and currency. The form also records the analysis period, performance benchmark, and allocation limits, making the conditions of later calculations visible at the point of entry.

[[FIGURE:portfolio_input|Portfolio input with instrument, monetary value, currency, benchmark, and constraint fields|Source: Finfolio 2.0 application, project screenshot.]]

### 2.2 Source register and Vietnam benchmark policy

The source register assigns a defined purpose to each provider. TradingView through `tvdatafeed` supplies Vietnam equity and index histories because Yahoo Finance did not provide a stable VN-Index series over the required period. Yahoo Finance remains appropriate for international equities, exchange-traded funds, commodity proxies, and foreign-exchange observations within the supported universe. User input supplies position values and preferences, while fixed fixtures are retained for numerical tests and are explicitly labelled as test data.

The benchmark policy distinguishes a performance benchmark from a portfolio holding. VN30 or VN-Index can be used as an external comparison series but is never silently inserted into the portfolio. When direct index observations are unavailable, `E1VFVN30.VN` may be used as a labelled ETF proxy. The label must remain visible because tracking error, fees, and market trading mechanics make the proxy economically different from the index. This policy followed the external feedback received by the group: Finfolio's current purpose is performance comparison, so one declared performance benchmark is clearer than an automatically mixed policy benchmark.

The registered sources also carry limitations. Free providers can impose rate limits, revise history, or return incomplete metadata. A successful download timestamp does not prove that the most recent market session is present. The application therefore distinguishes the provider, snapshot time, latest closed session, and fallback status. These fields allow a user or reviewer to identify whether the analysis uses a live provider response, a cached snapshot, or a declared fallback.

### 2.3 Common-date, benchmark, and currency compatibility

Multi-market alignment is performed on the intersection of valid observations required for a calculation. Vietnamese, United States, benchmark, and USD/VND series can close on different calendar dates, and the newest session in one market may still be open in another. Forward-filling across a long closure would create an artificial daily return of zero and could bias covariance or relative metrics. The contract therefore aligns on common dates and excludes price gaps longer than the accepted threshold from daily-risk estimation.

Relative measures such as active return, tracking error, beta, alpha, and information ratio are calculated only when the portfolio and benchmark use the same effective period and sufficient common observations. Currency conversion is performed before a VND-based portfolio is compared with a VND benchmark. This sequence prevents differences in calendar or unit from being interpreted as investment performance.

[[FIGURE:analysis|Analysis page showing effective dates, data status, base currency, and benchmark context|Source: Finfolio 2.0 application, project screenshot.]]

### 2.4 Classification and searchable instrument universe

The supported universe combines a Vietnam symbol list and an international catalog. Each entry contains a normalized identifier, human-readable name, market, instrument type, quote currency, and available classification. Search accepts both ticker symbols and company names and normalizes case and Vietnamese accents. This behavior allows users to find a security without already knowing the provider-specific suffix.

Sector and industry labels are meaningful for operating companies but can mislead when applied to commodities, broad ETFs, or cryptoassets. I specified explicit non-corporate labels such as "Not applicable" and preserved commodity type as a separate grouping dimension. This supports grouped attribution by instrument, asset class, market or commodity type, currency, sector, and industry without inventing a corporate classification for an exposure that does not have one.

## III. IMPLEMENTATION AND DEVELOPMENT PROCESS

### 3.1 Development of the data-readiness evidence

During Weeks 1 and 2, I identified provider, benchmark, currency, and calendar risks associated with the multi-asset product proposal. In Week 3, these questions became the formal input dictionary, source register, sample data, assumptions, data structure, validation rules, and data flow. The resulting documentation gave the team a shared definition of each input and identified the owner of user-entered, provider-supplied, and derived fields.

During Weeks 4 and 5, the data contract was connected to the financial and interface requirements. Benchmark and exchange-rate fields were linked to the formulas that consume them, and instrument suggestions were linked to visible name, market, and unit labels. In Weeks 6 and 7, the work moved from specification to operational checks: Vietnam data coverage, search behavior, classification, provider fallback, and freshness metadata were tested through `test_vn_data.py`, `test_global_data.py`, `test_symbol_search.py`, `test_classification.py`, and `freshness.test.mjs`.

### 3.2 Freshness monitoring and scheduled refresh

The final audit revealed that a file could have a recent download timestamp while containing an older market session. I therefore defined freshness using both timestamps. The application presents the most recent closed Vietnam session and the snapshot refresh time separately. The scheduled job validates the number of supported symbols and the latest date before publishing a snapshot. When a snapshot is missing or stale, the server attempts the provider path and reports the failure rather than substituting an unlabelled fixture.

The current job is best-effort because GitHub Actions scheduling is not guaranteed to start at an exact minute. The product also does not maintain a dedicated exchange-holiday calendar. These constraints are documented, and the interface avoids fabricating a candle for weekends or market holidays. The freshness mechanism therefore communicates operational evidence while preserving the distinction between system activity and market recency.

## IV. EVIDENCE, VERIFICATION AND PROJECT OUTCOMES

The data contribution can be verified by tracing an instrument from form entry to the API response and then to the calculation period. `demo/vn_universe.json` and `demo/instrument_catalog.json` establish the supported symbols and metadata. `demo/vn_data.py` and `demo/global_data.py` implement the provider responsibilities. `demo/classification.py` applies the sector and industry rules, while `demo/data_status.py` and `demo/freshness.mjs` expose and interpret recency.

| Data deliverable | Repository evidence | Verification procedure |
| --- | --- | --- |
| Input dictionary and source register | `docs/WEEK3.md` | Trace every portfolio form field to type, unit, validation, and source. |
| Vietnam universe and benchmarks | `demo/vn_universe.json`, `demo/vn_data.py` | Run the Vietnam data tests and inspect direct index or labelled proxy status. |
| International instruments | `demo/instrument_catalog.json`, `demo/global_data.py` | Confirm symbol, market, quote currency, and instrument type. |
| Classification and search | `demo/classification.py`, `demo/symbol_search.py` | Search by ticker and name; inspect non-corporate labels. |
| Freshness | `demo/data_status.py`, `demo/freshness.mjs` | Compare latest session with refresh timestamp and run the freshness tests. |

The final outcome was a data pipeline capable of supporting an actual multi-asset example consisting of Vietnamese equities and a USD commodity ETF proxy. The pipeline supplies a common VND basis, a declared comparison benchmark, and transparent source timing. These conditions enabled the financial engine to calculate attribution and risk without hiding differences in provider, currency, or market calendar.

## V. LIMITATIONS AND LESSONS LEARNED

The application does not yet maintain point-in-time sector and industry histories, and the supported Vietnam universe is finite. A company can therefore be classified using current metadata when historical classification would be preferable. Exchange holidays are inferred through observations rather than a dedicated calendar, and multi-market closing times remain asynchronous. Free providers can also change their response format or revise historical values.

The principal lesson was that a financial result is only as defensible as its data lineage. Source, currency, effective date, transformation, fallback, and validation status must remain traceable. A provider response that contains numbers is not automatically suitable for covariance or benchmark analysis. Establishing this contract reduced ambiguity between workstreams and gave the QA owner observable conditions through which the data path could be tested.

## VI. CONCLUSION

My contribution established the data architecture and provenance controls of Finfolio 2.0. I defined the inputs and metadata required by the product, resolved the Vietnam benchmark-source problem, separated user and quote currencies, specified common-date alignment, developed classification rules, and strengthened freshness monitoring.

These outputs allowed the application to support multiple asset classes while retaining a transparent chain from user input to market observation and financial calculation. The work also established a clear accountability boundary: I determined whether data were identifiable and compatible, while the Financial Logic Lead and Lead Developer remained responsible for the meaning and implementation of the formulas applied afterward.
