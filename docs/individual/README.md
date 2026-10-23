# Individual footprint — G09

Nhóm xác nhận giữ phân công: Linh logic tài chính; Quỳnh Anh flow/testing; Bảo An build/integration; Minh Ngọc data; Ngọc Anh UI/UX. Phân công không tự chứng minh mỗi người đã tự viết code hoặc chạy test. Code/tài liệu final trong lần cập nhật này có hỗ trợ Codex; không suy từ Git commit của người upload thành tác giả duy nhất.

| Thành viên | Trách nhiệm | Concrete output / evidence | Cách dùng trong sản phẩm | Integration / testing / revision |
| --- | --- | --- | --- | --- |
| Hoàng Khánh Linh | Financial logic | [Week 4](../WEEK4.md), [method final](../FINAL_METHODS.md), [footprint](linh.md) | Công thức return/risk, benchmark, Sharpe và mô phỏng có claim boundary | Test reconciliation do Codex chạy; cá nhân review pending |
| Nguyễn Quỳnh Anh | Flow / testing | [Week 5](../WEEK5.md), [test table](../WEEK7.md), [footprint](quynh-anh.md) | Acceptance input → output, lỗi và regression | Kịch bản final đã soạn; buổi user acceptance cá nhân pending |
| Lê Bảo An | Build / integration | [API](../../demo/server.py), [worker](../../demo/research-worker.mjs), [footprint](bao-an.md) | Nối nguồn, phép tính, UI và deployment | Code/test final có Codex hỗ trợ; personal reproduce pending |
| Trần Minh Ngọc | Data / provenance | [Week 3](../WEEK3.md), [VN source](../../demo/vn_data.py), [footprint](minh-ngoc.md) | Identifier/currency, phiên giá, nguồn và freshness | Mock source tests do Codex chạy; personal data audit pending |
| Nguyễn Ngọc Anh | UI/UX | [Week 5 references](../WEEK5.md), [tokens](../../demo/tokens.css), [footprint](ngoc-anh.md) | Tiếng Việt, navigation, chart và progressive explanations | Screenshot/browser audit do Codex; personal design acceptance pending |

Mỗi footprint dưới đây có sáu mục theo yêu cầu Week 7. “Output” là artifact thuộc phạm vi phụ trách được repo ghi nhận, **không phải xác nhận cá nhân đã độc lập tạo ra artifact đó**. Trước khi nộp, từng người bổ sung phần mình thực sự làm, buổi test/review cụ thể và xác nhận nội dung. Không tự dựng bằng chứng đóng góp hay ngày review.

## Cách chuẩn bị thuyết trình

Mỗi người chuẩn bị 2–3 phút: vấn đề mình xử lý → mở một evidence thật → đi qua input/logic/output → giải thích một expected/actual → nêu một giới hạn. Có thể bị hỏi chéo phần của bạn khác, nên cả nhóm hiểu luồng chung. Không cần học thuộc mọi dòng code.

Trạng thái personal sign-off cho cả năm thành viên: **chờ thành viên đọc và xác nhận**, chưa có bằng chứng buổi tự kiểm tra mới. Unit tests do Codex chạy được ghi trong [Week 7](../WEEK7.md), không nhận thay thành user testing của Quỳnh Anh hay review phương pháp của Linh.
