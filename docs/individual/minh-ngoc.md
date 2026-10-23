# Individual Footprint — Trần Minh Ngọc

## Bảng thông tin cá nhân

| Thông tin | Nội dung |
| :--- | :--- |
| **Họ và tên** | **Trần Minh Ngọc** |
| **Mã sinh viên** | **2412380036** |
| **Vai trò chính** | **Business Analyst / Data & Provenance Lead** |
| **Dự án** | **Finfolio 2.0 — Portfolio Attribution & Risk Analytics** |
| **Môn học** | Ứng dụng CNTT trong Tài chính - Ngân hàng (NHA408E) |
| **Nhóm** | Group 09 (G09) — Lớp K63 |

---

## 1. Vai trò trong dự án

Với tư cách là **Chuyên viên Phân tích Nghiệp vụ (Business Analyst)** kiêm **Trưởng nhóm phụ trách Nguồn dữ liệu và Xuất xứ Dữ liệu (Data & Provenance Lead)** của Finfolio 2.0, em chịu trách nhiệm chính về:
1. **Thiết kế Từ điển Dữ liệu và Đặc tả Yêu cầu Dữ liệu (Data Dictionary & Requirements):** Xác định toàn bộ các thực thể, thuộc tính, định dạng, đơn vị đo lường và quy tắc xác thực cho từng trường dữ liệu đầu vào và đầu ra của hệ thống.
2. **Thẩm định và Quản trị Nguồn dữ liệu Thị trường (Data Provenance & Source Auditing):** Đánh giá tính khả thi, độ ổn định và tính hợp pháp của các nguồn cung cấp dữ liệu thị trường (TradingView, Yahoo Finance, tỷ giá ngân hàng, dữ liệu sở giao dịch HOSE/HNX); giải quyết các điểm nghẽn dữ liệu (data blockers).
3. **Chuẩn hóa Hệ thống Phân loại Ngành và Universe Tài sản (Classification & Universe Management):** Xây dựng bảng ánh xạ ngành kinh tế (Sector & Industry) cho cổ phiếu Việt Nam và Mỹ dựa trên dữ liệu niêm yết chính thống; quản trị danh mục 26 tài sản hạt nhân và 23 quỹ ETF hàng hóa đại diện (Commodity Proxies); thiết lập cơ chế giám sát tính tươi mới của dữ liệu (Data Freshness Monitoring).

---

## 2. Dấu ấn cá nhân trong sản phẩm

Dấu ấn chuyên môn sâu sắc nhất của em trong Finfolio 2.0 thể hiện qua 3 đóng góp mang tính quyết định:

1. **Giải cứu bế tắc dữ liệu Benchmark thị trường Việt Nam (Tháo gỡ Blocker Week 3):**  
   Tại tuần 3, nhóm phát hiện nguồn Yahoo Finance không còn hỗ trợ ổn định chuỗi giá lịch sử của chỉ số VN-Index (`^VNINDEX` thường xuyên bị rỗng hoặc lỗi). Đây là nguy cơ phá vỡ toàn bộ tính năng so sánh benchmark của dự án. Em đã chủ động nghiên cứu và đề xuất phương án chuyển hướng: sử dụng thư viện `tvdatafeed` kết nối trực tiếp với nguồn dữ liệu của **TradingView** để lấy trọn vẹn dữ liệu chỉ số VN30 và VN-Index chính thống, đồng thời thiết lập chứng chỉ quỹ `E1VFVN30.VN` làm phương án dự phòng minh bạch có gắn nhãn ETF proxy.
2. **Xây dựng hệ thống Universe 26 mã Việt Nam và 23 Commodity Proxies chuẩn mực:**  
   Em là người trực tiếp tuyển chọn và xây dựng file danh mục `demo/vn_universe.json` (gồm 26 mã cổ phiếu vốn hóa lớn và chỉ số đầu ngành tại TTCK Việt Nam) và `demo/instrument_catalog.json` (gồm 45 tài sản quốc tế, trong đó có 23 proxy hàng hóa bao phủ từ vàng GLD, bạc SLV, dầu thô USO, đồng CPER đến nông sản DBA, ngô CORN, lúa mì WEAT). Đảm bảo mọi mã trong danh mục đều được thẩm định chuỗi giá lịch sử đủ 5 năm.
