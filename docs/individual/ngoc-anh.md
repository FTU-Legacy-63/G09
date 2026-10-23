# Individual Footprint — Nguyễn Ngọc Anh

## Bảng thông tin cá nhân

| Thông tin | Nội dung |
| :--- | :--- |
| **Họ và tên** | **Nguyễn Ngọc Anh** |
| **Mã sinh viên** | **2413380008** |
| **Vai trò chính** | **UI/UX Designer / Information Architecture Lead** |
| **Dự án** | **Finfolio 2.0 — Portfolio Attribution & Risk Analytics** |
| **Môn học** | Ứng dụng CNTT trong Tài chính - Ngân hàng (NHA408E) |
| **Nhóm** | Group 09 (G09) — Lớp K63 |

---

## 1. Vai trò trong dự án

Với tư cách là **Thiết kế Giao diện & Trải nghiệm Người dùng (UI/UX Designer)** kiêm **Trưởng nhóm Cấu trúc Thông tin (Information Architecture Lead)** của Finfolio 2.0, em chịu trách nhiệm chính về:
1. **Thiết kế Cấu trúc Thông tin và Phân cấp Trực quan (Information Architecture & Visual Hierarchy):** Chuyển đổi khối lượng số liệu tài chính định lượng đồ sộ thành một giao diện trực quan, khoa học, dễ tiếp thu theo nguyên lý *Tiết lộ thông tin lũy tiến (Progressive Disclosure)*.
2. **Xây dựng Hệ thống Thiết kế Chuẩn mực (Design System & Design Tokens):** Xây dựng bảng mã màu, kiểu chữ, khoảng cách, thành phần giao diện (CSS Design Tokens) mang phong cách Forest/Paper đặc trưng, tạo dựng cảm giác tin cậy, chuyên nghiệp cho một sản phẩm công nghệ tài chính.
3. **Trực quan hóa Dữ liệu Tài chính (Financial Data Visualization):** Thiết kế và hiện thực hóa biểu đồ biến động tài sản Native SVG, bảng nhiệt đóng góp lợi nhuận (Attribution Heatmap), hệ thống tooltip/crosshair và giao diện thích ứng linh hoạt trên mọi kích thước màn hình. Thuật toán và màn hình Monte Carlo thuộc phạm vi kỹ thuật của Lê Bảo An.

---

## 2. Dấu ấn cá nhân trong sản phẩm

Dấu ấn sáng tạo và chuyên môn rõ nét nhất của em trong Finfolio 2.0 thể hiện qua 3 đóng góp quan trọng:

1. **Thiết kế Biểu đồ PnL theo Giá trị Thực VND thay vì Chuẩn hóa Base-100:**  
   Trong các bản thiết kế tham khảo ban đầu (kể cả Finfolio 1.0 của K62), biểu đồ thường chuẩn hóa về mốc 100 điểm. Tuy nhiên, qua phỏng vấn người dùng, em nhận thấy nhà đầu tư cá nhân luôn muốn nhìn thấy **số tiền thực tế của mình đang tăng giảm ra sao** bằng tiền đồng Việt Nam. Em đã kiên định thiết kế trục tung biểu đồ hiển thị giá trị thực VND (bắt đầu đúng bằng tổng vốn đầu tư, ví dụ 100.000.000 VND), tích hợp con trỏ chữ thập (crosshair) trục kép X/Y hiển thị đồng thời ngày giao dịch, giá trị danh mục và số tiền lãi/lỗ tuyệt đối.
2. **Hệ thống Design Tokens phong cách Forest/Paper và Font tự lưu trữ:**  
   Em đã trực tiếp xây dựng file `demo/tokens.css` và `demo/typography.css`, sử dụng bộ đôi font chữ cao cấp hỗ trợ trọn vẹn tiếng Việt có dấu: **Be Vietnam Pro** (cho các tiêu đề và văn bản đọc) và **Fraunces** (cho các số liệu tài chính nổi bật). Toàn bộ 30 biến thể font được lưu trữ nội bộ (self-hosted) trong mã nguồn, giúp ứng dụng hiển thị tuyệt đẹp ngay cả khi không có kết nối Internet và loại bỏ hiện tượng giật vỡ chữ (FOUT - Flash of Unstyled Text).
