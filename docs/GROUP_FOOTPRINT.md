# Group Footprint — Finfolio 2.0

## 1. Thông tin chung dự án

| Mục | Nội dung |
| :--- | :--- |
| **Tên sản phẩm** | **Finfolio 2.0 — Portfolio Attribution & Risk Analytics** |
| **Mã nhóm** | **G09** |
| **Môn học** | Ứng dụng CNTT trong Tài chính - Ngân hàng (NHA408E) |
| **Khóa** | K63 — Trường Đại học Ngoại thương (FTU) |
| **Repository** | [https://github.com/FTU-Legacy-63/G09](https://github.com/FTU-Legacy-63/G09) (Bản lưu trữ kiểm định: [v2.0.0-final-20261023](https://github.com/FTU-Legacy-63/G09/releases/tag/v2.0.0-final-20261023)) |
| **Production URL** | [https://g09-finfolio.vercel.app/](https://g09-finfolio.vercel.app/) |
| **Trạng thái kiểm thử** | **85 tests pass** (50 JavaScript tests + 35 Python unit tests tại thời điểm nộp 23/10/2026) |

---

## 2. Vấn đề nhóm giải quyết (Problem Statement)

### 2.1. Bối cảnh thực tế
Nhà đầu tư cá nhân trên thị trường tài chính hiện nay (đặc biệt tại Việt Nam) khi tự quản lý danh mục đầu tư đa tài sản (cổ phiếu niêm yết, quỹ ETF, kim loại quý/hàng hóa proxy) thường sử dụng các ứng dụng chứng khoán hoặc bảng tính cá nhân (Excel/Google Sheets). Các công cụ này chủ yếu hiển thị **giá thị trường, lãi/lỗ tức thời (unrealized PnL) và tỷ suất sinh lời tổng hợp** của từng mã riêng lẻ.

Tuy nhiên, người dùng gặp phải 4 khó khăn cốt lõi ở cấp độ toàn danh mục (**portfolio level**):
1. **Không biết lợi nhuận thực chất đến từ đâu (Return Attribution Deficit):** Một danh mục có thể đang sinh lời 15%, nhưng người dùng không xác định được mã cổ phiếu nào, nhóm ngành nào (Sector) hay biến động tỷ giá (FX) đóng góp phần lớn tỷ suất sinh lời đó.
2. **Không nhận diện được rủi ro tập trung tiềm ẩn (Risk Concentration Blindness):** Một cổ phiếu chỉ chiếm 20% tỷ trọng vốn nhưng do biến động cao và tương quan dương mạnh với phần còn lại, nó có thể đóng góp tới 50% tổng độ biến động danh mục (Euler Risk Contribution). Các công cụ truyền thống không đo lường được rủi ro biên này.
3. **Thiếu hệ quy chiếu chuẩn mực (Benchmark Comparison Gap):** Nhà đầu tư không biết hiệu quả danh mục của mình là do năng lực lựa chọn tài sản (Alpha) hay chỉ đơn thuần là biến động chung theo xu hướng thị trường (Beta) do thiếu việc so sánh chuẩn mực trên cùng chuỗi ngày giao dịch với VN30, VN-Index hoặc ETF tham chiếu.
4. **Bế tắc khi ra quyết định tái phân bổ (Allocation Dilemma):** Khi thị trường biến động, người dùng không biết nếu thay đổi phân bổ thì sự đánh đổi giữa rủi ro và lợi nhuận (Risk-Return Trade-off) sẽ thay đổi định lượng ra sao; các khuyến nghị trên diễn đàn mang tính định tính, trong khi các mô hình tối ưu hóa định lượng lại quá phức tạp.

### 2.2. Tuyên bố bài toán (Problem Statement)
> *"Nhà đầu tư cá nhân có hiểu biết tài chính đang tự theo dõi danh mục cổ phiếu và hàng hóa gặp khó khăn khi đưa ra quyết định giữ nguyên hay tái phân bổ danh mục, vì các chỉ số tổng hợp truyền thống không giải thích được lợi nhuận và rủi ro đang tập trung ở đâu, danh mục vận hành khác biệt thế nào so với benchmark, và một phương án phân bổ tham khảo sẽ làm thay đổi trade-off rủi ro – lợi nhuận như thế nào."*

---

## 3. Người dùng mục tiêu (Target User)

Sản phẩm Finfolio 2.0 xác định ranh giới người dùng rất khắt khe:

- **Chân dung người dùng trọng tâm:** Nhà đầu tư cá nhân đã có kiến thức nền tảng về tài chính – đầu tư (hiểu các khái niệm tỷ trọng, độ lệch chuẩn, lãi suất phi rủi ro), đang trực tiếp nắm giữ từ 2 đến 30 tài sản (gồm cổ phiếu Việt Nam, cổ phiếu quốc tế niêm yết USD, chứng chỉ quỹ ETF, commodity proxy) và muốn tự đánh giá danh mục định kỳ.
- **Đối tượng phụ:** Sinh viên chuyên ngành Tài chính – Ngân hàng cần một công cụ thực nghiệm để nghiên cứu mô hình Markowitz, Euler Risk Decomposition, và mô phỏng Bootstrap Monte Carlo trên dữ liệu thị trường thực tế.
- **Ranh giới loại trừ (Non-target users):** Nhóm **không** phục vụ người dùng F0 hoàn toàn chưa có kiến thức tài chính (dễ hiểu lầm các chỉ số xác suất), **không** phục vụ các định chế tài chính/quỹ tương hỗ chuyên nghiệp (vốn cần hệ thống Bloomberg/Refinitiv với mô hình đa nhân tố Barra), và **không** phục vụ nhà đầu tư lướt sóng trong ngày (day traders) vì Finfolio phân tích theo nến ngày đóng cửa (EOD close).

---

## 4. Phạm vi sản phẩm (Product Scope)

### 4.1. Khung chức năng Core MVP
Core MVP giải quyết trọn vẹn chuỗi hành trình quyết định của người dùng thông qua **Risk and Return Allocation Brief**:
- **Universe tài sản:** Hỗ trợ cổ phiếu Việt Nam (HOSE/HNX), chứng chỉ quỹ ETF, cổ phiếu niêm yết tại Mỹ (USD), và 23 quỹ ETF hàng hóa đại diện (Commodity Proxies như GLD - vàng, SLV - bạc, USO - dầu thô, CPER - đồng, DBA - nông sản).
- **Phân rã đóng góp lợi nhuận (Return Attribution):** Phân rã lợi nhuận danh mục theo từng mã tài sản, theo nhóm tài sản (Asset Class), theo ngành kinh tế (Sector/Industry từ dữ liệu niêm yết thực tế), và phân rã cấu phần Tỷ giá (FX Attribution: Asset Return vs FX Return vs Cross-Product Interaction) đối với tài sản định giá USD quy về đồng báo cáo VND.
- **Phân rã đóng góp rủi ro (Risk Attribution):** Tính ma trận hiệp phương sai lịch sử (Sample Covariance), độ biến động năm hóa (Annualized Volatility, căn 252 phiên), và phân bổ rủi ro Euler (Euler Marginal Risk Contribution), chứng minh đẳng thức Euler $\sum RC_i = \sigma_P$.
- **So sánh chuẩn mực (Benchmark Comparison):** So sánh trực diện với VN30, VN-Index hoặc ETF chuẩn hóa trên cùng khoảng ngày giao dịch chung; xác định Active Return và Tracking Error.
- **Tối ưu hóa phân bổ tham chiếu (Constrained Optimization):** Cung cấp 2 kịch bản tối ưu hóa: Độ biến động tối thiểu (Minimum Volatility) và Tỷ số Sharpe tối đa (Maximum Sharpe) với các ràng buộc lồi chặt chẽ (Long-only simplex $\sum w_i = 1, w_i \ge 0$, giới hạn tỷ trọng đơn vị $\le 80\%$, trần hàng hóa $\le 60\%$).

### 4.2. Mở rộng Final Release (So sánh với K62 & Bản MVP)
Finfolio 2.0 đã nâng cấp vượt bậc so với phiên bản Finfolio 1.0 của K62:
1. **Kiến trúc đa trang chuyên biệt:** Không dồn vào một dashboard duy nhất; tách biệt thành 7 URL chuyên sâu (`/`, `/portfolio`, `/analysis`, `/optimize`, `/simulation`, `/method`, `/account`).
2. **Bộ chỉ số đo lường rủi ro nâng cao (Advanced Risk Metrics):** Tích hợp CAGR chính xác theo ngày lịch, Max Drawdown, Tỷ số Sharpe/Sortino/Calmar, VaR 95% lịch sử, Conditional VaR (Expected Shortfall) với xử lý phân vị nội suy chính xác, Skewness & Excess Kurtosis hiệu chỉnh mẫu nhỏ theo chuẩn NIST, Beta & Jensen's Alpha.
3. **Mô phỏng ngẫu nhiên Monte Carlo (Joint Moving-Block Bootstrap):** Khắc phục nhược điểm của giả định phân phối chuẩn; lấy mẫu lại theo từng khối 5 ngày liên tiếp (block size = 5) để bảo toàn cấu trúc tương quan chéo giữa các tài sản và hiện tượng biến động theo cụm (volatility clustering), chạy độc lập trên Web Worker đa luồng.
4. **Nhật ký quyết định người dùng (Decision Journal):** Tích hợp xác thực tài khoản Google/Supabase để lưu trữ quyết định tái phân bổ của cá nhân, hình thành thói quen kỷ luật đầu tư.

---

## 5. Dữ liệu đầu vào và Nguồn dữ liệu (Data & Input Schema)

### 5.1. Bảng đặc tả trường dữ liệu (Input Dictionary)

| Tên trường | Kiểu dữ liệu | Đơn vị / Định dạng | Quy tắc kiểm tra (Validation Rule) | Nguồn cấp / Xử lý |
| :--- | :--- | :--- | :--- | :--- |
| `symbol` | String | Mã ticker (VD: `FPT.VN`, `GLD`) | Viết hoa, phải thuộc universe hoặc tìm kiếm thấy | Người dùng chọn từ autocomplete |
| `asset_value` | Number | VND hoặc USD | Giá trị thực số dương $> 0$ | Người dùng nhập |
| `currency` | Enum | `VND`, `USD` | Độc lập giữa đơn vị nhập và đồng tiền niêm yết | Người dùng chọn |
| `benchmark` | String | Ticker benchmark | Bắt buộc (`VN30`, `VNINDEX`, `GLD`, `YF:...`) | Mặc định gợi ý VN30 |
| `time_horizon` | Enum | 1M, 3M, 6M, YTD, 1Y, 3Y, 5Y | Tối đa 5 năm lịch sử | Người dùng chọn |
| `objective` | Enum | `min_variance`, `max_sharpe` | Thuộc 2 hàm mục tiêu được hỗ trợ | Người dùng chọn tại tab `/optimize` |
| `max_asset_cap`| Number | Tỷ lệ % (VD: $80\%$) | $1/N \le \text{Cap} \le 1.0$ (Đảm bảo tính khả thi) | Mặc định $80\%$ |
| `max_comm_cap` | Number | Tỷ lệ % (VD: $60\%$) | Phải lớn hơn tổng tỷ trọng hàng hóa tối thiểu | Mặc định $60\%$ |
| `risk_free_rate`| Number | % năm hóa (VD: $3.0\%$) | $r_f \ge 0\%$, kế thừa hằng số từ Finfolio 1.0 | Mặc định 3%/năm; cho phép sửa |

### 5.2. Nguồn dữ liệu thị trường và Giám sát tính tươi mới (Provenance & Freshness)
- **Cổ phiếu và chỉ số Việt Nam:** Dữ liệu nến ngày lấy từ TradingView thông qua thư viện `tvdatafeed`. Hệ thống duy trì một Universe 26 mã nòng cốt trong `demo/vn_universe.json` được cập nhật tự động bằng GitHub Actions định kỳ lúc **16:17 và 20:47 giờ Việt Nam (thứ Hai đến thứ Sáu)** và xuất bản sang nhánh `market-data`.
- **Thị trường quốc tế & Hàng hóa & Tỷ giá:** Lấy từ Yahoo Finance (`yfinance`) đối với các ETF niêm yết USD, commodity proxies và tỷ giá `VND=X`.
- **Căn chỉnh phiên chung (Common Date Alignment):** Do lệch múi giờ và ngày nghỉ lễ giữa TTCK Việt Nam (HOSE) và Mỹ (NYSE), hệ thống thực hiện phép giao (Inner Join) các ngày giao dịch chung có đầy đủ giá của tất cả tài sản và tỷ giá FX.
- **Quy đổi tỷ giá nhất quán:** Khoản đầu tư bằng USD được quy đổi sang VND tại tỷ giá của **phiên giao dịch chung đầu tiên**, đảm bảo tổng vốn VND ban đầu không bị biến động ảo do trôi tỷ giá quá khứ.

---

## 6. Logic tài chính và Công thức cốt lõi (Financial Logic)

```
[Nhập Danh mục & Vốn] 
       ↓ 
[Kiểm tra & Căn ngày chung] → [Quy đổi vốn về VND tại T0]
       ↓
[Tính Lợi nhuận Danh mục & Phân rã Return (Asset / Sector / FX)]
       ↓
[Ước lượng Ma trận Covariance & Phân rã Euler Risk Contribution]
       ↓
[Đối chiếu Benchmark (Active Return, Tracking Error, Beta, Alpha)]
       ↓
[Tối ưu hóa lồi có ràng buộc (Min Volatility & Max Sharpe)]
       ↓
[Mô phỏng Moving-Block Bootstrap Monte Carlo 2.000 kịch bản]
       ↓
[Risk & Return Allocation Brief → Ghi nhận Nhật ký Quyết định]
```

### 6.1. Công thức Lợi nhuận và Đóng góp lợi nhuận (Return Attribution)
- Lợi nhuận theo chuỗi thời gian của tài sản $i$ tại ngày $t$:
  $$r_{i,t} = \frac{P_{i,t}}{P_{i,t-1}} - 1$$
- Giá trị danh mục buy-and-hold tại thời điểm $T$:
  $$V_T = \sum_{i=1}^N q_i \cdot P_{i,T} \cdot FX_{i,T}$$
- Tỷ suất sinh lời toàn kỳ của danh mục:
  $$R_P = \frac{V_T}{V_0} - 1 = \sum_{i=1}^N w_{i,0} \cdot r_{i,\text{period}}$$
- Phân rã FX đối với tài sản yết giá ngoại tệ (với $r_{\text{local}}$ là lợi nhuận bản tệ, $r_{FX}$ là biến động tỷ giá):
  $$r_{VND} = (1 + r_{\text{local}})(1 + r_{FX}) - 1 = \underbrace{w_i \cdot r_{\text{local}}}_{\text{Đóng góp giá}} + \underbrace{w_i \cdot r_{FX}}_{\text{Đóng góp FX}} + \underbrace{w_i \cdot r_{\text{local}} \cdot r_{FX}}_{\text{Hiệu ứng tương tác}}$$

### 6.2. Công thức Rủi ro và Phân rã rủi ro Euler (Euler Risk Attribution)
- Ma trận hiệp phương sai mẫu $\Sigma$ từ chuỗi lợi nhuận ngày tính bằng VND (chia mẫu số $n-1$).
- Độ biến động năm hóa danh mục:
  $$\sigma_P = \sqrt{252 \cdot \mathbf{w}^T \Sigma \mathbf{w}}$$
- Đóng góp rủi ro biên (Marginal Contribution to Risk - MCR):
  $$\text{MCR}_i = \frac{(\Sigma \mathbf{w})_i}{\sqrt{\mathbf{w}^T \Sigma \mathbf{w}}}$$
- Đóng góp rủi ro thành phần (Euler Risk Contribution - RC):
  $$\text{RC}_i = w_i \cdot \text{MCR}_i \cdot \sqrt{252}$$
- **Đẳng thức nghiệm thu toán học (Euler's Theorem for Homogeneous Functions):**
  $$\sum_{i=1}^N \text{RC}_i = \sigma_P$$

### 6.3. Tối ưu hóa phân bổ (Constrained Optimization)
1. **Bài toán Độ biến động tối thiểu (Minimum Volatility):**
   $$\min_{\mathbf{w}} \mathbf{w}^T \Sigma \mathbf{w} \quad \text{thỏa mãn} \quad \sum_{i=1}^N w_i = 1, \quad 0 \le w_i \le \text{Cap}_i, \quad \sum_{j \in \text{Commodity}} w_j \le \text{Cap}_{\text{comm}}$$
   Giải bằng thuật toán dốc có điều kiện (Conditional Gradient / Frank-Wolfe) đảm bảo nghiệm hội tụ trên tập lồi simplex.
2. **Bài toán Tỷ số Sharpe tối đa (Maximum Sharpe):**
   $$\max_{\mathbf{w}} \frac{\mathbf{w}^T \boldsymbol{\mu} - r_{f,\text{daily}}}{\sqrt{\mathbf{w}^T \Sigma \mathbf{w}}} \cdot \sqrt{252}$$
   Khởi tạo với 3 điểm xuất phát (Equally-weighted, Inverse-volatility, Min-volatility) để tìm nghiệm xấp xỉ tối ưu cục bộ tốt nhất.

### 6.4. Mô phỏng Bootstrap Monte Carlo
Lấy mẫu lại các khối lợi nhuận chung $\mathbf{R}_{t:t+b-1}$ với kích thước khối $b = 5$ phiên giao dịch liên tiếp. Mô phỏng $M = 2.000$ đường đi của tổng giá trị danh mục trong chân trời $H = 252$ phiên bắt đầu từ giá trị và tỷ trọng thực tế tại cuối kỳ phân tích. Trích xuất các phân vị $5\%, 25\%, 50\%, 75\%, 95\%$ và xác suất tổn thất $\mathbb{P}(V_{T+H} < V_T)$.

---

## 7. Kiến trúc hệ thống và Công nghệ (Architecture & Tech Stack)

| Thành phần | Công nghệ lựa chọn | Lý do lựa chọn |
| :--- | :--- | :--- |
| **Frontend Framework** | **Vanilla JavaScript (ES Modules)** | Loại bỏ hoàn toàn overhead của React/Vite, nạp tức thì trong 200ms, không phụ thuộc bundle build phức tạp |
| **Backend API** | **Python (HTTP Server / Vercel Serverless Function)** | Tận dụng hệ sinh thái xử lý dữ liệu mạnh mẽ của Python (`pandas`, `numpy`, `yfinance`, `tvdatafeed`) |
| **Đa luồng trình duyệt** | **Web Worker (`research-worker.mjs`)** | Chuyển toàn bộ thuật toán tối ưu hóa Frank-Wolfe và 2.000 đường chạy Monte Carlo sang luồng ngầm, UI mượt mà 60fps |
| **Đồ họa & Trực quan** | **Native SVG (`chart-utils.mjs`)** | Vẽ biểu đồ PnL giá trị thực VND, crosshair trục kép X/Y, fan chart Monte Carlo tương thích hoàn hảo mọi độ phân giải |
| **Typography & UI** | **Self-hosted CSS Tokens & Fonts** | Bộ font Be Vietnam Pro và Fraunces tự lưu trữ nội bộ, bảng màu Forest/Paper tạo cảm giác tin cậy tài chính |
| **CI/CD & Dữ liệu** | **GitHub Actions (`update-vn-data.yml`)** | Tự động hóa tải nến ngày TTCK Việt Nam sau giờ đóng cửa, lưu snapshot độc lập trên nhánh `market-data` |
| **Deployment** | **Vercel** | Hỗ trợ cấu hình rewrite đa trang (`vercel.json`), tích hợp Python Function `/api/*` với độ trễ thấp |

---

## 8. Hướng dẫn chạy và Demo sản phẩm (Demo Script)

### 8.1. Cài đặt và khởi chạy cục bộ (Local Run)
```bash
# 1. Di chuyển vào thư mục dự án
cd G09-Finfolio

# 2. Cài đặt phụ thuộc frontend và build font assets
npm ci
npm run build

# 3. Cài đặt thư viện Python cho API server
python3 -m pip install -r demo/requirements.txt

# 4. Khởi chạy máy chủ tích hợp (cổng 8123)
python3 demo/server.py
```
Mở trình duyệt tại địa chỉ: `http://127.0.0.1:8123/portfolio`.

### 8.2. Kịch bản chạy kiểm thử tự động (Verification Suite)
```bash
# Chạy 50 kiểm thử JavaScript (tính toán tài chính, Euler identity, worker, SVG chart)
node --test demo/*.test.mjs

# Chạy 35 kiểm thử Python (API providers, routing TradingView/Yahoo, căn ngày, metadata)
python3 -m unittest discover -s demo -p 'test_*.py'
```

### 8.3. Kịch bản Demo thuyết trình 3 phút tại lớp (Standard Talk Track)
1. **Bước 1 — Nhập danh mục thực tế:** Nhập `FPT.VN` (40 triệu VND), `HPG.VN` (35 triệu VND), và `GLD` (25 triệu VND); chọn khung thời gian 5 năm, benchmark là `VN30 Index`. Giới hạn tỷ trọng mã $80\%$, hàng hóa $60\%$.
2. **Bước 2 — Phân tích Danh mục hiện tại (`/analysis`):**
   - Chỉ ra tổng vốn khởi điểm chính xác 100.000.000 VND trên biểu đồ PnL.
   - Mở bảng Return Attribution: giải thích vì sao FPT đóng góp lớn nhất vào lợi nhuận.
   - Mở bảng Euler Risk: chỉ ra GLD có tương quan thấp với cổ phiếu VN, giúp giảm biến động tổng thể của danh mục ra sao.
3. **Bước 3 — Tối ưu hóa phân bổ (`/optimize`):** Bấm chạy Minimum Volatility; chỉ ra tỷ trọng mới tự động giảm rủi ro danh mục như thế nào mà không vi phạm các trần quy định.
4. **Bước 4 — Mô phỏng tương lai (`/simulation`):** Chạy Monte Carlo 2.000 kịch bản; giải thích dải màu phân vị 5% - 95% và tỷ lệ xác suất hòa vốn.
5. **Bước 5 — Nhật ký quyết định (`/account`):** Lưu phương án tham khảo vào hệ thống làm bằng chứng kỷ luật đầu tư.

---

## 9. Tiến trình dự án 7 tuần (Weekly Progression & Evidence)

| Tuần | Mục tiêu giai đoạn | Quyết định & Kết quả chính của Nhóm G09 | File bằng chứng trong Repo |
| :---: | :--- | :--- | :--- |
| **W1** | Định hướng vấn đề (Problem Direction) | So sánh 3 đề tài; chọn Finfolio 2.0; xác định target user là nhà đầu tư cá nhân cần hiểu nguồn gốc return/risk thay vì nhìn chỉ số tổng; khóa phạm vi cổ phiếu + hàng hóa. | [docs/WEEK1.md](WEEK1.md) |
| **W2** | Định hình MVP & User Flow | Thiết kế chuỗi giá trị: Input → Validate → Analyze → Attribute → Compare → Optimize → Explain. Khóa ranh giới: tối ưu hóa là phương án tham chiếu, không phải khuyến nghị đầu tư. | [docs/WEEK2.md](WEEK2.md) |
| **W3** | Chuẩn bị dữ liệu & Kiểm định nguồn | Xây dựng Data Dictionary 18 trường; nhận diện blocker thiếu VN-Index trên Yahoo; thiết lập phương án tích hợp TradingView và cơ chế fallback; đặc tả giả định A01–A10. | [docs/WEEK3.md](WEEK3.md) |
| **W4** | Chuẩn hóa Logic tài chính & Công thức | Khóa phương pháp toán học: Buy-and-hold value path, Euler risk decomposition, Constrained Frank-Wolfe optimizer, FX attribution 3 thành phần. | [docs/WEEK4.md](WEEK4.md), [docs/OPTIMIZATION.md](OPTIMIZATION.md) |
| **W5** | Đặc tả tính năng, Luồng & Giao diện | Chi tiết hóa 9 kịch bản kiểm thử (W5-T01 đến W5-T09); thiết kế cấu trúc phân cấp thông tin; tiếp nhận feedback giao diện draft từ Drive; chuẩn hóa hiển thị VND thay vì base-100. | [docs/WEEK5.md](WEEK5.md) |
| **W6** | Tích hợp hệ thống & Kiểm thử Build | Xây dựng demo hoạt động thực tế trên Vercel; tích hợp API TradingView/tvdatafeed nạp 26 mã VN; thiết lập GitHub Actions cron job 16:17 & 20:47; thông qua 10 ca kiểm thử T01–T10. | [docs/WEEK6.md](WEEK6.md) |
| **W7** | Kiểm định toàn diện & Phát hành Final | Hoàn thiện kiến trúc 7 trang; bổ sung Monte Carlo bootstrap và bộ chỉ số nâng cao (Sortino, VaR/CVaR, Skew/Kurtosis); thông qua 85 tests; triển khai production READY Vercel. | [docs/WEEK7.md](WEEK7.md), [docs/FINAL_METHODS.md](FINAL_METHODS.md) |

---

## 10. Phân công trách nhiệm thành viên (Team Contribution Matrix)

| Thành viên | MSSV | Vai trò chính | Trách nhiệm cốt lõi | Output chính đối chiếu |
| :--- | :---: | :--- | :--- | :--- |
| **Hoàng Khánh Linh** | 2412380024 | **Product Owner** | Phạm vi sản phẩm, chuẩn hóa công thức tài chính (Return, Euler Risk, FX, Benchmark), giả định tối ưu hóa và phê duyệt tính đúng đắn của phương pháp. | [WEEK4.md](WEEK4.md), [FINAL_METHODS.md](FINAL_METHODS.md), [OPTIMIZATION.md](OPTIMIZATION.md), [linh.md](individual/linh.md) |
| **Nguyễn Quỳnh Anh** | 2413380010 | **Product Manager** | Quản lý yêu cầu sản phẩm, kịch bản kiểm thử chấp nhận (Acceptance Criteria), ma trận kiểm thử hồi quy W5/W6/W7, theo dõi xử lý lỗi (Bug Log). | [WEEK5.md](WEEK5.md), [WEEK6.md](WEEK6.md), [WEEK7.md](WEEK7.md), [quynh-anh.md](individual/quynh-anh.md) |
| **Lê Bảo An** | 2412380002 | **Lead Developer** | Đại diện nhóm; thiết kế kiến trúc hệ thống, xây dựng pipeline dữ liệu Python, Web Worker tính toán định lượng, CI/CD GitHub Actions và triển khai Vercel. | [server.py](../demo/server.py), [finance.mjs](../demo/finance.mjs), [optimizer.mjs](../demo/optimizer.mjs), [bao-an.md](individual/bao-an.md) |
| **Trần Minh Ngọc** | 2412380036 | **Business Analyst**| Thiết kế từ điển dữ liệu (Data Dictionary), thẩm định nguồn dữ liệu thị trường (TradingView vs Yahoo), phân loại ngành kinh tế (Sector/Industry), kiểm soát độ trễ dữ liệu. | [WEEK3.md](WEEK3.md), [classification.py](../demo/classification.py), [vn_data.py](../demo/vn_data.py), [minh-ngoc.md](individual/minh-ngoc.md) |
| **Nguyễn Ngọc Anh** | 2413380008 | **UI/UX Designer** | Thiết kế luồng trải nghiệm người dùng, hệ thống Design Tokens (Forest/Paper theme), Typography tự lưu trữ, trực quan hóa biểu đồ SVG và giải thích số liệu lũy tiến. | [tokens.css](../demo/tokens.css), [chart-utils.mjs](../demo/chart-utils.mjs), [redesign.css](../demo/redesign.css), [ngoc-anh.md](individual/ngoc-anh.md) |

---

## 11. Đánh giá kết quả, Hạn chế & Bài học kinh nghiệm

### 11.1. Những điểm nhóm đã thực hiện xuất sắc
1. **Tính hoàn chỉnh từ Logic đến Sản phẩm:** Nhóm không dừng lại ở mô hình lý thuyết hay bản vẽ giao diện, mà đưa được toàn bộ các công thức định lượng phức tạp (Euler Decomposition, Frank-Wolfe Optimization, Block Bootstrap) vào một web application thực thi mượt mà với 85 automated tests bảo vệ.
2. **Tính trung thực học thuật và Ranh giới cam kết (Claim Boundary):** Không biến sản phẩm thành "hộp đen AI phán lệnh"; mọi kết quả tối ưu hóa đều được dán nhãn là *Phương án phân bổ tham khảo dựa trên dữ liệu lịch sử*, công bố đầy đủ mọi giả định và điều kiện biên.
3. **Giải quyết triệt để bài toán Đa tiền tệ và Đa thị trường:** Xử lý chuẩn mực sự lệch pha ngày giao dịch giữa TTCK Việt Nam và Mỹ bằng thuật toán Inner Join ngày chung và phân rã hiệu ứng tỷ giá FX độc lập.

### 11.2. Hạn chế kỹ thuật còn tồn tại
- **Chưa có lịch nghỉ lễ tự động (Holiday Calendar):** Hệ thống dựa vào việc nhà cung cấp trả về nến giá để nhận diện ngày giao dịch; nếu sàn nghỉ lễ đột xuất, hệ thống chỉ giữ nến phiên gần nhất mà chưa hiển thị lý do nghỉ lễ.
- **Giới hạn Universe cổ phiếu Việt Nam tự động:** Cron job hàng ngày hiện ưu tiên snapshot 26 mã nòng cốt; các mã ngoài universe cần tải trực tiếp qua TradingView nên có thể mất thêm 1–2 giây khi phân tích lần đầu.
- **Thiên lệch dữ liệu quá khứ (In-sample Bias):** Tỷ số Sharpe tối đa phụ thuộc mạnh vào mẫu lịch sử; nhóm chưa tích hợp mô hình Black-Litterman hay shrinkage covariance (Ledoit-Wolf) để giảm thiểu sai số ước lượng kỳ vọng.

### 11.3. Bài học kinh nghiệm quan trọng
- *"Làm sản phẩm Fintech phải bắt đầu từ Logic tài chính và Dữ liệu trước khi vẽ Giao diện":* Nhóm đã trải qua bài học quý giá ở tuần 3 khi suýt bị tắc nghẽn do nguồn dữ liệu Yahoo không hỗ trợ chỉ số VN-Index, từ đó nhận ra tầm quan trọng của việc kiểm định nguồn (Data Provenance) trước khi code giao diện.
- *"Testing không phải là bước phụ, mà là điều kiện tiên quyết của tính Defensible":* Việc duy trì 85 automated tests giúp nhóm tự tin tuyệt đối trước mọi câu hỏi chất vấn của giảng viên về sự nhất quán của các đẳng thức tài chính.

