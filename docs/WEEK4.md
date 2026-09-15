# Week 4 — Financial Logic & Expected Results

## 1. Mục tiêu của Week 4

Week 4 biến input đã xác định thành một reasoning chain tài chính có thể kiểm tra trước khi triển khai. Tài liệu này khóa phương pháp Core MVP, expected output, acceptance logic và giới hạn; các phương pháp nâng cao chưa được chấp nhận được tách riêng.

## 2. Quyết định phương pháp cho Core MVP

| Hạng mục | Quyết định hiện tại |
| --- | --- |
| Asset universe | Chỉ cổ phiếu thuộc supported universe |
| Benchmark | Một performance benchmark bắt buộc; với danh mục cổ phiếu Việt Nam, VN-Index là lựa chọn mặc định nếu nguồn được xác minh |
| Return | Price return theo cùng period/convention cho portfolio và benchmark |
| Return attribution | Contribution theo mã; cộng theo sector và factor/exposure đã định nghĩa |
| Risk | Annualized volatility và Euler risk contribution |
| Benchmark comparison | Portfolio return − benchmark return; tracking error/active-risk contribution khi đủ dữ liệu |
| Optimization | Constrained long-only minimum variance là baseline Core MVP |
| Comparison | Current và optimized dùng chung return matrix, covariance, horizon và assumptions |
| Main output | Một Risk and Return Allocation Brief |

Full Brinson-Fachler, multi-period Cariño linking, active attribution nhiều tầng, Ledoit–Wolf nâng cao và max-Sharpe là các phương pháp optional chỉ được bật khi có đủ data/method evidence. Monte Carlo và multi-asset thuộc final product, không thuộc Core MVP.

## 3. End-to-end financial logic

```text
Validate
  → Calculate current allocation and returns
  → Attribute return and risk
  → Compare with benchmark
  → Estimate covariance
  → Optimize under disclosed constraints
  → Recalculate optimized portfolio
  → Compare and explain
```

Mọi module phải dùng chung symbol mapping, analysis horizon, return frequency, price convention và method version.

## 4. Current portfolio calculation

Với cổ phiếu `i`, giá đầu kỳ `P_i,0` và quantity `q_i`:

```text
position_value_i = q_i × P_i,0
weight_i = position_value_i / Σ position_value_i
return_i,t = P_i,t / P_i,t-1 − 1
portfolio_return_t = Σ weight_i × return_i,t
```

Nếu dùng fixed-quantity buy-and-hold cho period return:

```text
portfolio_period_return = V_T / V_0 − 1
```

Không cộng CAGR của từng mã để tạo portfolio CAGR. CAGR chỉ hiển thị khi horizon đủ dài và được tính từ value path của portfolio.

## 5. Return attribution

Core MVP dùng phép phân rã dễ giải thích:

```text
security_return_contribution_i = start_weight_i × period_return_i
portfolio_period_return = Σ security_return_contribution_i
sector_contribution_g = Σ contribution_i, i thuộc sector g
```

Factor/exposure view áp dụng cùng nguyên tắc group/tag khi mapping là mutually exclusive. Nếu exposure là liên tục hoặc chồng lấn, output phải dùng mô hình riêng đã công bố; không cộng các factor như sector buckets.

Core questions:

- mã nào đóng góp return lớn nhất/nhỏ nhất;
- ngành nào tập trung phần lớn return;
- factor/exposure nào có liên hệ đáng chú ý theo method được hỗ trợ.

### Optional method, chưa phải Core MVP

Brinson-Fachler có thể phân rã active return thành allocation, selection và interaction khi có benchmark constituent weights/sector returns point-in-time. Vì dependency này chưa có evidence đầy đủ, tài liệu không mô tả Brinson nhiều tầng như feature đã chạy. Nếu triển khai sau, bắt buộc reconcile tổng effects với `portfolio return − benchmark return` và công bố convention cho cổ phiếu ngoài benchmark.

## 6. Risk attribution

Từ covariance matrix `Σ` và vector weight `w`:

```text
portfolio_volatility = sqrt(w'Σw) × sqrt(252)
marginal_risk_i = (Σw)_i / sqrt(w'Σw)
risk_contribution_i = w_i × marginal_risk_i × sqrt(252)
```

Acceptance identity:

```text
Σ risk_contribution_i = portfolio_volatility
```

