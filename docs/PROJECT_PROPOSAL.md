# Finfolio 2.0 — Project Proposal

## 1. Problem direction

Sinh viên tài chính và nhà đầu tư cá nhân giai đoạn đầu đã sở hữu danh mục đa tài sản thường nhìn thấy các chỉ số tổng hợp như return, volatility, VaR và Expected Shortfall nhưng khó xác định:

- tài sản nào tạo ra lợi nhuận;
- vị thế hoặc exposure nào tạo ra rủi ro;
- mức độ tập trung thực tế của danh mục;
- và tác động của một thay đổi phân bổ trước khi giao dịch.

Vấn đề cốt lõi không phải thiếu thêm một chỉ số, mà là thiếu một chuỗi giải thích kết nối **cấu trúc danh mục → nguồn đóng góp → kịch bản thay đổi → quyết định của người dùng**.

## 2. Target user and user task

### Target user

Sinh viên tài chính và nhà đầu tư cá nhân giai đoạn đầu đã nắm giữ hoặc đang thử nghiệm danh mục gồm nhiều loại tài sản, nhưng chưa sử dụng hệ thống phân tích chuyên nghiệp.

### Core user task

Đánh giá danh mục hiện tại và quyết định nên giữ nguyên, tái phân bổ hoặc phòng hộ dựa trên nguồn gốc lợi nhuận, rủi ro và kết quả scenario analysis.

### Context

Danh mục có thể gồm cổ phiếu, ETF, vàng, tiền mặt và hợp đồng tương lai chỉ số. Các tài sản có cơ chế sinh lời, volatility, correlation và downside risk khác nhau, khiến chỉ số tổng hợp khó giải thích nếu không có attribution.

## 3. Desired user outcome

Sau khi sử dụng Finfolio 2.0, người dùng có thể:

1. xác định tài sản hoặc nhóm tài sản đóng góp nhiều nhất vào lợi nhuận và rủi ro;
2. nhận diện mức độ tập trung không thể hiện rõ qua tỷ trọng danh nghĩa;
3. so sánh trạng thái hiện tại với một phương án thay đổi phân bổ;
4. giải thích quyết định giữ nguyên, tái cân bằng hoặc hedge bằng kết quả định lượng.

## 4. Product statement

> Finfolio 2.0 là một web dashboard phân tích danh mục đa tài sản. Sản phẩm chuyển dữ liệu vị thế và dữ liệu thị trường thành báo cáo attribution, risk diagnostics và scenario analysis để hỗ trợ người dùng đánh giá một quyết định phân bổ.

### Product value

Giúp người dùng hiểu **rủi ro và lợi nhuận đến từ đâu**, thay vì chỉ biết danh mục có bao nhiêu return hoặc volatility.

### Product form

Code-based web dashboard có input danh mục, analytics engine và màn hình kết quả. Sản phẩm không phải chatbot, sàn giao dịch hay robo-advisor.

## 5. Main output

Main output là **Portfolio Attribution & Risk Report**, không phải bản thân dashboard.

Báo cáo phải hiển thị tối thiểu:

- tổng giá trị và allocation của danh mục;
- historical return và volatility;
- VaR và Expected Shortfall ở mức tin cậy được công bố;
- return contribution theo vị thế và asset class;
- risk contribution theo vị thế và asset class;
- các vị thế tạo ra downside risk hoặc concentration risk lớn nhất;
- kết quả của ít nhất một predefined stress scenario;
- so sánh before/after cho một thay đổi tỷ trọng đơn giản.

### How the output supports the task

| Output insight | Quyết định được hỗ trợ |
|---|---|
| Một vị thế đóng góp tỷ lệ rủi ro cao hơn đáng kể so với tỷ trọng giá trị | Giảm tỷ trọng hoặc đa dạng hóa |
| Một tài sản có return contribution thấp nhưng downside contribution cao | Xem xét loại bỏ vị thế |
| Thêm vàng làm giảm VaR/Expected Shortfall trong giả định nhất định | Cân nhắc phương án phân bổ mới |
| Danh mục chịu tổn thất lớn trong predefined stress scenario | Điều chỉnh exposure hoặc hedge |

