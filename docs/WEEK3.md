# Week 3 — Information & Data Readiness

## 1. Mục tiêu của Week 3

Week 3 kiểm tra liệu nhóm đã xác định đủ input, nguồn, cấu trúc, giả định và validation để biến danh mục cổ phiếu của người dùng thành Risk and Return Allocation Brief hay chưa. Tuần này không mở rộng tính năng; trọng tâm là khả năng truy nguyên dữ liệu và readiness cho benchmark, attribution và optimization.

## 2. Information required

### Input dictionary

| Input | Meaning | Type / unit | Example | Validation chính | Nguồn/owner | Output sử dụng |
| --- | --- | --- | --- | --- | --- | --- |
| `portfolio_id` | Mã phiên phân tích | string | `G09_SAMPLE_01` | Không rỗng, duy nhất trong phiên | System / Lê Bảo An | Trace toàn bộ brief |
| `symbol` | Mã cổ phiếu | string | `FPT.VN` | Resolve duy nhất cùng exchange | User + instrument master / Trần Minh Ngọc | Mọi kết quả theo mã |
| `quantity` | Số cổ phiếu nắm giữ | number, shares | `100` | `> 0`, không short | User / Trần Minh Ngọc | Position value, weight |
| `portfolio_weight` | Tỷ trọng nếu user nhập theo weight | number, % | `35` | `0–100`; tổng 100% trong tolerance | User / Nguyễn Quỳnh Anh | Current allocation |
| `exchange` | Sàn niêm yết | enum | `HOSE` | Thuộc supported universe | Instrument source / Trần Minh Ngọc | Identity, calendar |
| `sector` | Ngành chuẩn hóa | enum | `Information Technology` | Có taxonomy, source và effective date | Product data / Trần Minh Ngọc | Sector contribution |
| `factor_exposure` | Exposure theo factor được hỗ trợ | numeric/tag | `large_cap` | Có definition, source/method version | Product data / Trần Minh Ngọc | Factor view |
| `price_date`, `close_price` | Quan sát giá lịch sử | date; VND/share | `2026-07-01`, `70200` | Date duy nhất; price `> 0` | Market source / Lê Bảo An | Return, covariance |
| `benchmark_symbol` | Performance benchmark | string | `VNINDEX` | Bắt buộc, resolve đúng index/proxy | User/product source / Trần Minh Ngọc | Active return/risk |
| `benchmark_close` | Giá trị benchmark lịch sử | number | — | Cùng dates/horizon và convention | Market source / Lê Bảo An | Benchmark comparison |
| `data_start`, `data_end` | Horizon phân tích | ISO date | `2026-01-01` | `start < end`, đủ observation | User/config / Nguyễn Quỳnh Anh | Tất cả metric |
| `objective` | Mục tiêu optimizer | enum | `min_variance` | Thuộc objective được hỗ trợ | User / Hoàng Khánh Linh | Optimized reference |
| `min_weight`, `max_weight` | Bounds từng mã | decimal | `0`, `0.30` | `0 ≤ min ≤ max ≤ 1` | User/config / Hoàng Khánh Linh | Constraints |
| `sector_cap` | Giới hạn theo ngành | decimal | `0.40` | `0–1`; constraints phải feasible | User/config / Hoàng Khánh Linh | Constraints |
| `risk_free_rate` | Lãi suất tham chiếu | % annual | `4.0%` | Có source/date; chỉ bắt buộc cho max Sharpe | Product source / Trần Minh Ngọc | Max-Sharpe objective |

`position_value`, `current_weight`, return series, covariance, return/risk contribution, active metrics và optimized weights là derived results, không phải user input.

## 3. Data structure

| Entity | Primary key | Trường quan trọng | Mục đích |
| --- | --- | --- | --- |
| `portfolios` | `portfolio_id` | horizon, objective, created_at | Context phiên phân tích |
| `holdings_snapshot` | (`portfolio_id`, `symbol_id`, `as_of`) | quantity hoặc weight | Current holdings; không phải transaction ledger |
| `instruments` | `symbol_id` | vendor_symbol, exchange, currency, sector, factor_version | Resolve và phân loại cổ phiếu |
| `market_prices` | (`symbol_id`, `price_date`) | close, source_id, retrieved_at | Raw price có provenance |
| `benchmarks` | (`benchmark_id`, `price_date`) | close, source_id, proxy_label | Chuỗi benchmark bắt buộc |
| `optimization_config` | (`portfolio_id`, `scenario_id`) | objective, bounds, sector caps, risk-free rate | Tạo reference allocation tái lập được |
| `metric_results` | (`portfolio_id`, `scenario_id`, `metric_id`) | value, unit, horizon, method_version | Lưu current/optimized results |
| `evidence_log` | `evidence_id` | source_id, retrieval_time, assumptions, limitations | Trace output về nguồn/method |

