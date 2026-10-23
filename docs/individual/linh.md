# Hoàng Khánh Linh — Financial logic

## 1. My main responsibility
Phụ trách logic tài chính: ý nghĩa return/risk attribution, benchmark, giả định và cách đọc kết quả. Đây là phân công nhóm đã xác nhận, không phải xác nhận tác giả mọi file dưới đây.

## 2. My concrete outputs
Artifact thuộc phạm vi: công thức và expected results Week 4; phương pháp FX; mô tả hai mục tiêu optimizer và diễn giải metrics/Monte Carlo final. Phần mở rộng final được hỗ trợ bởi Codex; cá nhân cần review và ghi chính xác phần mình đóng góp.

## 3. Evidence links
[Week 4](../WEEK4.md), [finance.mjs](../../demo/finance.mjs), [optimization](../OPTIMIZATION.md), [final methods](../FINAL_METHODS.md), [FX](../FX_ATTRIBUTION.md).

## 4. How my work is used
Logic chuyển giá và tỷ trọng thành kết quả người dùng hiểu được; ngăn nhầm benchmark comparison thành Brinson, ETF proxy thành spot, historical risk thành dự báo chắc chắn. Ví dụ: 40% vốn ở một mã tăng 10% đóng góp 4 điểm phần trăm, không phải 4% của tổng lợi nhuận.

## 5. Integration/testing/revision
Đọc và tái lập test identity return/risk trong finance tests; giải thích tại sao min-vol 69,23/30,77 khác Max-Sharpe 50/50 ở ví dụ độc lập trong method. Kiểm tra RF bỏ trống không ngầm bằng 0. Các test đã do Codex chạy; phần cá nhân tự tái lập/duyệt: **chờ xác nhận**.

## 6. Remaining limitation
Chưa xác nhận personal review bản final. Chưa out-of-sample validation, cổ tức/phí/thuế, historical constituents. Khi hỏi VaR: trả lời “ngưỡng phân vị mẫu”, không “mức lỗ tối đa”; khi hỏi Monte Carlo: mô hình lấy lại lịch sử, không dự báo được mọi khủng hoảng.
