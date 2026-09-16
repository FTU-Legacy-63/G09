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

1. Nhập danh mục gồm cổ phiếu và, nếu có, gold/silver.
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
- Input guidance: tự động viết hoa symbol, kiểm tra hậu tố `.VN`, nhãn đơn vị và lỗi ngay tại field.
- Explanation box, tooltip thuật ngữ và source/method metadata panel.
- Biểu đồ allocation, contribution và current–optimized comparison.
- Filter/sort giúp đọc contribution nhưng không tạo metric mới.
- Asset simulation chỉ là nhánh khám phá hỗ trợ; không thay thế optimized reference flow.

### Postponed / final product

- Asset class ngoài equity, gold và silver.
- Monte Carlo simulation.
- Account, cloud sync, chatbot và collaboration.
- Xuất báo cáo PDF/XLSX/DOCX.
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

1. User nhập các mã cổ phiếu, gold/silver được hỗ trợ và quantity.
2. User chọn VN-Index hoặc benchmark được hỗ trợ, analysis period và minimum-variance objective.
3. Hệ thống xác nhận mọi mã, tải/alignment dữ liệu và hiển thị allocation.
4. Hệ thống hiển thị performance, return/risk contribution và benchmark comparison.
5. Optimizer trả về reference weights thỏa long-only, per-stock và sector caps.
6. User xem current–optimized comparison, assumptions và limitations.
7. User ghi nhận giữ nguyên hoặc cân nhắc tái phân bổ cùng lý do.

### Alternative path

- User nhập trực tiếp portfolio weights thay vì quantity; validation yêu cầu tổng 100%.
- Nếu max-Sharpe chưa đủ input, hệ thống đề nghị dùng minimum variance thay vì tự giả định `r_f` hoặc expected return.
- Nếu dữ liệu phiên gần nhất chưa có do ngày nghỉ, bảo trì hoặc source delay, hệ thống dùng **latest available trading session**, hiển thị ngày dữ liệu thực tế và yêu cầu user xác nhận trước khi phân tích.
- User có thể thử thêm một mã thuộc supported equity/gold/silver universe trong nhánh asset simulation; hệ thống kiểm tra dữ liệu rồi so sánh với current portfolio. Nhánh này là supporting feature, không phải điều kiện hoàn thành core flow.
- Khi live source lỗi, nhóm có thể demo bằng fixture stocks/gold/silver đã đóng băng; đây là fallback kỹ thuật, không phải bước bắt buộc của user journey.

### Error path

- Symbol/benchmark không resolve: giữ form state, chỉ rõ mã lỗi và không dùng ticker gần giống.
- Horizon thiếu dữ liệu: nêu metric nào bị chặn và minimum policy.
- Constraints infeasible: chỉ rõ bounds/caps mâu thuẫn; không trả optimized weights giả.
- Solver thất bại hoặc weights không reconcile: không hiển thị reference allocation; current analysis vẫn được giữ nếu hợp lệ.
- Sector/factor source thiếu: ẩn đúng view phụ thuộc; không tự gán classification.

## 5. Input form và validation plan

| UI label | Field | Required | Inline validation/help |
| --- | --- | --- | --- |
| Mã tài sản | `symbol` | Có | Nhập mã cổ phiếu, gold hoặc silver thuộc supported universe |
| Nhóm tài sản | `asset_class` | Có | Equity, gold hoặc silver |
| Số lượng | `quantity` | Có nếu không nhập weight | Số lớn hơn 0 theo đơn vị tài sản; Core MVP không short |
| Tỷ trọng hiện tại | `portfolio_weight` | Có nếu không nhập quantity | Mỗi weight 0–100%; tổng 100% |
| Benchmark | `benchmark_symbol` | Có | Hiển thị tên index/proxy đầy đủ |
| Từ ngày / đến ngày | `data_start`, `data_end` | Có | Báo mức đủ dữ liệu trước khi chạy |
| Mục tiêu tối ưu hóa | `objective` | Có | Baseline: minimum variance |
| Giới hạn mỗi mã | `min_weight`, `max_weight` | Có | Kiểm tra min ≤ max và feasibility |
| Giới hạn ngành | `sector_cap` | Không/bộ mặc định công bố | Hiển thị source của sector mapping |
| Turnover tối đa | `turnover_cap` | Không | Chỉ bật khi current weights tồn tại |

Validation xảy ra ở hai lớp: inline cho schema/value và pre-run cho data coverage, benchmark alignment, covariance, constraints và solver feasibility.

Quy chuẩn hiển thị input:

