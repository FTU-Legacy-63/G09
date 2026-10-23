# Individual Footprint — Nguyễn Quỳnh Anh

## Bảng thông tin cá nhân

| Thông tin | Nội dung |
| :--- | :--- |
| **Họ và tên** | **Nguyễn Quỳnh Anh** |
| **Mã sinh viên** | **2413380010** |
| **Vai trò chính** | **Product Manager / Flow & Testing Lead** |
| **Dự án** | **Finfolio 2.0 — Portfolio Attribution & Risk Analytics** |
| **Môn học** | Ứng dụng CNTT trong Tài chính - Ngân hàng (NHA408E) |
| **Nhóm** | Group 09 (G09) — Lớp K63 |

---

## 1. Vai trò trong dự án

Với tư cách là **Product Manager** kiêm **Trưởng nhóm phụ trách Luồng nghiệp vụ và Kiểm thử (Flow & Testing Lead)** của Finfolio 2.0, em chịu trách nhiệm chính về:
1. **Chuyển hóa Yêu cầu thành Luồng nghiệp vụ (Requirements to User Flow):** Chuyển các định nghĩa toán học và logic tài chính từ Product Owner thành các luồng người dùng cụ thể (Happy Path, Alternative Paths, Error Paths), đảm bảo giao diện phản ánh đúng hành trình ra quyết định của nhà đầu tư.
2. **Thiết lập Tiêu chí chấp nhận (Acceptance Criteria):** Định nghĩa ranh giới nghiệm thu nghiêm ngặt cho từng tính năng, xác định điều kiện đầu vào hợp lệ, các trường hợp biên (boundary cases) và thông báo lỗi tương ứng.
3. **Quản trị chất lượng và Kiểm thử hồi quy (QA & Regression Testing):** Xây dựng ma trận kịch bản kiểm thử xuyên suốt từ Week 5 đến Week 7; theo dõi danh mục lỗi tồn đọng (Bug Log); phối hợp cùng Lead Developer để tự động hóa 85 test cases (50 JS + 35 Python), đảm bảo hệ thống đạt độ tin cậy tuyệt đối trước khi phát hành production.

---

## 2. Dấu ấn cá nhân trong sản phẩm

Dấu ấn cá nhân rõ ràng nhất của em trong Finfolio 2.0 tập trung ở 3 khía cạnh:

1. **Thiết kế luồng người dùng hoàn chỉnh 3 nhánh (Happy - Alternative - Error Paths):**  
   Em là người trực tiếp xây dựng luồng nghiệp vụ chi tiết tại [WEEK5.md](../WEEK5.md). Em quy định rõ: nếu người dùng nhập trùng mã, nhập giá trị bằng 0, hoặc chọn trần tỷ trọng không khả thi (infeasible cap), hệ thống phải chặn ngay tại form kèm thông báo lỗi cụ thể ở từng trường dữ liệu, tuyệt đối không được để lỗi ngầm rơi vào backend tính toán.
2. **Quy chuẩn hóa cấu trúc báo cáo "Risk & Return Allocation Brief":**  
   Để người dùng không bị "ngợp" trước hàng loạt chỉ số phức tạp, em đã chuẩn hóa cấu trúc trình bày kết quả theo mô hình 5 bước:  
   $$\text{Result (Con số)} \longrightarrow \text{Reason (Nguyên nhân)} \longrightarrow \text{Meaning (Ý nghĩa)} \longrightarrow \text{Action (Gợi ý hành động)} \longrightarrow \text{Limit (Giới hạn)}$$  
   Mô hình này giúp mọi thông tin hiển thị trên màn hình đều hỗ trợ trực tiếp cho quyết định của người dùng thay vì chỉ là các con số vô hồn.
3. **Thiết lập và giám sát hệ thống 85 ca kiểm thử tự động:**  
   Em phân loại kiểm thử thành các tầng rõ rệt: kiểm thử tính đồng nhất tài chính (Financial Identity tests), kiểm thử xử lý dữ liệu khuyết/lệch phiên (Data Alignment tests), và kiểm thử điều kiện biên giao diện (UI Boundary tests). Em phân biệt rạch ròi giữa *Expected Result* (kết quả mong đợi theo lý thuyết) và *Actual Result* (kết quả quan sát thực tế khi chạy test).

