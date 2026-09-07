# Week 3 — Source–Use Map

Mỗi nguồn được gắn với đúng information item và product use. Ngày rà soát nguồn: **2026-09-07**. Một nguồn có dữ liệu không đồng nghĩa dữ liệu đó đủ coverage hoặc được phép dùng cho production.

| ID | Source | Information supplied | Exact product use | Convention / version | Limitation | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| U01 | User-entered holdings snapshot | Symbol và quantity hiện nắm giữ | Tạo current allocation tại đầu kỳ | Form/CSV theo input dictionary | Người dùng có thể nhập sai hoặc thiếu; luôn phải validate | Trần Minh Ngọc | Approved for MVP |
| U02 | User-entered scenario | Một changed symbol và target weight | Tạo alternative state; các weights khác do hệ thống tính pro-rata | `sample_scenario.csv` | Không phải lệnh giao dịch hoặc recommendation | Nguyễn Ngọc Anh | Approved for MVP |
| M01 | [Yahoo Finance chart adapter in `yahoo-finance2`](https://github.com/gadicc/yahoo-finance2/blob/dev/src/modules/chart.ts) | Daily unadjusted close | Chuỗi price return của supported instruments | Prototype tested with `yahoo-finance2` 3.14.0; suffix/venue được giữ; retrieval timestamp lưu trong CSV | API Yahoo không chính thức, không có SLA và coverage không đầy đủ | Lê Bảo An | Provisional prototype source |
| M02 | [Yahoo Finance quote adapter in `yahoo-finance2`](https://github.com/gadicc/yahoo-finance2/blob/dev/src/modules/quote.ts) | Currency, exchange, quote type, market cap nếu có | Resolve/kiểm tra metadata; market cap chỉ contextual | Cùng resolved symbol như M01 | Market cap có thể thiếu và không point-in-time aligned | Lê Bảo An | Conditional |
| FX01 | Yahoo symbol `VND=X` | Daily USD/VND close | Chuyển giá trị và return USD sang VND | VND cho 1 USD; same-date common intersection | FX calendar có thể lệch asset calendar | Lê Bảo An | Provisional prototype source |
| R01 | [HNX listed-securities register](https://hnx.vn/vi-vn/co-phieu-etfs/chung-khoan-ny-thong-tin.html), [HOSE](https://www.hsx.vn/) và công bố của issuer | Tên tổ chức, symbol và exchange | Human review khi đưa mã Việt Nam vào instrument master | Không dùng làm historical-price feed | Chưa có một API thống nhất cho prototype; cần lưu exact verification link theo instrument | Trần Minh Ngọc | Verification source |
| T01 | Team configuration | Asset taxonomy, VND base currency, weight bounds và pro-rata rule | Chuẩn hóa group và tạo deterministic scenario | Versioned trong repository | Là quyết định sản phẩm, không phải fact thị trường | Hoàng Khánh Linh | Approved for MVP |
| D01 | [Committed Week 3 fixture](../data/README.md) | Holdings, scenario, config và 10 ngày market observations | Review và tái lập early logic test mà không phụ thuộc API live | CSV + source ID + retrieval timestamp | Cửa sổ ngắn; không dùng để kết luận đầu tư | Nguyễn Quỳnh Anh | Approved as evidence |
| B01 | Yahoo symbol `E1VFVN30.VN` | Giá ETF proxy cho VN30 | Candidate benchmark cho phiên bản sau MVP | Phải gắn nhãn ETF proxy, không gọi là VN30 index | Tracking error và phí quỹ; không nằm trong core fixture | Nguyễn Ngọc Anh | Deferred |
| TV01 | Local `tvdatafeed` / TradingView | Candidate market-price coverage | Chỉ nghiên cứu feasibility, không dùng trong core calculation | [TradingView policies](https://www.tradingview.com/policies/) | Điều khoản giới hạn automated collection và non-display processing; chưa có license phù hợp | Lê Bảo An | Not approved |

## Coverage decision

- Core fixture đã resolve: `FPT.VN`, `HPG.VN`, `GLD`, `BTC-USD` và `VND=X`.
- `^VNINDEX`, `^VN30` và các biến thể PVI đã thử không trả về đúng chuỗi qua adapter hiện tại. Hệ thống phải báo `unsupported/unresolved`, không tự bỏ suffix và lấy instrument trùng ticker ở thị trường khác.
- `GC=F` là gold futures, nằm ngoài giả định không futures. `GLD` được hiển thị đúng là **Gold proxy ETF**, không phải spot gold.
- Yahoo là nguồn prototype hiện tại. Nếu nhóm chuyển sang nguồn khác, source-use map, fixture provenance và coverage test phải được cập nhật cùng lúc.
- Trước production, nhóm phải chọn nguồn có license/SLA phù hợp. CSV trong repo chỉ là checkpoint evidence.

## Claim boundary

Các nguồn thị trường chỉ hỗ trợ giá và metadata tại thời điểm retrieval. Chúng không chứng minh nhu cầu người dùng, không bảo đảm coverage toàn thị trường và không tạo khuyến nghị đầu tư.
