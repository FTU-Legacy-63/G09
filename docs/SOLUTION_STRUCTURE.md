# Finfolio 2.0 — Solution Structure

## 1. User → Input → Process → Output → User Action

```text
USER
Sinh viên tài chính / nhà đầu tư cá nhân giai đoạn đầu
    ↓
INPUT
Danh sách vị thế, số lượng hoặc giá trị, asset class và lựa chọn scenario
    ↓
PROCESS
Chuẩn hóa dữ liệu → Tính portfolio metrics → Attribution → Scenario comparison
    ↓
OUTPUT
Portfolio Attribution & Risk Report
    ↓
USER ACTION
Giữ nguyên, tái phân bổ hoặc cân nhắc phòng hộ danh mục
```

## 2. Initial required information

Đây là danh sách thông tin ban đầu ở Week 2. Ý nghĩa, nguồn và quy tắc xử lý chi tiết sẽ được xác nhận trong Week 3.

| Information | Purpose | Initial note |
|---|---|---|
| Ticker/instrument ID | Nhận diện vị thế | Cần quy tắc mapping và ticker history |
| Asset class | Nhóm attribution | Stocks, ETFs, gold, cash; index futures nếu khả thi |
| Quantity hoặc market value | Tính position value và weight | Phải thống nhất đơn vị |
| Currency | Quy đổi giá trị và return | Target currency dự kiến là VND |
| Historical adjusted prices | Tính return, volatility và covariance | Cần frequency và lookback window thống nhất |
| Benchmark/sector classification | So sánh và giải thích exposure | Nguồn dữ liệu cần được kiểm chứng |
| Risk parameters | Tính VaR/Expected Shortfall | Horizon và confidence level phải được công bố |
| Scenario definition | Tính tác động giả định | Shock, affected assets và assumptions phải rõ |

## 3. Core process type

Core process gồm bốn loại logic liên kết:

1. **Calculate:** position value, portfolio weight, historical return, volatility, VaR và Expected Shortfall.
2. **Attribute:** phân rã return contribution và risk contribution theo vị thế/asset class.
3. **Compare or simulate:** tính lại kết quả theo predefined scenario hoặc một thay đổi tỷ trọng.
4. **Explain:** chuyển kết quả thành insight có thể truy nguyên về input, công thức và assumptions.

## 4. Backward design from the main output

| Visible result | Logic required | Minimum input | Component |
|---|---|---|---|
| Position X chiếm A% giá trị nhưng đóng góp B% portfolio risk | Weight, covariance và component risk contribution | Position value, historical returns, asset classification | Attribution engine + contribution chart |
| Asset class Y tạo ra C% historical return | Asset-level return contribution và aggregation | Weights, returns, asset class | Performance engine + attribution table |
| Portfolio có VaR/Expected Shortfall bằng D | Portfolio return distribution và risk calculation | Return series, horizon, confidence level | Risk engine + metric cards |
| Nếu thay đổi tỷ trọng, risk metric đổi từ D sang E | Reweight và recompute | Current weights + proposed weights | What-if control + comparison view |
| Trong scenario S, portfolio thay đổi F% | Apply shocks theo specification | Scenario shocks + exposures | Scenario engine + impact chart |

## 5. MVP flow

Một MVP hoàn chỉnh phải cho phép người dùng đi qua một luồng từ đầu đến cuối:

1. Chọn sample portfolio hoặc nhập một danh mục nhỏ.
2. Hệ thống kiểm tra và chuẩn hóa input.
3. Hệ thống tính portfolio value, allocation và historical risk/return.
4. Hệ thống phân rã return contribution và risk contribution.
5. Người dùng chọn một predefined scenario hoặc thay đổi một tỷ trọng.
6. Hệ thống tính lại và hiển thị so sánh before/after.
7. Người dùng đọc insight và đưa ra quyết định.

Tiêu chí hoàn thành MVP là **một flow chạy được, giải thích được và kiểm thử được**, không phải số lượng màn hình hoặc số lượng feature.

## 6. Scope

### Target scope

- Nhập hoặc chọn sample portfolio.
- Bốn asset classes lõi: stocks, ETFs, gold và cash.
- Portfolio value và allocation.
- Historical return, volatility, VaR và Expected Shortfall.
- Return attribution và risk attribution theo vị thế/asset class.
- Một đến hai predefined stress scenarios.
- Một what-if flow thay đổi tỷ trọng và so sánh before/after.
- Monte Carlo distribution nếu core metrics và attribution đã được kiểm chứng.

