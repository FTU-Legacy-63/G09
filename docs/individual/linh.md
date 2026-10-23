# Individual Footprint — Hoàng Khánh Linh

## Bảng thông tin cá nhân

| Thông tin | Nội dung |
| :--- | :--- |
| **Họ và tên** | **Hoàng Khánh Linh** |
| **Mã sinh viên** | **2412380024** |
| **Vai trò chính** | **Product Owner / Financial Logic Lead** |
| **Dự án** | **Finfolio 2.0 — Portfolio Attribution & Risk Analytics** |
| **Môn học** | Ứng dụng CNTT trong Tài chính - Ngân hàng (NHA408E) |
| **Nhóm** | Group 09 (G09) — Lớp K63 |

---

## 1. Vai trò trong dự án

Với tư cách là **Product Owner** kiêm **Trưởng nhóm phụ trách Logic Tài chính (Financial Logic Lead)** của Finfolio 2.0, em chịu trách nhiệm cao nhất về:
1. **Định nghĩa ranh giới sản phẩm (Product Scope & Claim Boundary):** Xác định bài toán cốt lõi, người dùng mục tiêu, danh mục tài sản khả dụng và ranh giới trách nhiệm pháp lý/học thuật (sản phẩm hỗ trợ phân tích định lượng, không đưa ra khuyến nghị đầu tư).
2. **Xây dựng và chuẩn hóa phương pháp tài chính cốt lõi:** Thiết lập công thức cho chuỗi giá trị danh mục mua và giữ, phân rã đóng góp lợi nhuận, phân rã rủi ro Euler, phân rã hiệu ứng tỷ giá và giả định tài chính của bài toán tối ưu hóa. Phạm vi này tập trung vào tính đúng đắn và ý nghĩa tài chính; thiết kế dữ liệu benchmark thuộc Trần Minh Ngọc, còn hiện thực Monte Carlo thuộc Lê Bảo An.
3. **Phê duyệt phương pháp luận (Methodology Acceptance):** Kiểm định tính nhất quán toán học của các công thức trước khi đội ngũ lập trình chuyển hóa thành mã nguồn (`demo/finance.mjs`, `demo/optimizer.mjs`, `demo/metrics.mjs`). Đảm bảo mọi kết quả đầu ra đều có khả năng giải trình (defensible) trước hội đồng giảng viên.

---

## 2. Dấu ấn cá nhân trong sản phẩm

Dấu ấn rõ nét nhất của em trong Finfolio 2.0 thể hiện qua 3 đóng góp mang tính trụ cột:

1. **Chuẩn hóa khung phân rã rủi ro Euler (Euler Risk Attribution) trên dữ liệu thực tế:**  
   Em đã trực tiếp chứng minh và áp dụng định lý Euler cho hàm thuần nhất bậc 1 vào phân rã rủi ro danh mục:
   $$\sigma_P = \sum_{i=1}^N w_i \cdot \frac{(\Sigma \mathbf{w})_i}{\sqrt{\mathbf{w}^T \Sigma \mathbf{w}}} \cdot \sqrt{252}$$
   Điều này giúp giải quyết câu hỏi hóc búa của nhà đầu tư: *"Một cổ phiếu chiếm 20% vốn thì đóng góp chính xác bao nhiêu % vào tổng độ biến động 18% của danh mục?"*, thay vì chỉ dừng lại ở các chỉ số biến động riêng lẻ.
2. **Khung phân rã tỷ giá FX 3 thành phần (Asset Return vs FX Return vs Interaction):**  
   Khi danh mục kết hợp cổ phiếu Việt Nam (VND) và hàng hóa quốc tế định giá bằng USD (như GLD), em đã thiết lập công thức phân rã:
   $$r_{VND} = (1 + r_{\text{local}})(1 + r_{FX}) - 1 = w_i r_{\text{local}} + w_i r_{FX} + w_i r_{\text{local}} r_{FX}$$
   Đảm bảo tổng các đóng góp quy đổi hoàn toàn khớp với tỷ suất sinh lời VND của toàn danh mục mà không làm méo mó các vị thế nội địa.