---

## 3. Những việc đã thực sự làm

### 3.1. Tổng hợp bài toán và quản trị các phiên bản hiệu chỉnh (Week 1 & Week 2)
- Tham gia tổng hợp và phân tích 3 đề tài ứng viên tại [WEEK1.md](../WEEK1.md). Ghi nhận các phản hồi ban đầu của giảng viên để điều chỉnh định hướng sản phẩm.
- Đồng tác giả tài liệu [WEEK2.md](../WEEK2.md), xây dựng chuỗi giải pháp: `Holdings Input → Data Validation → Current Analysis → Euler Attribution → Benchmark Comparison → Constrained Optimization → User Decision Record`.
- Thiết lập ranh giới tính năng: phân định rõ những tính năng thuộc phạm vi Core MVP và những tính năng dời lại (postponed) sang bản Final hoặc giai đoạn sau (như kết nối sàn giao dịch, giao dịch tự động).

### 3.2. Xây dựng ma trận kiểm tra tính hợp lệ dữ liệu (Week 3)
- Phối hợp cùng Business Analyst xây dựng ma trận kiểm tra dữ liệu đầu vào (Validation Matrix) tại [WEEK3.md](../WEEK3.md):
  - Kiểm tra định dạng mã tài sản, tự động viết hoa (uppercase).
  - Kiểm tra giá trị đầu tư: số dương $> 0$, không cho phép bán khống (long-only).
  - Kiểm tra tính khả thi của ràng buộc tối ưu hóa: nếu có 3 tài sản mà đặt giới hạn mỗi mã tối đa $30\%$ thì tổng tối đa chỉ đạt $90\% < 100\%$, hệ thống phải phát hiện và cảnh báo không khả thi (infeasible constraints) ngay lập tức.

### 3.3. Thiết kế chi tiết luồng người dùng và 9 kịch bản nghiệm thu (Week 5)
- Soạn thảo mục 4 và mục 8 trong tài liệu [WEEK5.md](../WEEK5.md) với 9 kịch bản nghiệm thu chuẩn mực:
  - **W5-T01:** Danh mục hợp lệ (cổ phiếu + hàng hóa + benchmark) $\to$ Đi hết luồng và tạo báo cáo Brief.
  - **W5-T02:** Tổng tỷ trọng khác $100\% \to$ Chặn phân tích, hiển thị tỷ trọng còn thiếu/thừa.
  - **W5-T03:** Benchmark thiếu dữ liệu hoặc lệch ngày $\to$ Chặn phần phân tích tương đối, giữ lại phân tích danh mục nội tại.
  - **W5-T04:** Phân rã lợi nhuận $\to$ Tổng đóng góp từng mã và từng ngành phải khớp hoàn toàn với lợi nhuận danh mục.
  - **W5-T05:** Phân rã rủi ro Euler $\to \sum RC_i = \sigma_P$.
  - **W5-T06:** Kịch bản tối ưu khả thi $\to$ Tổng tỷ trọng bằng $100\%$, tuân thủ trần từng mã và trần hàng hóa.
  - **W5-T07:** Kịch bản tối ưu không khả thi $\to$ Báo lỗi xung đột ràng buộc, không sinh tỷ trọng ảo.
  - **W5-T08:** So sánh trước/sau tối ưu $\to$ Dùng chung ma trận hiệp phương sai, chung khoảng thời gian và chung giả định.
  - **W5-T09:** Ranh giới ngôn ngữ $\to$ Không xuất hiện các từ ngữ "danh mục tốt nhất", "khuyến nghị mua", "khuyến nghị bán".

