# Individual Footprint — Lê Bảo An

## Bảng thông tin cá nhân

| Thông tin | Nội dung |
| :--- | :--- |
| **Họ và tên** | **Lê Bảo An** |
| **Mã sinh viên** | **2412380002** |
| **Vai trò chính** | **Đại diện nhóm / Lead Developer / Build & Integration Lead** |
| **Dự án** | **Finfolio 2.0 — Portfolio Attribution & Risk Analytics** |
| **Môn học** | Ứng dụng CNTT trong Tài chính - Ngân hàng (NHA408E) |
| **Nhóm** | Group 09 (G09) — Lớp K63 |

---

## 1. Vai trò trong dự án

Với tư cách là **Đại diện nhóm (Team Representative)** kiêm **Trưởng nhóm Kỹ thuật & Lập trình (Lead Developer)** của Finfolio 2.0, em chịu trách nhiệm cao nhất về:
1. **Kiến trúc hệ thống tổng thể (System Architecture):** Thiết kế mô hình kết hợp giữa Frontend ứng dụng đơn trang thuần (Vanilla JS ES Modules) và Backend tính toán định lượng (Python API Server & Vercel Serverless Functions).
2. **Xây dựng Pipeline Dữ liệu và Tính toán (Data & Computation Pipeline):** Hiện thực hóa toàn bộ các công thức tài chính từ tài liệu đặc tả thành các module mã nguồn chạy mượt mà, tối ưu hóa thuật toán ma trận trên trình duyệt và xử lý đa luồng qua Web Worker.
3. **Quản trị CI/CD và Hạ tầng Triển khai (DevOps & Deployment):** Thiết lập GitHub Actions tự động hóa thu thập dữ liệu giá thị trường hàng ngày; cấu hình triển khai Vercel với các quy tắc định tuyến URL độc lập (`vercel.json`); thiết lập và thực thi bộ kiểm thử tự động 85 test cases (50 JS + 35 Python).

---

## 2. Dấu ấn cá nhân trong sản phẩm

Dấu ấn kỹ thuật nổi bật nhất của em trong Finfolio 2.0 thể hiện qua 3 đóng góp nòng cốt:

1. **Kiến trúc tính toán định lượng đa luồng với Web Worker (`research-worker.mjs`):**  
   Mô phỏng ngẫu nhiên Monte Carlo với 2.000 đường chạy qua 252 phiên và thuật toán tối ưu hóa Frank-Wolfe đòi hỏi hàng triệu phép tính số học dấu phẩy động. Nếu chạy trên luồng chính của trình duyệt (main thread), giao diện sẽ bị đơ cứng (freeze). Em đã thiết kế kiến trúc phân tán tác vụ sang **Web Worker**, giao tiếp qua cơ chế `postMessage`, đảm bảo giao diện luôn mượt mà ở tốc độ 60 khung hình/giây (60fps) trong khi quá trình tính toán diễn ra ngầm.
2. **Xây dựng động cơ tối ưu hóa lồi Frank-Wolfe (`optimizer.mjs`):**  
   Khắc phục nhược điểm của phiên bản 1.0 (vốn chỉ dùng thuật toán heuristic xấp xỉ thô sơ dễ vi phạm ràng buộc), em đã trực tiếp lập trình thuật toán dốc có điều kiện (Conditional Gradient / Frank-Wolfe Algorithm) chạy thuần túy trên JavaScript. Thuật toán giải quyết chính xác bài toán cực tiểu hóa phương sai danh mục $\min \mathbf{w}^T \Sigma \mathbf{w}$ trên tập lồi simplex với các trần tỷ trọng khắt khe mà không cần phụ thuộc vào bất kỳ thư viện tối ưu hóa cồng kềnh nào từ bên thứ ba.
3. **Pipeline dữ liệu lai (Hybrid Data Pipeline) và Tự động hóa CI/CD:**  
   Em đã xây dựng hệ thống thu thập dữ liệu hai nguồn: sử dụng `tvdatafeed` kết nối TradingView để lấy dữ liệu nến ngày của 26 mã cổ phiếu và chỉ số Việt Nam (VN30, VN-Index), kết hợp với `yfinance` để lấy dữ liệu chứng chỉ quỹ ETF quốc tế và tỷ giá USD/VND. Em thiết lập quy trình GitHub Actions tự động kích hoạt vào lúc **16:17 và 20:47 giờ Việt Nam** sau mỗi phiên giao dịch ngày thường, xuất bản snapshot giá sạch sang nhánh `market-data` để phục vụ ứng dụng production.

