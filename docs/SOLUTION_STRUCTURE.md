# Finfolio 2.0 — Solution Structure

## 1. MVP selection rule

Mỗi component phải vượt qua ba câu hỏi:

1. Component này có cần để hoàn thành core task không?
2. Component này có tạo hoặc giải thích Risk and Return Allocation Brief không?
3. Component này có acceptance test cụ thể không?

Nếu câu trả lời là không, component đó không thuộc core MVP.

## 2. Product reasoning chain

```text
TARGET USER
Nhà đầu tư cá nhân có hiểu biết tài chính cơ bản và sở hữu nhiều loại tài sản
    ↓
CORE TASK
Điền danh mục, kiểm tra risk/return allocation và thử một thay đổi tỷ trọng
    ↓
ESSENTIAL INPUT
Asset/group + identifier + transaction + quantity + currency + proposed weights
    ↓
LOGIC PATH
Validate → Calculate → Attribute → Compare → Explain
    ↓
ONE MEANINGFUL OUTPUT
Risk and Return Allocation Brief theo từng mã/nhóm
    ↓
USER ACTION
Ghi nhận quyết định giữ nguyên hoặc tái phân bổ và lý do
```

## 3. Input schema

| Field | Type/example | Validation |
|---|---|---|
| `asset_group` | Equity, ETF, Gold proxy, Crypto | Thuộc supported classification |
| `symbol` | `HOSE:FPT`, `HNX:PVI`, `BTC-USD` | Map duy nhất tới instrument và exchange |
| `trade_side` | Buy hoặc Sell | Chỉ nhận enum được hỗ trợ |
| `trade_price` | Positive decimal | Lớn hơn 0 và cùng price convention |
| `trade_time` | ISO date/time | Không nằm ngoài supported data period |
| `quantity` | Positive decimal | Net quantity của vị thế không âm |
| `currency` | VND, USD | Có base-currency hoặc FX conversion rule |
| `proposed_weight` | Percentage | Nằm trong lower/upper bound |

MVP có thể nhận sample portfolio thay cho manual input. Dữ liệu không tương thích về frequency, currency hoặc calendar phải bị từ chối hoặc được xử lý theo rule công bố, không được âm thầm ghép.

## 4. Core logic path

### 4.1 Validate

- Xác nhận identifier và asset group.
- Kiểm tra giá, quantity, transaction chronology và currency.
- Kiểm tra historical series có cùng frequency và đủ common dates.
- Kiểm tra proposed-weight bounds và tổng weight.

### 4.2 Calculate

- Position value theo base currency:

```text
position_value_i = quantity_i × current_price_i × fx_rate_i
```

- Current portfolio weight:

```text
weight_i = position_value_i / total_portfolio_value
```

- Portfolio return series dùng cùng daily observations và weight convention được công bố.
- CAGR được tính từ compounded value series và độ dài data period.
- Annualized volatility dùng độ lệch chuẩn daily return nhân `sqrt(252)` đối với daily trading data.

### 4.3 Attribute

- Return contribution dùng period return contribution để tổng có thể đối chiếu với portfolio period return.
- Portfolio CAGR được trình bày riêng; không cộng individual CAGR để tạo portfolio CAGR.
- Volatility contribution dùng covariance/Euler decomposition:

```text
portfolio_volatility = sqrt(w'Σw)
marginal_risk_i = (Σw)_i / portfolio_volatility
risk_contribution_i = weight_i × marginal_risk_i
```

Trong sai số số học cho phép, tổng risk contribution phải bằng portfolio volatility.

### 4.4 Compare

- Người dùng thay đổi proposed weight của một vị thế.
- Các vị thế không khóa được cân bằng theo một rule duy nhất đã công bố, mặc định là pro-rata.
- Current và alternative state dùng cùng historical series, horizon, base currency và assumptions.

### 4.5 Explain

- Chỉ ra vị thế/nhóm có contribution lớn nhất.
- So sánh contribution với allocation để phát hiện concentration không tương xứng.
- Tạo một before/after statement dựa trên số đã tính.
- Hiển thị data period, method, currency, assumptions và limitations.

## 5. Main output specification

Risk and Return Allocation Brief là một output duy nhất gồm các phần liên kết:

| User question | Visible result | Acceptance criterion |
|---|---|---|
| Danh mục được phân bổ thế nào? | Current allocation theo mã/nhóm | Tổng weight bằng `100% ± tolerance` |
| Kết quả và biến động của từng tài sản ra sao? | CAGR và annualized volatility | Cùng period, frequency và currency convention |
| Return đến từ đâu? | Return contribution | Tổng contribution khớp portfolio period return trong tolerance |
| Risk tập trung ở đâu? | Volatility contribution + concentration insight | Tổng contribution khớp portfolio volatility trong tolerance |
| Một thay đổi tỷ trọng có tác động gì? | Before/after allocation, CAGR và volatility | Chỉ weights thay đổi; data và assumptions được giữ cố định |
| Tôi có thể tin output đến đâu? | Evidence, assumptions và limitations | Method và data period nhìn thấy trực tiếp trong brief |

### Output decision rule

Brief không tự động kết luận “nên mua” hoặc “nên bán”. Người dùng tự chọn **giữ nguyên** hoặc **tái phân bổ** và ghi lý do dựa trên evidence.

## 6. Complete user flow