3. **Tái cấu trúc Điều hướng 7 Trang độc lập và Trực quan hóa Lũy tiến:**  
   Em là người đề xuất và thiết kế thanh điều hướng trên đỉnh (Top Navigation Bar) thay thế cho thanh điều hướng bên cạnh (Sidebar) cồng kềnh cũ. Em phân bổ luồng trải nghiệm thành 7 màn hình chuyên biệt (`/`, `/portfolio`, `/analysis`, `/optimize`, `/simulation`, `/method`, `/account`). Ở mỗi màn hình, các chỉ số cốt lõi được đặt trong thẻ nổi bật (Metric Cards) ở phía trên, tiếp theo là biểu đồ trực quan, và các bảng dữ liệu chi tiết cùng giải thích toán học được đặt ở phía dưới hoặc trong các khối có thể mở rộng (expandable details).

---

## 3. Những việc đã thực sự làm

### 3.1. Nghiên cứu người dùng mục tiêu và Lên bản vẽ khung dây (Week 1 & Week 2)
- Tham gia phỏng vấn người dùng giả định để xác định nhu cầu tiếp nhận thông tin tại [WEEK1.md](../WEEK1.md). Nhận diện nỗi đau: người dùng thường bối rối trước những bảng số liệu dày đặc mà không có điểm nhấn thị giác.
- Vẽ bản thảo khung dây (Wireframe) sơ bộ cho màn hình Dashboard phân tích danh mục tại [WEEK2.md](../WEEK2.md), xác định các khối hiển thị cốt lõi: Khối tổng quan vốn, Khối biểu đồ tăng trưởng, Khối bảng đóng góp lợi nhuận và Khối cảnh báo rủi ro.

### 3.2. Thiết lập Mẫu giải thích Kết quả và Phân cấp Thông tin (Week 5)
- Soạn thảo mục 6 trong tài liệu [WEEK5.md](../WEEK5.md), thiết lập **Quy chuẩn giải thích kết quả đầu ra (Output Explanation Design)**:
  - Mọi nhận định tự động đều phải đi kèm 5 yếu tố: Kết quả $\to$ Nguyên nhân $\to$ Ý nghĩa $\to$ Gợi ý hành động $\to$ Giới hạn dữ liệu.
  - Thiết lập quy tắc màu sắc nghiêm ngặt: Tuyệt đối không dùng màu xanh lá/đỏ một cách tùy tiện để quy kết "tốt/xấu" nếu chưa có chuẩn mực định lượng rõ ràng. Màu xanh biểu thị đóng góp dương, màu đỏ biểu thị đóng góp âm, màu xám biểu thị trạng thái trung tính hoặc chưa phân loại.
- Thu thập và chuẩn hóa các mẫu giao diện tham khảo trên Google Drive, đưa ra các yêu cầu tinh chỉnh phù hợp với phạm vi Core MVP (loại bỏ các nút chức năng giả lập như "Giao dịch ngay" hay "Kết nối môi giới").

### 3.3. Xây dựng Hệ thống Design Tokens và Typography Tiếng Việt (Week 6)
- Trực tiếp lập trình file `demo/tokens.css`:
  - Định nghĩa bảng màu chủ đạo **Forest & Paper Theme**: Màu xanh rừng đậm (`--color-forest-deep: #1A3026`) tượng trưng cho sự bền vững tài chính, kết hợp màu nền giấy ngà (`--color-paper-base: #F8F7F3`) giúp giảm mỏi mắt khi đọc số liệu thời gian dài.
  - Định nghĩa hệ thống thang đo khoảng cách (spacing scale: 4px, 8px, 12px, 16px, 24px, 32px), bo góc (border radius) và bóng đổ tinh tế (box shadows).
- Lập trình file `demo/typography.css`: Tích hợp các bộ font tự lưu trữ Be Vietnam Pro và Fraunces, định nghĩa thứ bậc kiểu chữ từ H1 đến Caption và định dạng số liệu tài chính đơn cách (tabular monospace figures) giúp các cột số luôn thẳng hàng.