Raw observations không bị ghi đè. Mọi result phải mang unit, horizon, method version và source/assumption liên quan.

## 4. Source register và exact use

| ID | Nguồn | Information | Exact product use | Giới hạn | Status |
| --- | --- | --- | --- | --- | --- |
| U01 | User-entered holdings | Symbol, quantity/weight | Current allocation | Có thể nhập sai; luôn validate | Approved for MVP |
| U02 | User optimization settings | Objective và constraints | Constrained reference allocation | Có thể infeasible; phải giải thích lỗi | Approved for MVP |
| M01 | Yahoo Finance qua `yahoo-finance2` | Daily close và metadata | Prototype price return | API không chính thức, coverage VN không đầy đủ, không SLA | Provisional |
| B01 | Provider hỗ trợ `VNINDEX` như `vnstock`/SSI-compatible source | VN-Index close | Benchmark comparison | Cần xác minh license, stability và exact symbol | Pending validation; **blocking** |
| B02 | `E1VFVN30.VN` | Giá ETF proxy | Fallback benchmark | Có tracking error/fee; phải ghi “VN30 ETF proxy”, không gọi là VN-Index | Conditional fallback |
| C01 | HOSE/issuer disclosure | Exchange, sector, constituent/effective date | Instrument and sector mapping | Chưa có API thống nhất; cần snapshot point-in-time | Pending integration |
| F01 | Team-defined documented factor mapping hoặc approved factor source | Factor tag/exposure | Factor view | Chưa có source/method đã chấp nhận | Pending; output phải ẩn nếu thiếu |
| R01 | Nguồn lãi suất được nhóm chấp nhận | Risk-free rate | Max-Sharpe | Chưa khóa source và tenor | Pending; min-variance vẫn có thể chạy |
| D01 | [Committed sample fixture](../data/README.md) | Historical holdings/market observations | Arithmetic regression test | Fixture cũ có GLD/BTC, chưa có benchmark; không đại diện current equity-only MVP | Historical test evidence only |

Yahoo là nguồn prototype, không mặc nhiên là nguồn production. Nếu đổi provider, nhóm phải cập nhật source ID, retrieval timestamp, coverage test và limitation cùng lúc.

## 5. Assumptions và limitations

| ID | Assumption / limitation | Ảnh hưởng và disclosure |
| --- | --- | --- |
| A01 | Long-only, không leverage; weight mỗi mã trong `[0, 1]` | Optimizer không tạo short position; mọi constraints phải hiển thị |
| A02 | Core MVP chỉ equity | Không xử lý FX, crypto calendar, commodity proxy hoặc derivative trong current flow |
| A03 | Prototype dùng unadjusted close và price return | Chưa gồm dividend; portfolio và benchmark phải cùng convention |
| A04 | Fee, tax và slippage bằng 0 | Current–optimized comparison không phải net realized return |
| A05 | Base currency VND, daily frequency, annualization 252 | Hiển thị cạnh output; chỉ đổi convention theo method version |
| A06 | Holdings là snapshot; không có intra-period trade/cash flow | Period return không phải money-weighted return |
| A07 | Covariance/expected return được ước lượng từ lịch sử | Không phải forecast; optimization nhạy với data window và estimator |
| A08 | Sector/factor là các chiều nhìn thay thế | Không cộng chồng contribution giữa các chiều |
| A09 | Benchmark phải đủ dữ liệu cùng horizon | Thiếu benchmark sẽ chặn benchmark-dependent output, không im lặng thay proxy |
| A10 | Sample cũ chỉ có 10 dates | Chỉ dùng test parsing/arithmetic; không diễn giải CAGR, risk hoặc optimized result cho quyết định |

Final product mới xử lý multi-asset, FX và Monte Carlo. Các mục đó không phải data dependency của Core MVP.

## 6. Data flow

