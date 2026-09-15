# Week 2 — Product Direction & MVP

## 1. Mục tiêu của Week 2

Week 2 chuyển problem statement thành phiên bản nhỏ nhất vẫn giúp người dùng hoàn thành một quyết định có ý nghĩa. Finfolio không cố tạo thật nhiều dashboard; sản phẩm phải nối được input, logic, output và hành động của người dùng trong một flow.

## 2. Product reasoning chain

```text
Nhà đầu tư cá nhân có danh mục cổ phiếu
        ↓
Muốn biết return/risk tập trung ở đâu và performance khác benchmark ra sao
        ↓
Nhập holdings + benchmark + horizon + constraints
        ↓
Validate → Analyze current → Attribute → Compare benchmark → Optimize → Explain
        ↓
Risk and Return Allocation Brief: current so với optimized reference
        ↓
Người dùng tự quyết định giữ nguyên hoặc cân nhắc tái phân bổ
```

## 3. MVP definition

| Câu hỏi | Quyết định của Finfolio 2.0 |
| --- | --- |
| Target user | Nhà đầu tư cá nhân đã có kiến thức cơ bản về tài chính và đầu tư |
| Core need | Hiểu performance và risk của danh mục cổ phiếu trước khi tự cân nhắc tái phân bổ |
| Core input | Holdings, dữ liệu giá, benchmark, ngành/factor, horizon và constraints tối ưu hóa |
| Core logic | Kiểm tra dữ liệu → phân tích current portfolio → attribution → benchmark comparison → constrained optimization → current–optimized comparison → explanation |
| Main output | **Risk and Return Allocation Brief** có một phương án phân bổ tham khảo |
| Must include | Current allocation; security/sector/factor contribution; risk concentration; benchmark comparison; optimized reference allocation; assumptions và limitations |
| Chưa thuộc Core MVP | Multi-asset, Monte Carlo, tài khoản, chatbot, execution và lời khuyên mua/bán tự động |

## 4. Essential input

| Input | Ý nghĩa và output sử dụng | Rule chính |
| --- | --- | --- |
| `symbol` + `exchange` | Nhận diện từng cổ phiếu; nối holdings với price, sector và factor | Phải map duy nhất vào supported universe |
| `quantity` hoặc `portfolio_weight` | Tạo current allocation | Số dương; nếu nhập weight thì tổng bằng 100% trong tolerance |
| Historical prices | Tính return, volatility, covariance và contribution | Cùng frequency, đủ horizon, không có giá không dương |
| `benchmark_symbol` | Tính performance tương đối và active return/risk | Bắt buộc; cùng horizon và price convention |
| Sector/industry classification | Tổng hợp return/risk theo ngành | Có source và effective date; không tự gán không căn cứ |
| Factor data/exposure | Giải thích exposure theo factor đã công bố | Chỉ hiển thị factor đủ dữ liệu và có phương pháp rõ |
| Analysis horizon | Khóa cửa sổ dùng chung cho mọi metric | `start < end`; đạt policy tối thiểu của metric |
| Optimization objective | Ví dụ minimum variance hoặc max Sharpe | Người dùng chọn từ objective được hỗ trợ |
| Constraints | Long-only, tổng weight, min/max từng mã/ngành, turnover nếu có | Hiển thị cùng optimized result; không hard-code âm thầm |
| Risk-free rate | Chỉ cần cho max Sharpe | Có source, date và cùng đơn vị annualized |

Mỗi input phải phục vụ một phép tính hoặc phần output. Sample portfolio chỉ là fixture kiểm thử/fallback khi demo; user journey chính bắt đầu bằng danh mục của người dùng.

## 5. Logic và output chính

Risk and Return Allocation Brief là một output thống nhất, trả lời trực tiếp:

| Câu hỏi của người dùng | Kết quả hiển thị | Acceptance idea |
| --- | --- | --- |
| Return tập trung ở mã nào? | Return contribution theo cổ phiếu | Tổng contribution reconcile với portfolio return |
| Return tập trung ở ngành nào? | Contribution cộng gộp theo sector | Tổng sector contribution bằng tổng security contribution |
| Performance liên quan factor/exposure nào? | Exposure hoặc grouped contribution theo factor được hỗ trợ | Nêu source, method và không cộng chồng các chiều phân tích |
| Risk tập trung ở đâu? | Volatility và Euler risk contribution theo mã/ngành | Tổng risk contribution bằng portfolio volatility |
| Danh mục hoạt động thế nào so với benchmark? | Portfolio return, benchmark return, active return và tracking error khi đủ dữ liệu | Cùng horizon, frequency và price convention |
| Optimization thay đổi allocation ra sao? | Objective, constraints và optimized reference weights | Tổng weight bằng 100%; thỏa mọi constraints |
| Current và optimized khác nhau thế nào? | So sánh weight, expected return, volatility và metric phù hợp | Cùng input estimates, horizon và assumptions |

