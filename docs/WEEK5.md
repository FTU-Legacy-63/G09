# Week 5 — MVP Feature, Flow & Implementation Readiness

## 1. Mục tiêu của Week 5

Week 5 chuyển logic tài chính thành một feature map và một user flow đủ cụ thể để triển khai. Trọng tâm là bảo đảm một người dùng có thể đi từ holdings tới kết quả current–optimized và hiểu kết quả, thay vì tiếp tục thêm module rời.

## 2. Feature map gắn với MVP

| User need | Core feature | Visible evidence/output | Acceptance |
| --- | --- | --- | --- |
| Cung cấp danh mục thật | Holdings input | Danh sách mã và quantity/weight | Dữ liệu hợp lệ được giữ nguyên sau validation |
| Có mốc đánh giá | Benchmark selection | Benchmark + period | Bắt buộc, resolve được, cùng horizon |
| Hiểu danh mục hiện tại | Current portfolio analysis | Allocation, return và volatility | Weight reconcile; method/period hiển thị |
| Biết return/risk tập trung ở đâu | Attribution | Security/sector/factor contribution và risk concentration | Contribution reconcile theo method |
| Biết portfolio khác thị trường thế nào | Benchmark comparison | Active return và tracking error nếu đủ data | Cùng dates/convention |
| Xem một phương án khác | Portfolio optimization | Objective, constraints, reference weights | Feasible; weights tổng 100%; không short |
| Đánh giá trade-off | Current–optimized comparison | Delta allocation/return/risk | Cùng estimates và assumptions |
| Hiểu và tự hành động | Explanation + decision record | Result, reason, meaning, action, limit | Không dùng ngôn ngữ khuyến nghị tự động |

## 3. Feature priority

### Core features

1. Nhập danh mục cổ phiếu.
2. Chọn benchmark, horizon, objective và constraints.
3. Validation và data-sufficiency checks.
4. Current allocation/performance.
5. Return/risk contribution theo mã và sector; factor view khi mapping/method đã sẵn sàng.
6. Benchmark comparison.
7. Constrained minimum-variance optimization.
8. Current–optimized comparison.
9. Một Risk and Return Allocation Brief có assumptions/limitations.

### Supporting features

- Sample fixture và static data fallback phục vụ demo/test.
- Source/method metadata panel.
- Download/export brief nếu còn thời gian sau khi core flow chạy.
- Filter/sort giúp đọc contribution nhưng không tạo metric mới.

### Postponed / final product

- Multi-asset ngoài cổ phiếu.
- Monte Carlo simulation.
- Account, cloud sync, chatbot và collaboration.
- Real-time feed, broker integration, execution.
- VaR/Expected Shortfall, stress testing và advanced multi-period attribution.
- Max-Sharpe cho đến khi expected-return/risk-free inputs được bảo vệ đầy đủ.

## 4. Complete user flow

```text
Start
  → Input holdings, benchmark, horizon, objective and constraints
  → Check schema, symbols, data coverage and feasibility
  → Analyze current portfolio
  → Attribute return and risk
  → Compare with benchmark
  → Optimize
  → Compare current vs optimized
  → Explain result and limitations
  → User records decision
```

### Happy path

1. User nhập các mã cổ phiếu và quantity.
2. User chọn VN-Index hoặc benchmark được hỗ trợ, analysis period và minimum-variance objective.
3. Hệ thống xác nhận mọi mã, tải/alignment dữ liệu và hiển thị allocation.
4. Hệ thống hiển thị performance, return/risk contribution và benchmark comparison.
5. Optimizer trả về reference weights thỏa long-only, per-stock và sector caps.
6. User xem current–optimized comparison, assumptions và limitations.
7. User ghi nhận giữ nguyên hoặc cân nhắc tái phân bổ cùng lý do.

### Alternative path

