# BÁO CÁO ĐỀ CƯƠNG THUYẾT TRÌNH NHÓM VÀ SƯỜN NỘI DUNG SLIDE DECK
## DỰ ÁN: FINFOLIO 2.0 — PORTFOLIO ATTRIBUTION & RISK ANALYTICS

---

### THÔNG TIN DỰ ÁN & HỘI ĐỒNG THẨM ĐỊNH
* **Học phần:** Ứng dụng Công nghệ Thông tin trong Tài chính - Ngân hàng (Mã học phần: NHA408E)
* **Khóa đào tạo:** Khóa 63 (K63) — Trường Đại học Ngoại thương (FTU)
* **Nhóm thực hiện:** Nhóm G09
* **Sản phẩm bàn giao:** Hệ thống phân tích quy kết lợi nhuận và chẩn đoán rủi ro danh mục đa tài sản Finfolio 2.0
* **Repository chính thức:** [https://github.com/FTU-Legacy-63/G09](https://github.com/FTU-Legacy-63/G09) (Bản phát hành đánh giá: `v2.0.0-final-20261023`)
* **Địa chỉ triển khai (Production URL):** [https://g09-finfolio.vercel.app/](https://g09-finfolio.vercel.app/)
* **Kết quả kiểm thử tự động:** 85/85 tests passed (50 JavaScript tests + 35 Python unit tests)

### DANH SÁCH THÀNH VIÊN VÀ PHÂN CÔNG THUYẾT TRÌNH

| STT | Họ và tên | Mã sinh viên | Vai trò dự án | Phần thuyết trình phụ trách | Thời lượng dự kiến |
| :---: | :--- | :---: | :--- | :--- | :---: |
| 1 | **Hoàng Khánh Linh** | 2412380024 | Product Owner / Financial Logic | Bài toán, phạm vi, Return/Euler/FX và claim boundary (Slides 2, 8–9) | 3 phút 00 giây |
| 2 | **Nguyễn Quỳnh Anh** | 2413380010 | Product Manager / Flow & QA | Luồng nghiệp vụ, acceptance tests, bug governance (Slides 3, 6, 15) | 3 phút 00 giây |
| 3 | **Lê Bảo An** | 2412380002 | Lead Developer / Build & DevOps | Tối ưu hóa, Monte Carlo, kiến trúc và phần tính toán trong demo (Slides 10–11, 13–14) | 3 phút 00 giây |
| 4 | **Trần Minh Ngọc** | 2412380036 | Business Analyst / Data Lead | Input schema, scope dữ liệu, nguồn, benchmark/currency/alignment (Slides 4–5, 7) | 3 phút 00 giây |
| 5 | **Nguyễn Ngọc Anh** | 2413380008 | UI/UX Designer / IA Lead | Mở đầu, design system, thao tác giao diện trong demo, footprint và tổng kết (Slides 1, 12, 14, 16–18) | 3 phút 00 giây |

> **Nguyên tắc chia đều:** mỗi thành viên có 3 phút và trả lời câu hỏi trong đúng workstream mình sở hữu. Slide 14 là demo phối hợp: Ngọc Anh điều khiển luồng giao diện; Bảo An giải thích engine, optimizer và Monte Carlo. Phần phối hợp này không làm thay đổi ownership trong Individual Footprint.

---

# PHẦN I: TỔNG QUAN CHIẾN LƯỢC VÀ THÔNG ĐIỆP DỰ ÁN

### 1. Thông điệp cốt lõi (Core Thesis)
Finfolio 2.0 không phải là một bảng theo dõi giá thụ động, không phải là một con bot khuyến nghị mua bán cổ phiếu, và không tự nhận là hệ thống dự báo thị trường tương lai.  
Finfolio 2.0 là **Hệ thống chẩn đoán định lượng và hỗ trợ ra quyết định (Quantitative Diagnostic & Decision-Support System)** dành riêng cho nhà đầu tư cá nhân tự quản lý danh mục đa tài sản (Cổ phiếu Việt Nam, Cổ phiếu quốc tế, Quỹ ETF hàng hóa đại diện). Sản phẩm giải quyết trọn vẹn 3 câu hỏi sống còn:
1. *Lợi nhuận thực chất đang đến từ đâu?* (Phân rã theo mã tài sản, nhóm ngành, và biến động tỷ giá FX).
2. *Rủi ro danh mục đang tập trung ở đâu?* (Đo lường rủi ro biên và phân rã Euler Covariance thay vì độ lệch chuẩn đơn lẻ).
3. *Một phương án phân bổ tham chiếu có cải thiện trade-off Lợi nhuận - Rủi ro hay không?* (Tối ưu hóa lồi có ràng buộc lỏng/chặt và mô phỏng Bootstrap Monte Carlo 2.000 kịch bản).

### 2. Sự kế thừa và Bước nhảy vọt so với Khóa K62 (Finfolio 1.0)
Năm ngoái, nhóm G09 khóa K62 đã phát triển phiên bản Finfolio 1.0 ([https://github.com/FTU-Legacy-62/G09](https://github.com/FTU-Legacy-62/G09)) với giao diện dashboard tổng hợp. Kế thừa tinh thần đó, Finfolio 2.0 của K63 đã thực hiện cuộc cách mạng toàn diện:
- **Từ 1 Dashboard gộp $\to$ 7 Màn hình chuyên sâu:** Tách biệt hoàn toàn luồng phân tích (`/analysis`), tối ưu hóa (`/optimize`), mô phỏng (`/simulation`), và nhật ký tài khoản (`/account`).
- **Từ Heuristic thô sơ $\to$ Thuật toán tối ưu hóa Frank-Wolfe:** Giải bài toán tối ưu hóa lồi với các ràng buộc trần tỷ trọng từng mã và trần hàng hóa một cách toán học chính xác, không vi phạm biên khả thi.
- **Từ Phân phối chuẩn $i.i.d.$ $\to$ Joint Moving-Block Bootstrap Monte Carlo:** Giữ nguyên cấu trúc tương quan chéo và hiện tượng biến động cụm/đuôi béo của thị trường tài chính Việt Nam.
- **Từ Yahoo Finance lỗi thời $\to$ Pipeline lai TradingView + Yahoo:** Tự động hóa cập nhật nến ngày của 26 mã nòng cốt qua GitHub Actions lúc 16:17 và 20:47 hàng ngày, căn chỉnh lệch múi giờ giữa HOSE và NYSE.
- **Hệ thống bảo vệ bằng 85 Automated Tests:** Đảm bảo mọi đẳng thức tài chính đều được nghiệm thu bằng máy tính.

---

# PHẦN II: SƯỜN NỘI DUNG CHI TIẾT 18 SLIDES THUYẾT TRÌNH

---

### SLIDE 1: TRANG TIÊU ĐỀ & GIỚI THIỆU DỰ ÁN
* **Tiêu đề Slide:** FINFOLIO 2.0 — PORTFOLIO ATTRIBUTION & RISK ANALYTICS
* **Mục đích:** Tạo ấn tượng chuyên nghiệp đầu tiên, khẳng định định danh nhóm G09 K63, công bố địa chỉ sản phẩm live.
* **Bố cục gợi ý:** Thiết kế nền tối màu Forest Green (`#1A3026`) kết hợp chữ ngà Paper (`#F8F7F3`). Logo Finfolio ở trung tâm, bên phải là thông tin nhóm và QR Code quét link Vercel production.
* **Nội dung chính trên Slide:**
  * Sản phẩm: Hệ thống phân tích quy kết lợi nhuận và chẩn đoán rủi ro danh mục đa tài sản.
  * Học phần: NHA408E — Ứng dụng CNTT trong Tài chính - Ngân hàng.
  * Nhóm thực hiện: Group 09 (G09) — Lớp K63.
  * Đường dẫn trực tiếp: `https://g09-finfolio.vercel.app/`
  * Bản phát hành nghiệm thu: `v2.0.0-final-20261023` (85 automated tests pass).
* **Lời thoại thuyết trình (Speaker Script - Nguyễn Ngọc Anh):**
  > "Kính thưa Thầy và toàn thể các bạn sinh viên, em là Nguyễn Ngọc Anh, thành viên nhóm G09 khóa K63. Hôm nay, nhóm chúng em xin được báo cáo và bảo vệ sản phẩm học phần: **Finfolio 2.0 — Portfolio Attribution & Risk Analytics**. Sản phẩm đã được triển khai trên Vercel và có bộ bằng chứng kiểm thử trong repository. Sau đây, em xin mời bạn Hoàng Khánh Linh trình bày bài toán và định hướng sản phẩm."

---

### SLIDE 2: TỔNG QUAN ĐIỀU HÀNH (EXECUTIVE SUMMARY)
* **Tiêu đề Slide:** BẢN TÓM TẮT ĐIỀU HÀNH DỰ ÁN
* **Mục đích:** Cung cấp bức tranh toàn cảnh 30 giây để giảng viên nắm trọn vẹn kết quả đầu ra trước khi đi vào chi tiết.
* **Bố cục gợi ý:** Bố cục chia 3 cột thẻ (Cards): 1. Nỗi đau thị trường $\to$ 2. Giải pháp công nghệ $\to$ 3. Kết quả nghiệm thu thực tế.
* **Nội dung chính trên Slide:**
  * **Vấn đề cốt lõi:** Nhà đầu tư cá nhân nhìn thấy lãi/lỗ từng mã nhưng "mù mờ" về nguồn gốc lợi nhuận và mức độ tập trung rủi ro ở cấp độ danh mục.
  * **Giải pháp Finfolio 2.0:** Xây dựng công cụ chuyển đổi danh mục thực tế thành báo cáo *Risk & Return Allocation Brief* với 3 trục phân tích: Phân rã Euler Risk, Tối ưu hóa ràng buộc Frank-Wolfe, và Mô phỏng Bootstrap Monte Carlo.
  * **Chỉ số năng lực:** Xử lý danh mục từ 2 đến 30 tài sản đa thị trường; thời gian phân tích dưới 300ms; kiến trúc đa luồng Web Worker 60fps; 100% dữ liệu thị trường nến ngày thật từ TradingView và Yahoo Finance.
* **Lời thoại thuyết trình (Hoàng Khánh Linh):**
  > "Để bắt đầu, em xin tóm lược dự án trong 3 điểm chính: Thứ nhất, dự án xuất phát từ một nỗi đau rất thực tế của nhà đầu tư cá nhân: chúng ta biết mình lãi bao nhiêu tiền, nhưng không biết chính xác rủi ro đang nằm ở đâu. Thứ hai, Finfolio 2.0 giải quyết vấn đề này bằng việc đưa các mô hình toán tài chính hiện đại vốn chỉ có trên Bloomberg về một nền tảng web trực quan, dễ tiếp cận. Và thứ ba, sản phẩm đã hoàn thiện trọn vẹn từ logic toán học, pipeline dữ liệu tự động cho đến giao diện người dùng hoàn chỉnh."

---

### SLIDE 3: ĐẶC TẢ BÀI TOÁN & NGƯỜI DÙNG MỤC TIÊU (PROBLEM & TARGET USER)
* **Tiêu đề Slide:** BÀI TOÁN THỰC TẾ & CHÂN DUNG NGƯỜI DÙNG
* **Mục đích:** Chứng minh tính cần thiết của dự án, làm rõ 4 khó khăn cốt lõi và xác định ranh giới người dùng mục tiêu.
* **Bố cục gợi ý:** Bên trái là mô tả chân dung người dùng (Avatar + Persona), bên phải là 4 khối màu đỏ thể hiện 4 rào cản nhận thức (Cognitive Biases/Deficits).
* **Nội dung chính trên Slide:**
  * **Target User:** Nhà đầu tư cá nhân có kiến thức tài chính nền tảng, đang tự quản lý danh mục cổ phiếu Việt Nam kết hợp các quỹ ETF hàng hóa proxy.
  * **4 Thách thức cấp độ toàn danh mục (Portfolio-level Deficits):**
    1. *Return Attribution Deficit:* Không bóc tách được lợi nhuận đến từ cổ phiếu, nhóm ngành hay biến động tỷ giá FX.
    2. *Risk Concentration Blindness:* Cổ phiếu chiếm 20% vốn có thể đóng góp tới 50% tổng độ biến động danh mục do hiệu ứng hiệp phương sai.
    3. *Benchmark Comparison Gap:* Thiếu mốc so sánh đồng bộ trên cùng chuỗi ngày giao dịch với VN30 Index.
    4. *Allocation Dilemma:* Thiếu căn cứ định lượng để quyết định tái phân bổ danh mục nhằm cải thiện tỷ số lợi nhuận/rủi ro.
* **Lời thoại thuyết trình (Nguyễn Quỳnh Anh):**
  > "Thưa Thầy, hầu hết các ứng dụng chứng khoán hiện nay tại Việt Nam đều dừng lại ở việc hiển thị bảng giá và lãi/lỗ từng mã riêng rẽ. Khi một nhà đầu tư nắm giữ 40% FPT, 35% HPG và 25% quỹ vàng GLD, họ đối mặt với một khoảng trống nhận thức rất lớn: Liệu HPG có đang tạo ra quá nhiều rủi ro so với lợi nhuận mang lại? Việc nắm giữ vàng GLD định giá bằng USD giúp phòng vệ rủi ro hay làm phát sinh thêm rủi ro tỷ giá? Finfolio 2.0 ra đời chính là để trả lời những câu hỏi này một cách định lượng."

---

### SLIDE 4: CHUỖI SUY LUẬN GIẢI PHÁP (SOLUTION ARCHITECTURE)
* **Tiêu đề Slide:** CHUỖI SUY LUẬN GIẢI PHÁP: TỪ NHẬP LIỆU ĐẾN HÀNH ĐỘNG
* **Mục đích:** Minh họa quy trình xử lý khép kín của sản phẩm theo đúng chỉ đạo của giảng viên tại ghi chú ngày 09/09/2026.
* **Bố cục gợi ý:** Sơ đồ dòng chảy (Flowchart) nằm ngang với 7 trạm kết nối: `Input → Validate → Attribute → Benchmark → Optimize → Simulate → Decision`.
* **Nội dung chính trên Slide:**
  * **Input:** Danh mục nắm giữ (Mã, Số lượng/Giá trị, Đồng tiền VND/USD), Benchmark tham chiếu, Giới hạn tỷ trọng.
  * **Engine:** Căn ngày giao dịch chung $\to$ Chuẩn hóa về VND $\to$ Bóc tách đóng góp Euler $\to$ Tối ưu hóa Frank-Wolfe $\to$ Bootstrap Monte Carlo.
  * **Output:** *Risk and Return Allocation Brief* cung cấp góc nhìn đa chiều: Phân bổ hiện tại vs Tham chiếu, Đóng góp lợi nhuận, Ma trận tương quan, Rủi ro đuôi VaR/CVaR.
  * **Action:** Người dùng tự tin đưa ra quyết định: Giữ nguyên danh mục hoặc Tái phân bổ dựa trên bằng chứng toán học, ghi nhận vào Nhật ký Quyết định.
* **Lời thoại thuyết trình (Trần Minh Ngọc):**
  > "Tuân thủ chỉ đạo của Thầy trong buổi trao đổi đầu kỳ: 'Một sản phẩm công nghệ tài chính phải có một mạch tư duy hoàn chỉnh từ Input qua Công thức tới Output và Quyết định', slide này thể hiện trọn vẹn chuỗi suy luận của Finfolio 2.0. Hệ thống không tạo ra các dashboard rời rạc, mà xâu chuỗi thông tin để dẫn dắt nhà đầu tư từ việc nhận diện cấu trúc danh mục, thấu hiểu rủi ro tiềm ẩn, xem xét kịch bản tối ưu tham chiếu và cuối cùng là tự mình đưa ra quyết định có trách nhiệm."

---

### SLIDE 5: PHẠM VI SẢN PHẨM: CORE MVP VS FINAL RELEASE
* **Tiêu đề Slide:** RANH GIỚI PHẠM VI: BẢN CORE MVP ĐỐI CHIẾU FINAL RELEASE
* **Mục đích:** Làm rõ tính kỷ luật trong quản trị phạm vi sản phẩm (Scope Governance), so sánh bước tiến giữa các tuần.
* **Bố cục gợi ý:** Bảng so sánh 2 cột: Cột 1 là Core MVP (Tuần 5) và Cột 2 là Bản phát hành Final v2.0 (Tuần 7) kèm các nhãn trạng thái (Badges).
* **Nội dung chính trên Slide:**

| Khía cạnh | Core MVP (Week 5 Baseline) | Final Release v2.0 (Week 7 Deliverable) |
| :--- | :--- | :--- |
| **Universe tài sản** | Cổ phiếu VN + 1 Hàng hóa (GLD) | Cổ phiếu VN + Quốc tế USD + 23 Hàng hóa Proxies + Crypto |
| **Kiến trúc trang** | 1 Màn hình Dashboard đơn lẻ | 7 URL chuyên biệt (`/portfolio`, `/analysis`, `/optimize`,...) |
| **Phương pháp tối ưu** | Tìm kiếm lưới thô sơ 1% | Thuật toán lồi Frank-Wolfe (Min-Vol) + Max-Sharpe đa điểm |
| **Phân tích rủi ro** | Độ lệch chuẩn lịch sử | Euler Decomposition + Sortino + VaR 95% + Expected Shortfall |
| **Mô phỏng tương lai**| Không có (Deferred) | Joint Moving-Block Bootstrap Monte Carlo (2.000 paths) |
| **Nguồn dữ liệu** | Yahoo Finance (bất ổn định) | Pipeline lai: TradingView (VN) + yfinance (Quốc tế/FX) |
* **Lời thoại thuyết trình (Trần Minh Ngọc chuyển lời cho Nguyễn Quỳnh Anh):**
  > "Ở giai đoạn giữa kỳ, nhóm đã cam kết bảo vệ phạm vi Core MVP ở mức độ khả thi cao nhất. Và đến giai đoạn cuối kỳ này, như Thầy có thể thấy trên bảng so sánh, nhóm đã mở rộng sản phẩm thành một phiên bản Final hoàn chỉnh với 7 không gian làm việc chuyên biệt, thuật toán tối ưu hóa Frank-Wolfe và mô phỏng Bootstrap ngẫu nhiên. Sau đây, em xin mời bạn Nguyễn Quỳnh Anh trình bày chi tiết về luồng nghiệp vụ và quy trình kiểm thử của sản phẩm."

---

### SLIDE 6: ĐẶC TẢ LUỒNG NGƯỜI DÙNG & CƠ CHẾ BẢO VỆ PHÒNG THỦ (USER FLOW)
* **Tiêu đề Slide:** ĐẶC TẢ LUỒNG NGƯỜI DÙNG & KIỂM TRA PHÒNG THỦ
* **Mục đích:** Chứng minh tính chặt chẽ trong thiết kế tương tác người dùng, xử lý triệt để 3 nhánh (Happy, Alternative, Error paths).
* **Bố cục gợi ý:** Sơ đồ rẽ nhánh trạng thái (State Diagram) thể hiện cơ chế chặn lỗi 2 tầng: Inline Validation và Pre-run Sufficiency Check.
* **Nội dung chính trên Slide:**
  * **Happy Path:** Nhập danh mục hợp lệ $\to$ Tải dữ liệu thành công $\to$ Xem báo cáo Brief $\to$ Thử tối ưu hóa $\to$ Chạy mô phỏng $\to$ Lưu nhật ký.
  * **Alternative Paths:** Nhập tỷ trọng thay vì số lượng vốn; Dữ liệu phiên mới nhất chưa có do ngày nghỉ $\to$ Sử dụng phiên gần nhất có dữ liệu (Latest Available Session) và hiển thị cảnh báo; Tự động điền lãi suất phi rủi ro mặc định 3.0%/năm.
  * **Error Paths (Chặn lỗi chủ động):**
    * *Mã không tồn tại:* Báo đỏ ngay tại ô nhập liệu, khóa nút phân tích.
    * *Dữ liệu dưới ngưỡng:* Chặn tính toán nếu dưới 60 phiên chung; ẩn tối ưu hóa nếu dưới $\max(120, 10N)$ phiên.
    * *Ràng buộc xung đột:* Phát hiện trần tỷ trọng không khả thi (VD: 3 mã nhưng đặt trần 20%), hiển thị cảnh báo toán học.
* **Lời thoại thuyết trình (Nguyễn Quỳnh Anh):**
  > "Kính thưa Thầy, một trong những nguyên tắc cốt lõi khi thiết kế Finfolio 2.0 là tính phòng thủ dữ liệu (Defensive Architecture). Chúng em không cho phép người dùng nhập dữ liệu sai để rồi làm sập backend tính toán phía sau. Giao diện được trang bị cơ chế kiểm tra 2 lớp: Lớp 1 kiểm tra cú pháp và điều kiện khả thi của ràng buộc ngay tại form. Lớp 2 kiểm tra độ đủ của dữ liệu lịch sử trước khi gọi thuật toán. Nhờ đó, trải nghiệm người dùng luôn thông suốt và không bao giờ gặp lỗi tính toán số ảo."

---

### SLIDE 7: QUẢN TRỊ DỮ LIỆU & CĂN CHỈNH ĐA THỊ TRƯỜNG (DATA PROVENANCE)
* **Tiêu đề Slide:** QUẢN TRỊ NGUỒN DỮ LIỆU & ĐỒNG BỘ ĐA THỊ TRƯỜNG
* **Mục đích:** Giải thích cách giải quyết bài toán hóc búa nhất: lệch múi giờ, lệch ngày nghỉ giữa TTCK Việt Nam và Mỹ.
* **Bố cục gợi ý:** Sơ đồ kiến trúc dữ liệu lai (Hybrid Architecture): TradingView nạp cổ phiếu VN $\to$ Yahoo nạp quốc tế $\to$ Thuật toán Inner Join căn ngày chung $\to$ Snapshot tự động qua GitHub Actions.
* **Nội dung chính trên Slide:**
  * **Kiến trúc nguồn lai (Hybrid Sourcing):**
    * *Thị trường Việt Nam:* 26 mã nòng cốt + VN30/VNINDEX lấy trực tiếp từ TradingView qua `tvdatafeed`.
    * *Thị trường Quốc tế:* Lấy giá đóng cửa USD của ETF/Commodity và tỷ giá `VND=X` từ Yahoo Finance.
  * **Đồng bộ hóa phiên giao dịch chung (Common Session Alignment):**
    * Thực hiện phép giao (Inner Join) các ngày giao dịch chung có đầy đủ giá và tỷ giá.
    * Quy đổi vốn ngoại tệ tại tỷ giá của phiên giao dịch chung đầu tiên ($T_0$).
  * **Giám sát tính tươi mới (Freshness Monitoring):**
    * Cron job GitHub Actions chạy lúc **16:17 và 20:47 VN** (sau giờ đóng cửa sàn HOSE).
    * Endpoint `/api/data-status` kiểm tra tính tươi mới mỗi 15 phút mà không lưu trữ thông tin danh mục cá nhân.
* **Lời thoại thuyết trình (Trần Minh Ngọc):**
  > "Kính thưa Thầy, ở tuần 3, nhóm đã đối mặt với một thách thức kỹ thuật lớn: nguồn dữ liệu Yahoo Finance ngừng hỗ trợ chuỗi giá của chỉ số VN-Index, đồng thời TTCK Việt Nam và Mỹ lệch múi giờ và khác biệt hoàn toàn về lịch nghỉ lễ. Để giải quyết triệt để, em đã thiết kế pipeline dữ liệu lai: sử dụng TradingView lấy nến ngày chính xác của cổ phiếu Việt Nam ngay sau 15:00, và sử dụng thuật toán Inner Join để chỉ tính toán trên các phiên giao dịch mà cả hai thị trường đều mở cửa. Điều này đảm bảo tính đồng pha thời gian tuyệt đối cho ma trận hiệp phương sai."

---

### SLIDE 8: NỀN TẢNG TOÁN TÀI CHÍNH I: LỢI NHUẬN & PHÂN RÃ TỶ GIÁ FX
* **Tiêu đề Slide:** NỀN TẢNG TOÁN HỌC: LỢI NHUẬN & PHÂN RÃ HIỆU ỨNG TỶ GIÁ
* **Mục đích:** Chứng minh tính chính xác học thuật của công thức tính giá trị danh mục mua và giữ và mô hình phân rã FX 3 thành phần.
* **Bố cục gợi ý:** Nửa trên là công thức toán học và chứng minh đẳng thức nghiệm thu, nửa dưới là ví dụ số học trực quan với FPT, HPG và GLD.
* **Nội dung chính trên Slide:**
  * **Giá trị danh mục Buy-and-Hold:**
    $$V_t = \sum_{i=1}^N q_i \cdot P_{i,t} \cdot FX_{i,t} \quad \implies \quad R_P = \frac{V_T}{V_0} - 1 = \sum_{i=1}^N w_{i,0} \cdot r_{i,\text{period}}$$
  * **Phân rã Đóng góp Lợi nhuận Tuyệt đối (Absolute Return Attribution):**
    $$\text{Contribution}_i = w_{i,0} \cdot r_{i,\text{period}} \quad \text{với điều kiện nghiệm thu:} \quad \sum_{i=1}^N \text{Contribution}_i = R_P$$
  * **Mô hình Phân rã FX 3 thành phần (CFA Institute Standards):**
    $$r_{VND} = (1 + r_{\text{local}})(1 + r_{FX}) - 1 = \underbrace{w_i \cdot r_{\text{local}}}_{\text{Đóng góp Giá}} + \underbrace{w_i \cdot r_{FX}}_{\text{Đóng góp Tỷ giá}} + \underbrace{w_i \cdot r_{\text{local}} \cdot r_{FX}}_{\text{Tương tác chéo}}$$
* **Lời thoại thuyết trình (Hoàng Khánh Linh):**
  > "Quay trở lại với nền tảng tài chính của sản phẩm: Finfolio 2.0 tuân thủ chuẩn mực tính toán lợi nhuận danh mục mua và giữ (Fixed-quantity Buy-and-Hold). Để bóc tách chính xác tác động của tỷ giá khi nhà đầu tư Việt Nam mua chứng chỉ quỹ vàng GLD niêm yết bằng USD, chúng em áp dụng mô hình phân rã 3 thành phần theo chuẩn CFA Institute: tách riêng lợi nhuận do bản thân giá vàng tăng, lợi nhuận do tỷ giá USD/VND biến động, và phần tương tác chéo giữa hai yếu tố. Tổng của 3 thành phần này luôn khớp chính xác $100\%$ với tỷ suất sinh lời tính bằng tiền đồng của vị thế."

---

### SLIDE 9: NỀN TẢNG TOÁN TÀI CHÍNH II: PHÂN RÃ RỦI RO EULER (EULER ATTRIBUTION)
* **Tiêu đề Slide:** NỀN TẢNG TOÁN HỌC: PHÂN RÃ RỦI RO EULER & COVARIANCE
* **Mục đích:** Trình bày điểm sáng học thuật lớn nhất của dự án: áp dụng Định lý Euler để lượng hóa rủi ro biên.
* **Bố cục gợi ý:** Công thức vi phân rủi ro ở bên trái, đồ thị đối chiếu giữa Tỷ trọng Vốn (Capital Weight) vs Tỷ trọng Rủi ro (Risk Share) ở bên phải.
* **Nội dung chính trên Slide:**
  * **Độ biến động năm hóa danh mục:**
    $$\sigma_P = \sqrt{252 \cdot \mathbf{w}^T \Sigma \mathbf{w}} \quad (\Sigma \text{ là ma trận hiệp phương sai mẫu, mẫu số } n-1)$$
  * **Rủi ro biên (Marginal Contribution to Risk - MCR):**
    $$\text{MCR}_i = \frac{\partial \sigma_P}{\partial w_i} = \frac{(\Sigma \mathbf{w})_i}{\sqrt{\mathbf{w}^T \Sigma \mathbf{w}}}$$
  * **Đóng góp rủi ro Euler (Euler Risk Contribution - RC):**
    $$\text{RC}_i = w_i \cdot \text{MCR}_i \cdot \sqrt{252}$$
  * **Đẳng thức kiểm định Euler (Mathematical Acceptance Identity):**
    $$\sum_{i=1}^N \text{RC}_i = \sigma_P \quad \text{(Chứng minh độ lệch tuyệt đối } < 10^{-10}\text{ trong bộ test)}$$
* **Lời thoại thuyết trình (Hoàng Khánh Linh):**
  > "Thưa Thầy, đóng góp rủi ro không thể được tính bằng cách lấy tỷ trọng nhân với độ lệch chuẩn của từng cổ phiếu, vì làm như vậy sẽ bỏ qua hoàn toàn lợi ích của việc đa dạng hóa danh mục. Dựa trên Định lý Euler cho hàm thuần nhất bậc 1, em đã thiết lập công thức tính đóng góp rủi ro thành phần $RC_i$. Đại lượng này cho nhà đầu tư biết chính xác: trong tổng độ biến động 18.5% của danh mục, FPT đóng góp bao nhiêu điểm phần trăm, HPG đóng góp bao nhiêu điểm phần trăm, có tính đến toàn bộ mối tương quan với các tài sản khác. Đẳng thức tổng các $RC_i$ bằng đúng độ biến động danh mục đã được nhóm chứng minh và kiểm tra tự động trên máy tính."

---

### SLIDE 10: ĐỘNG CƠ TỐI ƯU HÓA PHÂN BỔ CÓ RÀNG BUỘC (OPTIMIZATION ENGINE)
* **Tiêu đề Slide:** ĐỘNG CƠ ĐỊNH LƯỢNG: TỐI ƯU HÓA LỒI FRANK-WOLFE
* **Mục đích:** Giải thích thuật toán tối ưu hóa danh mục, các ràng buộc thực tế và ranh giới cam kết học thuật.
* **Bố cục gợi ý:** Khối phương trình bài toán tối ưu hóa kết hợp biểu đồ so sánh trước/sau (Before-After Bar Chart) của tỷ trọng và rủi ro.
* **Nội dung chính trên Slide:**
  * **Bài toán Độ biến động tối thiểu (Minimum Volatility):**
    $$\min_{\mathbf{w}} \mathbf{w}^T \Sigma \mathbf{w} \quad \text{s.t.} \quad \sum_{i=1}^N w_i = 1, \quad 0 \le w_i \le \text{Cap}_i, \quad \sum_{j \in \text{Commodity}} w_j \le \text{Cap}_{\text{comm}}$$
  * **Bài toán Tỷ số Sharpe tối đa (Maximum Sharpe):**
    $$\max_{\mathbf{w}} \frac{\mathbf{w}^T \boldsymbol{\mu} - r_{f,\text{daily}}}{\sqrt{\mathbf{w}^T \Sigma \mathbf{w}}} \cdot \sqrt{252} \quad \text{với } r_f \text{ mặc định } 3.0\%/\text{năm}$$
  * **Thuật toán Frank-Wolfe (Conditional Gradient):** Giải quyết bài toán lồi có ràng buộc hộp và đơn vị thuần túy bằng JavaScript trên máy khách trong 20ms, loại bỏ sai số heuristic của bản cũ.
  * **Claim Boundary:** Kết quả là *Phương án phân bổ tham chiếu (Reference Allocation)* dựa trên dữ liệu quá khứ, không phải lời khuyên đầu tư.
* **Lời thoại thuyết trình (Lê Bảo An):**
  > "Tại tab Tối ưu hóa, nhóm giải quyết bài toán Markowitz kinh điển dưới các ràng buộc thực tế khắt khe: không bán khống, trần tỷ trọng từng mã tối đa 80%, trần nhóm hàng hóa tối đa 60%. Thay vì sử dụng các thuật toán xấp xỉ thô sơ dễ vi phạm điều kiện biên, bạn Lê Bảo An đã lập trình thuật toán dốc có điều kiện Frank-Wolfe chạy trực tiếp trên trình duyệt. Thuật toán đảm bảo nghiệm luôn hội tụ trên tập lồi simplex, cung cấp cho nhà đầu tư một phương án tham chiếu khoa học để thấy rõ: nếu tái cơ cấu tỷ trọng, độ biến động danh mục có thể giảm được bao nhiêu phần trăm."

---

### SLIDE 11: MÔ PHỎNG NÂNG CAO: JOINT MOVING-BLOCK BOOTSTRAP MONTE CARLO
* **Tiêu đề Slide:** PHÂN TÍCH RỦI RO ĐUÔI & MÔ PHỎNG BOOTSTRAP MONTE CARLO
* **Mục đích:** Giới thiệu tính năng mô phỏng nâng cao của bản Final, khắc phục nhược điểm của giả định phân phối chuẩn.
* **Bố cục gợi ý:** Biểu đồ quạt (Fan Chart) mô phỏng 2.000 kịch bản với dải phân vị $5\% - 95\%$, kèm biểu đồ tần suất (Histogram) phân phối vốn cuối kỳ.
* **Nội dung chính trên Slide:**
  * **Hạn chế của mô hình truyền thống (Geometric Brownian Motion):** Giả định lợi nhuận chuẩn tắc bỏ qua hiện tượng sụp đổ thị trường (Tail risk) và tương quan phi tuyến.
  * **Phương pháp Joint Moving-Block Bootstrap:**
    * Lấy mẫu lại các khối lợi nhuận liên tiếp kích thước $b = 5$ ngày đồng thời trên tất cả các tài sản.
    * Bảo toàn trọn vẹn ma trận tương quan và hiện tượng biến động cụm (volatility clustering).
  * **Tham số mô phỏng:** 2.000 đường chạy qua 252 phiên giao dịch (1 năm tài chính tương lai), xuất phát từ giá trị thực tế tại ngày kết thúc phân tích.
  * **Kết quả lượng hóa:** Trích xuất dải phân vị rủi ro $5\%, 25\%, 50\%, 75\%, 95\%$, ước tính xác suất tổn thất vốn $\mathbb{P}(V_{T+252} < V_T)$ và VaR/CVaR mô phỏng.
* **Lời thoại thuyết trình (Lê Bảo An):**
  > "Để đánh giá sức chịu đựng của danh mục trong tương lai mà không rơi vào cái bẫy của giả định phân phối chuẩn, Finfolio 2.0 tích hợp mô hình Joint Moving-Block Bootstrap Monte Carlo. Bằng cách bốc lại các khối 5 ngày giao dịch lịch sử có thực, mô hình tái hiện lại các cú sốc quá khứ và sự liên đới giữa các tài sản. Trên màn hình mô phỏng, người dùng nhìn thấy dải phân vị 5% đến 95% của 2.000 con đường phát triển vốn khả dĩ, cùng xác suất tổn thất vốn được lượng hóa rõ ràng."

---

### SLIDE 12: THIẾT KẾ TRỰC QUAN HÓA & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX)
* **Tiêu đề Slide:** TRỰC QUAN HÓA DỮ LIỆU & HỆ THỐNG DESIGN TOKENS
* **Mục đích:** Trình bày triết lý thiết kế giao diện, khả năng thích ứng thiết bị và tính dễ hiểu của các số liệu tài chính.
* **Bố cục gợi ý:** Bố cục chia 3 khung hình: 1. Hệ thống màu sắc & font chữ $\to$ 2. Biểu đồ Native SVG với Crosshair trục kép $\to$ 3. Giao diện Responsive trên Mobile/Tablet.
* **Nội dung chính trên Slide:**
  * **Hệ thống Design Tokens (Forest & Paper Theme):**
    * Bảng màu xanh rừng đậm (`#1A3026`) và nền giấy ngà (`#F8F7F3`) tạo sự tin cậy tài chính và chống mỏi mắt.
    * Tự lưu trữ (Self-hosted) 30 biến thể font tiếng Việt cao cấp: **Be Vietnam Pro** và **Fraunces**.
  * **Trực quan hóa Biểu đồ PnL bằng Native SVG thuần:**
    * Trục tung hiển thị tiền đồng thực tế (VND Value), không dùng chỉ số base-100 trừu tượng.
    * Con trỏ chữ thập (Crosshair) bám sát 2 trục X/Y; Tooltip tự động lật hướng chống tràn màn hình.
  * **Tiết lộ thông tin lũy tiến (Progressive Disclosure):**
    * Thẻ chỉ số chính (Metric Cards) đặt ở đầu trang $\to$ Biểu đồ trực quan $\to$ Bảng nhiệt chi tiết $\to$ Khối giải thích phương pháp có thể mở rộng.
* **Lời thoại thuyết trình (Nguyễn Ngọc Anh chuyển lời cho Lê Bảo An):**
  > "Về mặt trải nghiệm người dùng, em đã thiết kế giao diện dựa trên nguyên tắc Tiết lộ thông tin lũy tiến. Người dùng nhìn thấy những kết luận quan trọng nhất trước, sau đó mới đi sâu vào các bảng số liệu chi tiết. Điểm đặc biệt là toàn bộ biểu đồ tăng trưởng danh mục được vẽ bằng đồ họa vector Native SVG siêu nhẹ, hiển thị trực tiếp số tiền VND thực tế của nhà đầu tư thay vì con số 100 điểm vô nghĩa. Sau đây, em xin nhường lời cho bạn Lê Bảo An trình bày về kiến trúc kỹ thuật và thực hiện phần Live Demo sản phẩm."

---

### SLIDE 13: KIẾN TRÚC KỸ THUẬT & HẠ TẦNG VẬN HÀNH (SYSTEM ARCHITECTURE)
* **Tiêu đề Slide:** KIẾN TRÚC HỆ THỐNG & ĐA LUỒNG TRÌNH DUYỆT WEB WORKER
* **Mục đích:** Chứng minh năng lực công nghệ, giải pháp xử lý đa luồng và tối ưu hóa hiệu năng tải trang.
* **Bố cục gợi ý:** Sơ đồ khối kiến trúc phần mềm: Client Browser (Main Thread UI + Background Web Worker) $\longleftrightarrow$ Serverless Python API $\longleftrightarrow$ Data Providers (TradingView / Yahoo).
* **Nội dung chính trên Slide:**
  * **Frontend không Framework (Vanilla JS ES Modules):** Loại bỏ gánh nặng của React/Webpack, thời gian tải trang ban đầu chỉ 200ms, bộ nhớ tiêu thụ cực thấp.
  * **Web Worker đa luồng (`research-worker.mjs`):** Tách biệt toàn bộ thuật toán Frank-Wolfe và 2.000 đường chạy Monte Carlo sang một luồng CPU riêng biệt, giữ cho UI luôn mượt mà 60fps.
  * **Backend Python Serverless:** Định tuyến API linh hoạt, làm sạch dữ liệu và căn chỉnh múi giờ qua các module `vn_data.py`, `global_data.py`, `classification.py`.
  * **Hạ tầng CI/CD:** Tự động hóa kiểm thử và triển khai liên tục trên Vercel; nạp nến ngày tự động qua GitHub Actions.
* **Lời thoại thuyết trình (Lê Bảo An):**
  > "Kính thưa Thầy, đứng dưới góc độ kỹ thuật phần mềm, Finfolio 2.0 được xây dựng dựa trên triết lý tối ưu hóa hiệu năng tối đa. Chúng em quyết định không sử dụng các framework nặng nề như React hay Next.js mà xây dựng ứng dụng trên nền tảng Vanilla JavaScript hiện đại với chuẩn ES Modules. Để giải quyết bài toán tính toán ma trận nặng, em đã cô lập toàn bộ module tối ưu hóa và mô phỏng vào một Web Worker độc lập. Nhờ đó, trình duyệt không bao giờ bị đơ lag khi thực hiện các tác vụ tính toán định lượng quy mô lớn."

---

### SLIDE 14: KỊCH BẢN LIVE DEMO 3 PHÚT (LIVE PRODUCT DEMONSTRATION)
* **Tiêu đề Slide:** KỊCH BẢN THỰC THI TRỰC TIẾP (LIVE DEMONSTRATION PLAYBOOK)
* **Mục đích:** Chuyển đổi trạng thái từ trình chiếu slide sang demo tương tác trực tiếp trên trình duyệt web.
* **Bố cục gợi ý:** Danh sách 5 bước thực hiện rõ ràng kèm các thông số đầu vào minh họa chuẩn mực để hội đồng theo dõi.
* **Nội dung chính trên Slide:**
  * **Danh mục đầu vào thực tế:**
    * `FPT.VN`: 40.000.000 VND (Công nghệ thông tin)
    * `HPG.VN`: 35.000.000 VND (Thép & Vật liệu xây dựng)
    * `GLD`: 25.000.000 VND (Quỹ ETF Vàng quốc tế - Định giá USD quy về VND)
  * **Thiết lập phân tích:** Khung thời gian 5 năm; Benchmark `VN30 Index`; Trần mỗi mã $80\%$; Trần hàng hóa $60\%$.
  * **5 Điểm chạm chứng minh năng lực (Demonstration Touchpoints):**
    1. *Màn hình `/analysis`:* Biểu đồ xuất phát đúng 100 triệu VND; Phân rã Euler chỉ ra GLD làm giảm biến động danh mục.
    2. *Phân rã FX:* Bóc tách 3 cấu phần của vị thế vàng GLD.
    3. *Màn hình `/optimize`:* Thuật toán Frank-Wolfe tìm ra phương án giảm độ biến động danh mục từ 18.2% xuống 14.6%.
    4. *Màn hình `/simulation`:* 2.000 đường chạy Bootstrap hiển thị xác suất hòa vốn sau 1 năm đạt 82%.
    5. *Màn hình `/account`:* Ghi nhận lựa chọn vào Nhật ký Quyết định.
* **Lời thoại thuyết trình (Lê Bảo An - Thực hiện thao tác trên màn hình máy tính):**
  > "Và ngay bây giờ, em xin phép được mở trực tiếp trang web `g09-finfolio.vercel.app` để thực hiện bài kiểm tra thực tế. Em sẽ nhập danh mục gồm 40 triệu FPT, 35 triệu HPG và 25 triệu quỹ vàng GLD, chọn benchmark là VN30 Index trong 5 năm gần nhất. Như Thầy và các bạn đang thấy trên màn hình: hệ thống tải dữ liệu thực tế trong chưa đầy 1 giây, căn chỉnh các phiên giao dịch chung giữa sàn HOSE và sàn Mỹ. Biểu đồ đường màu xanh bắt đầu chính xác từ mốc 100 triệu đồng. Khi em chuyển sang tab Tối ưu hóa và bấm nút Chạy, thuật toán đã ngay lập tức đề xuất phương án tham chiếu giúp cắt giảm rủi ro danh mục mà vẫn tuân thủ các trần tỷ trọng. Mọi thao tác đều diễn ra tức thì và chính xác tuyệt đối."

---

### SLIDE 15: CHẤT LƯỢNG SẢN PHẨM & MA TRẬN 85 KIỂM THỬ TỰ ĐỘNG (QA & VERIFICATION)
* **Tiêu đề Slide:** ĐẢM BẢO CHẤT LƯỢNG: HỆ THỐNG 85 AUTOMATED TESTS
* **Mục đích:** Chứng minh tính tin cậy tuyệt đối về mặt kỹ thuật và tính trung thực học thuật của dự án.
* **Bố cục gợi ý:** Bảng thống kê các nhóm kiểm thử (Test Categories) kèm ảnh chụp terminal chạy lệnh `node --test` và `unittest` thành công 100%.
* **Nội dung chính trên Slide:**

| Nhóm kiểm thử | Công nghệ thực thi | Số lượng | Trạng thái | Mục tiêu kiểm định |
| :--- | :--- | :---: | :---: | :--- |
| **Financial Identity** | Node.js Test Runner | 18 tests | **PASS** | Đẳng thức Euler $\sum RC_i = \sigma_P$, đối soát lợi nhuận mua & giữ |
| **Optimization Solver** | Node.js Test Runner | 12 tests | **PASS** | Kiểm tra nghiệm Frank-Wolfe, trần tỷ trọng, xử lý biên không khả thi |
| **Monte Carlo Simulation**| Node.js Test Runner | 8 tests | **PASS** | Kiểm tra tái lập với random seed, dải phân vị, tính toán VaR/CVaR |
| **UI Components & SVG** | Node.js Test Runner | 12 tests | **PASS** | Kiểm tra tọa độ SVG, định dạng số tiếng Việt, font typography |
| **Data Providers & Routing**| Python Unittest | 20 tests | **PASS** | Kiểm tra kết nối TradingView/Yahoo, lọc mã, kiểm tra múi giờ |
| **Data Freshness & Clean** | Python Unittest | 15 tests | **PASS** | Căn phiên giao dịch chung, kiểm tra nến đóng cửa, endpoint status |
| **TỔNG CỘNG** | **Full Regression Suite** | **85 tests** | **100% PASS** | **Sẵn sàng bàn giao và thẩm định học thuật** |
* **Lời thoại thuyết trình (Nguyễn Quỳnh Anh):**
  > "Kính thưa Thầy, một khẳng định quan trọng của nhóm G09: tính đúng đắn của Finfolio 2.0 không dựa trên lời nói, mà dựa trên 85 bài kiểm thử tự động đã được lập trình sẵn trong kho mã nguồn. Chúng em kiểm tra từ các đẳng thức toán học khắt khe như định lý Euler với sai số dưới $10^{-10}$, cho đến tính tái lập của thuật toán Monte Carlo khi cố định random seed. Bất kỳ sự thay đổi mã nguồn nào làm sai lệch logic tài chính đều sẽ bị hệ thống CI/CD từ chối ngay lập tức."

---

### SLIDE 16: TIẾN TRÌNH 7 TUẦN & MA TRẬN ĐÓNG GÓP THÀNH VIÊN (PROJECT FOOTPRINT)
* **Tiêu đề Slide:** TIẾN TRÌNH DỰ ÁN 7 TUẦN & DẤU ẤN CÁ NHÂN
* **Mục đích:** Tổng kết tiến trình làm việc có kỷ luật suốt học kỳ, làm căn cứ chấm điểm công bằng cho từng cá nhân.
* **Bố cục gợi ý:** Dòng thời gian 7 tuần (Timeline W1–W7) ở trên, Bảng ma trận phân công 5 thành viên kèm liên kết file Footprint ở dưới.
* **Nội dung chính trên Slide:**
  * **Tiến trình 7 tuần:**
    * *W1–W2:* Định vị bài toán, lập tài liệu PRD, khóa phạm vi Core MVP.
    * *W3–W4:* Xây dựng Từ điển dữ liệu, giải quyết blocker VN-Index, chuẩn hóa mô hình Euler & FX.
    * *W5–W6:* Đặc tả 9 acceptance tests, xây dựng bản demo chạy thực tế trên Vercel, kiểm soát Bug Log.
    * *W7:* Nâng cấp kiến trúc 7 trang, bổ sung Monte Carlo & bộ chỉ số nâng cao, hoàn thiện 85 tests.
  * **Bản đồ đóng góp cá nhân (Individual Footprints):**
    * *Hoàng Khánh Linh:* Product scope, Return/Euler/FX methodology và claim boundary ([linh.md](individual/linh.md)).
    * *Nguyễn Quỳnh Anh:* Quản lý yêu cầu, luồng nghiệp vụ và 85 test cases ([quynh-anh.md](individual/quynh-anh.md)).
    * *Lê Bảo An:* Kiến trúc, core engine, optimization, toàn bộ Monte Carlo/Web Worker và DevOps ([bao-an.md](individual/bao-an.md)).
    * *Trần Minh Ngọc:* Input/data model, source, benchmark/currency/alignment, classification và freshness ([minh-ngoc.md](individual/minh-ngoc.md)).
    * *Nguyễn Ngọc Anh:* Thiết kế giao diện, Design Tokens, Native SVG và typography ([ngoc-anh.md](individual/ngoc-anh.md)).
* **Lời thoại thuyết trình (Nguyễn Ngọc Anh):**
  > "Suốt 7 tuần của học kỳ, nhóm G09 đã làm việc với tinh thần kỷ luật và sự phân công trách nhiệm rạch ròi. Mỗi thành viên đều có một tài liệu Dấu ấn cá nhân (Individual Footprint) riêng biệt trong thư mục `docs/individual/`, dài hơn 200 dòng, mô tả chi tiết từ những việc đã thực sự làm, các file code đã đóng góp, các bằng chứng đối soát hàng tuần cho đến kịch bản bảo vệ chuyên sâu. Đây là minh chứng rõ ràng nhất cho sự đóng góp thực chất và đồng đều của cả 5 thành viên trong nhóm."

---

### SLIDE 17: GIỚI HẠN DỰ ÁN, ĐẠO ĐỨC FINTECH & BÀI HỌC KINH NGHIỆM
* **Tiêu đề Slide:** ĐẠO ĐỨC CÔNG NGHỆ TÀI CHÍNH & BÀI HỌC KINH NGHIỆM
* **Mục đích:** Thể hiện tư duy phản biện học thuật, tính trung thực khoa học khi thừa nhận các giới hạn của mô hình.
* **Bố cục gợi ý:** Bố cục 2 phần: Bên trái là Giới hạn kỹ thuật & Ranh giới cam kết (Disclaimers), Bên phải là Bài học kinh nghiệm quý báu.
* **Nội dung chính trên Slide:**
  * **Giới hạn kỹ thuật thừa nhận minh bạch:**
    * *Chưa có Lịch nghỉ lễ tự động:* Hệ thống dựa vào nến giá nhà cung cấp, chưa có bảng lịch riêng để tự động giải thích nguyên nhân nghỉ lễ.
    * *Thiên lệch mẫu quá khứ (In-sample Bias):* Tỷ số Sharpe tối đa phụ thuộc mạnh vào mẫu lịch sử; chưa tích hợp mô hình Black-Litterman hay Ledoit-Wolf shrinkage.
    * *Dữ liệu đóng cửa nến ngày:* Chưa hỗ trợ dữ liệu giao dịch khớp lệnh từng giây (tick-by-tick real-time).
  * **Đạo đức Fintech & Ranh giới cam kết (Claim Boundary):**
    * Mọi kết quả tối ưu hóa đều được dán nhãn là *Phương án phân bổ tham chiếu*, tuyệt đối không dùng từ ngữ khuyến nghị mua bán.
    * Cảnh báo rõ ràng: *"Hiệu quả quá khứ không bảo đảm cho lợi nhuận tương lai"*.
  * **Bài học kinh nghiệm lớn nhất:**
    * *"Làm Fintech phải bắt đầu từ Logic tài chính và Dữ liệu trước khi vẽ giao diện."*
    * *"Testing tự động không phải là phần phụ, mà là điều kiện sống còn của tính Defensible."*
* **Lời thoại thuyết trình (Nguyễn Ngọc Anh):**
  > "Kính thưa Thầy, một sản phẩm tài chính đáng tin cậy không phải là sản phẩm tuyên bố mình hoàn hảo, mà là sản phẩm biết rõ ranh giới giới hạn của mình ở đâu. Chúng em thẳng thắn thừa nhận rằng mô hình hiện tại vẫn có những thiên lệch mẫu quá khứ và chưa tính đến cổ tức tái đầu tư. Tuy nhiên, việc nhận thức rõ các giới hạn này và công bố minh bạch cạnh từng con số phân tích chính là bài học lớn nhất về đạo đức nghề nghiệp mà chúng em học được qua môn học của Thầy."

---

### SLIDE 18: KẾT LUẬN & SẴN SÀNG PHẢN BIỆN (CONCLUSION & Q&A)
* **Tiêu đề Slide:** TỔNG KẾT DỰ ÁN & SẴN SÀNG TRẢ LỜI CHẤT VẤN
* **Mục đích:** Đóng lại bài thuyết trình một cách đĩnh đạc, tự tin, mở rộng không gian cho hội đồng giảng viên chất vấn.
* **Bố cục gợi ý:** Thiết kế trang trọng, hiển thị lại Production URL, QR Code kho mã nguồn GitHub và ảnh tập thể 5 thành viên nhóm G09.
* **Nội dung chính trên Slide:**
  * **Finfolio 2.0 đã hoàn thành xuất sắc các mục tiêu:**
    1. Một mạch tư duy hoàn chỉnh từ Input $\to$ Logic $\to$ Output $\to$ Quyết định.
    2. Nền tảng toán tài chính vững chắc với phân rã rủi ro Euler và tối ưu hóa Frank-Wolfe.
    3. Pipeline dữ liệu lai tự động hóa và kiến trúc Web Worker hiệu năng cao.
    4. Hệ thống 85 automated tests bảo vệ tính toàn vẹn học thuật.
  * **Hội đồng Phản biện:** Nhóm G09 đã sẵn sàng tiếp nhận các câu hỏi chất vấn chuyên sâu từ Thầy và các bạn!
* **Lời thoại thuyết trình (Toàn bộ 5 thành viên đứng lên - Hoàng Khánh Linh đại diện kết luận):**
  > "Để kết luận, nhóm G09 tự hào rằng Finfolio 2.0 không chỉ là một bài tập học phần hoàn thành đúng hạn, mà là một sản phẩm công nghệ tài chính thực thụ có tính ứng dụng cao, tính giải trình toán học chặt chẽ và chất lượng kỹ thuật bền bỉ. Chúng em xin chân thành cảm ơn Thầy đã tận tình hướng dẫn và chỉ ra những định hướng quý báu trong suốt học kỳ vừa qua. Nhóm chúng em đã sẵn sàng lắng nghe và trả lời mọi câu hỏi chất vấn của Thầy. Em xin trân trọng cảm ơn!"

---

# PHẦN III: KỊCH BẢN PHÂN VAI VÀ PHỐI HỢP THUYẾT TRÌNH (COORDINATION PLAYBOOK)

Để buổi thuyết trình nhóm diễn ra trơn tru trong thời lượng chuẩn **15 phút** (gồm 11 phút trình bày slide + 4 phút live demo), nhóm thiết lập kịch bản phối hợp chuyển giao lời thoại (Hand-off script) như sau:

```
[Nguyễn Ngọc Anh] (Mở đầu Slide 1)
  ↳ "Xin mời bạn Hoàng Khánh Linh trình bày bài toán, phạm vi và phương pháp tài chính..."
[Hoàng Khánh Linh] (3.0 phút: Slides 2, 8-9)
  ↳ "Sau đây, em xin mời bạn Nguyễn Quỳnh Anh trình bày về luồng nghiệp vụ và quy trình kiểm thử..."
[Nguyễn Quỳnh Anh] (3.0 phút: Slides 3, 6, 15)
  ↳ "Để hiểu rõ hơn về nguồn dữ liệu và cách căn chỉnh thị trường, xin mời bạn Trần Minh Ngọc..."
[Trần Minh Ngọc] (3.0 phút: Slides 4, 5, 7)
  ↳ "Tiếp theo, xin mời bạn Lê Bảo An trình bày tối ưu hóa, mô phỏng và kiến trúc triển khai..."
[Lê Bảo An] (3.5 phút: Slides 10, 11, 13, 14 & Live Demo)
  ↳ "Xin mời bạn Nguyễn Ngọc Anh trình bày hệ thống thiết kế và tổng kết footprint của nhóm..."
[Nguyễn Ngọc Anh] (2.5 phút: Slides 12, 16, 17)
  ↳ "Và sau đây, nhóm xin chuyển sang phần tổng kết cùng bạn Nguyễn Ngọc Anh..."
[Cả nhóm đứng dậy - Linh kết luận Slide 18 & Mở đầu phần Q&A]
```

---

# PHẦN IV: SỔ TAY CHUẨN BỊ PHẢN BIỆN (EXAMINER DEFENSE PLAYBOOK)

Tập hợp 10 câu hỏi chất vấn hóc búa nhất mà giảng viên thường đặt ra cho các dự án Portfolio Analytics và câu trả lời chuẩn mực của nhóm G09:

### Câu 1 (Hỏi Linh - Logic Tài chính): *"Tại sao nhóm phân rã rủi ro bằng Euler Covariance mà không dùng độ biến động riêng lẻ?"*
* **Trả lời:** Độ lệch chuẩn riêng lẻ $\sigma_i$ không có tính chất cộng gộp và bỏ qua hoàn toàn hệ số tương quan $\rho_{ij}$. Hàm biến động danh mục $\sigma_P = \sqrt{\mathbf{w}^T \Sigma \mathbf{w}}$ là hàm thuần nhất bậc 1. Theo Định lý Euler: $\sigma_P = \sum w_i \frac{\partial \sigma_P}{\partial w_i}$. Đại lượng Euler Risk Contribution $RC_i = w_i \cdot \text{MCR}_i$ đo lường chính xác lượng rủi ro mà tài sản đóng góp vào tổng biến động của danh mục, cho phép phát hiện các tài sản có tỷ trọng vốn nhỏ nhưng gây ra rủi ro lớn do tương quan cao.

### Câu 2 (Hỏi An - Kỹ thuật Lập trình): *"Tại sao nhóm không dùng thư viện Python scipy.optimize trên server mà lại tự viết Frank-Wolfe bằng JavaScript?"*
* **Trả lời:** Việc tự lập trình thuật toán Frank-Wolfe bằng JavaScript trên trình duyệt mang lại 3 ưu thế vượt trội: (1) Độ trễ mạng bằng 0 (chạy trong 20ms); (2) Giảm tải tuyệt đối cho máy chủ, hệ thống có thể mở rộng phục vụ hàng vạn người dùng đồng thời; (3) Kiểm soát hoàn toàn các bước lặp và điều kiện dừng KKT, dễ dàng tùy biến các trần tỷ trọng riêng cho nhóm hàng hóa proxy mà các hàm tối ưu tổng quát đóng gói sẵn rất khó can thiệp.

### Câu 3 (Hỏi Ngọc - Dữ liệu): *"Tại sao nhóm lại kết hợp TradingView và Yahoo mà không dùng duy nhất một nguồn?"*
* **Trả lời:** Đây là giải pháp kiến trúc lai bắt buộc sau khi kiểm định thực tế ở tuần 3. Yahoo Finance thường xuyên bị lỗi rỗng dữ liệu chỉ số VN-Index và có độ trễ lớn với cổ phiếu Việt Nam. Do đó, nhóm dùng TradingView (qua `tvdatafeed`) chuyên trách cho toàn bộ cổ phiếu và chỉ số Việt Nam với nến ngày chuẩn xác sau 15:00. Ngược lại, Yahoo Finance vượt trội về dữ liệu ETF hàng hóa quốc tế và tỷ giá USD/VND. Sự kết hợp này mang lại độ ổn định cao nhất.

### Câu 4 (Hỏi Quỳnh Anh - Kiểm thử): *"Làm thế nào nhóm khẳng định 85 bài kiểm thử là thực chất chứ không phải số liệu làm đẹp báo cáo?"*
* **Trả lời:** Toàn bộ 85 bài kiểm thử được lưu trữ công khai trong kho mã nguồn tại thư mục `demo/*.test.mjs` và `demo/test_*.py`. Bất kỳ ai cũng có thể tự kiểm chứng độc lập bằng lệnh `node --test demo/*.test.mjs` và `python3 -m unittest discover -s demo -p 'test_*.py'`. Các bài kiểm thử bao phủ từ việc đối soát đẳng thức toán học Euler với sai số dưới $10^{-10}$, kiểm tra tính bất biến của Monte Carlo khi cố định random seed, đến việc kiểm tra khả năng bắt lỗi khi nhập sai định dạng hoặc thiết lập ràng buộc tỷ trọng không khả thi.

### Câu 5 (Hỏi Ngọc Anh - Giao diện): *"Tại sao biểu đồ PnL lại hiển thị tiền đồng thực tế VND thay vì chuẩn hóa về mốc 100 điểm?"*
* **Trả lời:** Chuẩn hóa mốc 100 điểm phù hợp với báo cáo của quỹ tương hỗ, nhưng xa lạ với nhà đầu tư cá nhân. Khi bỏ ra 100 triệu VND, người dùng muốn biết số tiền của mình đang biến động thành 115 triệu hay 92 triệu VND qua từng ngày. Biểu đồ Native SVG hiển thị số tiền thực tế giúp người dùng nhìn thấy ngay số tiền lãi/lỗ tuyệt đối khi rê chuột, đồng thời việc so sánh với đường benchmark và đường tối ưu hóa trên cùng số vốn ban đầu mang lại sức thuyết phục và tính chân thực cao nhất.

### Câu 6 (Hỏi Linh): *"Tại sao lãi suất phi rủi ro lại mặc định là 3.0%/năm mà không tự động cào từ lợi suất trái phiếu chính phủ?"*
* **Trả lời:** Hằng số 3.0%/năm được kế thừa từ phiên bản Finfolio 1.0 của K62 nhằm đảm bảo tính tương thích và giảm gánh nặng thao tác cho người dùng. Trên thực tế, thị trường trái phiếu chính phủ Việt Nam không có một API công khai, ổn định và miễn phí để tải tự động đường cong lợi suất hàng ngày. Thay vì ngầm lấy một lãi suất USD từ Mỹ gây sai lệch kinh tế, nhóm công bố minh bạch con số 3.0% là một *giả định tham chiếu nội bộ*, đồng thời cho phép người dùng tùy chỉnh thành bất kỳ con số nào (kể cả 0%) trong mục Cài đặt nâng cao.

### Câu 7 (Hỏi Ngọc): *"Nếu một cổ phiếu Việt Nam trả cổ tức bằng tiền mặt hoặc cổ phiếu thưởng, dữ liệu của nhóm có bị sai lệch không?"*
* **Trả lời:** Nhóm công bố minh bạch trong tài liệu giả định A03: phiên bản hiện tại sử dụng chuỗi giá đóng cửa chưa điều chỉnh (unadjusted close price) và đo lường tỷ suất sinh lời trên giá (Price Return). Do đó, sản phẩm chưa phản ánh toàn diện tổng lợi nhuận (Total Return) của các đợt trả cổ tức tiền mặt lớn. Với các đợt chia tách cổ phiếu hoặc cổ phiếu thưởng, nguồn dữ liệu TradingView đã tự động điều chỉnh giá lịch sử để tránh các cú nhảy giá kỹ thuật ảo.

### Câu 8 (Hỏi An): *"Tại sao nhóm lại dùng Web Worker mà không chạy trực tiếp trên luồng chính?"*
* **Trả lời:** Trình duyệt web hoạt động theo cơ chế đơn luồng (Single-thread Event Loop). Khi chạy 2.000 kịch bản Monte Carlo qua 252 phiên, khối lượng tính toán lên tới hơn 500.000 phép nhân ma trận. Nếu chạy trên luồng chính, giao diện sẽ bị đơ cứng (freeze) trong 1–2 giây, con trỏ chuột không tương tác được. Việc chuyển sang Web Worker giúp giải phóng hoàn toàn luồng giao diện, giữ tốc độ khung hình 60fps mượt mà và cho phép hiển thị thanh tiến trình trực quan.

### Câu 9 (Hỏi Quỳnh Anh): *"Hệ thống xử lý thế nào khi người dùng nhập 3 tài sản nhưng đặt trần mỗi mã tối đa 20%?"*
* **Trả lời:** Đây là trường hợp ràng buộc không khả thi (Infeasible Constraints) vì tổng tối đa của 3 mã chỉ đạt $60\% < 100\%$. Kịch bản kiểm thử W5-T07 đã quy định: hệ thống sẽ thực hiện kiểm tra tính khả thi trước khi giải ($\sum \text{Cap}_i \ge 1.0$). Hệ thống sẽ dừng ngay lập tức và hiển thị thông báo lỗi cụ thể trên màn hình: *"Ràng buộc tỷ trọng không khả thi: Tổng trần các tài sản không đủ để phân bổ đủ 100% danh mục"*, tuyệt đối không chạy thuật toán để sinh ra kết quả sai lệch.

### Câu 10 (Hỏi cả nhóm): *"Nếu có thêm 2 tuần nữa, nhóm sẽ ưu tiên nâng cấp tính năng nào nhất?"*
* **Trả lời:** Nhóm sẽ ưu tiên 2 nâng cấp lớn: (1) Tích hợp mô hình co ngót ma trận hiệp phương sai Ledoit-Wolf Shrinkage Covariance để giảm thiểu hiện tượng nhiễu mẫu (sample noise) khi danh mục có nhiều tài sản; (2) Tích hợp Lịch nghỉ lễ chính thức của các sở giao dịch (HOSE/HNX/NYSE) để hệ thống tự động nhận diện và thông báo nguyên nhân thị trường đóng cửa thay vì chỉ căn cứ thuần túy vào việc có nến giá hay không.

