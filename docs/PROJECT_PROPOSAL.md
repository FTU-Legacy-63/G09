# Finfolio 2.0 — Project Proposal

## 1. Problem direction

Week 1 identified the following difficulty:

> Nhà đầu tư cá nhân đang tự theo dõi một danh mục nhỏ gồm nhiều vị thế nhưng chưa sử dụng hệ thống portfolio analytics chuyên nghiệp có thể nhìn thấy giá trị, return hoặc volatility của toàn danh mục qua Finfolio 1.0 nhưng khó xác định lợi nhuận và rủi ro đang tập trung ở vị thế nào. Vì vậy, họ khó đánh giá liệu một thay đổi tỷ trọng có thực sự cải thiện danh mục hay không.

Đây vẫn là một **problem hypothesis cần được kiểm chứng với nhóm nhà đầu tư cá nhân mục tiêu**. Week 2 chuyển hypothesis này thành một product direction có thể review và tiếp tục điều chỉnh theo evidence.

## 2. Target user, context and user task

### Primary target user

Nhà đầu tư cá nhân đang tự theo dõi một danh mục nhỏ gồm nhiều vị thế nhưng chưa sử dụng hệ thống portfolio analytics chuyên nghiệp.

### Context

Người dùng biết danh mục đang lãi/lỗ và có thể biết tỷ trọng từng vị thế, nhưng chưa dễ trả lời:

1. Vị thế nào tạo ra phần lớn return?
2. Vị thế nào tạo ra phần lớn portfolio risk?
3. Risk concentration có khác allocation concentration không?
4. Nếu thay đổi một tỷ trọng, trạng thái danh mục thay đổi thế nào?

### Core user task

> Đánh giá danh mục hiện tại, so sánh với một phương án thay đổi tỷ trọng và quyết định giữ nguyên hay tái phân bổ.

Hedge, lựa chọn “danh mục tối ưu” và dự báo thị trường không phải core task của giai đoạn này.

## 3. Desired user outcome

Sau một complete flow, người dùng có thể đưa ra một câu giải thích có căn cứ, ví dụ:

> “Vị thế A chỉ chiếm X% giá trị nhưng đóng góp Y% rủi ro. Khi giảm tỷ trọng A và phân bổ lại sang B, mức độ tập trung và volatility ước tính thay đổi từ C sang D; vì vậy tôi chọn/không chọn phương án này.”

Desired outcome là **một quyết định có thể giải thích**, không phải việc xem nhiều biểu đồ hoặc nhận thêm nhiều chỉ số.

## 4. Main visible output

Main output là **Portfolio Decision Brief** trả lời ba câu hỏi:

1. **Current state:** lợi nhuận và rủi ro đang tập trung ở đâu?
2. **Alternative:** một thay đổi tỷ trọng cụ thể làm kết quả thay đổi thế nào?
3. **Decision support:** evidence nào ủng hộ việc giữ nguyên hoặc tái phân bổ?

### Minimum content of the brief

| Nội dung nhìn thấy | Liên hệ với problem/task |
|---|---|
| Allocation theo vị thế/nhóm tài sản | Cho biết cấu trúc danh nghĩa của danh mục |
| Return contribution | Cho biết nguồn tạo ra kết quả quá khứ |
| Risk contribution | Cho biết nguồn tạo ra portfolio risk |
| Concentration insight | Làm rõ vị thế có risk contribution không tương xứng với allocation |
| Before/after comparison | Hỗ trợ đánh giá một phương án thay đổi tỷ trọng |
| Assumptions and limitations | Giúp người dùng không diễn giải output như một khuyến nghị chắc chắn |

Các metric như VaR/Expected Shortfall chỉ được thêm nếu chúng làm rõ một câu hỏi trong brief và có thể kiểm thử. Chúng không phải điều kiện để core output hoàn thành.

## 5. Product statement

> Finfolio 2.0 tạo một Portfolio Decision Brief từ thông tin danh mục và dữ liệu lịch sử, giúp người dùng xác định nguồn đóng góp lợi nhuận/rủi ro và so sánh một phương án tái phân bổ trước khi tự đưa ra quyết định.

### Product value

Chuyển từ “danh mục đang có chỉ số bao nhiêu?” sang “vì sao danh mục có kết quả đó, và một thay đổi cụ thể tạo ra khác biệt gì?”.

### Product form and pattern

Nhóm chọn **dashboard application** làm initial product pattern vì Decision Brief gồm nhiều kết quả liên kết và cần so sánh current/alternative state trên cùng một flow.

