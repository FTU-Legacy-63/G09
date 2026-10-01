# Finfolio: hypothetical portfolio analytics

Cập nhật 01/10/2026 theo lựa chọn của nhóm. Target user là nhà đầu tư cá nhân đã có hiểu biết tài chính, muốn so sánh đóng góp và rủi ro giữa các loại tài sản.

## Mô hình danh mục

Input: vốn VND, tỷ trọng đầu kỳ tổng 100%, 2–30 instrument khác nhau, thời gian tối đa 5 năm, performance benchmark và giới hạn phân bổ. Hệ thống giả định mua tại close đầu kỳ, cho phép fractional units và giữ nguyên quantity. Không thêm cash flow, giao dịch mua/bán, phí/thuế hay đòn bẩy. PnL là chênh lệch giá trị VND so với vốn đầu kỳ; không phải PnL tài khoản brokerage.

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
- Grouping: instrument, asset class, thị trường/commodity type hoặc currency niêm yết. Currency grouping là phân nhóm contribution đã quy về VND, **không phải phân rã FX effect**. Chưa có sector/equity-style mapping point-in-time.
- Risk: Euler volatility contribution trên historical covariance và tỷ trọng input. Đây là risk của một allocation cố định theo dữ liệu lịch sử, không phải realized volatility của value path buy-and-hold với weights trôi. Annualization 252 phiên/năm là xấp xỉ, đặc biệt với crypto/đa thị trường. Giữ cảnh báo sample nhỏ/gap dài.
- Optimizer: conditional gradient trên capped long-only simplex, per-asset cap và tổng commodity-proxy cap. Có giới hạn 4.000 vòng lặp, gap và trạng thái hội tụ; kết quả xấp xỉ không được gọi là danh mục tốt nhất hay khuyến nghị mua/bán.
- Relative performance: portfolio minus benchmark trên cùng kỳ overlap. Chưa có constituent weights/returns lịch sử để làm Brinson allocation/selection/interaction.

## User flow và xuất báo cáo

Tìm/chọn instrument → nhập vốn, weights, kỳ, benchmark → xác minh metadata/giá/currency → căn chỉnh ngày chung holdings/FX → portfolio value/PnL → attribution heatmap/table → risk và minimum-variance scenario → ghi nhận quyết định.

Lookback chỉ điều khiển bảng/heatmap attribution; chart PnL và risk vẫn dùng toàn kỳ đã nhập, được ghi rõ trên màn hình. Cột đa kỳ thiếu lịch sử hiện N/A, không trình bày vài ngày dữ liệu thành return 5 năm; kỳ chọn bị rút gọn được cảnh báo. Đổi đơn vị VND/điểm %, sort và grouping cập nhật bảng/CSV. CSV có ngày thực của từng lookback, nguồn, đơn vị, tổng; có bảo vệ spreadsheet formula injection. PDF dùng chức năng in của trình duyệt, không phải native Excel `.xlsx` hay PDF generator server.

Input lưu trong localStorage khi người dùng lưu/phân tích; không lưu giá lịch sử, không cloud sync và không account. Mở bản lưu vẫn cần tải lại giá mới. Những notes Week 1–6 là evidence theo giai đoạn, không bị viết lại thành claim đã có toàn bộ final roadmap.

## Verification

26 Python tests: provider routing, search, currency/type validation, index-only benchmark, unverified VN ticker lookup và error handling. 22 JavaScript tests: tài chính, risk identities, dữ liệu khuyết, chart, lookback, grouping, export escaping và optimizer 30 assets.

Real-data integration: VIC/AAPL/TLT/BTC-USD/CORN, mỗi mã 20%, vốn 100 triệu, 01/10/2021–01/10/2026, SPY benchmark: 1.201 ngày chung; return contribution và Euler risk contribution reconcile trong sai số float, optimizer hội tụ trong ca kiểm tra. Các số là kết quả kiểm tra lịch sử, không dự báo hiệu suất.