```text
User holdings + benchmark + horizon + objective/constraints
        ↓
Schema validation → instrument/benchmark resolution
        ↓                         ↘ lỗi rõ theo field/symbol
Price + classification + benchmark retrieval
        ↓
Normalize dates, units and price convention
        ↓
Align common observations → sufficiency/staleness checks
        ↓
Current allocation/performance → return/risk attribution
        ↓
Benchmark comparison → covariance/return estimates
        ↓
Constrained optimization → feasibility/solver checks
        ↓
Current–optimized comparison
        ↓
Risk and Return Allocation Brief + assumptions/limitations
```

## 7. Sample trace và readiness

Fixture đã commit gồm FPT, HPG, GLD và BTC cùng 10 dates. Đây là evidence lịch sử trước khi nhóm khóa equity-only MVP. Phần có thể tái sử dụng cho current scope là hai mã FPT/HPG và arithmetic pipeline; GLD/BTC không thuộc Core MVP, còn fixture chưa có benchmark, sector/factor source hoặc optimization config đầy đủ.

| Bước | Evidence hiện có | Khoảng trống so với current MVP |
| --- | --- | --- |
| Holdings → allocation | `sample_portfolio.csv`; FPT/HPG resolve được | Cần equity-only fixture chính thức |
| Prices → period return | 10 daily closes cho FPT/HPG | Không đủ horizon cho decision-grade volatility/CAGR |
| Risk arithmetic | Expected result cũ reconcile trên 9 returns | Cần chạy lại trên equity-only long window |
| Benchmark | Candidate sources đã xác định | Chưa có benchmark series đã commit |
| Sector/factor | Data requirement đã xác định | Mapping/source chưa commit |
| Optimization | Objective/constraint schema đã xác định | Chưa có config, solver output hoặc feasibility evidence |

Vì vậy Week 3 **đủ để review schema và dependency**, nhưng chưa data-ready cho toàn bộ current MVP. Benchmark source là blocker quan trọng nhất; tiếp theo là long-window equity data, classification/factor mapping và optimization config.

## 8. Validation và early logic test

| Check | Hành vi mong đợi | Status |
| --- | --- | --- |
| Required field/type sai | Chỉ rõ field, format và example | Specified |
| Symbol/benchmark mơ hồ hoặc không resolve | Block; không silent fallback | Specified |
| Quantity/price không dương hoặc duplicate date | Block calculation liên quan | Specified |
| Weight không tổng 100% | Block và nêu residual | Specified |
| Benchmark lệch date/convention | Block benchmark-dependent metrics | Specified |
| Horizon không đủ cho metric | Ẩn metric và giải thích, không annualize tùy tiện | Specified |
| Constraint mâu thuẫn/infeasible | Không chạy optimizer; nêu constraint gây lỗi | Specified |
| Optimized weights vi phạm bounds/tổng weight | Fail result; không hiển thị allocation | Specified |
| Current/optimized dùng khác estimates | Fail like-for-like comparison | Specified |
| Sector/factor thiếu source | Ẩn view liên quan; không tự gán | Specified |

Các identity cần kiểm tra ở implementation: allocation sum = 1; return contributions reconcile; Euler risk contributions reconcile; portfolio active return = portfolio return − benchmark return; optimized weights sum = 1 và thỏa constraints; mọi optimized metric được tính lại bằng cùng calculation engine.

## 9. Week 3 status

- Input/data schema: **Defined, revised for equity-only MVP**.
- Source register: **Defined; benchmark/classification/factor sources pending validation**.
- Assumptions/limitations: **Defined**.
- Historical sample arithmetic: **Available but not current-scope complete**.
- Benchmark-ready dataset: **Pending**.
- Optimization input fixture: **Pending**.
- Executable tests: **Pending implementation**.

## Individual Contribution

| Thành viên | Output Week 3 | Status |
| --- | --- | --- |
| Hoàng Khánh Linh | Assumptions, metric boundaries và optimization constraints | Assumption evidence documented; final constraint set pending |
| Nguyễn Quỳnh Anh | Validation register, early arithmetic checks và readiness tracking | Documented; executable tests pending |
| Lê Bảo An | Canonical data structure, data flow và source-adapter route | Documented; benchmark/optimizer integration pending |
| Trần Minh Ngọc | Input dictionary, source–use map, data limitations và benchmark/sector/factor requirements | Documented; source validation pending |
| Nguyễn Ngọc Anh | Sample input-to-output trace và output information needs | Historical trace documented; current–optimized screen pending |