Dashboard là cách tổ chức output, không phải lý do sản phẩm tồn tại. Nếu một report/prototype đơn giản chứng minh core output nhanh hơn, nhóm có thể dùng route đó mà không thay đổi product value.

## 6. Product traceability

| Problem evidence/hypothesis | Product response | Priority |
|---|---|---|
| Người dùng chỉ nhìn thấy kết quả tổng | Return/risk contribution theo vị thế | Core |
| Allocation không phản ánh đầy đủ risk concentration | So sánh allocation với risk contribution | Core |
| Khó đánh giá trước một thay đổi tỷ trọng | Một before/after comparison | Core |
| Người dùng có thể hiểu sai mô hình | Hiển thị assumptions và limitations | Core |
| Người dùng cần tail-risk metric | VaR/Expected Shortfall | Chỉ thêm sau validation |
| Người dùng cần đánh giá cú sốc thị trường | Stress scenario | Conditional extension |
| Người dùng cần phân phối giá trị tương lai | Monte Carlo | Stretch scope |
| Người dùng cần hedge bằng futures | Futures module | Out of core MVP |

Feature không truy ngược được về problem evidence hoặc core task sẽ không vào MVP.

## 7. Conceptual product chain

```text
Problem
  Không biết nguồn tập trung return/risk và tác động của thay đổi tỷ trọng
        ↓
User task
  Đánh giá current portfolio và một reallocation alternative
        ↓
Desired outcome
  Đưa ra quyết định có thể giải thích
        ↓
Main output
  Portfolio Decision Brief
        ↓
Required process
  Calculate → Attribute → Compare → Explain
        ↓
Required input
  Holdings + compatible historical data + proposed weights
        ↓
Product pattern / route
  Dashboard or simpler reviewable prototype
```

## 8. Feasibility and scope decision

### Why the direction is feasible

- Core task chỉ yêu cầu đánh giá một current portfolio và một alternative.
- Mỗi calculation có thể đối chiếu bằng một test portfolio nhỏ.
- Static historical dataset đủ để chứng minh core value; live API không phải dependency bắt buộc.
- Main output vẫn hữu ích khi chưa có VaR, stress testing, Monte Carlo hoặc futures.

### Main risks and responses

| Risk | Tác động | Response |
|---|---|---|
| Problem hypothesis chưa được xác nhận | Xây đúng kỹ thuật nhưng không đúng nhu cầu | Phỏng vấn/quan sát nhà đầu tư cá nhân mục tiêu và ghi lại current workflow |
| “Risk contribution” khó hiểu | Output không hỗ trợ quyết định | Dùng plain-language explanation và test comprehension |
| Dữ liệu không đồng nhất | Attribution sai hoặc không so sánh được | Week 3 xác định instrument universe, frequency, currency và cleaning rules |
| Feature expansion | Scope tăng nhưng core flow chưa hoàn chỉnh | Chỉ thêm feature khi có traceability tới problem/task và acceptance test |
| Kết quả bị hiểu như lời khuyên đầu tư | Tạo kỳ vọng sai | Hiển thị assumptions, limitations và không đưa ra “best portfolio” |

## 9. Open questions for Week 3

1. Nhà đầu tư cá nhân mục tiêu hiện dùng quy trình nào để nhận diện risk concentration?
2. Họ hiểu “risk contribution” theo cách trình bày nào dễ nhất?
3. Instrument universe nhỏ nhất nào có dữ liệu tương thích để chứng minh core output?
4. Dữ liệu holdings và historical prices cần trường, đơn vị, currency và frequency nào?
5. Phép đo risk contribution nào vừa đúng tài chính vừa có thể giải thích và kiểm thử trong phạm vi khóa học?
6. Before/after comparison cần giữ yếu tố nào cố định để tránh tạo so sánh gây hiểu nhầm?

## 10. Week 2 checkpoint answers

- **What exactly are we building?** Một product flow tạo Portfolio Decision Brief cho current portfolio và một phương án tái phân bổ.
- **What is the main output?** Brief giải thích allocation, return/risk contribution, concentration và before/after comparison.
- **What is the conceptual solution chain?** Problem → user task → desired outcome → main output → process → input → product pattern/route.
- **What is the MVP and fallback?** Core MVP giữ attribution và một comparison; fallback dùng sample portfolio và static data nhưng vẫn giữ cùng user task/output.
- **Who owns which output?** Được ghi trong [SOLUTION_STRUCTURE.md](SOLUTION_STRUCTURE.md#10-responsibility-by-output).
