# Finfolio 2.0 — Solution Structure

## 1. Component selection rule

Mọi component phải vượt qua hai câu hỏi:

1. Component này giải quyết difficulty hoặc hỗ trợ user task nào?
2. Nếu bỏ component này, người dùng còn hoàn thành được core task không?

Nếu không truy ngược được về problem hoặc core task, component đó là supporting, conditional hoặc out of scope.

## 2. Product reasoning chain

```text
PROBLEM
Không biết return/risk tập trung ở đâu và một thay đổi tỷ trọng tạo ra tác động gì
    ↓
USER TASK
Đánh giá current portfolio và một reallocation alternative
    ↓
DESIRED OUTCOME
Đưa ra quyết định giữ nguyên hoặc điều chỉnh có thể giải thích
    ↓
MAIN OUTPUT
Portfolio Decision Brief
    ↓
PROCESS NEEDED
Calculate → Attribute → Compare → Explain
    ↓
INPUT NEEDED
Holdings + compatible historical data + proposed weights
    ↓
PATTERN / ROUTE
Dashboard hoặc prototype đơn giản đủ để review complete flow
```

## 3. User → Input → Process → Output → User Action

```text
USER
Nhà đầu tư cá nhân đang tự theo dõi một danh mục nhỏ gồm nhiều vị thế nhưng chưa sử dụng hệ thống portfolio analytics chuyên nghiệp
    ↓
INPUT
Current holdings và một proposed weight change
    ↓
PROCESS
Validate → Calculate → Attribute → Compare → Explain
    ↓
OUTPUT
Portfolio Decision Brief cho current và alternative portfolio
    ↓
USER ACTION
Giữ nguyên hoặc tái phân bổ, kèm lý do và limitations
```

## 4. Main output specification

Portfolio Decision Brief phải trả lời được:

| User question | Visible result | Acceptance idea |
|---|---|---|
| Danh mục hiện được phân bổ thế nào? | Allocation theo vị thế/nhóm | Tổng weight bằng 100% và truy nguyên được về holdings |
| Return đến từ đâu? | Return contribution | Tổng contribution khớp portfolio return trong sai số cho phép |
| Risk tập trung ở đâu? | Risk contribution + concentration insight | Tổng contribution khớp portfolio risk theo phương pháp đã công bố |
| Một thay đổi tỷ trọng có tác động gì? | Before/after comparison | Cùng dữ liệu, horizon và assumptions cho hai trạng thái |
| Tôi nên diễn giải kết quả trong giới hạn nào? | Assumptions and limitations | Người dùng nhìn thấy period, method và cảnh báo không phải investment advice |

## 5. Initial required information

Đây là initial information inferred từ output. Week 3 sẽ xác định meaning, source và rule chi tiết.

| Information | Why the output needs it | Week 3 question |
|---|---|---|
| Instrument identifier | Liên kết holdings với dữ liệu lịch sử | Ticker mapping được quản lý thế nào? |
| Quantity hoặc current value | Tính position value và allocation | Input nào dễ hiểu và ít lỗi nhất? |
| Asset/group label | Tổng hợp contribution và concentration | Classification source nào đáng tin cậy? |
| Compatible historical price series | Tính return, covariance và contribution | Frequency, lookback, currency và missing-data rule là gì? |
| Proposed weights | Tạo alternative portfolio | Ràng buộc tổng weight và cash handling ra sao? |
| Method assumptions | Giải thích và tái tạo kết quả | Convention và tolerance nào được dùng? |

Không thu thập dữ liệu chỉ vì “có thể hữu ích”; mỗi trường phải phục vụ một phần của Decision Brief.

## 6. Core process

1. **Validate:** kiểm tra identifier, value/quantity, tổng weight và data compatibility.
2. **Calculate:** tính position value, portfolio weight, return và một risk measure cơ sở.
3. **Attribute:** phân rã return contribution và risk contribution theo vị thế/nhóm.
4. **Compare:** áp dụng một proposed weight change và tính lại cùng bộ chỉ số.
5. **Explain:** tạo concentration insight, before/after statement, assumptions và limitations.

Core process không cần Monte Carlo để hoàn thành. Một kỹ thuật phân tích chỉ được thêm khi nó cải thiện main output và có acceptance test.

## 7. MVP flow

1. Người dùng chọn sample portfolio hoặc nhập một danh mục nhỏ thuộc instrument universe được hỗ trợ.
2. Hệ thống xác thực input và hiển thị current allocation.
3. Hệ thống tính return/risk contribution và chỉ ra concentration đáng chú ý.
4. Người dùng thay đổi tỷ trọng của một vị thế; hệ thống cân bằng theo rule được công bố.
5. Hệ thống tạo before/after comparison với cùng data period và assumptions.
6. Decision Brief hiển thị evidence, assumptions và limitations.
7. Người dùng ghi nhận quyết định giữ nguyên hoặc tái phân bổ và lý do.

MVP hoàn thành khi flow này chạy được, giải thích được và kiểm thử được từ input đến output.

## 8. Scope

### Target scope — Core MVP

- Một current portfolio nhỏ và một reallocation alternative.
- Instrument universe giới hạn theo data readiness của Week 3.
- Allocation theo vị thế/nhóm.
- Historical return và một risk measure cơ sở được công bố.
- Return contribution và risk contribution.
- Concentration insight.
- Before/after comparison.
- Assumptions, limitations và test portfolio.

