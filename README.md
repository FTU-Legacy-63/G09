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

## Week 6 working demo

[Mở demo công khai](https://g09-finfolio.vercel.app/) · [Mã nguồn demo](demo/index.html). Website được host trên Vercel như project SHB; Python Function tải giá qua yfinance mỗi lần người dùng phân tích. Không cần API key hoặc account. Để chạy local:

```bash
cd G09-Finfolio
python3 -m pip install -r demo/requirements.txt
python3 demo/server.py
```

Mở <http://127.0.0.1:8123/demo/>. Không mở `index.html` bằng `file://` hoặc `python3 -m http.server`: hai cách đó không có API yfinance. Dữ liệu đầu vào minh họa gồm FPT.VN 40%, HPG.VN 35%, GLD 25%, 6 tháng gần nhất, benchmark VN30 ETF, giới hạn 80% mỗi mã và 60% commodity. Với cổ phiếu, gõ **tên công ty hoặc ticker** vào ô tìm kiếm rồi **chọn một gợi ý** (ví dụ “Vietcombank” → `VCB.VN`); có thể dùng chuột hoặc phím mũi tên và Enter. Sau đó chọn commodity ETF proxy, benchmark và giá trị danh mục đầu kỳ bằng VND. Chọn **Phân tích danh mục** để tải giá mới và xem brief, rồi ghi nhận quyết định và lý do. Gợi ý tên/mã không đảm bảo có chuỗi giá; nếu Yahoo Finance không trả dữ liệu cho mã đã chọn, ứng dụng báo lỗi và không tự dùng fixture.

Kiểm tra logic tự động:

```bash
node --test demo/finance.test.mjs
python3 -m unittest discover -s demo -p 'test_*.py'
```

Demo phân tích 2–3 tài sản một lần: mã cổ phiếu `.VN` có dữ liệu từ Yahoo và năm ETF proxy đại diện cho vàng, bạc, dầu, đồng, nông sản. Biểu đồ có một đường tổng giá trị danh mục bắt đầu từ vốn đầu kỳ, các mốc ngày và tooltip giá trị/PnL; hai đường phụ là phương án tham khảo và benchmark. ETF proxy không phải giá commodity spot hay futures. yfinance cung cấp chuỗi giá lịch sử mới nhất khả dụng, không bảo đảm báo giá khớp lệnh real-time. Volatility và tối ưu hóa phụ thuộc vào khoảng ngày; đây không phải lời khuyên đầu tư. Việc hỗ trợ toàn bộ commodity khả dụng từ provider là phạm vi sản phẩm, chưa phải khả năng của demo. [Phạm vi, test table, bug log và trạng thái triển khai](docs/WEEK6.md).

Production: <https://g09-finfolio.vercel.app/>. Hiện project Vercel chưa kết nối GitHub org để tự deploy khi push; sau khi thay đổi code, người có quyền Vercel chạy `vercel deploy --prod` tại thư mục repo hoặc cấp quyền GitHub App của Vercel cho repo `FTU-Legacy-63/G09`.