3. **Thiết lập ranh giới cam kết minh bạch cho mô hình tối ưu hóa:**  
   Em kiên quyết bác bỏ việc gọi kết quả tối ưu là "danh mục tốt nhất" (best portfolio). Thay vào đó, em quy chuẩn hóa kết quả thành **"Phương án phân bổ tham chiếu (Reference Allocation)"** với các ràng buộc lồi chặt chẽ (giới hạn từng mã $\le 80\%$, giới hạn hàng hóa $\le 60\%$, không bán khống $w_i \ge 0$), đi kèm cảnh báo về thiên lệch mẫu lịch sử (in-sample estimation error).

---

## 3. Những việc đã thực sự làm

### 3.1. Xác định bài toán và chuẩn hóa phạm vi sản phẩm (Week 1 & Week 2)
- Cùng nhóm đánh giá 3 đề tài tiềm năng (so sánh sản phẩm tiết kiệm, định giá khoản vay tiêu dùng, phân tích danh mục Finfolio 2.0). Em là người bảo vệ quyết định chọn Finfolio 2.0 vì tính ứng dụng cao trong quản trị danh mục hiện đại và phù hợp với kiến thức chuyên ngành Tài chính - Ngân hàng.
- Soạn thảo tài liệu [WEEK1.md](../WEEK1.md) và [WEEK2.md](../WEEK2.md), xác định chuỗi suy luận sản phẩm: `User Task → Essential Inputs → Financial Engine → Risk & Return Brief → User Action`.
- Quyết định khóa Universe của Core MVP ở **Cổ phiếu và Hàng hóa khả dụng (Commodity Proxies)** để đảm bảo tính khả thi về dữ liệu trước khi mở rộng.

### 3.2. Thiết lập công thức Lợi nhuận và Đóng góp lợi nhuận (Week 4)
- Quy chuẩn công thức lợi nhuận danh mục mua và giữ: giá trị danh mục $V_t$ được tính từ số lượng cổ phiếu giả định mua tại phiên đầu tiên $q_i$ nhân với giá đóng cửa $P_{i,t}$ và tỷ giá $FX_{i,t}$.
- Thiết lập quy tắc phân rã đóng góp lợi nhuận tuyệt đối:
  $$\text{Contribution}_i = w_{i,0} \cdot r_{i,\text{period}}$$
  với điều kiện nghiệm thu: $\sum_{i=1}^N \text{Contribution}_i = R_P$.
- Xây dựng nguyên tắc phân nhóm theo ngành (Sector Attribution) và loại tài sản (Asset Class) mà không cộng chồng chéo (mutually exclusive).

### 3.3. Xây dựng mô hình Rủi ro và Ma trận Hiệp phương sai (Week 4)
- Thiết lập quy tắc tính ma trận hiệp phương sai mẫu $\Sigma$ từ chuỗi lợi nhuận ngày tính bằng VND (chia mẫu số $n-1$).
- Annualization factor chuẩn hóa: nhân với $\sqrt{252}$ cho độ biến động và rủi ro biên.
- Xác định điều kiện phương pháp: chỉ tính covariance sau khi bộ dữ liệu đã vượt qua các kiểm tra tương thích và căn ngày do Data Lead phụ trách.

### 3.4. Thiết kế mô hình Tối ưu hóa phân bổ có ràng buộc (Week 4 & OPTIMIZATION.md)
- Soạn thảo tài liệu phương pháp [OPTIMIZATION.md](../OPTIMIZATION.md), lựa chọn 2 hàm mục tiêu:
  - **Minimum Volatility:** $\min_{\mathbf{w}} \mathbf{w}^T \Sigma \mathbf{w}$ trên tập lồi simplex $\sum w_i = 1, 0 \le w_i \le \text{Cap}_i$.
  - **Maximum Sharpe:** $\max_{\mathbf{w}} \frac{\mathbf{w}^T \boldsymbol{\mu} - r_{f,\text{daily}}}{\sqrt{\mathbf{w}^T \Sigma \mathbf{w}}} \cdot \sqrt{252}$.