1. Chọn sample portfolio hoặc nhập một danh mục nhỏ thuộc supported universe.
2. Validate input; lỗi được trả về tại đúng field hoặc data series liên quan.
3. Hiển thị current allocation.
4. Tính CAGR, volatility, return contribution và volatility contribution.
5. Chỉ ra concentration đáng chú ý.
6. Người dùng thay đổi một proposed weight; hệ thống cân bằng theo rule công bố.
7. Tạo before/after comparison với cùng data period và assumptions.
8. Hiển thị Risk and Return Allocation Brief.
9. Người dùng ghi nhận quyết định và lý do.

MVP hoàn thành khi một người dùng đi hết flow này từ input đến decision record.

## 7. Scope

### Core MVP

- Một target user segment.
- Một portfolio nhỏ, một current state và một alternative state.
- Instrument universe giới hạn theo data readiness.
- Daily historical series và một base currency.
- Current allocation theo mã/nhóm.
- CAGR và annualized volatility.
- Return contribution và volatility contribution.
- Một concentration insight.
- Một proposed-weight change với pro-rata rebalance.
- Evidence, assumptions và limitations.

### Fallback scope

- Một sample portfolio cố định.
- Static historical CSV đã làm sạch.
- Một số ít instruments thuộc nhiều asset groups nhưng có compatible data.
- Một predetermined proposed-weight change.
- Report/prototype đơn giản hiển thị cùng main output.

Fallback loại bỏ live API và flexible input, nhưng không thay đổi target user, core task, logic path hoặc output.

### Out of core MVP

- Overall score hoặc ranking danh mục.
- User-defined scoring weights và risk-tolerance questionnaire.
- Account, authentication và cloud storage.
- Chatbot và AI investment recommendation.
- Portfolio optimization và automatic “best weights”.
- VaR/Expected Shortfall, Monte Carlo và stress testing.
- Forecasting, real-time data, brokerage integration và order execution.
- Các dashboard hoặc biểu đồ không phục vụ brief.

## 8. Why overall score is excluded

Một overall score cần:

- bộ tiêu chí được kiểm chứng;
- scale và normalization;
- trọng số có căn cứ;
- quan hệ rõ với risk tolerance;
- validation chứng minh score giúp người dùng quyết định tốt hơn.

Các yếu tố này chưa có evidence trong Week 2. Vì vậy MVP giữ các metric và contribution có thể truy nguyên thay vì gộp chúng thành một điểm có vẻ chính xác nhưng chưa được bảo vệ bằng logic.

## 9. Technical route and fallback

### Initial route

Một small code-based analytics flow với report/dashboard interface tối giản:

- calculation layer tách khỏi presentation layer;
- data-provider adapter tách khỏi financial logic;
- static dataset trước, live API sau;
- test portfolio và hand-calculated expected results;
- UI chỉ hiển thị những phần của Risk and Return Allocation Brief.

### Data fallback

Sample portfolio và static CSV là fallback chính thức. API outage không được làm mất khả năng demo complete flow.

## 10. Responsibility by output

| Owner | Responsibility | Expected output | Evidence location (planned) | Next action |
|---|---|---|---|---|
| Hoàng Khánh Linh | Financial logic và assumptions | Formula specification cho CAGR, volatility và contribution | `docs/FINANCIAL_LOGIC.md` | Chốt formula, annualization và tolerance |
| Nguyễn Quỳnh Anh | Product coordination và QA | Test portfolio, hand-calculated cases và acceptance checklist | `docs/TEST_PLAN.md`, `tests/` | Tạo expected results cho current/alternative states |
| Lê Bảo An | Integration và implementation | Validate → Calculate → Attribute → Compare → Explain pipeline | `src/`, deployment link | Tách data adapter khỏi calculation engine |
| Trần Minh Ngọc | Information readiness | Dataset, data dictionary, FX/data compatibility rules | `data/`, `data/README.md` | Chốt supported universe và static fallback |
| Nguyễn Ngọc Anh | Output/interface design | User flow và Risk and Return Allocation Brief layout | `docs/DESIGN.md`, Figma link | Thiết kế một complete flow với sample results |

Planned path chỉ trở thành evidence khi file hoặc link thực sự tồn tại trong repository.

## 11. Scope and quality guardrails

- Một target user, một core task và một output chính.
- Không dùng overall score trong core MVP.
- Không cộng individual CAGR để suy ra portfolio CAGR.
- Current và alternative state phải dùng cùng data và assumptions.
- Mỗi input field phải phục vụ một calculation hoặc output cụ thể.
- Không thêm feature khi core flow chưa chạy và chưa có acceptance test.
- Dashboard là cách trình bày, không phải output.
- Kết quả không được mô tả như investment advice.

## 12. Definition of done for Week 2

- [x] Target user chỉ còn một segment cụ thể.
- [x] Core task được mô tả bằng hành động của user.
- [x] Essential input được suy ngược từ calculation và output.
- [x] Logic path chính có năm bước rõ ràng.
- [x] Một meaningful output duy nhất được chọn.
- [x] Complete user flow đi từ input tới decision record.
- [x] CAGR, volatility và contribution conventions được phân biệt.
- [x] Core, fallback và out-of-scope được khóa.
- [x] Feedback Checkpoint 2 đã dẫn tới một revision có thể kiểm tra.
