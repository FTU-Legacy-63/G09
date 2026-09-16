# Week 1 — Problem Direction

## 1. Vấn đề cần giải quyết

Nhóm xem xét ba hướng trước khi chọn đề tài.

| Hướng | Người dùng | Quyết định cần hỗ trợ | Đánh giá |
| --- | --- | --- | --- |
| So sánh sản phẩm tiết kiệm | Người mới đi làm | Chọn lãi suất, kỳ hạn và thanh khoản | Khả thi nhưng chiều sâu phân tích định lượng hạn chế |
| So sánh khoản vay cá nhân | Người vay lần đầu | So sánh chi phí và khả năng trả nợ | Có ý nghĩa nhưng đã có nhiều sản phẩm tương tự |
| **Finfolio 2.0** | Nhà đầu tư cá nhân tự quản lý danh mục | Giữ nguyên hay tái phân bổ danh mục | **Được chọn** vì task rõ, phù hợp portfolio/risk analytics và năng lực nhóm |

## 2. Target user

Target user là **nhà đầu tư cá nhân đã có kiến thức cơ bản về tài chính, đang tự theo dõi cổ phiếu và muốn so sánh thêm với vàng/bạc nhưng chưa sử dụng hệ thống portfolio analytics chuyên nghiệp**.

Nhóm không nhắm tới người hoàn toàn mới, nhà quản lý quỹ chuyên nghiệp hoặc tổ chức tài chính. Core MVP chỉ mở rộng vừa đủ từ cổ phiếu sang vàng và bạc; các asset class khác thuộc tầm nhìn dài hạn.

## 3. Core user task

Sau khi cung cấp danh mục, người dùng cần hiểu hiệu quả và rủi ro đang tập trung ở mã/ngành nào, danh mục hoạt động thế nào so với benchmark, và một phương án phân bổ tham khảo có làm thay đổi trade-off return–risk hay không. Từ đó, người dùng tự quyết định giữ nguyên hoặc cân nhắc tái phân bổ.

## 4. Khó khăn cụ thể

Người dùng có thể nhìn thấy giá trị, return hoặc volatility tổng nhưng vẫn gặp các khó khăn:

1. Không biết mã cổ phiếu hoặc ngành nào đóng góp phần lớn return.
2. Không biết rủi ro đang tập trung ở đâu.
3. Không có mốc benchmark nhất quán để đánh giá performance.
4. Khó đánh giá trade-off của một phương án phân bổ khác trước khi tự ra quyết định.

## 5. Problem statement

> Nhà đầu tư cá nhân đang tự theo dõi cổ phiếu và muốn so sánh với vàng/bạc gặp khó khăn khi quyết định giữ nguyên hay tái phân bổ vì các chỉ số tổng hợp không giải thích return và risk tập trung ở đâu, kết quả khác benchmark như thế nào, và một phương án phân bổ khác làm thay đổi trade-off return–risk ra sao.

Problem statement tập trung vào user, task, difficulty và context; benchmark hay optimization là lựa chọn giải pháp ở các tuần sau, không phải một phần của định nghĩa vấn đề ban đầu.

## 6. Mức độ liên quan tới tài chính – ngân hàng

Bài toán liên quan trực tiếp tới portfolio management và risk management:

- đo performance và volatility;
- phân rã return contribution và risk contribution;
- phân tích mức độ tập trung theo mã/ngành;
- đánh giá performance tương đối so với benchmark;
- hỗ trợ người dùng đánh giá một phương án phân bổ trên bằng chứng định lượng.

Sản phẩm hỗ trợ phân tích; không tự phát lệnh hoặc cam kết kết quả đầu tư.

## 7. Giả thuyết cần kiểm chứng

Quan sát từ Finfolio 1.0 cho thấy người dùng đã có thể nhìn thấy các chỉ số tổng, nhưng chưa được giải thích rõ nguồn return/risk hoặc tác động của thay đổi phân bổ. Đây là giả thuyết vấn đề, không phải kết luận đã được kiểm chứng. Nhóm cần tiếp tục xác nhận qua phản hồi của target user và việc quan sát họ đọc output.

## 8. Quyết định và revision

| Nội dung | Ghi nhận |
| --- | --- |
| Quyết định ban đầu | Chọn Finfolio 2.0 trong ba problem candidates |
| Feedback | Vai trò và output của từng thành viên cần rõ; phạm vi cần đủ nhỏ để tạo một flow hoàn chỉnh |
| Revision hiện tại | Giữ Core MVP đủ hẹp ở cổ phiếu, vàng và bạc; làm rõ benchmark và phương án tối ưu hóa là các phương tiện hỗ trợ user task |
| Câu hỏi còn mở | Target user hiểu contribution và current–optimized comparison theo cách trình bày nào dễ nhất? |

## 9. Evidence/output của Week 1

- Ba problem candidates và lý do lựa chọn.
- Một target user cụ thể.
- Core user task và difficulty.
- Problem statement có liên quan trực tiếp tới tài chính.
- Giả thuyết và câu hỏi cần kiểm chứng ở các checkpoint sau.

## Individual Contribution

| Thành viên | Output được ghi nhận ở Week 1 | Trạng thái |
| --- | --- | --- |
| Hoàng Khánh Linh | Financial reasoning, difficulty và finance relevance | Documented trong bản Week 1 trước refactor |
| Nguyễn Quỳnh Anh | Tổng hợp problem candidates và checkpoint revision | Documented trong bản Week 1 trước refactor |
| Lê Bảo An | Tổ chức repository và tích hợp evidence Week 1 | Documented trong lịch sử repository |
| Trần Minh Ngọc | Initial observation và các câu hỏi về dữ liệu cần kiểm chứng | Documented trong bản Week 1 trước refactor |
| Nguyễn Ngọc Anh | Target user, user task và nhu cầu diễn giải output | Documented trong bản Week 1 trước refactor |

Các issue/commit hoặc artefact cá nhân chi tiết hơn sẽ được gắn thêm khi có; bảng trên không thay thế bằng chứng thực tế.