---

## 3. Những việc đã thực sự làm

### 3.1. Thiết kế kiến trúc hệ thống và Thiết lập Repository (Week 1 & Week 2)
- Khởi tạo và tổ chức cấu trúc kho chứa mã nguồn GitHub (`FTU-Legacy-63/G09`), thiết lập quy chuẩn phân chia thư mục: `/demo` (mã nguồn ứng dụng), `/docs` (tài liệu học thuật theo tuần), `/.github/workflows` (tự động hóa CI/CD).
- Soạn thảo tài liệu kiến trúc kỹ thuật tại [WEEK2.md](../WEEK2.md), lựa chọn giải pháp công nghệ: loại bỏ framework nặng như React/NextJS để quay về **Vanilla JavaScript với ES Modules**, giúp website nạp nhanh tức thì (dưới 200ms) và loại bỏ hoàn toàn các lỗi xung đột build phức tạp.

### 3.2. Chuẩn hóa Cấu trúc dữ liệu và Giao thức truyền thông (Week 3)
- Hiện thực hóa cấu trúc dữ liệu kinh điển (Canonical Data Schema) được đặc tả tại [WEEK3.md](../WEEK3.md): định nghĩa các đối tượng `Portfolio`, `HoldingsSnapshot`, `MarketPrices`, `FxRates` và `BenchmarkSeries`.
- Xây dựng module điều hợp nguồn (Source Adapter) trong Python, thiết kế giao thức RESTful API cho backend cục bộ (`demo/server.py`) với các endpoint trọng yếu:
  - `POST /api/market-data`: Nhận danh mục, tải giá lịch sử, căn chỉnh ngày giao dịch chung và trả về ma trận giá đã quy đổi VND.
  - `GET /api/search-symbols`: Tìm kiếm thông minh mã cổ phiếu Việt Nam và quốc tế.
  - `GET /api/data-status`: Trả về metadata về tính tươi mới của phiên dữ liệu mà không làm lộ danh mục cá nhân của người dùng.

### 3.3. Lập trình Động cơ Tính toán Tài chính Cốt lõi (Week 4 & Week 5)
- Trực tiếp viết toàn bộ file `demo/finance.mjs` (trái tim tính toán của Finfolio 2.0):
  - Hàm `calculateHoldings`: Tính giá trị từng vị thế $V_{i,t}$, tỷ trọng vốn $w_{i,0}$, và tỷ suất sinh lời danh mục mua và giữ.
  - Hàm `calculateEulerRisk`: Ước lượng ma trận hiệp phương sai mẫu $\Sigma$, tính độ biến động năm hóa $\sigma_P = \sqrt{252 \cdot \mathbf{w}^T \Sigma \mathbf{w}}$, tính rủi ro biên MCR và rủi ro thành phần Euler RC.
  - Hàm `calculateReturnAttribution`: Phân rã đóng góp lợi nhuận theo mã tài sản, theo nhóm tài sản và theo ngành kinh tế (Sector).
- Viết file `demo/attribution.mjs` thực thi mô hình phân rã tỷ giá FX 3 thành phần: Đóng góp giá tài sản, Đóng góp tỷ giá và Hiệu ứng tương tác.

### 3.4. Phát triển Thuật toán Tối ưu hóa và Mô phỏng Monte Carlo (Week 6 & Week 7)
- Viết file `demo/optimizer.mjs`: Hiện thực hóa thuật toán Frank-Wolfe giải bài toán Minimum Volatility và thuật toán tìm kiếm đa điểm khởi tạo giải bài toán Maximum Sharpe với lãi suất phi rủi ro kế thừa từ Finfolio 1.0 ($3.0\%$/năm).
- Viết file `demo/simulation.mjs`: Hiện thực hóa thuật toán Joint Moving-Block Bootstrap Monte Carlo. Tạo bộ sinh số ngẫu nhiên giả lập có thể tái lập thông qua thuật toán LCG (Linear Congruential Generator) khi người dùng chỉ định random seed.
- Xây dựng `demo/research-worker.mjs`: Đóng gói thuật toán tối ưu hóa và mô phỏng vào Web Worker, thiết lập cơ chế trao đổi dữ liệu phi đồng bộ (asynchronous non-blocking message passing).