- User nhập trực tiếp portfolio weights thay vì quantity; validation yêu cầu tổng 100%.
- Nếu max-Sharpe chưa đủ input, hệ thống đề nghị dùng minimum variance thay vì tự giả định `r_f` hoặc expected return.
- Khi live source lỗi, nhóm có thể demo bằng equity-only fixture đã đóng băng; đây là fallback kỹ thuật, không phải bước bắt buộc của user journey.

### Error path

- Symbol/benchmark không resolve: giữ form state, chỉ rõ mã lỗi và không dùng ticker gần giống.
- Horizon thiếu dữ liệu: nêu metric nào bị chặn và minimum policy.
- Constraints infeasible: chỉ rõ bounds/caps mâu thuẫn; không trả optimized weights giả.
- Solver thất bại hoặc weights không reconcile: không hiển thị reference allocation; current analysis vẫn được giữ nếu hợp lệ.
- Sector/factor source thiếu: ẩn đúng view phụ thuộc; không tự gán classification.

## 5. Input form và validation plan

| UI label | Field | Required | Inline validation/help |
| --- | --- | --- | --- |
| Mã cổ phiếu | `symbol` | Có | Nhập mã thuộc supported exchange |
| Số lượng | `quantity` | Có nếu không nhập weight | Số lớn hơn 0; Core MVP không short |
| Tỷ trọng hiện tại | `portfolio_weight` | Có nếu không nhập quantity | Mỗi weight 0–100%; tổng 100% |
| Benchmark | `benchmark_symbol` | Có | Hiển thị tên index/proxy đầy đủ |
| Từ ngày / đến ngày | `data_start`, `data_end` | Có | Báo mức đủ dữ liệu trước khi chạy |
| Mục tiêu tối ưu hóa | `objective` | Có | Baseline: minimum variance |
| Giới hạn mỗi mã | `min_weight`, `max_weight` | Có | Kiểm tra min ≤ max và feasibility |
| Giới hạn ngành | `sector_cap` | Không/bộ mặc định công bố | Hiển thị source của sector mapping |
| Turnover tối đa | `turnover_cap` | Không | Chỉ bật khi current weights tồn tại |

Validation xảy ra ở hai lớp: inline cho schema/value và pre-run cho data coverage, benchmark alignment, covariance, constraints và solver feasibility.

## 6. Output explanation design

Mỗi insight theo pattern:

1. **Result:** con số nào thay đổi hoặc đang tập trung.
2. **Reason:** mã/ngành/factor nào tạo contribution.
3. **Meaning:** điều đó nói gì trong đúng horizon và method.
4. **Possible action:** người dùng có thể xem xét điều gì, không phải lệnh mua/bán.
5. **Limit:** data, estimator và assumption nào giới hạn kết luận.

Ví dụ wording:

> Reference allocation có estimated volatility thấp hơn current portfolio dưới historical covariance và constraints đang hiển thị. Thay đổi chủ yếu đến từ việc giảm concentration ở ngành X. Đây là analytical scenario trên dữ liệu quá khứ, không phải lời khuyên giao dịch hoặc bảo đảm kết quả tương lai.

## 7. Interface/working draft

```text
┌ Input ────────────────────────────────────────────────┐
│ Holdings | Benchmark | Horizon | Objective | Limits │
└───────────────────────────────────────────────────────┘
                         ↓ Validate
┌ Current portfolio ─────────┬ Benchmark ───────────────┐
│ Allocation / return / risk │ Active return / TE      │
├ Attribution ───────────────┼ Optimized reference ────┤
│ Security / sector / factor │ Weights / constraints   │
├────────────────────────────┴──────────────────────────┤
│ Current vs optimized: deltas and trade-offs          │
├───────────────────────────────────────────────────────┤
│ Explanation | Assumptions | Limitations | Decision   │
└───────────────────────────────────────────────────────┘
```

Information hierarchy ưu tiên kết luận và comparison trước, công thức/source mở trong evidence panel. Giao diện không biến mỗi metric thành một dashboard riêng.