3. **Thiết kế hệ thống phân loại ngành và siêu dữ liệu (Metadata Architecture):**  
   Em đã trực tiếp viết module phân loại `demo/classification.py`, tích hợp cơ chế tra cứu ngành tự động từ TradingView Screener cho cổ phiếu Việt Nam và phân loại của thị trường Mỹ. Em quy định rõ nguyên tắc: các chứng chỉ quỹ ETF, hàng hóa và tiền mã hóa bắt buộc phải được gắn nhãn ngành là *"Không áp dụng"* (Not Applicable) để tránh việc gán nhầm ngành của doanh nghiệp cho tài sản rổ quỹ.

---

## 3. Những việc đã thực sự làm

### 3.1. Thiết kế Từ điển Dữ liệu Toàn diện 18+ Trường (Week 3)
- Trực tiếp soạn thảo mục 2 trong tài liệu [WEEK3.md](../WEEK3.md), thiết lập **Input Dictionary** chi tiết cho hệ thống, quy định rõ ý nghĩa, kiểu dữ liệu, ví dụ, điều kiện kiểm tra (validation), đơn vị sở hữu và mục đích sử dụng trong báo cáo:
  - `portfolio_id`: Định danh duy nhất phiên phân tích (string).
  - `symbol` & `exchange`: Mã tài sản và sàn giao dịch (HOSE, HNX, NYSE, NASDAQ).
  - `asset_class`: Phân loại tài sản (`equity`, `commodity`, `bond_etf`, `crypto`).
  - `quantity` & `portfolio_weight`: Số lượng cổ phiếu nắm giữ hoặc tỷ trọng vốn danh nghĩa.
  - `currency`: Đồng tiền niêm yết gốc (VND hoặc USD) phục vụ quy đổi tỷ giá.
  - `sector` & `industry`: Ngành kinh tế cấp 1 và cấp 2 của doanh nghiệp.
  - `price_date` & `close_price`: Chuỗi ngày lịch sử và giá đóng cửa chính thức.
  - `benchmark_symbol` & `benchmark_close`: Mã và chuỗi giá chỉ số so sánh bắt buộc.
  - `risk_free_rate`: Lãi suất phi rủi ro năm hóa phục vụ tính Sharpe Ratio.
  - `min_weight`, `max_weight`, `group_cap`: Các thông số ràng buộc của bài toán tối ưu hóa.

### 3.2. Thiết lập Sổ đăng ký Nguồn dữ liệu (Source Register U01–D01) (Week 3)
- Xây dựng bảng thẩm định nguồn dữ liệu tại [WEEK3.md](../WEEK3.md) với 10 định danh nguồn minh bạch:
  - **U01 & U02:** Dữ liệu danh mục và thông số tối ưu hóa do người dùng nhập.
  - **M01:** Yahoo Finance (`yfinance`) cung cấp giá đóng cửa quốc tế và tỷ giá FX.
  - **M02:** Chuỗi giá ETF hàng hóa proxy đại diện cho giá giao ngay (spot).
  - **B01:** TradingView cung cấp chỉ số VN30 Index và VN-Index.
  - **B02:** ETF E1VFVN30 làm benchmark dự phòng có điều kiện.
  - **C01:** Báo cáo công bố thông tin sở giao dịch HOSE/HNX phục vụ gán nhãn ngành.
  - **R01:** Giả định lãi suất phi rủi ro tham chiếu kế thừa hằng số $3.0\%$/năm của Finfolio 1.0.
  - **D01:** Bộ dữ liệu kiểm thử tĩnh (Committed Test Fixture) phục vụ kiểm định toán học.

### 3.3. Xây dựng Hệ thống Phân loại Ngành và Tra cứu Mã (Week 5 & Week 6)
- Trực tiếp lập trình file `demo/classification.py`:
  - Kết nối với bộ lọc TradingView Screener để truy xuất ngành nghề thực tế của các mã niêm yết tại Việt Nam.
  - Thiết lập bảng ánh xạ các ngành chuẩn: Tài chính, Ngân hàng, Bất động sản, Công nghệ thông tin, Thép & Vật liệu xây dựng, Tiêu dùng thiết yếu, Bán lẻ,...
  - Đảm bảo tính nhất quán: cổ phiếu chưa có dữ liệu ngành được gán nhãn *"Chưa có phân loại"*; quỹ ETF và hàng hóa được gắn nhãn *"Không áp dụng"*.