Kết quả optimization là **analytical scenario/reference allocation**. Finfolio không gọi đây là “best portfolio”, không tự áp dụng tỷ trọng và không tạo lệnh mua/bán.

## 6. Complete user flow

1. Người dùng nhập danh mục cổ phiếu hiện tại bằng symbol và quantity hoặc weight.
2. Người dùng chọn benchmark, analysis horizon, optimization objective và constraints được hỗ trợ.
3. Hệ thống kiểm tra identifier, weight/quantity, dữ liệu giá, benchmark, classification và mức đủ dữ liệu.
4. Hệ thống hiển thị current allocation và performance hiện tại.
5. Hệ thống phân rã return contribution theo mã, sector và factor/exposure phù hợp.
6. Hệ thống tính volatility, risk contribution và concentration insight.
7. Hệ thống so sánh portfolio với benchmark trên cùng kỳ.
8. Hệ thống chạy constrained portfolio optimization để tạo reference allocation.
9. Hệ thống so sánh current portfolio với optimized portfolio bằng cùng estimates và assumptions.
10. Brief trình bày result, reason, meaning, possible action, assumptions và limitations.
11. Người dùng tự ghi nhận quyết định giữ nguyên hoặc cân nhắc tái phân bổ; sản phẩm không tự giao dịch.

## 7. Phạm vi Core MVP và final product

### Core MVP

Core MVP là trải nghiệm end-to-end cho **một danh mục chỉ gồm cổ phiếu**. Người dùng cung cấp holdings và benchmark; hệ thống phân tích current allocation/performance, security–sector–factor contribution, risk concentration và benchmark-relative result; sau đó tạo một optimized reference allocation có objective/constraints minh bạch và so sánh với current portfolio. Toàn bộ output nằm trong một brief có giải thích và giới hạn.

### Final product / future extension

- Mở rộng sang ETF, commodity, trái phiếu, crypto và các asset class khác.
- Monte Carlo simulation và các phân tích scenario nâng cao.
- Account/cloud storage, collaboration và lịch sử danh mục.
- Dữ liệu real-time, broker integration và order execution nếu có cơ sở pháp lý/kỹ thuật.
- Suitability hoặc personalization chỉ khi có evidence và phương pháp được chấp nhận.

## 8. Scope guardrails

- Core MVP chỉ equity; dữ liệu multi-asset cũ không chứng minh current MVP.
- Benchmark là input bắt buộc, không phải contextual/deferred.
- Optimization là Core MVP nhưng phải có constraints, data-sufficiency check và nhãn tham khảo.
- Monte Carlo không thuộc Core MVP.
- Không cộng individual CAGR để suy ra portfolio CAGR.
- Các chiều sector/factor là các cách nhìn của cùng contribution; không cộng chúng với nhau để tạo tổng mới.
- Current và optimized phải dùng chung dữ liệu, horizon, estimator và assumptions.

## 9. Checkpoint revision record

| Mốc | Quyết định trước | Revision hiện tại | Lý do |
| --- | --- | --- | --- |
| Sau Checkpoint 2 | Bỏ overall score; optimization từng được đưa ra ngoài MVP để cắt scope | Giữ bỏ overall score; đưa constrained optimization vào Core MVP và thu hẹp asset universe xuống equity | Một objective rõ và reference allocation tạo hành động cụ thể, trong khi equity-only giúp giữ flow khả thi |
| Benchmark | Từng được xem là optional/deferred | Trở thành essential input | Performance và attribution cần mốc so sánh nhất quán |
| Sample portfolio | Từng xuất hiện như bước đầu user flow | Chỉ là test fixture/fallback | Hành trình chính phải bắt đầu từ danh mục của user |

## 10. Evidence/output của Week 2

- Một target user, core task và output chính.
- Essential inputs map trực tiếp tới calculation/output.
- Complete user flow có benchmark và optimization.
- Boundary rõ giữa Core MVP và final product.
- Claim boundary cho optimized reference allocation.

## Individual Contribution

| Thành viên | Output Week 2 | Trạng thái |
| --- | --- | --- |
| Hoàng Khánh Linh | Product scope, financial reasoning, benchmark/optimization boundary | Documented; phương pháp chi tiết được kiểm tra tiếp ở Week 4 |
| Nguyễn Quỳnh Anh | Requirement breakdown, acceptance ideas và checkpoint revision | Documented |
| Lê Bảo An | Technical route và pipeline logic ở mức thiết kế | Documented; implementation pending |
| Trần Minh Ngọc | Data requirements cho holdings, benchmark, sector/factor và optimization | Documented; source validation tiếp tục ở Week 3 |
| Nguyễn Ngọc Anh | Complete user flow và information hierarchy của brief | Documented; artefact giao diện pending |
