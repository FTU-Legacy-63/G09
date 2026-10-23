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
| Week 7 | [Final audit, evidence và individual footprint](docs/WEEK7.md) |

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

Final bổ sung tab riêng cho **minimum volatility / maximum Sharpe**, Monte Carlo joint block bootstrap và chỉ số có diễn giải: CAGR, drawdown, Sharpe/Sortino, VaR/CVaR, skewness/excess kurtosis, beta/alpha và tracking error. [Phương pháp tối ưu](docs/OPTIMIZATION.md) · [Mô phỏng và chỉ số](docs/FINAL_METHODS.md). Sample data trong [`data/`](data/README.md) chỉ là fixture kiểm thử, không thay thế giá thật khi nguồn lỗi.

## Finfolio portfolio analytics

[Mở Finfolio](https://g09-finfolio.vercel.app/) · [Mã nguồn](demo/index.html) · [Phạm vi hiện tại](docs/PRODUCT_SCOPE.md). Website host trên Vercel như project SHB. VN dùng TradingView/tvdatafeed; quốc tế và tỷ giá dùng yfinance. Nhập giá trị giả định đầu kỳ từng tài sản bằng USD/VND, không phải lịch sử giao dịch thật. Workspace tách bảy trang, gồm Tối ưu hóa, Mô phỏng và Nhật ký riêng. Để chạy local:

```bash
cd G09-Finfolio
npm ci
npm run build
python3 -m pip install -r demo/requirements.txt
python3 demo/server.py
```

Mở <http://127.0.0.1:8123/portfolio>. Không mở bằng `file://` hoặc `python3 -m http.server`: hai cách đó không có API. Input minh họa: FPT.VN 40 triệu VND, HPG.VN 35 triệu VND, GLD 25 triệu VND, **5 năm gần nhất**, benchmark **VN30 Index**, giới hạn 80% mỗi mã và 60% commodity. Gõ tên công ty/ticker rồi chọn một gợi ý bằng chuột hoặc phím mũi tên và Enter. Chọn giá trị và currency riêng cho mỗi vị thế rồi bấm phân tích. Khoản USD quy đổi bằng tỷ giá tại phiên đầu tiên có đủ giá chung; kết quả hiển thị tổng vốn VND và tỷ trọng tự tính. Mã không có dữ liệu provider sẽ báo lỗi, không tự dùng fixture.

Job [Refresh VN daily prices](.github/workflows/update-vn-data.yml) lên lịch **16:17 và 20:47 giờ Việt Nam, thứ Hai–thứ Sáu**; GitHub Actions có thể chạy trễ, không phải SLA. Snapshot thật trên `market-data`, code trên `main`. Có 26 mã trong [universe](demo/vn_universe.json); mã thiếu/cũ tải trực tiếp. Bản cache tải gần đây nhưng thiếu phiên ngày thường kỳ vọng cũng thử provider; chưa có lịch nghỉ lễ sàn. UI phân biệt timestamp tải, phiên VN và phiên chung với quốc tế/FX. Theo dõi ngày mới nhất tự kiểm tra khi mở lại tab và mỗi 15 phút; khoảng lịch sử cố định không tự đổi. Giá ngày đã đóng, không phải realtime. Xem [audit cập nhật](docs/WEEK7.md#dữ-liệu-và-refresh).

Kiểm tra logic tự động:

```bash
node --test demo/*.test.mjs
python3 -m unittest discover -s demo -p 'test_*.py'
```

Danh mục hỗ trợ 2–30 vị thế: cổ phiếu/ETF VN, cổ phiếu quốc tế và quỹ/ETF niêm yết USD, commodity proxy, bond ETF và crypto. Catalog có 45 instrument quốc tế, gồm 23 commodity proxy; tìm kiếm Yahoo có thể trả thêm mã, được xác minh loại/currency khi phân tích. Không khẳng định bao phủ toàn thị trường. ETF proxy không phải spot/futures trực tiếp; bond ETF không phải trái phiếu riêng lẻ. Chart giữ vốn đầu kỳ VND, tooltip X/Y và dữ liệu khuyết. Attribution có lookback, grouping (cả Sector/Industry), sorting, đơn vị điểm %/VND, CSV và in/lưu PDF. Lookback chỉ đổi attribution, chart/risk vẫn toàn kỳ nhập; tỷ trọng được tính lại ở đầu lookback, không tự rebalance. Optimizer dùng conditional gradient; account lưu decision journal riêng, không tự cloud-sync portfolio. Return chưa tái đầu tư cổ tức. [Week 6 lịch sử](docs/WEEK6.md).

## Final navigation, accounts và limitations

Trạng thái final mới nhất: bảy trang `/`, `/portfolio`, `/analysis`, `/optimize`, `/simulation`, `/method`, `/account`. Tab tối ưu hóa chạy theo yêu cầu, không tự chạy khi phân tích. Google/Supabase lưu nhật ký quyết định theo tài khoản; input portfolio chỉ lưu cục bộ, không tự đồng bộ thành portfolio cloud. [Cấu hình tài khoản](docs/ACCOUNT_SETUP.md). Mô tả Week 6 và các đoạn baseline trước đó là lịch sử, không phải giới hạn final hiện tại.

Annualized volatility mua và giữ cần 60 return; Euler risk attribution và optimizer cần ít nhất `max(120, 10N)` return chung. Không đủ mẫu thì vẫn xem allocation/period return, phần rủi ro hiển thị “—” và optimizer báo lý do. Giá ngày không đồng bộ giờ đóng giữa thị trường; source có thể lỗi/rate-limit; không bao phủ mọi mã. Không cổ tức/phí/thuế, không Brinson đầy đủ, không dự báo hoặc giao dịch tự động. Max-Sharpe xấp xỉ/in-sample; Monte Carlo không bảo đảm tương lai. [Toàn bộ giả định](docs/FINAL_METHODS.md).

[Contribution map và Individual Footprint](docs/individual/README.md): phân công đã xác nhận; từng thành viên phải tự xác nhận việc đã làm và khả năng trình bày, không suy tác giả từ tài khoản upload. [Final readiness, bug status và backup](docs/WEEK7.md).

[Final release / source backup](https://github.com/FTU-Legacy-63/G09/releases/tag/v2.0.0-final-20261023): 81 tests pass. Code final đã deploy lên website hiện hữu; trạng thái verification, deployment và các phần chưa nghiệm thu được ghi ở Week 7/release.

Production: <https://g09-finfolio.vercel.app/>. Ngày 23/10 nhóm đã kết nối `FTU-Legacy-63/G09` vào project Vercel hiện hữu, để push `main` tạo deployment; luôn kiểm tra trạng thái READY, không coi push là deploy thành công. Manual fallback: `vercel deploy --prod --scope an-4f7e`. Nhánh `market-data` được tắt deployment riêng vì chỉ lưu snapshot; workflow sao chép cấu hình không deploy sang nhánh này cùng snapshot, không đổi dữ liệu giá.
