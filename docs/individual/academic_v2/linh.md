# Hoàng Khánh Linh

## ABSTRACT

This report presents my individual contribution to Finfolio 2.0 as Product Owner and Financial Logic Lead. My responsibility was to define the analytical problem, maintain the product boundary, and specify the financial meaning of the outputs implemented by the development team. The principal methodological contributions were the buy-and-hold return framework, return contribution, Euler risk decomposition, foreign-exchange attribution, constrained optimization assumptions, and the language used to communicate limitations. The report explains why each method was selected, how its internal reconciliation can be verified, and how the methodology is separated from data engineering and software implementation. It also evaluates the limitations of the current model, including the focus on price return, a disclosed default risk-free rate, in-sample estimation, and the use of commodity exchange-traded proxies. The contribution established a consistent financial contract: every visible metric must state its unit and assumptions, reconcile with the corresponding portfolio total where applicable, and remain within the boundary of analytical support rather than personalized investment advice.

**Keywords:** portfolio methodology; return attribution; Euler risk decomposition; foreign exchange; constrained optimization; analytical limitations.

## I. INTRODUCTION AND INDIVIDUAL RESPONSIBILITY

Finfolio 2.0 began with a problem of explanation rather than trade execution. The target user is a financially literate retail investor who can hold Vietnamese equities and international commodity proxies but lacks a coherent view of how those positions combine into total return and risk. A conventional dashboard can report performance, volatility, and a benchmark difference, yet those aggregates do not answer which positions generated the result or whether a proposed allocation is being compared under equivalent assumptions. The product therefore required a financial framework that connected portfolio value, attribution, risk decomposition, benchmark comparison, and optional allocation analysis.

As Product Owner and Financial Logic Lead, I defined this analytical scope and approved the meaning of the measures exposed by the application. My responsibility included the target-user problem, core analytical path, return and risk methodology, foreign-exchange treatment, optimization assumptions, metric definitions, and claim boundaries. I reviewed the resulting interface explanations to ensure that an estimated historical output was not presented as a guaranteed forecast or recommendation. The work is documented in `docs/WEEK4.md`, `docs/FX_ATTRIBUTION.md`, `docs/OPTIMIZATION.md`, and `docs/FINAL_METHODS.md`.

Responsibility for adjacent layers remained explicit. Trần Minh Ngọc owned provider selection, benchmark fallback, currency metadata, and common-date alignment. Lê Bảo An implemented the formulas, optimizer, and Monte Carlo workflow. Nguyễn Quỳnh Anh translated the methodology into acceptance cases, while Nguyễn Ngọc Anh designed its presentation. My role was to determine what the financial output means, which assumptions must accompany it, and which identities must hold before it can be accepted.

[[FIGURE:diagram_methodology|Relationship between Finfolio's value, attribution, risk, and reference-allocation methods|Source: Author's diagram based on the approved Finfolio 2.0 methodology.]]

## II. DISTINCTIVE CONTRIBUTIONS TO FINFOLIO 2.0

### 2.1 Portfolio value and return attribution

The first methodological decision was to retain an actual-value portfolio path rather than normalize every series to 100 points. The user enters the initial value of each position, expressed in VND or USD, and the system derives buy-and-hold quantities from the first valid observation. This preserves the economic meaning of the input: a user who begins with VND 100 million can see how that capital changes over the selected period. Period return is calculated from the resulting total portfolio value, and each holding's contribution is derived on the same basis.

Return contribution must reconcile with total portfolio return. The purpose of this condition is both analytical and operational. It prevents the interface from showing attractive individual contribution values whose sum does not explain the portfolio result, and it provides a numerical acceptance criterion for the implementation. Grouped views by asset class, sector, industry, market, or currency must aggregate the same mutually exclusive holding-level contributions rather than recalculate performance using inconsistent denominators.

[[EQUATION:return_contribution]]

Figure 2 presents the analysis page on which the total result and the contribution section are shown together. This arrangement reflects the approved explanation sequence: the user first sees the portfolio-level outcome and then examines the positions or groups that produced it.