- Symbol được tự động viết hoa; hậu tố `.VN` được gợi ý nhưng không tự sửa sang một instrument khác khi mapping còn mơ hồ.
- Quantity dùng đơn vị **cổ phiếu (CP)** và chỉ nhận số nguyên dương trong Core MVP.
- Ngày hiển thị theo `YYYY-MM-DD`; `data_start` phải nhỏ hơn `data_end` và `data_end` không được vượt ngày dữ liệu mới nhất.
- Mọi giá trị mặc định của objective/constraints phải nhìn thấy và có thể truy nguyên, không hard-code âm thầm.

## 6. Output explanation design

Mỗi insight theo pattern:

1. **Result:** con số nào thay đổi hoặc đang tập trung.
2. **Reason:** mã/ngành/factor nào tạo contribution.
3. **Meaning:** điều đó nói gì trong đúng horizon và method.
4. **Possible action:** người dùng có thể xem xét điều gì, không phải lệnh mua/bán.
5. **Limit:** data, estimator và assumption nào giới hạn kết luận.

Ví dụ wording:

> Reference allocation có estimated volatility thấp hơn current portfolio dưới historical covariance và constraints đang hiển thị. Thay đổi chủ yếu đến từ việc giảm concentration ở ngành X. Đây là analytical scenario trên dữ liệu quá khứ, không phải lời khuyên giao dịch hoặc bảo đảm kết quả tương lai.

### Phân cấp output

- **Overview:** CAGR (khi đủ horizon), annualized volatility và Sharpe ratio (chỉ khi có risk-free rate hợp lệ).
- **Attribution:** return contribution và risk contribution theo mã/ngành; factor view chỉ hiện khi có mapping/method đủ evidence.
- **Benchmark:** benchmark return, active return và tracking error khi đủ dữ liệu.
- **Optimization:** objective, constraints, reference weights và current–optimized deltas.
- **Advanced metrics:** Beta, Alpha, Max Drawdown, Sortino, VaR/CVaR hoặc correlation chỉ đặt trong khu vực thu gọn khi đã được chấp nhận và triển khai; chúng không được mô tả là Core MVP mặc định.

Tooltip tối thiểu giải thích CAGR, volatility, return contribution và risk contribution bằng ngôn ngữ dành cho target user. Biểu đồ phải có title, period, unit, legend và câu “Cách đọc”; không dùng màu xanh/đỏ như kết luận tốt/xấu nếu chưa có rule định lượng.

## 7. Interface/working draft

### Evidence link

