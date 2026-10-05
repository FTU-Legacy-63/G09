# Finfolio 2.0 — Portfolio Attribution & Risk Analytics

Finfolio 2.0 giúp nhà đầu tư cá nhân đã có kiến thức tài chính hiểu lợi nhuận và rủi ro đang tập trung ở đâu trong danh mục gồm cổ phiếu và các commodity khả dụng; so sánh kết quả với benchmark; và xem một phương án phân bổ tham khảo trước khi tự quyết định có tái phân bổ hay không.

## Repository evidence

| Giai đoạn | File evidence chính |
| --- | --- |
| Week 1 | [Problem Direction](docs/WEEK1.md) |
| Week 2 | [Product Direction & MVP](docs/WEEK2.md) |
| Week 3 | [Information & Data Readiness](docs/WEEK3.md) |
| Week 4 | [Financial Logic & Expected Results](docs/WEEK4.md) |
| Week 5 | [MVP Feature, Flow & Implementation Readiness](docs/WEEK5.md) |
| Week 6 | [Working demo, integration and test evidence](docs/WEEK6.md) |

## Team members and roles

| Thành viên | MSSV | Vai trò | Trách nhiệm chính |
| --- | ---: | --- | --- |
| Hoàng Khánh Linh | 2412380024 | Product Owner | Phạm vi sản phẩm, logic tài chính, benchmark, giả định tối ưu hóa và chấp nhận phương pháp |
| Nguyễn Quỳnh Anh | 2413380010 | Product Manager | Yêu cầu, acceptance criteria, test scenario, revision và theo dõi trạng thái |
| Lê Bảo An | 2412380002 | Lead Developer | Kiến trúc, pipeline dữ liệu–tính toán, tích hợp benchmark/optimizer, kiểm thử và triển khai |
| Trần Minh Ngọc | 2412380036 | Business Analyst | Yêu cầu dữ liệu, nguồn benchmark, phân loại ngành/factor, data dictionary và giới hạn dữ liệu |
| Nguyễn Ngọc Anh | 2413380008 | UI/UX Designer | User flow, cấu trúc thông tin, trực quan attribution và so sánh current–optimized |

## Current product scope

Core MVP hỗ trợ **cổ phiếu và các commodity có chuỗi giá khả dụng từ nguồn dữ liệu được hỗ trợ** trong một flow hoàn chỉnh: nhập danh mục → kiểm tra dữ liệu → phân tích danh mục hiện tại → phân rã return/risk → so sánh benchmark → tối ưu hóa có ràng buộc → so sánh current–optimized → giải thích kết quả để người dùng tự quyết định. Gold và silver là ví dụ, không phải giới hạn universe. Kết quả tối ưu hóa là phương án phân bổ tham khảo, không phải lời khuyên đầu tư.

Các asset class khác và Monte Carlo thuộc final product. Sample data trong [`data/`](data/README.md) chỉ là fixture phục vụ kiểm thử logic, không phải hành trình chính của người dùng và không được dùng để thay thế dữ liệu live khi nguồn lỗi.

## Finfolio portfolio analytics

[Mở Finfolio](https://g09-finfolio.vercel.app/) · [Mã nguồn](demo/index.html) · [Phạm vi hiện tại](docs/PRODUCT_SCOPE.md). Website host trên Vercel như project SHB. Cổ phiếu/chỉ số VN dùng TradingView qua tvdatafeed; instrument quốc tế và tỷ giá tải qua yfinance khi phân tích. Danh mục giả định nhập giá trị từng tài sản bằng USD/VND, tự suy ra tổng vốn và tỷ trọng; không phải lịch sử giao dịch thật. Workspace tách thành Tổng quan, Danh mục, Phân tích và Phương pháp, mỗi trang có URL riêng. Để chạy local:

```bash
cd G09-Finfolio
python3 -m pip install -r demo/requirements.txt
python3 demo/server.py
```

Mở <http://127.0.0.1:8123/portfolio>. Không mở bằng `file://` hoặc `python3 -m http.server`: hai cách đó không có API. Input minh họa: FPT.VN 40 triệu VND, HPG.VN 35 triệu VND, GLD 25 triệu VND, **5 năm gần nhất**, benchmark **VN30 Index**, giới hạn 80% mỗi mã và 60% commodity. Gõ tên công ty/ticker rồi chọn một gợi ý bằng chuột hoặc phím mũi tên và Enter. Chọn giá trị và currency riêng cho mỗi vị thế rồi bấm phân tích. Khoản USD quy đổi bằng tỷ giá tại phiên đầu tiên có đủ giá chung; kết quả hiển thị tổng vốn VND và tỷ trọng tự tính. Mã không có dữ liệu provider sẽ báo lỗi, không tự dùng fixture.

Job [Refresh VN daily prices](.github/workflows/update-vn-data.yml) lên lịch **17:30 giờ Việt Nam, thứ Hai–thứ Sáu**, sau phiên đóng cửa (GitHub Actions có thể chạy trễ). Job tải lại lịch sử để cập nhật cả điều chỉnh chia tách, kiểm tra dữ liệu và lưu snapshot thực trên nhánh `market-data`; code vẫn ở `main`. Danh sách cập nhật gồm 26 mã cổ phiếu/ETF/chỉ số trong [vn_universe.json](demo/vn_universe.json). Mã ngoài danh sách, cache thiếu hoặc quá cũ được tải trực tiếp từ tvdatafeed khi phân tích. UI hiện timestamp riêng và phiên mới nhất của từng mã; job lỗi không giả vờ cập nhật thành công. Các ngày nghỉ không có nến mới. Hiện lấy được dữ liệu không đăng nhập; nếu provider thay đổi, có thể cấu hình GitHub Secrets và biến môi trường Vercel, không commit thông tin đăng nhập.

Kiểm tra logic tự động:

```bash
node --test demo/*.test.mjs
python3 -m unittest discover -s demo -p 'test_*.py'
```

Danh mục hỗ trợ 2–30 vị thế: cổ phiếu/ETF VN, cổ phiếu quốc tế và quỹ/ETF niêm yết USD, commodity proxy, bond ETF và crypto. Catalog gợi ý có 45 instrument quốc tế, gồm 23 commodity proxy; tìm kiếm Yahoo có thể trả thêm mã ngoài catalog, được xác minh loại/currency khi phân tích. Không khẳng định bao phủ toàn thị trường hay mọi commodity. VN dùng tvdatafeed; ETF proxy không phải vị thế spot/futures trực tiếp, bond ETF không phải trái phiếu riêng lẻ. Chart giữ vốn đầu kỳ VND, tooltip X/Y và xử lý dữ liệu khuyết. Bảng attribution có lookback, grouping, sorting, đơn vị điểm %/VND, CSV mở bằng Excel, in/lưu PDF; bộ chọn lookback chỉ đổi attribution, chart/risk vẫn là toàn kỳ nhập. Tỷ trọng đầu mỗi lookback được tính từ giá trị vị thế tại ngày đó. Optimizer dùng conditional gradient, không vét cạn lưới 1%. Input có thể lưu cục bộ trên trình duyệt, không có account/cloud sync. Return dựa trên giá, chưa gồm tái đầu tư cổ tức. [Bằng chứng Week 6 lịch sử](docs/WEEK6.md).

Production: <https://g09-finfolio.vercel.app/>. Hiện project Vercel chưa kết nối GitHub org để tự deploy khi push; sau khi thay đổi code, người có quyền Vercel chạy `vercel deploy --prod` tại thư mục repo hoặc cấp quyền GitHub App của Vercel cho repo `FTU-Legacy-63/G09`.
