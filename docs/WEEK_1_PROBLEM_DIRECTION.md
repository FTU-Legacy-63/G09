# Week 1 — Problem Direction

## 1. Problem candidates

Nhóm xem xét ba hướng vấn đề trước khi chọn phạm vi dự án.

| Candidate | Target user | Task/decision | Khó khăn chính | Đánh giá |
|---|---|---|---|---|
| Công cụ so sánh sản phẩm tiết kiệm | Người mới đi làm đang chọn kênh tiết kiệm | So sánh lãi suất, kỳ hạn và thanh khoản | Điều kiện của nhiều ngân hàng khó so sánh đồng thời | Khả thi nhưng chiều sâu phân tích định lượng còn hạn chế |
| Công cụ so sánh khoản vay cá nhân | Người vay lần đầu | Đánh giá khả năng chi trả và so sánh các khoản vay | Lãi suất, phí và nghĩa vụ trả nợ có thể dẫn đến các kết luận khác nhau | Có ý nghĩa tài chính nhưng đã có nhiều sản phẩm tương tự |
| **Finfolio 2.0 — Portfolio Attribution & Risk Analytics** | Sinh viên tài chính và nhà đầu tư cá nhân giai đoạn đầu đang có danh mục đa tài sản | Quyết định có nên tái phân bổ hoặc phòng hộ danh mục | Chỉ số tổng không giải thích tài sản nào tạo ra lợi nhuận và rủi ro; tác động của thay đổi phân bổ khó được đánh giá trước | **Được chọn** vì có task rõ, phù hợp quantitative finance và năng lực của nhóm |

## 2. Selected target user

Target user chính là **sinh viên tài chính và nhà đầu tư cá nhân giai đoạn đầu đã sở hữu danh mục gồm nhiều loại tài sản**, chẳng hạn cổ phiếu, ETF, vàng, tiền mặt và hợp đồng tương lai chỉ số.

- **Specific:** không nhắm đến mọi nhà đầu tư; tập trung vào người đã có danh mục nhưng chưa có quy trình phân tích chuyên sâu.
- **Relevant:** người dùng trực tiếp gặp khó khăn khi xác định nguồn gốc lợi nhuận và rủi ro.
- **Reachable:** nhóm có thể làm việc với sinh viên tài chính, nhà đầu tư cá nhân trong mạng lưới gần và test portfolio giả lập.
- **Task-based:** người dùng cần đánh giá danh mục trước khi quyết định giữ nguyên, tái phân bổ hoặc hedge.

Nhà đầu tư chuyên nghiệp có thể hưởng lợi từ sản phẩm nhưng không phải target user chính của MVP vì nhu cầu và tiêu chuẩn của họ vượt quá phạm vi dự án bảy tuần.

## 3. User task or decision

Sau khi nhập danh mục, người dùng cần quyết định liệu có nên:

- tăng hoặc giảm tỷ trọng một tài sản;
- thêm một loại tài sản để đa dạng hóa;
- loại bỏ một vị thế tạo ra rủi ro không tương xứng;
- hoặc sử dụng hợp đồng tương lai chỉ số để phòng hộ.

Quyết định phải dựa trên đóng góp lợi nhuận, đóng góp rủi ro và phản ứng của toàn danh mục trước các kịch bản thị trường.

## 4. Specific difficulty

Người dùng có thể nhìn thấy return, volatility, VaR hoặc Expected Shortfall của toàn danh mục nhưng vẫn gặp bốn khó khăn:

1. Không biết tài sản nào thực sự tạo ra phần lớn lợi nhuận.
2. Không biết rủi ro đang tập trung ở vị thế, nhóm tài sản hoặc exposure nào.
3. Không thể đánh giá trước tác động của một thay đổi tỷ trọng.
4. Khó so sánh các tài sản có đặc tính và đơn vị rủi ro khác nhau trong cùng một danh mục.

## 5. Draft problem statement

> Sinh viên tài chính và nhà đầu tư cá nhân giai đoạn đầu đang nắm giữ danh mục đa tài sản gặp khó khăn khi đánh giá mức độ và nguồn gốc rủi ro của danh mục để ra quyết định phân bổ lại, vì các chỉ số tổng hợp không cho thấy rủi ro và lợi nhuận đang tập trung ở tài sản hoặc exposure nào, đồng thời họ khó kiểm tra trước tác động của một thay đổi trong bối cảnh các loại tài sản có đặc tính rủi ro khác nhau.

Problem statement tập trung vào **user, task, difficulty và context**; chưa đưa công nghệ hoặc giao diện vào định nghĩa vấn đề.

## 6. Finance and banking relevance

Đây là bài toán trực tiếp của quantitative finance, portfolio management và risk management:

- đo lường return, volatility, Value at Risk và Expected Shortfall;
- phân rã performance và risk contribution;
- đánh giá exposure và mức độ tập trung;
- áp dụng stress testing, scenario analysis và Monte Carlo simulation;
- hỗ trợ quyết định tái cân bằng hoặc phòng hộ danh mục.

Sản phẩm không chỉ hiển thị dữ liệu mà phải giúp người dùng giải thích và bảo vệ một quyết định tài chính.

## 7. Initial observation and assumptions to verify

Định hướng bắt đầu từ quan sát rằng nhiều dashboard đầu tư ưu tiên giá trị danh mục và chỉ số tổng, trong khi người dùng giai đoạn đầu cần một diễn giải đơn giản hơn về nguồn đóng góp rủi ro và lợi nhuận.

Đây là **giả thuyết vấn đề**, chưa phải kết luận đã được kiểm chứng. Nhóm cần xác nhận bằng phỏng vấn ngắn, quan sát quy trình hiện tại hoặc phản hồi từ người dùng mục tiêu.

## 8. Open questions

1. Người dùng mục tiêu hiện sử dụng công cụ nào và thiếu thông tin gì khi tái phân bổ danh mục?
2. Nguồn dữ liệu nào đủ ổn định cho cổ phiếu Việt Nam, ETF, vàng, tiền mặt và VN30 index futures?
3. Nên dùng portfolio thật, portfolio giả lập hay cả hai trong demo và kiểm thử?
4. Mức độ phức tạp nào của Monte Carlo là vừa đủ để kết quả có thể giải thích và kiểm chứng trong bảy tuần?
5. Index futures có khả thi trong MVP hay nên được chuyển sang fallback/stretch scope?

## 9. Week 1 result

- Hướng được chọn: **Finfolio 2.0**.
- Quyết định checkpoint: **Change** responsibility map, không thay đổi problem direction.
- Revision và câu hỏi còn mở được ghi tại [DECISION_LOG.md](DECISION_LOG.md).