### Fallback scope

Nếu target scope không khả thi trong thời gian còn lại:

- dùng static historical CSV thay vì live market-data API;
- dùng sample portfolio cố định thay vì input hoàn toàn tự do;
- giới hạn ở stocks, ETFs và gold;
- giữ historical metrics, return/risk attribution và một predefined scenario;
- hoãn Monte Carlo và index futures nếu chưa thể giải thích hoặc kiểm thử đáng tin cậy.

Fallback vẫn phải giữ nguyên core value: giải thích nguồn đóng góp và hỗ trợ một quyết định phân bổ.

### Out of scope for this stage

- đăng nhập và quản lý nhiều tài khoản người dùng;
- kết nối tài khoản môi giới hoặc đặt lệnh thật;
- lưu trữ nhiều danh mục trên cloud;
- tư vấn đầu tư tự động hoặc “best portfolio recommendation”;
- machine-learning price forecasting;
- mở rộng thêm commodity ngoài gold;
- tối ưu hóa danh mục nâng cao;
- dữ liệu intraday hoặc hệ thống giao dịch thời gian thực.

## 7. Initial route hypothesis

### Proposed route

**Code-based dashboard với analytics backend**, bao gồm:

- frontend nhận portfolio/scenario input và trình bày report;
- backend xử lý dữ liệu và chạy các phép tính portfolio analytics;
- historical dataset đã làm sạch làm nguồn dữ liệu kiểm thử chính;
- market-data API chỉ được tích hợp sau khi static-data flow chạy ổn định;
- test portfolios và hand-calculated cases để đối chiếu các phép tính cốt lõi.

### Why this route

- Dashboard phù hợp với output gồm nhiều thành phần liên kết.
- Backend tách financial logic khỏi presentation logic, giúp kiểm thử và giải thích dễ hơn.
- Static dataset giảm dependency trong giai đoạn đầu.
- Route này có đường fallback rõ mà không làm mất core output.

Initial route là giả thuyết ở Week 2, chưa phải quyết định framework hoặc library cuối cùng.

## 8. Component and dependency map

```text
Data specification ───────────────┐
                                  ↓
Historical dataset → Analytics engine → Report schema → Dashboard UI
                         ↑                ↓
Formula specification ──┘          Test cases / QA
                         ↑
Scenario specification ─┘
```

- Dataset phải tuân theo data specification.
- Analytics engine phải dùng formula và scenario specification đã thống nhất.
- UI phải hiển thị dữ liệu thật theo report schema, không chỉ mockup tách rời.
- Test cases kiểm tra cả công thức lẫn kết quả hiển thị.

## 9. Responsibility by output

| Owner | Responsibility | Visible output | Consumer/dependency |
|---|---|---|---|
| Hoàng Khánh Linh | Financial logic và scope | Formula/assumption specification cho attribution, risk và scenario | Developer, PM, report explanation |
| Nguyễn Quỳnh Anh | Product coordination và QA | Test portfolio, hand-calculated cases, acceptance checklist | Developer, Product Owner, demo |
| Lê Bảo An | Integration và implementation | Analytics modules, API/data adapter, runnable web flow | Toàn bộ MVP |
| Trần Minh Ngọc | Information readiness | Clean dataset, data dictionary, source/limitation note | Analytics engine, tests |
| Nguyễn Ngọc Anh | Output and interface design | User flow, report schema, Figma screens/components | Frontend implementation, user review |

### Shared integration rule

Các workstream phải gặp nhau tại một shared specification gồm:

- portfolio input schema;
- formula and assumption definitions;
- report output schema;
- test portfolio và expected results;
- scenario definition.

Developer không phải là người tự kết nối các output rời rạc vào cuối dự án; mỗi owner phải kiểm tra output của mình trong luồng chung.

## 10. Definition of done for Week 2

- [x] Product form và product value được nêu rõ.
- [x] Main output là một kết quả cụ thể, không chỉ là “dashboard”.
- [x] Có conceptual solution chain từ user task đến user action.
- [x] Initial required information và core process được nhìn thấy.
- [x] Có một MVP flow hoàn chỉnh.
- [x] Target, fallback và out-of-scope được phân biệt.
- [x] Initial route hypothesis có lý do và fallback.
- [x] Mỗi workstream có owner, visible output và dependency.
- [ ] Feedback và revision sau Checkpoint 2 được cập nhật trong README.