## 8. Acceptance scenarios

| ID | Scenario | Expected result | Status |
| --- | --- | --- | --- |
| W5-T01 | Valid equity holdings + benchmark + feasible constraints | Đi hết flow và tạo brief | Specified; executable test pending |
| W5-T02 | Weights tổng khác 100% | Block input, hiển thị residual | Specified |
| W5-T03 | Benchmark thiếu/misaligned | Block benchmark-dependent output | Specified |
| W5-T04 | Contribution calculation | Security và sector totals reconcile | Specified |
| W5-T05 | Euler risk attribution | Tổng RC bằng portfolio volatility | Specified |
| W5-T06 | Feasible optimizer | Weights tổng 100% và mọi constraints pass | Specified |
| W5-T07 | Infeasible optimizer | Không trả allocation; chỉ rõ constraint conflict | Specified |
| W5-T08 | Current–optimized comparison | Cùng data, covariance, horizon và assumptions | Specified |
| W5-T09 | User-facing language | Có explanation/limitations, không có “best portfolio” hay buy/sell command | Specified |

## 9. Implementation readiness và evidence gaps

| Deliverable | Current status | Owner | Next evidence cần commit |
| --- | --- | --- | --- |
| One core flow | Specified | Nguyễn Ngọc Anh + Nguyễn Quỳnh Anh | Clickable/working flow |
| Input form | Labels/validation specified | Nguyễn Ngọc Anh + Lê Bảo An | Implemented form |
| Equity-only data | Not ready | Trần Minh Ngọc | Long-window fixture + provenance |
| Benchmark integration | Not ready/blocking | Trần Minh Ngọc + Lê Bảo An | Resolved series + coverage test |
| Calculation engine | Logic specified | Lê Bảo An | Executable current metrics/attribution |
| Optimizer | Logic specified | Lê Bảo An + Hoàng Khánh Linh | Solver output + feasibility tests |
| Output screen | Text wireframe only | Nguyễn Ngọc Anh | Rendered comparison/brief |
| Automated tests | Scenarios specified | Nguyễn Quỳnh Anh + Lê Bảo An | Test results |
| Deployment | No evidence in reviewed repo | Lê Bảo An | URL + reproducible run instructions |

Trạng thái trung thực: **feature/flow-ready, chưa có đủ implementation evidence để gọi là working MVP**.

## 10. Revision log

| Revision | Owner | Status |
| --- | --- | --- |
| Thu hẹp Core MVP từ multi-asset xuống equity-only | Product Owner | Accepted |
| Chuyển benchmark thành essential input | Product Owner + Business Analyst | Accepted; integration pending |
| Đưa constrained optimization vào Core MVP | Product Owner + Lead Developer | Accepted; implementation pending |
| Giữ Monte Carlo ở final product | Product Owner | Accepted |
| Bỏ sample portfolio khỏi main user journey | Product Manager + UI/UX | Accepted |
| Chuyển expected output sang current–optimized comparison | Product Manager + UI/UX | Specified; UI evidence pending |

## Individual Contribution

| Thành viên | Output Week 5 | Status |
| --- | --- | --- |
| Hoàng Khánh Linh | Feature-scope decision và acceptance của benchmark/optimization assumptions | Scope documented; method sign-off pending implementation evidence |
| Nguyễn Quỳnh Anh | Feature breakdown, paths, acceptance scenarios và revision/status register | Documented |
| Lê Bảo An | Planned pipeline, benchmark/optimizer integration và technical tests | Planned/Pending; chưa có code evidence trong repo được rà soát |
| Trần Minh Ngọc | Planned equity dataset, benchmark/source và sector/factor mapping | Planned/Pending |
| Nguyễn Ngọc Anh | User flow, input labels, output hierarchy và text wireframe | Documented; clickable/rendered artefact pending |
