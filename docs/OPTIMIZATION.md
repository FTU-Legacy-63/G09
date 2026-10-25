# Tối ưu hóa phân bổ

Tab `/optimize` chỉ chạy khi người dùng yêu cầu, sau khi đã phân tích danh mục. Không áp dụng phương án vào danh mục và không tạo lệnh giao dịch.

## Hai mục tiêu

| Lựa chọn | Hàm mục tiêu | Dữ liệu cần |
| --- | --- | --- |
| Volatility thấp nhất ước tính | Minimize `sqrt(252 × wᵀΣw)`; tương đương minimize variance | Covariance mẫu của return ngày tính bằng VND |
| Sharpe cao nhất ước tính | Maximize `sqrt(252) × (wᵀμ − rf_daily) / sqrt(wᵀΣw)` | Cùng covariance, trung bình return ngày, mặc định dùng HNX Vietnam 10Y par yield; 3%/năm khi quote không hợp lệ hoặc quá cũ; hoặc tùy chỉnh |

`rf_daily = (1 + rf_annual)^(1/252) − 1`. **Không bắt người dùng nhập lãi suất:** mặc định lấy HNX 10Y par yield; khi không có quote hợp lệ, dùng nội bộ mức 3%/năm tương thích Finfolio 1.0. Tùy chỉnh có thể là 0%, nhưng nhập sai/để trống trong chế độ tùy chỉnh phải báo lỗi, không tự đổi thành 0. Tổng tỷ trọng bằng 100%, không âm, không đòn bẩy; giới hạn mỗi mã và tổng commodity proxy được kiểm tra đồng thời.

## Diễn giải và giới hạn

Minimum variance dùng conditional gradient trên miền ràng buộc lồi và báo gap/ngưỡng hội tụ. Max-Sharpe tìm kiếm xấp xỉ với ba điểm khởi tạo, báo trạng thái hội tụ và không bảo đảm nghiệm tối ưu toàn cục. Kết quả không được gọi là “danh mục tốt nhất” theo nghĩa đầu tư.

Hàm mục tiêu dùng phân bổ cố định, covariance/mean lịch sử; bảng đối chiếu lại mua và giữ cùng lượng tài sản từ đầu kỳ. Sharpe mua và giữ được báo riêng và có thể khác Sharpe của hàm mục tiêu. Dữ liệu chọn phương án cũng là dữ liệu đánh giá: có thiên lệch in-sample, chưa phải kiểm định ngoài mẫu. Không bao gồm phí, thuế hay turnover; lãi suất đầu vào là giả định không đổi. Không diễn giải tỷ trọng bằng 0 là lời khuyên bán.

## Bằng chứng tái lập

- Thuật toán: [optimizer.mjs](../demo/optimizer.mjs).
- Kịch bản độc lập với phân tích: [finance.mjs](../demo/finance.mjs), `allocationScenario`.
- Kiểm thử: [research.test.mjs](../demo/research.test.mjs); chạy `npm test`.
- Trường hợp hai tài sản không tương quan: variance 0,04 và 0,09 cho minimum-variance khoảng 69,23% / 30,77%. Khi mean excess tương ứng 0,08 và 0,18, Max-Sharpe khoảng 50% / 50%. Đây là số kiểm thử toán học, không phải dữ liệu chứng khoán thật hay kết quả đầu tư.