### Target extension

Chỉ bổ sung sau khi core flow đã được kiểm thử:

- input portfolio linh hoạt hơn;
- thêm một downside-risk metric như VaR hoặc Expected Shortfall nếu nhà đầu tư cá nhân mục tiêu cần;
- một predefined stress scenario nếu có scenario specification defensible;
- thêm asset classes có dữ liệu tương thích.

### Fallback scope

- Một sample portfolio cố định.
- Static historical CSV đã làm sạch.
- Một số ít vị thế có cùng currency/frequency.
- Allocation, return/risk contribution, concentration và một predetermined reallocation comparison.
- Report/prototype đơn giản thay vì full dashboard.

Fallback vẫn giữ nguyên problem, user task và main output.

### Out of core scope

- Monte Carlo simulation;
- index futures và hedge execution;
- portfolio optimization hoặc “best portfolio recommendation”;
- live brokerage integration và đặt lệnh;
- machine-learning forecasting;
- đăng nhập, cloud portfolio storage và multi-user management;
- intraday/real-time trading data;
- mở rộng commodity ngoài gold.

## 9. Initial route hypothesis

### Route selection rule

Route phải chứng minh Portfolio Decision Brief nhanh, minh bạch và kiểm thử được nhất.

### Initial route

Một **small code-based analytics flow với dashboard/report interface**:

- static dataset trước, live API sau;
- calculation layer tách khỏi presentation layer;
- test portfolio và hand-calculated expected results;
- interface chỉ hiển thị các trường thuộc Decision Brief.

### Fallback route

Notebook/spreadsheet logic proof kết hợp một report hoặc prototype interface. Fallback không được thay đổi user task hoặc giả vờ rằng mockup là working calculation.

### Why the route follows the problem

- Attribution cần calculation có thể tái tạo.
- Before/after cần cùng logic áp dụng cho hai states.
- Decision Brief cần nhiều kết quả liên kết nhưng không bắt buộc một full-feature platform.
- Static data giảm dependency mà không làm mất product value.

## 10. Responsibility by output

| Owner | Responsibility | Expected output | Evidence location (planned) | Dependency | Next action |
|---|---|---|---|---|---|
| Hoàng Khánh Linh | Xác định financial logic, assumptions và giới hạn diễn giải | Formula/assumption specification cho return/risk contribution và comparison | `docs/FINANCIAL_LOGIC.md` | Data definition, Developer, PM | Chốt metric, assumptions và cách diễn giải sau data-readiness review |
| Nguyễn Quỳnh Anh | Product coordination và QA | Test portfolio, hand-calculated cases, acceptance checklist | `docs/TEST_PLAN.md`, `tests/` | Financial logic, input schema, Developer | Tạo test portfolio và expected results cho core flow |
| Lê Bảo An | Integration và implementation | Calculation modules, data adapter và complete runnable flow | `src/`, deployment link trong README | Financial logic, dataset, output schema | Dựng pipeline Validate → Calculate → Attribute → Compare → Explain |
| Trần Minh Ngọc | Information readiness | Dataset, data dictionary, source/limitation note | `data/`, `data/README.md` | Instrument universe, financial assumptions | Xác minh nguồn, frequency, currency và missing-data rules |
| Nguyễn Ngọc Anh | Output/interface design | User flow, Decision Brief schema, Figma screens/components | `docs/DESIGN.md`, Figma link trong README | Main output specification, sample results | Thiết kế wireframe bằng sample results của Decision Brief |

Các đường dẫn trên là **vị trí evidence dự kiến**, chưa được xem là evidence hoàn thành cho đến khi file hoặc link thực sự xuất hiện trong repository.

### Shared specification

Các workstream gặp nhau tại:

- problem/task statement;
- portfolio input schema;
- formula and assumption definitions;
- Decision Brief output schema;
- test portfolio và expected results;
- reallocation comparison rule.

## 11. Scope and quality guardrails

- Mỗi feature phải hỗ trợ một phần rõ ràng của user task hoặc main output.
- Dashboard là product pattern; Portfolio Decision Brief là main output.
- Process phải mô tả rõ calculate, attribute, compare và explain.
- Chỉ mở rộng asset classes sau data-readiness check.
- Monte Carlo, stress test, VaR/ES hoặc futures chỉ được bổ sung khi có user need và acceptance test.
- Product value được đánh giá bằng complete flow và khả năng giải thích, không phải số lượng màn hình hoặc metric.

## 12. Definition of done for Week 2

- [x] Problem direction được kế thừa rõ từ Week 1.
- [x] User task đứng trước product form.
- [x] Desired outcome mô tả khả năng của user, không mô tả feature.
- [x] Main output là Portfolio Decision Brief, không phải dashboard.
- [x] Process và input được suy ngược từ output.
- [x] Product pattern/route được chọn sau output.
- [x] Core, target extension, fallback và out-of-scope được phân biệt.
- [x] Mỗi core component truy ngược được về problem/task.
- [x] Responsibility được phân chia theo visible output và dependency.
- [ ] Feedback và revision sau Checkpoint 2 được cập nhật trong README.