- Viết file `demo/symbol_search.py`: Xây dựng API tìm kiếm thông minh kết hợp giữa tìm kiếm trực tuyến của Yahoo Finance và bảng mã tiếng Việt có dấu/không dấu (như gõ "Hòa Phát" hoặc "HPG" đều gợi ý đúng mã `HPG.VN`).

### 3.4. Xây dựng Cơ chế Giám sát Tính tươi mới của Dữ liệu (Week 7)
- Viết file `demo/data_status.py` và phối hợp xây dựng `demo/freshness.mjs`:
  - Cung cấp endpoint `/api/data-status` cho phép giao diện kiểm tra xem phiên giao dịch gần nhất trong cơ sở dữ liệu là ngày nào, thời điểm tải về là khi nào mà không cần gửi kèm thông tin danh mục của người dùng (bảo mật tuyệt đối).
  - Thiết lập cơ chế kiểm tra định kỳ mỗi 15 phút hoặc mỗi khi người dùng quay lại tab trình duyệt: nếu phát hiện thị trường đã đóng phiên mới hoặc dữ liệu đã cũ quá 6 giờ, hệ thống sẽ hiển thị biểu tượng thông báo nhắc người dùng tải lại dữ liệu mới.
- Viết bộ kiểm thử Python `demo/test_classification.py`, `demo/test_vn_data.py`, `demo/test_symbol_search.py` đảm bảo dữ liệu luôn được chuẩn hóa chính xác trước khi đưa vào tính toán.

---

## 4. Bảng tổng hợp File, Dữ liệu và Đóng góp nghiệp vụ cụ thể

| Hạng mục dữ liệu | Vai trò nghiệp vụ & Chức năng cụ thể | File minh chứng | Lệnh kiểm tra / Nghiệm thu |
| :--- | :--- | :--- | :--- |
| **Từ điển Dữ liệu (Data Dictionary)** | Đặc tả 18 trường dữ liệu, quy tắc kiểm tra kiểu, đơn vị đo lường và mục đích sử dụng | [WEEK3.md](../WEEK3.md) | Đối chiếu mục 2 trong tài liệu WEEK3.md |
| **Sổ đăng ký Nguồn dữ liệu (Source Register)** | Thẩm định 10 nguồn dữ liệu U01–D01, ranh giới cam kết và giới hạn nguồn | [WEEK3.md](../WEEK3.md) | Đối chiếu bảng mục 4 trong WEEK3.md |
| **Phân loại Ngành (Sector Classification)** | Ánh xạ mã cổ phiếu sang nhóm ngành kinh tế chính thức; phân loại rổ quỹ ETF | [classification.py](../../demo/classification.py) | `python3 -m unittest demo/test_classification.py` (Pass 100%) |
| **Universe 26 mã Việt Nam** | Danh mục 26 cổ phiếu nòng cốt và chỉ số VN30/VNINDEX phục vụ tự động hóa dữ liệu | [vn_universe.json](../../demo/vn_universe.json), [vn_data.py](../../demo/vn_data.py) | `python3 -m unittest demo/test_vn_data.py` |
| **Catalog 45 tài sản quốc tế** | Danh mục 45 công cụ quốc tế gồm 23 commodity proxies, bond ETFs, crypto | [instrument_catalog.json](../../demo/instrument_catalog.json), [global_data.py](../../demo/global_data.py) | `python3 -m unittest demo/test_global_data.py` |
| **Giám sát Tính tươi mới Dữ liệu** | API kiểm tra ngày phiên giao dịch mới nhất và thời điểm snapshot thị trường | [data_status.py](../../demo/data_status.py), [freshness.mjs](../../demo/freshness.mjs) | `node --test demo/freshness.test.mjs` |

---

## 5. Bằng chứng đóng góp theo 7 tuần dự án