### 3.4. Trực quan hóa Biểu đồ Native SVG và Bảng nhiệt Attribution (Week 7)
- Phối hợp cùng Lead Developer trong file `demo/chart-utils.mjs`:
  - Thiết kế đồ họa vector SVG cho biểu đồ đường tăng trưởng danh mục: đường chính màu xanh rừng đậm thể hiện danh mục thực tế, đường nét đứt màu xám thể hiện benchmark VN30, và đường màu hổ phách thể hiện phương án tối ưu hóa tham chiếu.
  - Thiết kế hộp chú giải (Tooltip) thông minh: tự động tính toán vị trí con trỏ chuột, tự động lật hướng (flip left/right/top/bottom) khi con trỏ tiến sát mép màn hình để đảm bảo thông tin không bao giờ bị che khuất.
  - Thiết kế bảng nhiệt đóng góp lợi nhuận (Attribution Heatmap): các ô có mức đóng góp cao được phủ lớp màu nền đậm nhạt theo cường độ tỷ lệ phần trăm, giúp người dùng nhận diện ngay mã cổ phiếu dẫn dắt danh mục chỉ trong 3 giây đầu tiên.

### 3.5. Tối ưu hóa Giao diện Thích ứng và Khả năng Truy cập (Week 7)
- Viết file `demo/redesign.css` và `demo/product.css`:
  - Thiết lập 3 điểm ngắt giao diện (Breakpoints): Mobile (375px), Tablet (768px), và Desktop (1440px).
  - Tối ưu hóa bảng dữ liệu dài: thiết lập cơ chế cuộn ngang nội bộ (internal horizontal scroll) có bóng mờ báo hiệu ở mép bảng, đảm bảo trang web không bị lỗi tràn màn hình ngang (horizontal body overflow) trên điện thoại di động.
  - Hỗ trợ đầy đủ phím điều hướng (Accessibility): người dùng có thể dùng phím Tab để di chuyển qua các trường nhập liệu, dùng phím mũi tên để chọn mã cổ phiếu trong danh sách gợi ý và đóng danh sách bằng phím Escape.

---

## 4. Bảng tổng hợp File, Giao diện và Đóng góp thiết kế cụ thể

