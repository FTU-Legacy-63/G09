# Week 3 — Validation và Early Logic Test

## Validation register

| ID | Check | Failure message / behavior | Severity |
| --- | --- | --- | --- |
| V01 | Required field missing hoặc sai type | Chỉ rõ field, expected format và example | Block |
| V02 | Symbol rỗng, bare/ambiguous hoặc không resolve được | `Unsupported or ambiguous instrument`; không silent fallback | Block instrument |
| V03 | Exchange/currency metadata xung đột input | Yêu cầu xác nhận hoặc sửa mapping | Block |
| V04 | Close price, FX hoặc holdings quantity `≤ 0` | Báo field/value không hợp lệ; short nằm ngoài MVP | Block |
| V05 | Một symbol xuất hiện nhiều lần trong holdings snapshot | Yêu cầu gộp quantity hoặc áp dụng aggregation rule công bố | Block |
| V06 | Duplicate observation theo symbol/date | Giữ raw evidence, yêu cầu deterministic deduplication rule | Block calculation |
| V07 | Date parse lỗi, start ≥ end hoặc date ở tương lai | Báo date rule bị vi phạm | Block |
| V08 | Thiếu FX path cho non-base-currency asset | Nêu currency/date bị thiếu | Block affected metrics |
| V09 | Missing/nonpositive close trong aligned matrix | Loại theo published rule hoặc dừng nếu dưới minimum observations | Block/flag |
| V10 | Dữ liệu stale hoặc retrieval lỗi | Hiển thị last available date/source; không giả là current | Flag/block theo policy |
| V11 | Derived proposed weights không tổng 100% trong tolerance | Báo lỗi rebalance rule và không xuất comparison | Block comparison |
| V12 | Target weight ngoài min/max | Nêu changed symbol, target và bound bị vi phạm | Block comparison |
| V13 | Không đủ observations cho metric | Không annualize/diễn giải metric; nêu minimum policy | Block metric |
| V14 | Benchmark thiếu hoặc market cap thiếu | Ẩn/đánh dấu phần optional; core output vẫn chạy | Non-blocking |

## Formula path used for the early test

Với tài sản `i` tại ngày `t`:

```text
value_i,0 = quantity_i × price_i,0 × fx_i,0
weight_i,0 = value_i,0 / Σ value_i,0
base_price_i,t = price_i,t × fx_i,t
return_i,t = base_price_i,t / base_price_i,t-1 - 1
asset_period_return_i = base_price_i,T / base_price_i,0 - 1
return_contribution_i = weight_i,0 × asset_period_return_i
portfolio_period_return = Σ return_contribution_i
proposed_weight_j = weight_j,0 × (1 - target_weight) / (1 - current_weight_changed), j ≠ changed
portfolio_vol = sqrt(w'Σw) × sqrt(252)
risk_contribution_i = w_i × (Σw)_i / sqrt(w'Σw) × sqrt(252)
```

`Σ` là sample covariance matrix của 9 daily return observations (`ddof=1`). Period return dùng fixed-quantity buy-and-hold, không giả định daily rebalancing. Volatility/risk contribution là static-weight estimate tại start allocation; threshold và full methodology được khóa ở Week 4.

## Deterministic fixture tests

| Test | Expected result | Result |
| --- | --- | --- |
| T01 — Current allocation reconciles | Tổng start weights = 100% | Pass: 100.0000% |
| T02 — First daily portfolio return | 2026-07-01 → 2026-07-02 = 2.235879% | Pass |
| T03 — Current period return | Buy-and-hold từ 2026-07-01 → 2026-07-15 = -1.261763% | Pass |
| T04 — Risk decomposition reconciles | Tổng RC = portfolio volatility trong numerical tolerance | Pass: 21.986605% = 21.986605% |
| T05 — Proposed scenario valid | BTC target 20%; derived weights `33.9437/22.5324/23.5239/20.0000` sum to 100% và nằm trong `0–60%` | Pass |
| T06 — Like-for-like comparison | Current/proposed dùng cùng 10 dates, FX, annualization và assumptions | Pass |
| T07 — Short horizon guard | Fixture không được gắn nhãn decision-grade CAGR | Pass: CAGR omitted |
| T08 — Proposed result | Buy-and-hold period return = -0.826938%; static-weight volatility estimate = 22.498064% | Pass |

## Negative tests required before implementation checkpoint

| Scenario | Expected behavior | Status |
| --- | --- | --- |
| Enter bare `PVI` and adapter resolves a US instrument | Reject as ambiguous/wrong venue; require supported mapping | Specified |
| One USD asset has no `VND=X` observation | Block its base-currency metrics; identify missing date | Specified |
| BTC target weight = 65% trong khi max = 60% | Block comparison and display violated upper bound | Specified |
| Holdings quantity bằng 0 hoặc âm | Reject because empty/short positions are outside MVP | Specified |
| Upload có transaction columns thay vì holdings snapshot | Báo transaction history chưa được hỗ trợ; không âm thầm diễn giải thành current holdings | Specified |
| Market cap is missing | Continue core output; show contextual field unavailable | Specified |
| Only 10 price dates supplied for CAGR | Do not show CAGR; explain insufficient horizon | Specified |

Các số trong test là expected arithmetic results cho fixture đã commit, không phải kết luận hiệu quả danh mục. Code-level unit tests và threshold policy đầy đủ được chuyển sang Week 4.