[[FIGURE:analysis|Portfolio result and return-contribution interface|Source: Finfolio 2.0 application, project screenshot.]]

### 2.2 Euler risk decomposition

Volatility is useful as an aggregate measure, but it does not identify the holdings responsible for portfolio risk. I therefore specified Euler decomposition for a differentiable, homogeneous volatility function. Given daily portfolio weights and a sample covariance matrix, annualized portfolio volatility is calculated from the quadratic form. Marginal contribution measures the change in volatility associated with an incremental change in a holding weight, while component risk multiplies that marginal effect by the current weight.

[[EQUATION:euler_risk]]

The central acceptance identity is that the component risks sum to total annualized portfolio volatility, subject to a small numerical tolerance. This property makes the risk output attributable and auditable. It also changes the user's interpretation: a holding with a modest allocation can contribute disproportionately to volatility when it is individually volatile or strongly correlated with the rest of the portfolio. Conversely, a volatile holding may contribute less than expected when its covariance relationship provides diversification.

The methodology uses sample covariance and an annualization factor of 252 trading sessions. Both choices are disclosed because they affect the reported figure. Annualization does not convert historical volatility into a guaranteed future value, and the covariance matrix can change materially across samples. The financial engine therefore calculates the measure only after the data layer has supplied a sufficiently long, aligned set of observations.

### 2.3 Foreign-exchange attribution

International holdings introduce a second source of return. A VND-based investor experiences both the local price movement of the asset and the movement of the asset's quote currency against VND. Treating the VND return as though it came entirely from the asset price would conceal this distinction. I specified an exact multiplicative identity that separates the local-asset effect, exchange-rate effect, and their interaction.

[[EQUATION:fx_attribution]]

The interaction term is necessary because local return and currency return compound rather than add exactly. The three components reconcile with the VND-denominated return of the holding. For a Vietnamese asset already denominated in VND, the exchange-rate component is zero. For an international commodity ETF proxy, the interface can identify whether the VND result was driven primarily by the proxy's USD price, by USD/VND, or by their joint effect.

This method also supports responsible labeling. The product distinguishes a commodity exposure proxy from a physical spot commodity and does not imply that the ETF price is identical to the underlying commodity quotation. Currency attribution is applied to the instrument actually observed by the application, with the quote currency and base currency stated by the data contract.

### 2.4 Optimization assumptions and analytical claim boundary

The optimization feature was framed as a historical reference-allocation exercise. I specified two objectives: minimum estimated variance and approximate maximum historical Sharpe ratio. The feasible set is long-only, sums to 100%, and respects both instrument-level and commodity-group caps. Before-and-after results must use the same time period, valid observations, currency basis, and financial assumptions so that changes can be attributed to weights rather than to a different sample.

The risk-free rate required particular attention. Finfolio 1.0 implicitly used 3% per year, and forcing every user to supply a market rate would add an input that many users could not defend. The final method therefore retains a disclosed 3% default and permits an advanced override. The application does not claim that this value is a live market quotation. Maximum-Sharpe results remain sensitive to expected-return estimation, and the interface labels the output as an approximate reference allocation.

[[FIGURE:optimize|Historical reference-allocation comparison under user-defined constraints|Source: Finfolio 2.0 application, project screenshot.]]

## III. IMPLEMENTATION AND DEVELOPMENT PROCESS

### 3.1 From problem statement to financial contract

During Weeks 1 and 2, I helped select the portfolio-attribution problem from the candidate ideas and narrowed the target user to a self-directed investor with financial knowledge and a multi-asset portfolio. The core task was expressed as entering a small portfolio, validating its information, viewing current allocation and attribution, examining a constrained alternative, and recording a decision. This sequence prevented the product from expanding into brokerage execution, automated advice, or an account-heavy platform before the analytical workflow was defensible.

By Week 4, the product boundary had been converted into a financial contract. The contract defined units, observation requirements, reconciliation identities, and the order in which calculations could be performed. Return contributions had to sum to total return; Euler components had to sum to volatility; foreign-exchange components had to sum to the VND holding return; and optimized weights had to satisfy all declared constraints. These conditions later became acceptance tests and visible methodology explanations.

