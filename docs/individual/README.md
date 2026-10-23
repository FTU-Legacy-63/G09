# Individual Footprint & Contribution Map — Nhóm G09

Tài liệu này tổng hợp phân công trách nhiệm, bản đồ đóng góp (Contribution Map) và liên kết đến báo cáo dấu ấn cá nhân chi tiết (Individual Footprint) của từng thành viên trong dự án **Finfolio 2.0 — Portfolio Attribution & Risk Analytics** (Nhóm G09, Khóa K63, Học phần NHA408E).

---

## 1. Phân công trách nhiệm nòng cốt

Nhóm G09 xác nhận duy trì ma trận phân công 5 thành viên theo 5 mảng nghiệp vụ chuyên biệt:

| Thành viên | MSSV | Vai trò chính | Trách nhiệm cốt lõi | Báo cáo chi tiết |
| :--- | :---: | :--- | :--- | :---: |
| **Hoàng Khánh Linh** | 2412380024 | **Product Owner** | Định nghĩa phạm vi sản phẩm, mô hình toán tài chính (Return, Euler Risk, FX Attribution), giả định tối ưu hóa và phê duyệt phương pháp luận. | [Xem báo cáo của Linh](linh.md) |
| **Nguyễn Quỳnh Anh** | 2413380010 | **Product Manager** | Quản lý yêu cầu, đặc tả luồng người dùng (Happy/Alternative/Error), ma trận kiểm thử nghiệm thu W5/W6/W7, quản trị danh mục lỗi (Bug Log). | [Xem báo cáo của Quỳnh Anh](quynh-anh.md) |
| **Lê Bảo An** | 2412380002 | **Lead Developer** | Đại diện nhóm; thiết kế kiến trúc hệ thống, xây dựng pipeline dữ liệu Python, Web Worker tính toán đa luồng, tự động hóa CI/CD và triển khai Vercel. | [Xem báo cáo của Bảo An](bao-an.md) |
| **Trần Minh Ngọc** | 2412380036 | **Business Analyst**| Xây dựng Từ điển Dữ liệu (18+ trường), thẩm định nguồn dữ liệu thị trường (TradingView & Yahoo), phân loại ngành kinh tế, giám sát độ trễ dữ liệu. | [Xem báo cáo của Minh Ngọc](minh-ngoc.md) |
| **Nguyễn Ngọc Anh** | 2413380008 | **UI/UX Designer** | Thiết kế cấu trúc thông tin 7 trang, hệ thống Design Tokens (Forest/Paper), Typography tự lưu trữ, trực quan hóa biểu đồ Native SVG và giải thích lũy tiến. | [Xem báo cáo của Ngọc Anh](ngoc-anh.md) |

---

## 2. Bản đồ bằng chứng và Đóng góp cụ thể (Concrete Output Matrix)

| Hạng mục | Concrete Output / Evidence trong Repository | Thành viên phụ trách chính | Cách thức đối soát / Kiểm tra |
| :--- | :--- | :---: | :--- |
| **Phương pháp Tài chính** | [WEEK4.md](../WEEK4.md), [OPTIMIZATION.md](../OPTIMIZATION.md), [FINAL_METHODS.md](../FINAL_METHODS.md), [FX_ATTRIBUTION.md](../FX_ATTRIBUTION.md) | Hoàng Khánh Linh | Đối chiếu công thức toán học và các ranh giới giả định |
| **Luồng & Kiểm thử** | [WEEK5.md](../WEEK5.md), [WEEK6.md](../WEEK6.md), [WEEK7.md](../WEEK7.md), [freshness.test.mjs](../../demo/freshness.test.mjs) | Nguyễn Quỳnh Anh | Chạy `node --test demo/*.test.mjs` và rà soát bug log |
| **Kiến trúc & Lập trình** | [server.py](../../demo/server.py), [finance.mjs](../../demo/finance.mjs), [optimizer.mjs](../../demo/optimizer.mjs), [simulation.mjs](../../demo/simulation.mjs) | Lê Bảo An | Kiểm tra 85 automated tests và triển khai Vercel production |
| **Dữ liệu & Xuất xứ** | [WEEK3.md](../WEEK3.md), [vn_data.py](../../demo/vn_data.py), [classification.py](../../demo/classification.py), [data_status.py](../../demo/data_status.py) | Trần Minh Ngọc | Chạy `python3 -m unittest discover -s demo -p 'test_*.py'` |
| **UI/UX & Trực quan** | [tokens.css](../../demo/tokens.css), [typography.css](../../demo/typography.css), [chart-utils.mjs](../../demo/chart-utils.mjs), [redesign.css](../../demo/redesign.css) | Nguyễn Ngọc Anh | Mở website [g09-finfolio.vercel.app](https://g09-finfolio.vercel.app/) trên các viewport |

---

## 3. Cấu trúc chuẩn mực của Báo cáo Cá nhân (Individual Footprint)

Tham khảo từ tiêu chuẩn xuất sắc của Khóa K62 ([https://github.com/FTU-Legacy-62/G09](https://github.com/FTU-Legacy-62/G09)), mỗi file footprint cá nhân trong thư mục này được xây dựng hoàn chỉnh với 6 phần chuyên sâu:
1. **Thông tin cá nhân & Vai trò trong dự án:** Định vị rõ trách nhiệm và vai trò đầu mối của cá nhân.
2. **Dấu ấn cá nhân trong sản phẩm:** Nêu bật 3 đóng góp mang tính quyết định, có thể nhìn thấy hoặc đo lường được trên sản phẩm.
3. **Những việc đã thực sự làm:** Tường trình chi tiết 5–6 mảng nghiệp vụ cụ thể gắn với các mốc thời gian từ Week 1 đến Week 7.
4. **Bảng tổng hợp File, Logic và Đóng góp cụ thể:** Đối chiếu chính xác từng dòng code, file markdown, test case hoặc màn hình giao diện.
5. **Bảng bằng chứng đóng góp theo 7 tuần:** Bằng chứng kiểm tra chéo giữa tiến trình nhóm và kết quả thực tế của cá nhân.
6. **Hạn chế còn tồn tại và Bài học kinh nghiệm:** Đánh giá trung thực những điểm chưa hoàn hảo và bài học rút ra về mặt chuyên môn.

---

## 4. Hướng dẫn thuyết trình cá nhân trước Hội đồng (2–3 Phút / Người)

Mỗi thành viên khi bước lên bảo vệ dự án trước giảng viên cần tuân thủ cấu trúc 3 phút:
- **Phút 1 (Vấn đề & Trách nhiệm):** Nêu rõ bài toán mình được giao xử lý, vì sao bài toán đó quan trọng đối với toàn bộ luồng hoạt động của Finfolio 2.0.
- **Phút 2 (Minh chứng sống):** Mở trực tiếp màn hình sản phẩm hoặc file bằng chứng trong repo; chỉ rõ dữ liệu đầu vào $\to$ công thức xử lý $\to$ kết quả hiển thị trên giao diện hoặc kết quả kiểm thử chạy bằng lệnh máy tính.
- **Phút 3 (Ranh giới & Bài học):** Thừa nhận một giới hạn kỹ thuật của giải pháp hiện tại, giải thích lý do vì sao nhóm đưa ra sự đánh đổi (trade-off) đó và hướng mở rộng trong tương lai.
