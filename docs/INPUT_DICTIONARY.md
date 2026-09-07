# Week 3 — Input Dictionary

MVP nhận **current holdings snapshot**, không nhận transaction history. Bảng phân biệt rõ dữ liệu người dùng nhập, product information, team configuration và system state. `Core` là bắt buộc cho Risk and Return Allocation Brief; `Conditional` chỉ cần khi chạy nhánh liên quan; `Contextual/Deferred` không tham gia core calculation.

| Input / state | Meaning | Type / format | Unit | Example | Rule | Information role | Level | Output affected | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `portfolio_id` | Mã của một phiên phân tích | string | — | `G09_SAMPLE_01` | Không rỗng; duy nhất trong phiên | System-generated state | Core | Truy nguyên toàn bộ brief | Lê Bảo An |
| `symbol` | Mã tài sản người dùng đang nắm giữ | string | — | `FPT.VN` | Phải resolve duy nhất; không dùng bare ticker mơ hồ | User input | Core | Mọi kết quả theo vị thế | Trần Minh Ngọc |
| `quantity` | Số đơn vị đang nắm giữ tại đầu kỳ | number | đơn vị tài sản | `100` | `> 0`; MVP không hỗ trợ short | User input | Core | Position value và current weight | Trần Minh Ngọc |
| `exchange` | Sàn/venue của instrument đã resolve | string | — | `HOSE` | Thuộc supported universe | Product information | Core | Nhận diện instrument và calendar | Lê Bảo An |
| `asset_group` | Nhóm tài sản chuẩn hóa | enum | — | `Vietnam equity` | System map theo taxonomy; user được xác nhận | Product information | Core | Allocation/contribution theo nhóm | Trần Minh Ngọc |
| `currency` | Đồng tiền báo giá của instrument | ISO 4217 | — | `VND` | Phải có FX path sang base currency | Product information | Core | Chuẩn hóa value và return | Lê Bảo An |
| `base_currency` | Đồng tiền báo cáo danh mục | ISO 4217 | — | `VND` | MVP khóa ở `VND` | Team configuration | Core | Mọi giá trị tiền tệ | Hoàng Khánh Linh |
| `data_start` | Đầu kỳ phân tích | ISO date | — | `2026-07-01` | `< data_end`; có đủ observations | User/config input | Core | Horizon của brief | Nguyễn Quỳnh Anh |
| `data_end` | Cuối kỳ phân tích | ISO date | — | `2026-07-15` | Không sau latest available date | User/config input | Core | Horizon của brief | Nguyễn Quỳnh Anh |
| `session_date` | Ngày của một quan sát thị trường | ISO date | — | `2026-07-01` | Duy nhất theo series; theo alignment rule | Market information | Core | Return series | Lê Bảo An |
| `close_price` | Giá đóng cửa chưa điều chỉnh | number | quote currency/đơn vị | `70200` | `> 0`; không missing trong matrix cuối | Market information | Core | Value, price return, volatility | Lê Bảo An |
| `fx_rate_to_base` | Số VND cho một đơn vị quote currency | number | VND/quote currency | `26255` | `> 0`; bằng `1` với tài sản VND | Market information | Core với tài sản ngoại tệ | Base-currency value và return | Lê Bảo An |
| `price_frequency` | Tần suất chuỗi giá | enum | — | `1d` | MVP chỉ dùng daily observations | Team configuration | Core | Alignment và annualization | Hoàng Khánh Linh |
| `changed_symbol` | Một vị thế người dùng muốn thử thay đổi | string | — | `BTC-USD` | Phải thuộc current holdings | User input | Core cho Compare | Xác định scenario | Nguyễn Ngọc Anh |
| `target_weight_pct` | Tỷ trọng mới của `changed_symbol` | number | % | `20` | `0–100` và nằm trong bounds | User input | Core cho Compare | Before/after comparison | Nguyễn Ngọc Anh |
| `min_weight_pct` | Cận dưới cho target weight | number | % | `0` | `0 ≤ min ≤ target` | Team configuration | Core cho Compare | Scenario validation | Hoàng Khánh Linh |
| `max_weight_pct` | Cận trên cho target weight | number | % | `60` | `target ≤ max ≤ 100` | Team configuration | Core cho Compare | Scenario validation | Hoàng Khánh Linh |
| `rebalance_rule` | Cách phân bổ phần weight còn lại | enum | — | `pro_rata_unlocked` | MVP dùng đúng một rule công bố | Team assumption/configuration | Core cho Compare | Proposed weights của các vị thế còn lại | Hoàng Khánh Linh |
| `benchmark_symbol` | Mã benchmark tùy chọn | string | — | `E1VFVN30.VN` | Phải có cùng horizon và currency path | Product information | Deferred | Không thuộc core Week 3 output | Nguyễn Ngọc Anh |
| `market_cap` | Vốn hóa gần nhất nếu có | number | quote currency | `189000000000000` | Có timestamp/source; thiếu không chặn flow | Product information | Contextual | Chỉ mô tả instrument | Trần Minh Ngọc |

## Dữ liệu được tạo sau validation

`position_value`, `current_weight`, `proposed_weight`, base-currency return, return contribution và risk contribution là **derived results**, không phải user input. Proposed weights của các vị thế không được chọn được hệ thống tính theo `rebalance_rule`.

## Deferred input

Transaction history (`trade_side`, `trade_price`, `trade_date`) chưa thuộc MVP. Khi hỗ trợ trong tương lai, sản phẩm phải xử lý holdings thay đổi theo thời gian, external cash flow và return convention riêng; không được trộn transaction rows với holdings snapshot.
