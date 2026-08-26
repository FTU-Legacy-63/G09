# Week 3 — Assumptions và Limitations

## Assumption register

| ID | Assumption | Why needed | Effect on output | Disclosure / control | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| A01 | MVP không hỗ trợ short selling hoặc leverage | Giữ một logic path rõ ràng | Net quantity không âm; weight trong `0–100%` | Reject vị thế âm và SELL vượt holdings | Hoàng Khánh Linh | Accepted |
| A02 | Không hỗ trợ futures/options | Tránh contract multiplier, expiry và margin | Commodity chỉ qua spot hoặc proxy được gắn nhãn | Sample dùng GLD ETF proxy; không dùng `GC=F` | Hoàng Khánh Linh | Accepted |
| A03 | Dùng unadjusted close và price return; chưa gồm dividend | Giữ source convention nhất quán | Return có thể thấp hơn total return | Hiển thị “price return only” | Hoàng Khánh Linh | Accepted for prototype |
| A04 | Transaction cost, tax và slippage bằng 0 | Chưa có dữ liệu phí theo broker/market | Before/after không phản ánh chi phí tái cân bằng | Hiển thị limitation; chưa đưa recommendation | Nguyễn Ngọc Anh | Accepted for prototype |
| A05 | Base currency là VND | Target user và sample tại Việt Nam | Tài sản USD được chuyển bằng FX cùng ngày | Hiển thị source và orientation của FX | Lê Bảo An | Accepted |
| A06 | Ma trận return dùng giao của các ngày có đủ price và FX | Multi-asset calendars khác nhau | Crypto weekend observations bị loại khi ghép với equity | Báo số observations bị loại | Lê Bảo An | Accepted |
| A07 | Daily sample dùng hệ số annualization 252 | Phù hợp trading-day convention của equity | Volatility phụ thuộc convention này | Hiển thị frequency và factor | Hoàng Khánh Linh | Accepted |
| A08 | Early attribution giữ fixed start weights trong horizon | Dễ truy nguyên phép tính đầu tiên | Không mô phỏng drift/rebalance trong kỳ | Gắn nhãn early test; Week 4 sẽ khóa convention | Nguyễn Quỳnh Anh | Provisional |
| A09 | Covariance dùng sample estimator (`ddof=1`) và Euler risk contribution | Cho phép contribution cộng lại portfolio volatility | Kết quả phụ thuộc lịch sử và covariance | Công bố formula và reconciliation test | Hoàng Khánh Linh | Provisional |
| A10 | Proposed weights phải tổng bằng 100%; phần mở khóa được cân theo rule pro-rata | Tạo một scenario xác định | Before/after có thể tái lập | Hiển thị locked positions, bounds và rule | Nguyễn Ngọc Anh | Accepted |
| A11 | Sample holdings do nhóm tạo; market observations là dữ liệu thực | Không dùng dữ liệu cá nhân nhưng vẫn kiểm thử được flow | Sample không đại diện khách hàng hoặc bằng chứng vấn đề | Gắn provenance trong data README | Trần Minh Ngọc | Accepted |
| A12 | Không diễn giải CAGR khi cửa sổ quá ngắn; output user-facing cần horizon đủ dài | Annualizing vài ngày gây hiểu lầm | Week 3 fixture chỉ kiểm tra arithmetic, không báo CAGR | Block/flag khi không đủ observation policy | Nguyễn Quỳnh Anh | Accepted |

## Limitation register

| Limitation | Consequence | MVP response |
| --- | --- | --- |
| Yahoo adapter là nguồn không chính thức và coverage có khoảng trống | Mã như PVI hoặc direct VN indices có thể không resolve | Supported-universe list, explicit error, không silent fallback |
| Fixture chỉ có 10 common dates / 9 return observations | CAGR/volatility không đủ ý nghĩa để ra quyết định | Chỉ dùng cho early logic test; gắn nhãn non-decision-grade |
| Price return không gồm cổ tức, phí, thuế và slippage | Không phản ánh net investor return | Disclosure bắt buộc trong Decision Brief |
| Market cap là latest metadata, không point-in-time aligned | Không dùng được cho historical attribution đáng tin cậy | Chỉ hiển thị contextual; missing không chặn core flow |
| GLD là ETF proxy, không phải physical/spot gold | Có tracking, fee và market-hours difference | Gắn nhãn “Gold proxy ETF” |
| Calendar equity, ETF, FX và crypto khác nhau | Common-date rule làm mất dữ liệu cuối tuần của crypto | Hiển thị alignment rule và observation count |
| Historical volatility/contribution không phải forecast | Người dùng có thể hiểu nhầm thành khuyến nghị | Ngôn ngữ mô tả evidence, không dùng “nên mua/bán” |
| Benchmark ETF proxy có tracking error | So sánh không tương đương direct index | Benchmark optional và gắn nhãn proxy |
| Chưa có licensed production feed/SLA | Không bảo đảm uptime hoặc redistribution | Chỉ prototype; cần source decision trước production |

Các assumption/limitation này phải xuất hiện cạnh output liên quan, không chỉ nằm trong tài liệu nội bộ.