Risk contribution theo sector là tổng contribution của các mã trong sector. `risk contribution / portfolio volatility` cho risk share; so sánh risk share với capital weight giúp phát hiện concentration.

Volatility là historical estimate, đo cả upside lẫn downside và không phải forecast. Euler contribution là ảnh hưởng biên quanh allocation hiện tại, không phải lượng risk chắc chắn mất đi nếu bán toàn bộ vị thế.

## 7. Benchmark logic

Benchmark là essential input, không phải feature optional.

```text
benchmark_return_t = B_t / B_t-1 − 1
active_return_period = portfolio_period_return − benchmark_period_return
active_weight = portfolio_weight − benchmark_weight
tracking_error = std(portfolio_return_t − benchmark_return_t) × sqrt(252)
```

Rules:

1. Portfolio và benchmark dùng cùng dates, frequency và price-return convention.
2. Một benchmark duy nhất được dùng cho performance comparison trong một run; không trộn nhiều benchmark thành policy benchmark trong Core MVP.
3. Nếu dùng ETF proxy, output phải ghi đúng tên proxy và limitation; không gọi proxy là index gốc.
4. Thiếu benchmark hoặc không đủ common observations sẽ chặn phần benchmark-dependent; hệ thống không tự thay benchmark âm thầm.
5. Benchmark là mốc so sánh performance, không khẳng định allocation đó phù hợp với risk tolerance của người dùng.

## 8. Portfolio optimization

### Core objective

Core MVP tạo một **minimum-variance reference allocation**:

```text
min_w   w'Σw
subject to
        Σ w_i = 1
        w_i ≥ 0
        min_weight_i ≤ w_i ≤ max_weight_i
        Σ_(i thuộc sector g) w_i ≤ sector_cap_g
```

Nhóm có thể thêm turnover constraint nếu input và UI đã hỗ trợ. Constraint set phải feasible và được hiển thị cạnh kết quả.

### Output và claim boundary

Optimizer trả về objective, constraints, reference weights và các metric được tính lại. Đây là analytical scenario, không phải lời khuyên hay “danh mục tốt nhất”. Hệ thống không tự áp dụng allocation và không tạo lệnh.

### Optional objective

Max-Sharpe chỉ chạy khi risk-free rate và expected-return estimator có source/method hợp lệ:

```text
maximize (μ'w − r_f) / sqrt(w'Σw)
```

Historical mean rất nhạy với sample window; vì vậy max-Sharpe chưa phải baseline Core MVP. Nếu được bật, output phải hiển thị estimator và sensitivity/estimation-error warning.

## 9. Current–optimized comparison

| Thành phần | Current | Optimized reference | Comparison rule |
| --- | --- | --- | --- |
| Allocation | Weight theo mã/ngành | Weight nghiệm optimizer | Mỗi bên tổng 100% |
| Expected return | Dùng estimator đã công bố | Cùng estimator | Không đổi `μ` giữa hai trạng thái |
| Volatility | `sqrt(w'Σw)` | Cùng `Σ` | Cùng annualization |
| Benchmark-relative metrics | Active return/tracking error khi đủ data | Tính bằng cùng benchmark | Cùng horizon và dates |
| Constraints | N/A/current breaches nếu có | Pass/fail từng constraint | Không ẩn constraint |

Một câu giải thích đúng dạng: “Với historical covariance và giới hạn đã hiển thị, reference allocation có estimated volatility thấp hơn/cao hơn current portfolio.” Không được chuyển thành “người dùng nên mua/bán”.

## 10. Data-sufficiency và validation

Ngưỡng dưới đây là policy prototype cần tiếp tục kiểm chứng, không phải chân lý phổ quát:

| Metric/module | Minimum policy | Khi không đủ |
| --- | --- | --- |
| Allocation | Một price observation | Vẫn chạy nếu holdings hợp lệ |
| Period return/contribution | Ít nhất một return observation | Nếu không có thì ẩn metric |
| CAGR | Khoảng 252 daily returns | Chỉ hiện period return |
| Annualized volatility | 60 returns; cảnh báo dưới 120 | Không diễn giải decision-grade |
| Covariance/Euler/optimizer | `T ≥ max(120, 10N)` và matrix hợp lệ | Ẩn risk attribution/optimizer; nêu lý do |
| Benchmark comparison | Common dates cho portfolio và benchmark | Chặn phần phụ thuộc benchmark |

Validation bắt buộc:

