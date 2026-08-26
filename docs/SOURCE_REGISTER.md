# Week 3 — Source Register và Source–Use Map

Mỗi nguồn dưới đây được gắn với đúng claim/use trong sản phẩm. Việc một nguồn “có dữ liệu” không đồng nghĩa dữ liệu đó được phép hoặc đủ ổn định cho production.

| ID | Source | Information supplied | Exact use in product | Convention / access | Limitation | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| U01 | User-entered holdings | Symbol, side, trade price/time, quantity, proposed weight | Tái tạo holdings và scenario do người dùng yêu cầu | Form/CSV theo input dictionary | Có thể sai định dạng hoặc không đầy đủ; luôn phải validate | Trần Minh Ngọc | Approved for MVP |
| M01 | [Yahoo Finance chart through `yahoo-finance2`](https://github.com/gadicc/yahoo-finance2/blob/dev/src/modules/chart.ts) | Daily unadjusted close | Chuỗi price return của instrument được hỗ trợ | Symbol có suffix/venue, ví dụ `FPT.VN`; lưu retrieval timestamp | Adapter dùng API Yahoo không chính thức, không có bảo đảm availability; coverage không đầy đủ | Lê Bảo An | Provisional prototype source |
| M02 | [Yahoo Finance quote through `yahoo-finance2`](https://github.com/gadicc/yahoo-finance2/blob/dev/src/modules/quote.ts) | Currency, exchange, quote type, latest market cap nếu có | Kiểm tra metadata; market cap chỉ để hiển thị context | Đọc cùng symbol đã resolve | Market cap có thể thiếu và không point-in-time aligned | Lê Bảo An | Conditional |
| FX01 | Yahoo symbol `VND=X` | USD/VND daily close | Chuyển giá trị/return USD sang base currency VND | Diễn giải là VND cho 1 USD | Lịch FX và lịch tài sản có thể lệch; cần alignment rule | Lê Bảo An | Provisional prototype source |
| B01 | Yahoo symbol `E1VFVN30.VN` | Giá ETF mô phỏng VN30 | Benchmark mẫu khi direct index series không có | Gắn nhãn rõ là ETF proxy, không gọi là VN30 index | Tracking error và phí quỹ; không thay thế hoàn toàn chỉ số | Nguyễn Ngọc Anh | Conditional proxy |
| R01 | Website/thông tin công bố của HOSE/HNX và issuer | Tên doanh nghiệp, exchange, symbol | Xác minh danh tính instrument khi onboarding symbol | Human-reviewed instrument master | Chưa tích hợp lịch sử giá tự động | Trần Minh Ngọc | Verification source |
| T01 | Team-owned configuration | Taxonomy asset group, supported universe, bounds, rebalance rule | Chuẩn hóa group và kiểm soát scenario | Versioned trong repo | Là quyết định sản phẩm, không phải fact thị trường | Hoàng Khánh Linh | Approved for MVP |
| D01 | [Committed Week 3 fixture](../data/README.md) | Holdings mẫu, config và 10 ngày dữ liệu thị trường đã chụp | Review, tái lập early logic test, tránh thay đổi do API live | CSV + retrieval timestamp | Cửa sổ ngắn; không dùng để kết luận đầu tư | Nguyễn Quỳnh Anh | Approved as evidence |
| TV01 | Local `tvdatafeed` / TradingView | Candidate price feed | Chỉ nghiên cứu coverage; không dùng trong core evidence hoặc production | Unofficial client/automated access | Điều khoản TradingView hạn chế automated collection/non-display usage; thiếu hợp đồng/license rõ ràng | Lê Bảo An | Not approved |

## Quyết định về coverage

- Các mã đã kiểm tra trong fixture: `FPT.VN`, `HPG.VN`, `GLD`, `BTC-USD`, `E1VFVN30.VN`, `VND=X`.
- `^VNINDEX`, `^VN30` và các biến thể PVI đã thử không trả về chuỗi phù hợp qua adapter hiện tại. Hệ thống phải báo `unsupported/unresolved`; tuyệt đối không tự bỏ suffix và lấy một instrument trùng tên ở thị trường khác.
- `GC=F` có dữ liệu nhưng là gold futures, nằm ngoài giả định “không futures”. Sample dùng `GLD` và hiển thị là **Gold proxy ETF**, không phải spot gold.
- Trước production, nhóm phải thay hoặc bổ sung nguồn có license/SLA phù hợp; CSV trong repo chỉ là evidence có thể review.

## Claim boundary

Nguồn thị trường chỉ chứng minh các giá/metadata đã quan sát tại thời điểm retrieval. Nó không chứng minh nhu cầu người dùng, không bảo đảm coverage toàn thị trường và không tạo ra khuyến nghị đầu tư.
