# Nguyễn Quỳnh Anh — Flow và testing

## 1. My main responsibility
Phụ trách flow, acceptance criteria và theo dõi test/revision theo phân công đã xác nhận.

## 2. My concrete outputs
Artifact thuộc phạm vi: feature/flow Week 5, test scenarios Week 6 và final audit expected/actual. Chưa tự nhận đã chạy mọi test; các test tự động lần cập nhật final được Codex chạy.

## 3. Evidence links
[Week 5](../WEEK5.md), [Week 6](../WEEK6.md), [Week 7 test table](../WEEK7.md), [finance tests](../../demo/finance.test.mjs), [research tests](../../demo/research.test.mjs), [freshness tests](../../demo/freshness.test.mjs).

## 4. How my work is used
Chuyển yêu cầu thành hành vi kiểm tra được: nhập sai phải báo lỗi; tổng contribution phải khớp; mở tab Tối ưu hóa không tự chạy; bấm tính phải tuân thủ cap. Expected là điều nhóm muốn xảy ra, actual là kết quả quan sát, không ghi “pass” nếu chưa thực sự kiểm tra.

## 5. Integration/testing/revision
Chuẩn bị tự chạy: hai mã trùng, giá trị 0, mã không tồn tại; RF trống/0%; cap 10% với ba mã; Monte Carlo cùng seed; hủy rồi chạy lại; reload đường dẫn; mobile; cố định kỳ lịch sử; source lỗi. Ghi actual và ảnh/lỗi cụ thể. Trạng thái tự kiểm thử và acceptance của cá nhân: **chờ xác nhận**, không đồng nhất với unit tests của Codex.

## 6. Remaining limitation
Chưa có bằng chứng buổi user acceptance mới; mock test không thay được provider/live browser test. Khi hỏi lỗi còn mở, nêu cron có thể trễ, nghỉ lễ chưa có calendar và mô phỏng chưa kiểm định ngoài mẫu, không trả lời “không còn lỗi”.
