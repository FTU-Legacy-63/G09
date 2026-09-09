# Week 4 — Midterm Review

Tài liệu này là evidence index cho giữa kỳ. Nó liên kết problem, product, input, logic, expected result, current progress và individual output để người review có thể kiểm tra trực tiếp từ repository.

## Part A — Project logic chain

| Thành phần | Quyết định hiện tại | Evidence |
| --- | --- | --- |
| Target user | Nhà đầu tư cá nhân đã có hiểu biết cơ bản về tài chính và đang theo dõi một danh mục nhỏ đa tài sản | [README — Week 1](../README.md#week-1--problem-direction) |
| Difficulty | Người dùng thấy chỉ số tổng nhưng chưa biết return/risk đến từ vị thế nào và một thay đổi tỷ trọng tác động ra sao | [Project Proposal](PROJECT_PROPOSAL.md) |
| Core task | Nhập holdings snapshot, kiểm tra risk/return allocation và thử một target-weight change | [Solution Structure](SOLUTION_STRUCTURE.md) |
| Core input | Symbol, quantity, market price/FX, horizon và một target weight | [Input Dictionary](INPUT_DICTIONARY.md) |
| Logic path | Validate → Calculate → Attribute → Compare → Explain | [Financial Logic](FINANCIAL_LOGIC.md) |
| One main output | Risk and Return Allocation Brief theo mã/nhóm | [Sample Input-to-Output](SAMPLE_INPUT_OUTPUT.md) |
| User action | Tự ghi nhận quyết định giữ nguyên hoặc tái phân bổ và lý do | [README — Week 2](../README.md#week-2--product-direction) |

Một câu mô tả dự án:

> Finfolio 2.0 giúp nhà đầu tư cá nhân hiểu vị thế/nhóm nào đang đóng góp return và risk, đồng thời quan sát trade-off của một thay đổi tỷ trọng trước khi tự quyết định giữ nguyên hay tái phân bổ.

## Part B — Input, financial logic và output

| Input / state | Financial meaning | Logic / process | Output | Claim boundary |
| --- | --- | --- | --- | --- |
| Symbol + quantity | Current holdings tại đầu kỳ | Resolve instrument; quantity × price × FX; normalize weight | Current allocation | Estimated value trên price/FX convention đã công bố |
| Historical close + FX | Base-currency price path | Buy-and-hold period return | Return và return contribution | Price return; chưa gồm dividend, tax, fee, slippage |
| Daily return matrix | Co-movement trong sample period | Covariance + Euler decomposition | Volatility và risk contribution | Historical static-weight estimate, không phải forecast |
| Asset/group tags | Cách nhóm vị thế | Cộng asset contributions trong từng group | Contribution theo asset class/sector/currency dimension | Các dimensions là alternative views; không cộng chồng |
| Một changed symbol + target weight | Alternative allocation do user muốn thử | Giữ target; cân các vị thế còn lại pro-rata về 100% | Current/proposed comparison | Scenario comparison, không phải recommendation |
| Một performance benchmark | Mốc so sánh do portfolio chọn | Portfolio period return − benchmark period return | Active return comparison | Không khẳng định benchmark là allocation phù hợp với user |

Đặc tả tài chính đầy đủ do teammate chuẩn bị nằm tại [FINANCIAL_LOGIC.md](FINANCIAL_LOGIC.md). Công thức sample đã kiểm tra được nằm tại [VALIDATION_AND_EARLY_TEST.md](VALIDATION_AND_EARLY_TEST.md).

### Claim boundary

Finfolio hiện hỗ trợ **calculation, contribution analysis và comparison**. Sản phẩm không được tuyên bố:

- danh mục nào là tốt nhất;
- người dùng nên mua hoặc bán tài sản nào;
- historical return/risk sẽ tiếp tục trong tương lai;
- output phù hợp với risk tolerance khi chưa có suitability logic và evidence;
- một proxy benchmark là index gốc.

## Part C — Minimum viable version

### Must include

1. Một holdings snapshot thuộc supported universe.
2. Validation symbol, quantity, price, currency, FX, dates và target-weight bound.
3. Current allocation theo asset/group.
4. Period return contribution và total-risk contribution.
5. Một concentration insight có thể trace về số liệu.
6. Một target-weight change và pro-rata rebalance.
7. Một current/proposed Risk and Return Allocation Brief.
8. Data period, assumptions và limitations hiển thị cùng output.

### Not required for the accepted MVP

- account system và chatbot;
- overall portfolio score hoặc risk-tolerance score;
- automatic buy/sell recommendation;
- transaction-history accounting;
- forecasting, Monte Carlo, VaR/Expected Shortfall;
- automatic “best portfolio” hoặc execution.

### Week 4 scope decision still open

[FINANCIAL_LOGIC.md](FINANCIAL_LOGIC.md) đề xuất thêm Brinson-Fachler, Cariño linking, active risk, Ledoit-Wolf và Markowitz. Đây là logic đã được viết và có thể review, nhưng chưa tự động trở thành accepted core MVP vì:

- benchmark source và constituent data chưa sẵn sàng;
- Markowitz đảo ngược quyết định cắt scope ở Checkpoint 2;
- phản hồi chuyên môn gần nhất nghiêng về một performance benchmark và grouped contributions đơn giản hơn Carhart/attribution nhiều tầng.

Nhóm phải ghi quyết định **Keep / Change / Simplify** trước khi implementation; không được mô tả phần chưa chốt là feature đã chạy.

## Part D — Current progress evidence

| Workstream | Current evidence | Status |
| --- | --- | --- |
| Problem direction | Problem, target user, task, Week 1 revision trong [README](../README.md) | Complete for midterm review |
| Product direction | [Project Proposal](PROJECT_PROPOSAL.md), [Solution Structure](SOLUTION_STRUCTURE.md), Checkpoint 2 revision | Complete for midterm review |
| Information readiness | [Input Dictionary](INPUT_DICTIONARY.md), [Source–Use Map](SOURCE_USE_MAP.md), [Assumptions](ASSUMPTIONS.md) | Complete for current scope |
| Sample data | Holdings, scenario, config và market observations trong [`data/`](../data/README.md) | Complete as traceable fixture |
| Expected result | [Sample Input-to-Output](SAMPLE_INPUT_OUTPUT.md) | Complete as arithmetic reference; not decision-grade |
| Financial logic | [FINANCIAL_LOGIC.md](FINANCIAL_LOGIC.md) | Teammate draft uploaded unchanged; scope review required |
| Early reconciliation | [Validation and Early Logic Test](VALIDATION_AND_EARLY_TEST.md) | Core checks specified and sample values reconciled |
| Working MVP/code | Không có implementation evidence trong repository này tại thời điểm lập file | Not yet evidenced |

### Expected-result reference

| Expected item | Result |
| --- | ---: |
| Current allocation | FPT 35.6420%; HPG 23.6598%; GLD 24.7009%; BTC 15.9973% |
| Current period return | -1.2618% |
| Current static-weight annualized volatility estimate | 21.9866% |
| Largest risk-contribution share | FPT: khoảng 45.93% |
| User change | BTC target tăng lên 20% |
| Derived proposed weights | FPT 33.9437%; HPG 22.5324%; GLD 23.5239%; BTC 20.0000% |
| Proposed period return | -0.8269% |
| Proposed static-weight volatility estimate | 22.4981% |

Expected explanation:

> Trong fixture ngắn, tăng BTC lên 20% làm period return bớt âm nhưng static-weight volatility estimate tăng. Đây là trade-off của sample trên cùng data period, không phải khuyến nghị tăng BTC.

## Part E — Individual work output và next steps

| Thành viên | Individual output có thể kiểm tra | Downstream use | Next step trước implementation review |
| --- | --- | --- | --- |
| Hoàng Khánh Linh | [FINANCIAL_LOGIC.md](FINANCIAL_LOGIC.md), assumption/claim decisions | Là source of truth cho calculation và explanation | Cùng nhóm khóa benchmark, attribution depth và việc giữ/bỏ optimization |
| Nguyễn Quỳnh Anh | [Validation and Early Logic Test](VALIDATION_AND_EARLY_TEST.md), expected-result reconciliation | Dùng kiểm tra code và sample output | Chuyển bốn reconciliation lõi thành executable tests |
| Lê Bảo An | [Data Structure and Flow](DATA_STRUCTURE_AND_FLOW.md), source adapter route | Nối input, market data và calculation engine | Tạo working thin slice với sample-data fallback |
| Trần Minh Ngọc | [Input Dictionary](INPUT_DICTIONARY.md), [Source–Use Map](SOURCE_USE_MAP.md), fixture | Cung cấp meanings, provenance và supported-universe boundary | Chốt performance-benchmark source và coverage evidence |
| Nguyễn Ngọc Anh | [Sample Input-to-Output](SAMPLE_INPUT_OUTPUT.md), one-output requirement | Thiết kế brief và before/after explanation | Tạo một màn hình result gồm result, reason, action và limitation |

## Feedback and decision record

| Nội dung phản hồi | Implication | Status |
| --- | --- | --- |
| Composite weighted benchmarks gần với policy benchmark; sản phẩm hiện phù hợp một performance benchmark hơn | Không mix nhiều benchmark trong core comparison | Awaiting team confirmation |
| Carhart quá advanced cho investor-facing monitoring; grouped tags dễ hiểu hơn | Ưu tiên contribution theo asset class/sector/currency/country/size | Awaiting team confirmation |
| Crypto có thể là một asset class riêng | Giữ crypto, đồng thời công bố calendar/alignment limitation | Accepted direction; implementation pending |

## Midterm readiness checklist

- [x] Project có thể giải thích trong một câu.
- [x] Có input → logic → output → claim-boundary table.
- [x] Có một expected result trước khi chạy implementation.
- [x] Assumptions và limitations được liên kết.
- [x] Có evidence owner theo từng member.
- [x] Current progress được tách khỏi future plan.
- [ ] Nhóm khóa performance benchmark và nguồn dữ liệu.
- [ ] Nhóm quyết định giản lược hay giữ advanced attribution/optimization.
- [ ] Có working MVP hoặc executable calculation evidence.

Trạng thái trung thực: **logic-ready for review, chưa implementation-ready cho toàn bộ phạm vi trong FINANCIAL_LOGIC.md**.