| Tuần | Ghi nhận trong tiến trình nhóm | Output cụ thể được xác nhận | Ý nghĩa đóng góp cá nhân |
| :---: | :--- | :--- | :--- |
| **W1** | Ngọc đưa ra các câu hỏi ban đầu về tính khả dụng của dữ liệu đa tài sản. | [WEEK1.md](../WEEK1.md) (Data Observations) | Nhận diện sớm các thách thức về việc làm sạch dữ liệu giá và tỷ giá. |
| **W2** | Ngọc xác định các yêu cầu dữ liệu cho danh mục, benchmark và ràng buộc tối ưu. | [WEEK2.md](../WEEK2.md) (Data Requirements) | Đảm bảo mọi tính năng đề xuất đều có nguồn dữ liệu tương ứng hỗ trợ. |
| **W3** | Ngọc hoàn thành Từ điển Dữ liệu 18 trường và Sổ đăng ký nguồn U01–D01. | [WEEK3.md](../WEEK3.md) (Data Readiness) | Văn kiện quan trọng nhất định nghĩa toàn bộ cấu trúc dữ liệu của dự án. |
| **W4** | Ngọc thẩm định sự phụ thuộc dữ liệu của các công thức tài chính và rủi ro. | [WEEK4.md](../WEEK4.md) (Data Dependencies) | Xác định các điều kiện biên về số lượng quan sát tối thiểu cho từng chỉ số. |
| **W5** | Ngọc thiết lập nhãn trường (labels), đơn vị hiển thị và danh sách gợi ý tài sản. | [WEEK5.md](../WEEK5.md) (Input Labels & Universe) | Đảm bảo người dùng nhập liệu đúng định dạng và hiểu rõ đơn vị tiền tệ. |
| **W6** | Ngọc hoàn thiện module tích hợp dữ liệu TradingView cho 26 mã Việt Nam. | `demo/vn_data.py`, `demo/vn_universe.json` | Giải quyết triệt để vấn đề thiếu dữ liệu cổ phiếu và chỉ số Việt Nam. |
| **W7** | Ngọc hoàn thiện hệ thống phân loại ngành `classification.py` và API `/api/data-status`. | `demo/classification.py`, [WEEK7.md](../WEEK7.md) | Bàn giao hệ thống phân loại ngành và giám sát độ trễ dữ liệu chuẩn mực. |

---

## 6. Hạn chế còn tồn tại và Bài học kinh nghiệm

### 6.1. Hạn chế về mặt dữ liệu nghiệp vụ
- **Chưa có Lịch nghỉ lễ tự động (Exchange Holiday Calendar):** Hệ thống hiện xác định ngày giao dịch dựa trên dữ liệu giá trả về từ nhà cung cấp; nếu sàn giao dịch nghỉ lễ đột xuất (như nghỉ bão lũ hoặc nghỉ lễ Quốc khánh dài ngày), hệ thống chưa có bảng lịch riêng để giải thích nguyên nhân vắng mặt của phiên giao dịch.
- **Phân loại ngành là phân loại thời điểm hiện tại (Current Classification):** Dữ liệu ngành được lấy theo thông tin niêm yết hiện tại của doanh nghiệp, chưa có lịch sử thay đổi ngành trong quá khứ (Point-in-time sector reclassification) nếu doanh nghiệp tái cơ cấu ngành nghề cách đây vài năm.
- **Giới hạn số lượng mã nạp tự động:** Cron job hàng ngày hiện chỉ ưu tiên cập nhật nến cho 26 mã nòng cốt trong `vn_universe.json`; nếu người dùng nhập một mã cổ phiếu nhỏ sàn UPCoM ngoài danh mục, hệ thống sẽ phải tải trực tiếp qua TradingView và có thể mất thêm vài giây.

### 6.2. Bài học kinh nghiệm cá nhân
- **Dữ liệu tài chính không bao giờ hoàn hảo:** Không có bất kỳ API miễn phí nào cung cấp dữ liệu sạch $100\%$. Người làm phân tích nghiệp vụ phải luôn dự phòng các trường hợp dữ liệu bị thiếu nến, lệch ngày, hoặc sai đơn vị để thiết lập các bộ lọc phòng thủ (defensive sanity checks).
- **Phải minh bạch về Xuất xứ Dữ liệu (Data Provenance):** Khi một con số trên màn hình có vẻ bất thường, điều đầu tiên cần làm là truy ngược về nguồn gốc dữ liệu: giá lấy từ đâu, tải lúc mấy giờ, có bị lệch múi giờ không. Tính giải trình của sản phẩm phụ thuộc hoàn toàn vào tính minh bạch của dữ liệu.