### 3.4. Xây dựng Bảng kiểm thử thực tế và Quản lý danh mục lỗi (Week 6)
- Xây dựng bảng kiểm thử Week 6 ([WEEK6.md](../WEEK6.md)) với 10 ca kiểm thử thực thi trên mã nguồn thật (T01 đến T10).
- Khởi tạo và quản lý **Bug Log** gồm 6 vấn đề trọng yếu:
  - *Bug B01:* Yahoo Finance có thể trả về mã lỗi HTTP 429 hoặc thiếu dữ liệu $\to$ Giải pháp: Chuyển nguồn dữ liệu cổ phiếu Việt Nam sang TradingView.
  - *Bug B02:* Finfolio 1.0 của K62 dùng heuristic chuẩn hóa tỷ trọng có thể vi phạm cận trên $\to$ Giải pháp: Xây dựng thuật toán tối ưu hóa tìm kiếm trên lưới lồi khả thi.
  - *Bug B03:* Khi người dùng thay đổi input, kết quả cũ vẫn hiển thị gây hiểu lầm $\to$ Giải pháp: Tự động xóa trạng thái kết quả cũ ngay khi form input có thay đổi.
  - *Bug B05:* Dữ liệu thiếu chỉ số thị trường chuẩn $\to$ Giải pháp: Bổ sung nguồn lấy trực tiếp VN30 Index và VN-Index từ TradingView.

### 3.5. Kiểm định toàn diện Final Audit và Xác thực Production (Week 7)
- Soạn thảo tài liệu nghiệm thu [WEEK7.md](../WEEK7.md). Đối chiếu trực tiếp với các tiêu chuẩn trong tài liệu Final Repo Readiness.
- Giám sát việc chạy toàn bộ 85 bài kiểm thử tự động trước khi đóng gói phiên bản Release `v2.0.0-final-20261023`:
  - 50 kiểm thử JavaScript kiểm tra tính toán tài chính, worker đa luồng, định dạng số, SVG chart.
  - 35 kiểm thử Python kiểm tra provider routing, tìm kiếm mã, kiểm tra múi giờ và căn chỉnh ngày chung.
- Thực hiện kiểm thử khói (Smoke Test) trên môi trường Production Vercel: kiểm tra trên cả 3 độ phân giải 375px (Mobile), 768px (Tablet) và 1440px (Desktop), đảm bảo không tràn màn hình ngang và bảng biểu cuộn mượt mà.

---

## 4. Bảng tổng hợp File, Kịch bản và Đóng góp cụ thể

| Hạng mục | Chi tiết phần đã đóng góp | File minh chứng | Cách thức kiểm tra / Nghiệm thu |
| :--- | :--- | :--- | :--- |
| **Đặc tả Luồng người dùng** | Xây dựng Happy Path, Alternative Path (nhập weight, fallback phiên gần nhất), Error Path (sai mã, thiếu ngày, ràng buộc xung đột) | [WEEK5.md](../WEEK5.md) | Đối chiếu mục 4 trong WEEK5.md với hành vi thực tế của ứng dụng trên web |
| **Tiêu chí nghiệm thu (Acceptance Criteria)** | 9 kịch bản nghiệm thu từ W5-T01 đến W5-T09 bao phủ toàn bộ chức năng Core MVP | [WEEK5.md](../WEEK5.md) | Đối chiếu bảng mục 8 trong WEEK5.md |
| **Ma trận Kiểm thử Week 6** | 10 ca kiểm thử thực thi: T01 (Normal), T02 (Boundary 100%), T03 (Invalid), T04-T05 (Financial logic), T06-T10 (Data & API) | [WEEK6.md](../WEEK6.md) | Chạy `node --test demo/finance.test.mjs` |
| **Kiểm thử Kiểm soát Tính tươi mới Dữ liệu** | Kịch bản kiểm tra: nếu dữ liệu cache có timestamp mới nhưng phiên giao dịch đã cũ thì vẫn phải gọi provider để làm mới | [freshness.test.mjs](../../demo/freshness.test.mjs) | Chạy `node --test demo/freshness.test.mjs` |
| **Kiểm thử Rủi ro & Tối ưu hóa** | Kiểm thử ràng buộc không khả thi (infeasible cap), kiểm thử tính tái lập của Monte Carlo khi cố định random seed | [research.test.mjs](../../demo/research.test.mjs) | Chạy `node --test demo/research.test.mjs` |
| **Bảng nghiệm thu Final Week 7** | Ma trận đối chiếu Expected vs Actual cho 10 ca kiểm thử phức hợp tại thời điểm phát hành Final | [WEEK7.md](../WEEK7.md) | Đối chiếu bảng mục 3 trong WEEK7.md |

---

## 5. Bằng chứng đóng góp theo 7 tuần dự án

