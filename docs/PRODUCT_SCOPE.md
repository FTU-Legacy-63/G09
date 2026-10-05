# Finfolio: hypothetical portfolio analytics

Cập nhật 05/10/2026 theo lựa chọn của nhóm. Target user là nhà đầu tư cá nhân đã có hiểu biết tài chính, muốn so sánh đóng góp và rủi ro giữa các loại tài sản.

## Mô hình danh mục

Input: giá trị đầu kỳ của từng vị thế, chọn USD hoặc VND riêng; 2–30 instrument khác nhau, thời gian tối đa 5 năm, performance benchmark và giới hạn phân bổ. Khoản USD được quy đổi bằng VND=X tại phiên đầu tiên có đủ giá holdings và FX, không dùng tỷ giá hiện tại cho vốn lịch sử. Tổng vốn VND và tỷ trọng được suy ra tự động. Currency nhập giá trị độc lập với currency niêm yết. Hệ thống giả định mua tại close đầu kỳ, cho phép fractional units và giữ nguyên quantity. Không thêm cash flow, giao dịch mua/bán, phí/thuế hay đòn bẩy. PnL là chênh lệch giá trị VND so với vốn đầu kỳ; không phải PnL tài khoản brokerage.

## Instrument universe

| Nhóm | Nguồn và khả năng | Giới hạn |
| --- | --- | --- |
| Cổ phiếu/ETF VN | TradingView qua tvdatafeed; 26 mã/chỉ số có job cập nhật, mã khác tải khi phân tích | Tìm kiếm có alias và Yahoo; nhập ticker in hoa có thể chọn mục tra cứu chưa xác minh rồi kiểm tra TradingView. Chưa có full exchange listing registry |
| Cổ phiếu quốc tế | Yahoo search + metadata + lịch sử giá | Phải niêm yết USD; không tự coi GBP/EUR/JPY là USD |
| ETF/quỹ quốc tế | Yahoo search mở; metadata phải xác định ETF/mutual fund | Quỹ dùng currency khác bị từ chối; chưa hỗ trợ leveraged/inverse |
| Commodity proxy | 23 quỹ gợi ý: kim loại quý, dầu/khí/xăng, đồng, nông sản, rổ commodity | Không phải toàn bộ commodity; proxy có thể dùng vật chất/futures, phí và roll effects nằm trong giá |
| Bond/real-estate ETF | Bond ETF và REIT ETF gợi ý, ETF khác tìm qua nhóm quốc tế | Không tính yield/maturity như trái phiếu riêng lẻ; không look-through holdings |
| Crypto | Crypto USD từ Yahoo; BTC/ETH/SOL/XRP gợi ý, mã khác có thể tìm | Nến ngày UTC đã đóng, không có intraday/24-7 monitoring |
| Benchmark | VN30/VN-Index trực tiếp, các ETF hoặc mã Yahoo với prefix `YF:` | Chỉ số không được dùng làm holding; benchmark cổ phiếu không đại diện mọi asset class |

[Catalog](../demo/instrument_catalog.json) có 45 instrument quốc tế; đây là danh sách gợi ý/phân loại, không phải dữ liệu giá có sẵn. Kiểm tra provider ngày 01/10/2026: 45/45 có giá trong 5 ngày gần nhất; AMD ngoài catalog và ^GSPC benchmark được xác minh qua metadata. Các kiểm tra này không bảo đảm provider luôn phản hồi hoặc đủ 5 năm cho mọi mã. Instrument chưa được phân loại chuyên biệt vẫn hiện ETF/quỹ, không tự gán sector hay commodity type.

## Attribution và phương pháp

- Absolute contribution toàn kỳ: initial weight × VND-converted price return; tổng contribution bằng portfolio price return.
- Lookback: suy ra quantity từ input gốc, tính position value tại ngày bắt đầu kỳ chọn, lấy tỷ trọng lúc đó nhân return kỳ chọn. Tổng PnL contribution bằng chênh lệch giá trị danh mục của kỳ chọn. Không giả định tái cân bằng khi bấm 1M/3M/6M/YTD/1Y/5Y.
- Grouping: instrument, asset class, **Sector**, **Industry**, thị trường/commodity type hoặc currency niêm yết. Sector/Industry lấy trực tiếp từ TradingView Screener theo listing VN đã xác định sàn; cổ phiếu USD tra listing Mỹ, không gán khi listing mâu thuẫn. Đây là phân loại doanh nghiệp hiện tại, có nguồn/timestamp, không phải mapping point-in-time tại từng lookback hoặc GICS được tự suy diễn. Cổ phiếu thiếu metadata nằm trong “Chưa có phân loại”; ETF/quỹ, commodity và crypto nằm trong “Không áp dụng” theo asset class, không look-through holdings. Các nhóm vẫn cộng đủ toàn bộ contribution/weight/PnL. Metadata lỗi không làm mất kết quả phân tích giá. Currency grouping là phân nhóm contribution đã quy về VND, **không phải phân rã FX effect**.
- Risk: Euler volatility contribution trên historical covariance và tỷ trọng input. Đây là risk của một allocation cố định theo dữ liệu lịch sử, không phải realized volatility của value path buy-and-hold với weights trôi. Annualization 252 phiên/năm là xấp xỉ, đặc biệt với crypto/đa thị trường. Giữ cảnh báo sample nhỏ/gap dài.
- Optimizer: conditional gradient trên capped long-only simplex, per-asset cap và tổng commodity-proxy cap. Có giới hạn 4.000 vòng lặp, gap và trạng thái hội tụ; kết quả xấp xỉ không được gọi là danh mục tốt nhất hay khuyến nghị mua/bán.
- Relative performance: portfolio minus benchmark trên cùng kỳ overlap. Chưa có constituent weights/returns lịch sử để làm Brinson allocation/selection/interaction.