### 3.2 Review of advanced metrics and user-facing language

In the final stage, I reviewed the definitions and explanatory boundaries for CAGR, maximum drawdown, Sharpe, Sortino, Calmar, historical VaR and CVaR, skewness, excess kurtosis, beta, alpha, tracking error, and information ratio. These measures were included to deepen interpretation, but they were not allowed to compete with the main attribution output. Each advanced metric had to state its unit or frequency, the period over which it was estimated, and a limitation relevant to a retail investor.

The same review applied to language. Expressions such as "best portfolio," "safe allocation," or "guaranteed improvement" were excluded because the estimates are sample-dependent. The accepted language uses "reference allocation," "historical estimate," and "under the selected observations and assumptions." This is a product requirement rather than a cosmetic disclaimer: it determines the decision a user can reasonably make from the output.

## IV. EVIDENCE, VERIFICATION AND PROJECT OUTCOMES

The methodology can be verified through documentation and numerical reconciliation. `docs/WEEK4.md` records the core logic, `docs/FX_ATTRIBUTION.md` gives the currency identity, `docs/OPTIMIZATION.md` states the objectives and constraints, and `docs/FINAL_METHODS.md` defines the final metrics and interpretation limits. The corresponding implementations are located in `demo/finance.mjs`, `demo/attribution.mjs`, and `demo/optimizer.mjs`.

| Methodological output | Acceptance evidence | Explanation I can reproduce |
| --- | --- | --- |
| Return contribution | Holding or group contributions reconcile with portfolio return. | Derive the buy-and-hold value path and show the shared denominator. |
| Euler risk | Component risks reconcile with annualized portfolio volatility. | Explain covariance, marginal risk, and the Euler identity. |
| FX attribution | Local, currency, and interaction effects reconcile with VND return. | Work through a USD asset held by a VND investor. |
| Optimization | Weights total 100%, obey caps, and use an identical sample before and after. | Explain feasibility, objective choice, and in-sample sensitivity. |
| Advanced metrics | Each value carries a unit, method, and limitation. | Trace the visible metric to `FINAL_METHODS.md`. |

The project outcome was a coherent analytical sequence rather than a collection of unrelated indicators. Portfolio value establishes the observed result; return and risk attribution explain its sources; benchmark comparison provides context; and optimization offers a constrained historical alternative. Monte Carlo simulation extends the analysis, but its algorithm and implementation belong to the Lead Developer's footprint rather than mine.

## V. LIMITATIONS AND LESSONS LEARNED

The model focuses on price return and does not fully represent reinvested dividends, taxes, or transaction costs. The 252-session convention and the 3% risk-free rate are disclosed assumptions. Covariance, expected return, beta, and tail measures depend on the selected sample. Commodity exposures are represented through available tradable proxies, which can introduce tracking differences and fund-specific effects. These limitations mean that a mathematically correct calculation can still have restricted economic interpretation.

The principal lesson was the need to separate methodology, data readiness, and implementation. A formula should be specified together with the observations it requires and an identity through which it can be checked. The Product Owner approves the meaning and claim boundary; the Data Lead determines whether the observations are admissible; the Lead Developer implements the procedure; and the QA owner verifies the result. This separation improved accountability and reduced the risk that a technical decision would silently change the financial definition.

## VI. CONCLUSION

My contribution established the financial logic and product boundary of Finfolio 2.0. I defined the role of actual-value portfolio paths, return contribution, Euler risk decomposition, foreign-exchange attribution, and constrained reference allocation. I also approved the assumptions and explanatory language applied to advanced metrics and historical optimization.

The resulting methodology provides a defensible answer to the project's core question: what did the portfolio produce, where did the result come from, and what would a constrained change in weights have implied under the same historical evidence? Its usefulness depends on visible assumptions and reconciliation, and the application preserves those conditions throughout the analytical flow.