### 3.5. Trực quan hóa Biểu đồ Native SVG và Hệ thống Điều hướng 7 Trang (Week 7)
- Viết file `demo/chart-utils.mjs`: Xây dựng biểu đồ PnL giá trị thực VND bằng đồ họa vector thuần (Native SVG). Tích hợp crosshair trục kép bám sát cả trục hoành thời gian và trục tung giá trị; xử lý ngắt đoạn biểu đồ thông minh khi có khoảng trống dữ liệu vượt quá 7 ngày.
- Viết file `demo/navigation.mjs`: Xây dựng hệ thống định tuyến ứng dụng đơn trang (SPA Router) hỗ trợ 7 URL độc lập: `/`, `/portfolio`, `/analysis`, `/optimize`, `/simulation`, `/method`, `/account`. Hỗ trợ hoàn hảo nút Back/Forward của trình duyệt và nạp trực tiếp đường dẫn URL.
- Cấu hình hạ tầng triển khai Vercel (`vercel.json`) và thiết lập quy trình tự động hóa kiểm thử hồi quy 85 test cases (50 JS + 35 Python).

---

## 4. Bảng tổng hợp File, Mã nguồn và Đóng góp kỹ thuật cụ thể

| Hạng mục mã nguồn | Vai trò kỹ thuật & Chức năng cụ thể | File minh chứng | Lệnh kiểm tra / Nghiệm thu |
| :--- | :--- | :--- | :--- |
| **Động cơ Tài chính Cốt lõi** | Tính toán lợi nhuận, hiệp phương sai, phân rã rủi ro Euler và đối soát benchmark | [finance.mjs](../../demo/finance.mjs) | `node --test demo/finance.test.mjs` (Pass 100%) |
| **Động cơ Tối ưu hóa** | Thuật toán Frank-Wolfe giải bài toán quy hoạch lồi Min-Vol và Max-Sharpe có ràng buộc | [optimizer.mjs](../../demo/optimizer.mjs) | `node --test demo/research.test.mjs` |
| **Mô phỏng Monte Carlo** | Thuật toán Joint Moving-Block Bootstrap đa luồng (2.000 paths, block size 5) | [simulation.mjs](../../demo/simulation.mjs), [research-worker.mjs](../../demo/research-worker.mjs) | Kiểm tra fan chart và histogram trên tab `/simulation` |
| **API Server & Routing Dữ liệu** | Backend Python điều phối kết nối TradingView và Yahoo Finance, căn ngày chung | [server.py](../../demo/server.py), [vn_data.py](../../demo/vn_data.py), [global_data.py](../../demo/global_data.py) | `python3 -m unittest discover -s demo -p 'test_*.py'` |
| **Trực quan hóa Đồ họa SVG** | Vẽ biểu đồ PnL giá trị thực VND, crosshair trục kép X/Y, tooltip tự động đảo hướng | [chart-utils.mjs](../../demo/chart-utils.mjs) | `node --test demo/chart-utils.test.mjs` |
| **CI/CD & Dữ liệu Tự động** | GitHub Actions workflow tự động cào nến ngày sau 16:17 & 20:47 và xuất bản snapshot | [.github/workflows/update-vn-data.yml](../../.github/workflows/update-vn-data.yml) | Kiểm tra run history trên GitHub Actions |
| **Định tuyến SPA & Hạ tầng** | SPA hash router 7 trang độc lập, cấu hình rewrite Vercel Serverless | [navigation.mjs](../../demo/navigation.mjs), [vercel.json](../../vercel.json) | Kiểm tra mở trực tiếp các URL trên Production Vercel |

---

## 5. Bằng chứng đóng góp theo 7 tuần dự án