| Hạng mục thiết kế | Vai trò trực quan & Chức năng cụ thể | File minh chứng | Cách thức kiểm tra / Nghiệm thu |
| :--- | :--- | :--- | :--- |
| **Hệ thống Design Tokens** | Bảng màu Forest/Paper, biến khoảng cách, bán kính bo góc, hiệu ứng nổi khối | [tokens.css](../../demo/tokens.css) | Mở kiểm tra CSS variables trong DevTools trình duyệt |
| **Typography Tiếng Việt** | Bộ font tự lưu trữ Be Vietnam Pro & Fraunces, hỗ trợ số liệu thẳng hàng (tabular) | [typography.css](../../demo/typography.css) | `node --test demo/typography.test.mjs` (Pass 100%) |
| **Bản vẽ Khung dây & Mẫu UI** | Wireframes và mẫu thiết kế trực quan trên Google Drive | [WEEK5.md](../WEEK5.md) (mục 7) | Đối chiếu liên kết Google Drive trong WEEK5.md |
| **Giao diện Toàn diện Final** | CSS tinh chỉnh toàn diện cho 7 màn hình, bảng nhiệt heatmap, metric cards | [redesign.css](../../demo/redesign.css), [product.css](../../demo/product.css) | Mở giao diện trực tiếp tại [g09-finfolio.vercel.app](https://g09-finfolio.vercel.app/) |
| **Trực quan Biểu đồ SVG** | Đồ họa biểu đồ PnL giá trị thực VND, crosshair 2 trục X/Y, tooltip lật hướng | [chart-utils.mjs](../../demo/chart-utils.mjs) | `node --test demo/chart-utils.test.mjs` |
| **Thanh Điều hướng 7 Trang** | Top Navigation bar responsive, chuyển đổi mượt mà giữa các tab chức năng | [navigation.mjs](../../demo/navigation.mjs), [index.html](../../demo/index.html) | Kiểm tra chuyển tab trên điện thoại 375px |

---

## 5. Bằng chứng đóng góp theo 7 tuần dự án

| Tuần | Ghi nhận trong tiến trình nhóm | Output cụ thể được xác nhận | Ý nghĩa đóng góp cá nhân |
| :---: | :--- | :--- | :--- |
| **W1** | Ngọc Anh phân tích hành vi tiếp nhận thông tin của nhà đầu tư cá nhân. | [WEEK1.md](../WEEK1.md) (Target User Needs) | Định hướng việc trực quan hóa phải phục vụ mục tiêu đơn giản hóa số liệu. |
| **W2** | Ngọc Anh phác thảo cấu trúc thông tin của bản tóm tắt phân bổ (Brief). | [WEEK2.md](../WEEK2.md) (Information Hierarchy) | Xác định thứ tự ưu tiên hiển thị thông tin từ tổng quan đến chi tiết. |
| **W3** | Ngọc Anh rà soát luồng tương tác từ dữ liệu đầu vào đến bảng kết quả đầu ra. | [WEEK3.md](../WEEK3.md) (Input-Output Trace) | Đảm bảo mỗi trường dữ liệu người dùng nhập đều có vị trí hiển thị tương ứng. |
| **W4** | Ngọc Anh thiết kế cấu trúc trình bày so sánh trước và sau tối ưu hóa. | [WEEK4.md](../WEEK4.md) (Comparison Screen Draft) | Tạo tiền đề cho giao diện đối chiếu danh mục hiện tại và danh mục tham chiếu. |
| **W5** | Ngọc Anh xây dựng quy chuẩn giải thích kết quả và hoàn thiện hai mẫu PNG trên Drive. | [WEEK5.md](../WEEK5.md) (Visual Drafts & Output Design)| Đưa ra diện mạo hình ảnh chính thức đầu tiên của Finfolio 2.0. |
| **W6** | Ngọc Anh xây dựng hệ thống tokens.css và typography tự lưu trữ Be Vietnam Pro. | `demo/tokens.css`, `demo/typography.css` | Nâng cấp toàn diện tính chuyên nghiệp và thẩm mỹ cho ứng dụng demo. |
| **W7** | Ngọc Anh hoàn thiện biểu đồ Native SVG, giao diện responsive 375px/768px/1440px. | [WEEK7.md](../WEEK7.md), Release `v2.0.0-final-20261023` | Đảm bảo trải nghiệm người dùng hoàn hảo trên mọi thiết bị và nền tảng. |

---

## 6. Hạn chế còn tồn tại và Bài học kinh nghiệm

### 6.1. Hạn chế về mặt thiết kế giao diện
- **Bảng dữ liệu nhiều cột vẫn đòi hỏi thao tác cuộn trên màn hình nhỏ:** Khi danh mục có trên 10 tài sản và người dùng bật hiển thị đầy đủ các cột (Vốn, Tỷ trọng, Lợi nhuận, Đóng góp lợi nhuận, Rủi ro Euler, Đóng góp FX), người dùng mobile vẫn phải cuộn ngang để xem hết các số liệu chi tiết.
- **Các bảng attribution nhiều chiều vẫn cần kiểm thử khả dụng:** Khi người dùng chuyển giữa instrument, asset class, sector và industry, nhãn dài có thể làm bảng dày hoặc buộc cuộn trên màn hình nhỏ.

### 6.2. Bài học kinh nghiệm cá nhân
- **"Form follows function" trong thiết kế sản phẩm tài chính:** Thiết kế giao diện tài chính không phải là vẽ tranh nghệ thuật; vẻ đẹp thực sự của UI/UX Fintech nằm ở sự chính xác của số liệu, tính rõ ràng của đơn vị đo lường và khả năng dẫn dắt người dùng đến quyết định đúng đắn mà không gây hiểu lầm.
- **Tôn trọng người dùng thông qua khả năng tiếp cận (Accessibility):** Việc hỗ trợ thao tác hoàn toàn bằng bàn phím và giữ độ tương phản màu sắc đạt chuẩn WCAG AA là yêu cầu tối thiểu đối với một sản phẩm tài chính đáng tin cậy.