| Tuần | Ghi nhận trong tiến trình nhóm | Output cụ thể được xác nhận | Ý nghĩa đóng góp cá nhân |
| :---: | :--- | :--- | :--- |
| **W1** | Quỳnh Anh tổng hợp 3 problem candidates, phân tích phản hồi ban đầu của giảng viên. | [WEEK1.md](../WEEK1.md) (Problem Synthesis) | Đặt nền móng lựa chọn đề tài có tính khả thi và giải quyết đúng nỗi đau người dùng. |
| **W2** | Quỳnh Anh phân rã yêu cầu thành các bước trong hành trình trải nghiệm người dùng. | [WEEK2.md](../WEEK2.md) (Requirements Breakdown) | Chuyển bài toán trừu tượng thành quy trình từng bước rõ ràng. |
| **W3** | Quỳnh Anh xây dựng ma trận kiểm tra tính hợp lệ dữ liệu và các quy tắc chặn lỗi. | [WEEK3.md](../WEEK3.md) (Validation Register) | Ngăn ngừa việc nhập dữ liệu rác làm sai lệch kết quả mô hình. |
| **W4** | Quỳnh Anh xây dựng kịch bản kiểm tra đối soát (Reconciliation Checks) cho công thức tài chính. | [WEEK4.md](../WEEK4.md) (Acceptance Logic) | Chuẩn bị các ca kiểm thử toán học trước khi bước vào giai đoạn lập trình. |
| **W5** | Quỳnh Anh hoàn thiện 9 kịch bản nghiệm thu và danh mục rà soát cuối tuần 5. | [WEEK5.md](../WEEK5.md) (Acceptance Scenarios & Checklist) | Văn kiện bàn giao quan trọng nhất để đội ngũ code đối chiếu khi phát triển tính năng. |
| **W6** | Quỳnh Anh xây dựng bảng kiểm thử Week 6 và quản lý danh mục lỗi Bug Log B01–B06. | [WEEK6.md](../WEEK6.md) (Test Table & Bug Log) | Giám sát chất lượng bản demo hoạt động đầu tiên, phát hiện và khắc phục các lỗi quan trọng. |
| **W7** | Quỳnh Anh thực hiện kiểm định chất lượng Final Audit, kiểm thử khói Production Vercel. | [WEEK7.md](../WEEK7.md) (Final Audit Table) | Nghiệm thu 85 automated tests và đảm bảo hệ thống sẵn sàng bàn giao cho hội đồng chấm điểm. |

---

## 6. Hạn chế còn tồn tại và Bài học kinh nghiệm

### 6.1. Hạn chế về mặt kiểm thử và vận hành
- **Chưa thực hiện kiểm thử người dùng diện rộng (User Acceptance Testing - UAT):** Do giới hạn thời gian học kỳ, các buổi kiểm thử chủ yếu diễn ra nội bộ nhóm và trên các bộ dữ liệu mô phỏng; chưa tổ chức được buổi thử nghiệm thực tế với nhóm đối tượng nhà đầu tư bên ngoài để ghi nhận phản hồi định tính.
- **Phụ thuộc vào tính sẵn sàng của nhà cung cấp bên thứ ba:** Mặc dù hệ thống có cơ chế kiểm tra lỗi dữ liệu, nhưng nếu cả TradingView và Yahoo Finance đồng thời bị nghẽn mạng (rate-limit), hệ thống chỉ có thể báo lỗi mà chưa có nguồn dữ liệu dự phòng thương mại có trả phí (paid SLA provider).

### 6.2. Bài học kinh nghiệm cá nhân
- **Sự khác biệt giữa "Pass trên giấy" và "Pass trên máy":** Một kịch bản kiểm thử ghi là "Pass" chỉ có giá trị khi nó được chứng minh bằng lệnh thực thi máy tính với kết quả đầu ra cụ thể, không chấp nhận việc suy diễn cảm tính.
- **Tầm quan trọng của Quản trị lỗi (Bug Governance):** Khi phát hiện lỗi, thay vì vội vã sửa code ngay, cần ghi nhận lỗi vào Bug Log, phân loại mức độ nghiêm trọng (Severity), xác định nguyên nhân gốc rễ và viết test case kiểm tra hồi quy trước khi commit bản vá.


