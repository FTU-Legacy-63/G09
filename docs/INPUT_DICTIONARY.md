# Week 3 — Input Dictionary

Input dictionary thống nhất meaning, format, validation rule và output chịu ảnh hưởng. Trường `Core` là bắt buộc cho logic path chính; `Conditional` chỉ bắt buộc khi người dùng bật chức năng tương ứng; `Contextual` không tham gia phép tính MVP.

| Input name | Meaning | Type / format | Unit | Example | Valid range / rule | Level | Output affected | Source / owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `portfolio_id` | Mã danh mục trong một phiên phân tích | string | — | `SAMPLE_G09_01` | Không rỗng; duy nhất trong phiên | Core | Truy nguyên toàn bộ output | User / Trần Minh Ngọc |
| `asset_group` | Nhóm tài sản do người dùng chọn | enum | — | `equity_vn` | Thuộc taxonomy được công bố | Core | Allocation và attribution theo nhóm | User; system kiểm tra / Trần Minh Ngọc |
| `symbol` | Mã định danh tài sản | string | — | `FPT.VN` | Không dùng bare ticker mơ hồ; phải map được với `exchange` | Core | Mọi phép tính theo vị thế | User + instrument master / Lê Bảo An |
| `exchange` | Sàn hoặc venue của mã | string | — | `HOSE` | Thuộc danh sách được hỗ trợ | Core | Nhận diện mã và calendar | Instrument master / Lê Bảo An |
| `trade_side` | Chiều giao dịch | enum | — | `BUY` | `BUY` hoặc `SELL` | Core khi nhập giao dịch | Khối lượng ròng | User / Trần Minh Ngọc |
| `trade_price` | Giá thực hiện giao dịch | number | currency/đơn vị | `70200` | `> 0` | Core khi nhập giao dịch | Cost basis và position value ban đầu | User / Trần Minh Ngọc |
| `trade_date` | Ngày giao dịch (MVP chưa xử lý intraday) | ISO date | — | `2026-07-01` | Không ở tương lai; parse được | Core khi nhập giao dịch | Xác định cửa sổ nắm giữ | User / Trần Minh Ngọc |
| `quantity` | Khối lượng mua/bán hoặc đang nắm giữ | number | đơn vị tài sản | `100` | `> 0`; SELL không vượt holdings; không short | Core | Position value và weight | User / Trần Minh Ngọc |
| `currency` | Đồng tiền báo giá của tài sản | ISO 4217 | — | `VND` | Có FX path sang base currency | Core | Chuẩn hóa giá trị và return | Market metadata; user xác nhận / Lê Bảo An |
| `base_currency` | Đồng tiền báo cáo danh mục | ISO 4217 | — | `VND` | MVP mặc định `VND` | Core | Tất cả giá trị tiền tệ | Product config / Hoàng Khánh Linh |
| `proposed_weight_pct` | Tỷ trọng người dùng muốn thử | number | % | `30` | `0–100`; tổng các vị thế = `100` | Core cho Compare | Before/after comparison | User / Nguyễn Ngọc Anh |
| `min_weight_pct` | Cận dưới cho tỷ trọng đề xuất | number | % | `0` | `0 ≤ min ≤ proposed` | Core cho Compare | Validation và rebalance | Product config / Hoàng Khánh Linh |
| `max_weight_pct` | Cận trên cho tỷ trọng đề xuất | number | % | `60` | `proposed ≤ max ≤ 100` | Core cho Compare | Validation và concentration warning | Product config / Hoàng Khánh Linh |
| `session_date` | Ngày giao dịch của quan sát giá | ISO date | — | `2026-07-01` | Duy nhất theo symbol; theo calendar đã chuẩn hóa | Core | Return series | Market-data adapter / Lê Bảo An |
| `close_price` | Giá đóng cửa chưa điều chỉnh | number | currency/đơn vị | `70200` | `> 0`; không missing trong ma trận cuối | Core | Price return, value, volatility | Market source / Lê Bảo An |
| `fx_rate_to_base` | Số đơn vị base currency cho 1 đơn vị quote currency | number | base/quote | `26247` | `> 0`; bằng `1` nếu cùng currency | Core với tài sản ngoại tệ | Base-currency value và return | FX source / Lê Bảo An |
| `data_frequency` | Tần suất chuỗi giá | enum | — | `1d` | MVP: `1d` (daily) | Core | Alignment và annualization | Product config / Hoàng Khánh Linh |
| `data_start` | Đầu kỳ phân tích | ISO date | — | `2026-07-01` | `< data_end`; có đủ observations | Core | Horizon của output | User/config / Nguyễn Quỳnh Anh |
| `data_end` | Cuối kỳ phân tích | ISO date | — | `2026-07-15` | `≤ latest available date` | Core | Horizon của output | User/config / Nguyễn Quỳnh Anh |
| `benchmark_symbol` | Mã benchmark để đối chiếu | string | — | `E1VFVN30.VN` | Phải có cùng horizon và currency path | Conditional | Benchmark comparison | User/config + market source / Nguyễn Ngọc Anh |
| `market_cap` | Vốn hóa gần nhất của doanh nghiệp | number | currency | `189000000000000` | `> 0`; có timestamp/source | Contextual | Thông tin mô tả, không vào core calculation | Quote metadata / Trần Minh Ngọc |

## Quyết định phạm vi

- Market cap chỉ là context; thiếu market cap không được chặn Risk and Return Allocation Brief.
- Benchmark là tùy chọn trong Week 3, không phải điều kiện để hoàn thành core task.
- Không thu thập tên, email, số tài khoản hoặc thông tin định danh cá nhân trong MVP.
- Các trường dẫn xuất như position value, portfolio weight, return và risk contribution không phải input; chúng được tạo trong calculation layer.