## 6. Product pattern

Nhóm chọn **dashboard application** làm product pattern chính vì người dùng cần xem đồng thời nhiều kết quả có quan hệ với nhau: allocation, attribution, risk metrics và scenario comparison.

Monte Carlo simulation, stress testing và attribution là **process/analysis methods** bên trong sản phẩm, không phải các product pattern riêng.

## 7. Conceptual solution chain

```text
User task
  Đánh giá có nên thay đổi phân bổ danh mục
        ↓
Main output
  Portfolio Attribution & Risk Report
        ↓
Core process
  Calculate → Attribute → Compare/Simulate → Explain
        ↓
MVP flow
  Nhập danh mục → Chạy phân tích → Xem báo cáo → Thử một thay đổi → So sánh
        ↓
User action
  Giữ nguyên, tái phân bổ hoặc cân nhắc hedge
```

## 8. Feasibility

### Why the project is feasible

- Output được giới hạn thành một báo cáo phân tích thay vì nền tảng đầu tư đầy đủ.
- Có thể kiểm chứng các phép tính bằng test portfolio nhỏ và test cases tính tay.
- Khi market-data API không ổn định, nhóm có thể dùng historical CSV đã làm sạch.
- Dashboard có thể phát triển theo module nhưng tất cả module dùng chung một specification về portfolio, return và risk.

### Main risks

| Risk | Tác động | Response |
|---|---|---|
| Dữ liệu đa tài sản không đồng nhất | Kết quả covariance và attribution sai lệch | Chuẩn hóa currency, calendar, frequency và missing values trước khi tính toán |
| Scope quá rộng | Nhiều feature nhưng không có luồng hoàn chỉnh | Ưu tiên report, attribution và một scenario; dùng fallback scope khi cần |
| Công thức khó giải thích | Sản phẩm chạy nhưng không defensible | Ghi rõ công thức, assumptions và test cases |
| Index futures làm tăng độ phức tạp | Chậm tích hợp MVP | Chuyển futures sang fallback/stretch scope nếu dữ liệu hoặc mô hình chưa sẵn sàng |
| Monte Carlo bị dùng như “hộp đen” | Output khó kiểm chứng | Công bố assumptions, horizon, confidence level và số paths; so sánh với historical metrics |

## 9. Open questions for Week 3

1. Mỗi thành phần của report cần chính xác trường dữ liệu nào, đơn vị nào và frequency nào?
2. Nguồn dữ liệu nào được chọn cho từng asset class và benchmark?
3. Quy tắc xử lý currency, non-trading days, missing prices và corporate actions là gì?
4. Risk attribution sẽ dựa trên variance contribution, downside measure hay cả hai trong target scope?
5. Hợp đồng tương lai chỉ số có đủ dữ liệu và phương pháp định giá để giữ trong target scope không?
6. Scenario nào có ý nghĩa nhất với target user và có assumptions dễ giải thích nhất?

## 10. Week 2 checkpoint questions

- **What exactly are we building?** Một web dashboard tạo Portfolio Attribution & Risk Report từ danh mục đa tài sản.
- **What is the main output?** Báo cáo giải thích allocation, performance contribution, risk contribution và tác động của scenario.
- **What is the conceptual solution chain?** User task → report → calculate/attribute/simulate/explain → complete MVP flow → user action.
- **What is the MVP and fallback?** Target scope có attribution, core risk metrics và scenario comparison; fallback giảm asset classes và dùng static dataset.
- **Who owns which output?** Được ghi trong [SOLUTION_STRUCTURE.md](SOLUTION_STRUCTURE.md#9-responsibility-by-output).