## User flow và xuất báo cáo

Tìm/chọn instrument → nhập giá trị và USD/VND từng vị thế, kỳ, benchmark → xác minh metadata/giá/currency → căn chỉnh ngày chung holdings/FX → quy đổi vốn và tính weights → portfolio value/PnL → attribution heatmap/table → risk và minimum-variance scenario → ghi nhận quyết định.

Workspace có bốn URL riêng: `/` tổng quan, `/portfolio` nhập danh mục, `/analysis` kết quả, `/method` phương pháp. Không hiển thị tất cả phần trên cùng một trang. Hỗ trợ Back/Forward, tải trực tiếp URL và điều hướng mobile.

Lookback chỉ điều khiển bảng/heatmap attribution; chart PnL và risk vẫn dùng toàn kỳ đã nhập, được ghi rõ trên màn hình. Cột đa kỳ thiếu lịch sử hiện N/A, không trình bày vài ngày dữ liệu thành return 5 năm; kỳ chọn bị rút gọn được cảnh báo. Đổi đơn vị VND/điểm %, sort và grouping cập nhật bảng/CSV. CSV có ngày thực của từng lookback, nguồn, đơn vị, tổng; khi nhóm Sector/Industry có thêm classification từng mã và timestamp; có bảo vệ spreadsheet formula injection. PDF dùng chức năng in của trình duyệt, không phải native Excel `.xlsx` hay PDF generator server.

Input lưu trong localStorage khi người dùng lưu/phân tích/chuyển trang; bản lưu vốn + weights cũ chuyển thành giá trị VND. Kết quả gần nhất lưu sessionStorage trong tab để chuyển trang/reload không mất kết quả, kèm timestamp; đây không phải lần fetch giá mới. Bấm phân tích luôn tải lại dữ liệu. Không cloud sync và không account. Những notes Week 1–6 là evidence theo giai đoạn, không bị viết lại thành claim đã có toàn bộ final roadmap.

## Verification

05/10/2026: sửa cú pháp checkout nhánh `market-data` trong workflow; thêm hai lượt retry tuần tự cho các mã lỗi tạm thời, giữ nguyên timestamp của entry cũ nếu vẫn lỗi. Lượt chạy [37258292956](https://github.com/FTU-Legacy-63/G09/actions/runs/37258292956) xuất bản thành công, 26/26 mã tải được đến phiên 02/10/2026. Cron vẫn là 17:30 giờ Việt Nam các ngày thứ Hai–thứ Sáu; GitHub có thể chạy trễ, nghỉ lễ không tạo nến mới.

Browser verification: input 1.000 USD FPT + 35 triệu VND HPG + 25 triệu VND GLD, kỳ bắt đầu 01/09/2026, phiên chung đầu tiên 03/09/2026, FX 26.070, tổng vốn 86.070.000 VND. Chart bắt đầu đúng tổng vốn. Đã kiểm tra chuyển trang, reload kết quả, Back/Forward, giá trị 0 báo lỗi, bản lưu cũ vốn 200 triệu với 60/40 chuyển thành 120/80 triệu VND, và mobile 390px không tràn ngang.

30 Python tests: provider routing, search, currency/type validation, index-only benchmark, unverified VN ticker lookup, FX cho input USD dù holdings đều VN, classification chính xác theo listing, loại trừ ngành cho quỹ, metadata lỗi và listing mâu thuẫn. 26 JavaScript tests: tài chính, quy đổi giá trị đầu kỳ/weights, validation amounts, risk identities, dữ liệu khuyết, chart, lookback, grouping Sector/Industry và reconciliation, export escaping và optimizer 30 assets.

Real-data integration: VIC/AAPL/TLT/BTC-USD/CORN, mỗi mã 20%, vốn 100 triệu, 01/10/2021–01/10/2026, SPY benchmark: 1.201 ngày chung; return contribution và Euler risk contribution reconcile trong sai số float, optimizer hội tụ trong ca kiểm tra. Các số là kết quả kiểm tra lịch sử, không dự báo hiệu suất.