- Giải quyết bài toán Lãi suất phi rủi ro ($r_f$): Kế thừa hằng số mặc định $3.0\%$/năm tương thích với Finfolio 1.0 (nhằm giảm thiểu gánh nặng nhập liệu cho người dùng), đồng thời cung cấp chế độ tùy chỉnh minh bạch tại mục Cài đặt nâng cao.

### 3.5. Phê duyệt chỉ số và ranh giới diễn giải (Week 7 & FINAL_METHODS.md)
- Rà soát định nghĩa và cách diễn giải các chỉ số tài chính trong [FINAL_METHODS.md](../FINAL_METHODS.md): CAGR, Max Drawdown, Sharpe, Sortino, Calmar, VaR/CVaR, Skewness, Excess Kurtosis, Beta, Jensen's Alpha, Tracking Error và Information Ratio.
- Quy định ranh giới ngôn ngữ: số liệu lịch sử và phương án tối ưu chỉ là bằng chứng phân tích, không phải dự báo chắc chắn hay khuyến nghị mua/bán. Phần thiết kế dữ liệu đầu vào cho benchmark thuộc Data Lead; thuật toán và triển khai Monte Carlo thuộc Lead Developer.

---

## 4. Bảng tổng hợp File, Logic và Đóng góp cụ thể

| Hạng mục | Chi tiết phần đã đóng góp | File minh chứng | Cách thức kiểm tra / Nghiệm thu |
| :--- | :--- | :--- | :--- |
| **Logic Lợi nhuận** | Công thức Buy-and-hold $V_t$, Return contribution, Group attribution theo Sector/Industry | [WEEK4.md](../WEEK4.md), [finance.mjs](../../demo/finance.mjs) | Chạy `node --test demo/finance.test.mjs`, kiểm tra test case T01 & T04 |
| **Phân rã Rủi ro Euler** | Công thức hiệp phương sai $\Sigma$, rủi ro biên MCR, rủi ro thành phần RC, đẳng thức Euler $\sum RC_i = \sigma_P$ | [WEEK4.md](../WEEK4.md), [finance.mjs](../../demo/finance.mjs) | Test case kiểm tra đẳng thức Euler với sai số $< 10^{-10}$ |
| **Phân rã FX 3 thành phần** | Tách $r_{VND}$ thành Asset Return + FX Return + Interaction Return | [FX_ATTRIBUTION.md](../FX_ATTRIBUTION.md), [attribution.mjs](../../demo/attribution.mjs) | Kiểm tra test case danh mục kết hợp FPT (VND) và GLD (USD quy đổi) |
| **Phương pháp Tối ưu hóa** | Bài toán Min-Vol, Max-Sharpe, ràng buộc Simplex, per-asset cap $\le 80\%$, commodity cap $\le 60\%$ | [OPTIMIZATION.md](../OPTIMIZATION.md), [optimizer.mjs](../../demo/optimizer.mjs) | Kiểm tra test case 2 tài sản độc lập: $\sigma_1^2=0.04, \sigma_2^2=0.09 \to w_1=69.23\%, w_2=30.77\%$ |
| **Phê duyệt chỉ số & Claim Boundary**| Rà soát định nghĩa các chỉ số và quy tắc diễn giải kết quả không mang tính khuyến nghị | [FINAL_METHODS.md](../FINAL_METHODS.md), [WEEK5.md](../WEEK5.md) | Đối chiếu định nghĩa, đơn vị và cảnh báo cạnh kết quả |

---

## 5. Bằng chứng đóng góp theo 7 tuần dự án