| Tuần | Ghi nhận trong tiến trình nhóm | Output cụ thể được xác nhận | Ý nghĩa đóng góp cá nhân |
| :---: | :--- | :--- | :--- |
| **W1** | An khởi tạo cấu trúc repo, thiết lập các tiêu chuẩn commit và quản lý phiên bản. | [WEEK1.md](../WEEK1.md), Git repository setup | Đặt nền móng kỹ thuật và quản trị phiên bản cho toàn bộ dự án. |
| **W2** | An thiết kế kiến trúc pipeline dữ liệu - tính toán tổng thể của sản phẩm. | [WEEK2.md](../WEEK2.md) (Technical Pipeline) | Định hình giải pháp kỹ thuật kết nối giữa dữ liệu thị trường và giao diện. |
| **W3** | An xây dựng cấu trúc dữ liệu chuẩn (Canonical Data Schema) và API routing sơ bộ. | [WEEK3.md](../WEEK3.md), `demo/server.py` draft | Thiết lập bộ khung dữ liệu giúp chuẩn hóa giao tiếp giữa các thành viên. |
| **W4** | An lập trình phiên bản đầu tiên của engine tính toán tài chính `demo/finance.mjs`. | `demo/finance.mjs` (Core calculation) | Hiện thực hóa các công thức toán tài chính phức tạp thành mã nguồn chạy được. |
| **W5** | An kết nối giao diện Form input với API tải dữ liệu và bộ tính toán nội tại. | `demo/app.js` (State & Integration) | Đưa sản phẩm từ trạng thái tài liệu sang trạng thái ứng dụng tương tác được. |
| **W6** | An triển khai thành công bản demo hoạt động đầu tiên lên Vercel; thông qua 10 ca kiểm thử. | [WEEK6.md](../WEEK6.md), Production URL Vercel | Đạt mốc quan trọng: sản phẩm chạy thực tế với dữ liệu live và có thể truy cập toàn cầu. |
| **W7** | An hoàn thiện kiến trúc 7 trang, tích hợp Web Worker cho Monte Carlo, thông qua 85 tests. | [WEEK7.md](../WEEK7.md), Release `v2.0.0-final-20261023` | Bàn giao phiên bản hoàn chỉnh nhất với hiệu năng cao và độ ổn định tuyệt đối. |

---

## 6. Hạn chế còn tồn tại và Bài học kinh nghiệm

### 6.1. Hạn chế kỹ thuật của hệ thống
- **Chưa có cơ chế WebSocket cập nhật dữ liệu Real-time:** Ứng dụng hiện chỉ hoạt động trên dữ liệu nến ngày đã đóng (End-of-Day close price), chưa hỗ trợ dữ liệu giá khớp lệnh từng giây (tick-by-tick real-time data) do hạn chế của các API công khai miễn phí.
- **Phụ thuộc vào môi trường Serverless của Vercel:** Python Serverless Function trên Vercel có giới hạn thời gian thực thi (execution timeout) là 10 giây; nếu người dùng yêu cầu phân tích một danh mục quá lớn gồm 30 tài sản trong 10 năm với kết nối mạng chậm, API có thể bị nghẽn.
- **Lưu trữ nhật ký người dùng mới ở mức phiên bản cục bộ (Local Storage):** Mặc dù đã có module xác thực tài khoản Google/Supabase, dữ liệu danh mục hiện vẫn ưu tiên lưu trữ tại trình duyệt để bảo mật quyền riêng tư tài chính, chưa đồng bộ hóa hoàn toàn lên điện toán đám mây đa thiết bị.

### 6.2. Bài học kinh nghiệm cá nhân
- **Tránh xa "Cái bẫy Thư viện cồng kềnh" (Over-engineering Trap):** Ban đầu nhóm từng cân nhắc dùng các thư viện Python nặng như `scipy.optimize` trên server. Tuy nhiên, việc tự lập trình thuật toán Frank-Wolfe trực tiếp bằng JavaScript trên trình duyệt đã giúp giảm thiểu hoàn toàn độ trễ mạng, tiết kiệm chi phí máy chủ và giúp ứng dụng hoạt động độc lập cực kỳ bền bỉ.
- **Tự động hóa kiểm thử là cứu cánh của lập trình viên:** 85 bài kiểm thử tự động đã cứu nhóm rất nhiều lần khi chỉnh sửa các công thức tính toán phức tạp; chỉ cần một sai số nhỏ trong việc trừ chỉ số ngày của tỷ giá FX cũng sẽ bị phát hiện ngay lập tức trong quá trình CI/CD.