- identity và dữ liệu: unique symbol/date, positive price/quantity, aligned horizon;
- allocation: current và optimized weights sum to 1 trong tolerance;
- attribution: security/sector contributions reconcile;
- risk: tổng Euler contributions bằng portfolio volatility;
- benchmark: active return tính lại đúng trên cùng period;
- optimizer: solver success, feasibility và tất cả bounds/caps pass;
- comparison: current và optimized dùng cùng estimates và assumptions.

## 11. Expected output

Risk and Return Allocation Brief phải theo thứ tự **Result → Reason → Meaning → Possible action → Limitation**.

| Section | Nội dung tối thiểu |
| --- | --- |
| Analysis context | Holdings date, horizon, benchmark, source và method version |
| Current portfolio | Allocation, period return/CAGR nếu đủ, volatility |
| Attribution | Top positive/negative return contribution theo mã/ngành/factor và top risk concentration |
| Benchmark | Portfolio return, benchmark return, active return, tracking error nếu đủ |
| Optimized reference | Objective, constraints, weights, solver/feasibility status |
| Comparison | Delta weight, expected return, volatility và benchmark-relative metrics phù hợp |
| Explanation | Ba nguyên nhân chính, assumptions và limitations |
| User action | Ghi nhận giữ nguyên hoặc cân nhắc tái phân bổ, kèm lý do |

### Existing arithmetic evidence

Fixture lịch sử trong [`data/`](../data/README.md) đã từng reconcile allocation, period return và Euler risk contribution cho FPT, HPG, GLD và BTC trên 9 returns. Nó chỉ chứng minh shape/arithmetic cũ; vì chứa multi-asset, thiếu benchmark và chưa có optimizer nên **không phải expected result hoàn chỉnh của Core MVP hiện tại**.

Expected result current-scope sẽ chỉ được đánh dấu complete khi repo có equity-only fixture với benchmark, sector/factor mapping, constraint config, optimized weights và current–optimized metrics. Không điền số giả để tạo cảm giác implementation đã tồn tại.

## 12. Limitations và open dependencies

| Dependency/limitation | Impact | Required action |
| --- | --- | --- |
| VN-Index chưa resolve qua Yahoo adapter cũ | Chặn benchmark output | Chọn/validate provider; fallback phải ghi nhãn proxy |
| Chưa có sector/factor mapping point-in-time | Chặn grouped/factor output đầy đủ | Commit source, mapping và effective date |
| Fixture chỉ có 9 returns | Không đủ cho risk/optimization interpretation | Tạo equity-only long-window fixture |
| Expected return/risk-free source chưa khóa | Max-Sharpe không đáng tin cậy | Giữ min-variance baseline; validate source trước khi bật |
| Price return không gồm dividend, fee, tax | Không phải net/total investor return | Disclosure bắt buộc |
| Historical covariance không phải forecast | Optimized weights phụ thuộc sample | Hiển thị horizon, estimator và sensitivity warning |
| Chưa có working code trong evidence được rà soát | Logic-ready, chưa implementation-ready | Implement thin slice và executable tests ở Week 5 |

## 13. Revision record

| Previous position | Current decision | Reason |
| --- | --- | --- |
| Multi-asset MVP | Equity-only Core MVP | Giảm data/calendar/FX complexity để hoàn thành flow |
| Benchmark từng deferred | Benchmark essential | Cần cho performance-relative evidence |
| Optimization từng out of scope | Constrained minimum variance trong Core MVP | Tạo reference allocation có thể so sánh và hành động; vẫn giữ claim boundary |
| Advanced Brinson/Carhart như hướng chính | Simple security/sector/factor contribution là Core; advanced attribution optional | Dễ hiểu hơn cho investor-facing monitoring và phù hợp data readiness |

## Individual Contribution

| Thành viên | Output Week 4 | Status |
| --- | --- | --- |
| Hoàng Khánh Linh | Financial logic draft, benchmark/attribution/optimization reasoning và scope trade-offs | Documented; Core-vs-optional method revised |
| Nguyễn Quỳnh Anh | Reconciliation/acceptance logic và expected-result checks | Documented at specification level; executable tests pending |
| Lê Bảo An | Integration rules cho calculation, benchmark và optimizer | Architecture documented; implementation pending |
| Trần Minh Ngọc | Benchmark/source/classification dependencies và limitation register | Documented; sources pending validation |
| Nguyễn Ngọc Anh | Expected brief structure và current–optimized explanation | Documented; interface artefact pending |