| Tuần | Ghi nhận trong tiến trình nhóm | Output cụ thể được xác nhận | Ý nghĩa đóng góp cá nhân |
| :---: | :--- | :--- | :--- |
| **W1** | Linh đề xuất chọn đề tài Finfolio 2.0; xây dựng problem statement và target user. | [WEEK1.md](../WEEK1.md) (Problem Direction) | Định hình bài toán thực tế, gắn chặt với kiến thức Tài chính - Ngân hàng. |
| **W2** | Linh định hình chuỗi logic MVP và phạm vi ranh giới sản phẩm. | [WEEK2.md](../WEEK2.md) (Product Direction & MVP) | Khóa phạm vi khả thi, ngăn chặn việc sa đà vào các tính năng viễn vông. |
| **W3** | Linh xác nhận các giả định tài chính cần được dữ liệu đáp ứng; Data Lead đặc tả nguồn, benchmark và quy đổi. | [WEEK3.md](../WEEK3.md) (Assumptions & Boundaries) | Tách rõ yêu cầu phương pháp khỏi trách nhiệm chuẩn bị dữ liệu. |
| **W4** | Linh hoàn thiện toàn bộ công thức tài chính cho Core MVP. | [WEEK4.md](../WEEK4.md) (Financial Logic & Expected Results) | Là văn kiện nòng cốt để lập trình viên chuyển hóa thành code tính toán. |
| **W5** | Linh rà soát acceptance criteria, quy chuẩn hóa ngôn ngữ giải thích (Claim Boundary). | [WEEK5.md](../WEEK5.md) (Feature & Output Explanation) | Đảm bảo hệ thống không dùng từ ngữ khuyến nghị mua/bán sai chuẩn mực. |
| **W6** | Linh nghiệm thu bộ tính toán `demo/finance.mjs` và các ca kiểm thử T04–T05. | [WEEK6.md](../WEEK6.md) (Financial Consistency & Test Table) | Xác nhận thuật toán tối ưu hóa trên lưới đạt độ chính xác tài chính. |
| **W7** | Linh hoàn thành tài liệu [FINAL_METHODS.md](../FINAL_METHODS.md) và [OPTIMIZATION.md](../OPTIMIZATION.md). | [FINAL_METHODS.md](../FINAL_METHODS.md), [OPTIMIZATION.md](../OPTIMIZATION.md) | Hoàn thiện toàn bộ cơ sở lý thuyết cho bản phát hành chính thức Final v2.0. |

---

## 6. Hạn chế còn tồn tại và Bài học kinh nghiệm

### 6.1. Hạn chế về mặt phương pháp tài chính
- **Chưa tính cổ tức tái đầu tư (Dividend Reinvestment):** Mô hình hiện tại sử dụng chuỗi giá đóng cửa chưa điều chỉnh (unadjusted price return), do đó chưa phản ánh toàn diện tổng lợi nhuận (Total Return) nếu cổ phiếu chi trả cổ tức tiền mặt lớn.
- **Giả định Lãi suất phi rủi ro tĩnh:** Lãi suất $3\%$/năm là giả định cố định trong suốt kỳ phân tích, chưa phản ánh đúng sự biến động của đường cong lợi suất trái phiếu chính phủ Việt Nam theo thời gian.
- **Hiện tượng bẫy mẫu trong tối ưu hóa (In-sample Overfitting):** Trọng số tối ưu hóa Max-Sharpe được tính toán dựa trên dữ liệu quá khứ; chưa có bước kiểm định ngoài mẫu (Out-of-sample backtesting) để chứng minh tính bền vững trong tương lai.

### 6.2. Bài học kinh nghiệm cá nhân
- **Tư duy phản biện về phương pháp:** Không chấp nhận một chỉ số chỉ vì công thức chạy được; cần kiểm tra đơn vị, giả định, đẳng thức đối soát và giới hạn diễn giải trước khi phê duyệt.
- **Kỷ luật ranh giới sản phẩm:** Trong công nghệ tài chính, ranh giới giữa một *công cụ phân tích hỗ trợ ra quyết định* và một *hệ thống tư vấn tài chính trái phép* là rất mong manh. Việc kiên định duy trì các thông điệp cảnh báo rủi ro (disclaimers) là đạo đức nghề nghiệp bắt buộc.