- [Thư mục interface samples trên Google Drive](https://drive.google.com/drive/folders/1hozkS1c9ZpVh8XF4kX3bYpLBC7ivNcMP)
- [Finfolio Homepage Draft](https://drive.google.com/file/d/15Yc-OZBaXJLOKP5AQDLHLY3HBKkYrVwx/view)
- [Portfolio Analysis Dashboard](https://drive.google.com/file/d/1Y2k1k5Jg6PgYVMTt5PIQPloWvxSW4gXj/view)

Hai PNG trên là **interface sample/wireframe**, chưa phải bằng chứng một web demo đang chạy. Dashboard đã thể hiện navigation, total-return attribution, contribution table, biểu đồ phân bổ và khu vực metrics; homepage thể hiện hướng visual của sản phẩm.

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

### Chuẩn hóa mockup theo current MVP

| Chi tiết trong sample hiện tại | Cách dùng trong MVP |
| --- | --- |
| `Log in` / `Join now` trên homepage | Chỉ là visual placeholder; account system đang postponed |
| Copy nói về “optimal capital allocation” | Đổi thành “phương án phân bổ tham khảo theo objective và constraints đã công bố” |
| Asset simulation | Supporting path trong universe equity/gold/silver, không mở thêm asset class |
| `Weight optimization` | Giữ trong Core MVP; baseline là constrained minimum variance |
| VaR, CVaR, Sortino và placeholder metric | Không đặt trong core overview; ẩn hoặc chuyển vào advanced/future panel |
| Benchmark VN-Index | Giữ, nhưng phải nối với input/source thực và hiển thị period |
| Factor attribution | Chỉ hiển thị factor có definition, source và method; không dùng số minh họa như output thật |
| Khoảng trắng dài trong dashboard image | Không phải intended page length; implementation cần responsive layout và content-height tự nhiên |

## 8. Acceptance scenarios

| ID | Scenario | Expected result | Status |
| --- | --- | --- | --- |
| W5-T01 | Valid stocks/gold/silver holdings + benchmark + feasible constraints | Đi hết flow và tạo brief | Specified; executable test pending |
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
| Stocks/gold/silver data | Not ready | Trần Minh Ngọc | Long-window fixture + provenance; gold/silver labels rõ |
| Benchmark integration | Not ready/blocking | Trần Minh Ngọc + Lê Bảo An | Resolved series + coverage test |
| Calculation engine | Logic specified | Lê Bảo An | Executable current metrics/attribution |
| Optimizer | Logic specified | Lê Bảo An + Hoàng Khánh Linh | Solver output + feasibility tests |
| Output screen | Hai PNG interface samples trên Drive + text wireframe | Nguyễn Ngọc Anh | Cập nhật mock theo scope và tạo clickable/rendered current–optimized flow |
| Automated tests | Scenarios specified | Nguyễn Quỳnh Anh + Lê Bảo An | Test results |
| Deployment | No evidence in reviewed repo | Lê Bảo An | URL + reproducible run instructions |

Trạng thái trung thực: **feature/flow và visual draft đã có; chưa có đủ implementation evidence để gọi là working MVP**.

## 10. Repository deliverables

Theo nguyên tắc một file evidence chính cho mỗi Week, các deliverable `user-flow`, `feature-scope` và `output-explanation` được gộp thành các section trong file này thay vì tách thành ba tài liệu lặp nội dung.

| Deliverable được yêu cầu | Evidence location | Status |
| --- | --- | --- |
| Feature scope | [Feature map](#2-feature-map-gắn-với-mvp) và [Feature priority](#3-feature-priority) | Complete at specification level |
| Happy/Alternative/Error flows | [Complete user flow](#4-complete-user-flow) | Complete at specification level |
| Input labels và validation | [Input form](#5-input-form-và-validation-plan) | Complete at specification level |
| Output explanation | [Output explanation design](#6-output-explanation-design) | Complete at specification level |
| Interface draft | [Drive evidence](#evidence-link) | Available as two PNG samples |
| Source code `src/` | Chưa có trong repository evidence được rà soát | Pending |
| Working web demo | Chưa có URL chạy được | Pending |
| Test cases/results | [Acceptance scenarios](#8-acceptance-scenarios) | Cases specified; execution pending |
| Ownership | [Individual Contribution](#individual-contribution) | Owners mapped; implementation evidence pending |

## 11. Revision log

| Revision | Owner | Status |
| --- | --- | --- |
| Thu hẹp multi-asset scope xuống equity, gold và silver | Product Owner | Accepted |
| Chuyển benchmark thành essential input | Product Owner + Business Analyst | Accepted; integration pending |
| Đưa constrained optimization vào Core MVP | Product Owner + Lead Developer | Accepted; implementation pending |
| Giữ Monte Carlo ở final product | Product Owner | Accepted |
| Bỏ sample portfolio khỏi main user journey | Product Manager + UI/UX | Accepted |
| Chuyển expected output sang current–optimized comparison | Product Manager + UI/UX | Specified; UI evidence pending |
| Chuẩn hóa teammate draft: giữ gold/silver để giải quyết cross-asset pain point; asset simulation vẫn là supporting path | Product Owner + Product Manager | Accepted |
| Gắn hai interface samples từ Drive và tách visual draft khỏi working demo | UI/UX + Lead Developer | Visual evidence linked; implementation pending |

## 12. End-of-Week 5 checklist

| Checklist item | Evidence | Status |
| --- | --- | --- |
| Main và Supporting features được phân định | Sections 2–3 | Complete |
| Optional/future features được đóng băng | Section 3 | Complete |
| Happy, Alternative và Error paths | Section 4 | Complete at specification level |
| Input có label, unit và inline error rule | Section 5 | Complete at specification level |
| Output có hierarchy, benchmark context và explanation box | Section 6 | Complete at specification level |
| Có interface draft | Hai PNG trên Drive | Complete as visual draft |
| Có working interface chạy được | Chưa có deployment URL hoặc source code evidence | **Pending** |
| Ownership và evidence location được cập nhật | Sections 9–10 và contribution table | Complete for documentation; code evidence pending |
| Core logic nối với UI | Chưa có executable evidence | **Pending** |
| Acceptance tests đã chạy | Mới có test specification | **Pending** |

## Individual Contribution

| Thành viên | Output Week 5 và evidence location | Status |
| --- | --- | --- |
| Hoàng Khánh Linh | Feature-scope decision, explanation/claim boundary tại sections 3 và 6 | Documented; method sign-off pending implementation evidence |
| Nguyễn Quỳnh Anh | Happy/Alternative/Error paths, acceptance scenarios và checklist tại sections 4, 8 và 12 | Documented; test execution pending |
| Lê Bảo An | Pipeline, benchmark/optimizer integration và technical tests tại sections 8–9 | Planned/Pending; chưa có code evidence trong repo được rà soát |
| Trần Minh Ngọc | Input/output labels, fallback và planned stocks/gold/silver/benchmark data tại sections 5 và 9 | Specification documented; data evidence pending |
| Nguyễn Ngọc Anh | User flow, output hierarchy, wireframe và [hai interface samples trên Drive](#evidence-link) | Visual evidence available; clickable current–optimized flow pending |
