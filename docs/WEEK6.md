# Week 6 - Working Build, Integration and Testing

## Core flow được bảo vệ

Demo đáp ứng một nhiệm vụ chính: nhà đầu tư cá nhân nhập tỷ trọng cổ phiếu và commodity proxy, xem return/risk contribution của danh mục hiện tại, so sánh với một performance benchmark và một minimum-variance reference allocation, rồi tự ghi nhận quyết định. Luồng chạy trong [`demo/`](../demo/index.html):

```text
Chọn mã và tỷ trọng, ngày, benchmark, giới hạn
  -> validate
  -> backend tải giá qua yfinance, align ngày và quy đổi GLD sang VND
  -> tính allocation, return/risk contribution và benchmark comparison
  -> tìm minimum-variance reference trên lưới 1%
  -> hiển thị một Risk and Return Allocation Brief
  -> người dùng ghi nhận lựa chọn và lý do trong phiên
```

Mã Finfolio 1.0 là tham chiếu cho input danh mục, dashboard và cách trình bày portfolio metrics. Giao diện giữ hướng xanh lá, sidebar và phân cấp thông tin của [Homepage Draft](https://drive.google.com/file/d/15Yc-OZBaXJLOKP5AQDLHLY3HBKkYrVwx/view) và [Portfolio Analysis Dashboard](https://drive.google.com/file/d/1Y2k1k5Jg6PgYVMTt5PIQPloWvxSW4gXj/view). Các số trong ảnh mẫu chỉ là thiết kế; demo tính từ dữ liệu yfinance mới tải.

## Build và deployment check

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Input -> logic | Form truyền holdings, dates và caps vào engine | `demo/app.js` gọi `analyzePortfolio` với state của form | Pass, kiểm tra local |
| Data -> product | Tải giá mới từ yfinance mỗi lần phân tích | API trả 507 bản ghi cho 4 series, 2026-04-01–2026-09-25, có `fetched_at_utc`; không cache/fallback | Pass local live smoke, 26/09/2026 |
| Logic -> output | Brief phản ánh input mới | Browser hiển thị kết quả từ 127 ngày giá chung tải qua API, có thời điểm tải và ngày giá cuối | Pass Safari local, 26/09/2026 |
| Output -> action | User có thể ghi nhận lựa chọn và lý do | Form ở cuối brief ghi nhận lựa chọn trong phiên | Implemented; browser review pending |
| Repo -> local run | Người khác chạy được bằng lệnh README | Cài requirements, chạy `python3 demo/server.py`, mở `/demo/` | Pass, HTTP 200 và API 200 |
| Repo -> public URL | Link mở trên thiết bị khác | [g09-finfolio.vercel.app](https://g09-finfolio.vercel.app/) chạy static UI và Python Function | Pass, production HTTP 200 và API 200 ngày 26/09/2026 |

### Sample input để trình bày tại lớp

| Field | Value |
| --- | --- |
| Holdings | FPT.VN 40%; HPG.VN 35%; GLD 25% |
| Horizon | 6 tháng gần nhất, mặc định theo ngày mở ứng dụng |
| Benchmark | GLD, gold ETF proxy, quy đổi sang VND |
| Objective | Minimum variance, long-only |
| Constraints | Tối đa 80% mỗi mã; tối đa 60% commodity |
| Expected | Brief hiện allocation, return/risk contribution, benchmark và current/reference comparison; contribution reconcile |

## Financial consistency

- Giá FPT/HPG tính bằng VND. Giá GLD bằng USD được nhân `VND=X` cùng ngày; benchmark GLD cũng dùng giá quy đổi VND. Không gọi GLD là giá vàng spot hoặc VN-Index.
- Backend dùng yfinance để lấy `Close` chưa điều chỉnh tại thời điểm phân tích, trả `fetched_at_utc`; ngày phiên cuối có thể cũ hơn thời điểm tải do lịch giao dịch và độ trễ nguồn. Nếu nguồn lỗi hoặc thiếu ngày giao chung, trả lỗi; không tự dùng CSV.
- `period_return = sum(start_weight_i * (end_price_i / start_price_i - 1))`. Đây là mô hình mua và giữ từ tỷ trọng đầu kỳ; return contribution từng mã cộng đúng bằng return kỳ.
- Daily asset returns tạo sample covariance. `annualized_volatility = sqrt(w'Covw) * sqrt(252)`. Euler risk contribution từng mã cộng đúng bằng volatility ước lượng, đo theo tỷ trọng đầu kỳ.
- Reference allocation tìm variance thấp nhất trong các tỷ trọng nguyên 1%, có tổng 100%, không short, tuân thủ cap mỗi mã và cap commodity. Current và reference dùng cùng giá, horizon và covariance. Lưới 1% là độ phân giải demo, không phải lời hứa nghiệm liên tục chính xác tuyệt đối.
- Active return là portfolio period return trừ GLD benchmark period return trên cùng ngày.

## Test table

Chạy bằng `node --test demo/finance.test.mjs`. Các giá trị actual dưới đây đến từ lệnh này, không phải từ ảnh giao diện.
API boundary tests chạy bằng `python3 -m unittest discover -s demo -p 'test_*.py'`.

| ID | Case và input | Expected | Actual | Status | Test author / fix / verification |
| --- | --- | --- | --- | --- | --- |
| T01 | Normal: 40/35/25, fixture kiểm thử | Có đủ current, reference, benchmark, 10 ngày giá | Engine trả đủ các object và số hữu hạn | Pass | Codex-assisted / Lê Bảo An review pending / `node:test` |
| T02 | Boundary: FPT 100%, GLD 0% | GLD contribution = 0, return bằng FPT | Đúng trong sai số `1e-10` | Pass | Codex-assisted / Lê Bảo An review pending / `node:test` |
| T03 | Invalid: tổng 75%; lặp FPT | Báo lỗi, không trả brief | Hai input đều bị chặn | Pass | Codex-assisted / Lê Bảo An review pending / `node:test` |
| T04 | Financial: sample có GLD và USD/VND | Contribution return/risk và group reconcile; FX đúng | Các identity khớp trong tolerance; GLD ngày đầu = `370.600006 * 26255` VND | Pass | Codex-assisted / Hoàng Khánh Linh review pending / `node:test` |
| T05 | Financial: minimum variance 80/60 caps | Tổng 100%, tuân thủ cap, variance không tăng | Các điều kiện đều thỏa | Pass | Codex-assisted / Hoàng Khánh Linh review pending / `node:test` |
| T06 | Invalid: dưới 5 ngày; cap 30% cho 3 mã | Báo lỗi data sufficiency và infeasible cap | Hai trường hợp đều bị chặn | Pass | Codex-assisted / Nguyễn Quỳnh Anh review pending / `node:test` |
| T07 | Provider mock trả giá bốn series | API map `VND=X` thành `USDVND`, có timestamp | 8 bản ghi/2 ngày, timestamp hiện diện | Pass | Codex-assisted / Lê Bảo An review pending / Python unittest |
| T08 | Symbol trùng | Chặn trước khi gọi yfinance | Provider không được gọi | Pass | Codex-assisted / Lê Bảo An review pending / Python unittest |
| T09 | Provider trả rỗng | Báo lỗi, không fallback | RuntimeError đúng kỳ vọng | Pass | Codex-assisted / Lê Bảo An review pending / Python unittest |
| T10 | Live end-to-end, 26/09/2026 | API trả giá mới, browser có brief | 127 ngày giá chung; return -6.73%, volatility 18.52% trên khoảng mặc định lúc kiểm tra | Pass tại thời điểm kiểm tra; số sẽ thay đổi | Codex-assisted / Lê Bảo An review pending / Safari local |

## Bug log và ưu tiên

| ID | Issue / steps | Severity | Expected | Actual / status | Owner / verifier |
| --- | --- | --- | --- | --- | --- |
| B01 | Yahoo/yfinance có thể trả HTTP 429 hoặc thiếu giá | Major | Không hiển thị số cũ như số mới | API báo lỗi rõ, không fallback; cần thử lại sau hoặc đổi khoảng ngày | Lê Bảo An / nhóm kiểm tra lại provider |
| B02 | Finfolio 1.0 dùng heuristic rồi chuẩn hóa weight, có thể vượt bounds | Critical | Reference tuân thủ bounds | Engine mới tìm trên feasible grid; T05 pass | Lê Bảo An / Hoàng Khánh Linh review pending |
| B03 | Sau khi sửa input, brief cũ có thể gây nhầm | Major | Kết quả cũ bị ẩn đến khi chạy lại | UI invalidates result khi form thay đổi; interaction review pending | Lê Bảo An / Nguyễn Quỳnh Anh review pending |
| B04 | Demo chỉ mở ba mã và một commodity proxy | Major limitation | Không diễn giải như toàn bộ commodity universe | Warning và scope rõ; cần mở rộng universe sau Week 6 | Trần Minh Ngọc / Hoàng Khánh Linh review pending |
| B05 | Dữ liệu cũ không có performance index benchmark | Major limitation | Benchmark được định danh đúng | Demo dùng GLD ETF proxy như performance comparator và ghi rõ; index integration pending | Trần Minh Ngọc / Hoàng Khánh Linh review pending |
| B06 | Vercel GitHub App chưa được cấp quyền vào repo tổ chức `FTU-Legacy-63/G09` | Minor deployment workflow | Push lên main tự tạo deployment | Production đã deploy bằng CLI; các lần cập nhật cần `vercel deploy --prod` hoặc cấp quyền GitHub App | Lê Bảo An / org admin |

## Scope freeze và ownership

Freeze cho bản Week 6 demo: một route với ba instrument tải từ yfinance, một benchmark GLD proxy, một objective minimum variance, một brief và một decision record trong phiên. Các asset class khác, AI commentary, login, tick-by-tick real-time data và các chỉ số nâng cao chưa được tích hợp. Phạm vi sản phẩm vẫn là equity cùng commodity khả dụng từ provider; demo chỉ chứng minh một tập con.

| Component | Owner theo phân công Week 5 | Evidence hiện có | Việc cần nhóm xác nhận |
| --- | --- | --- | --- |
| Scope và phương pháp tài chính | Hoàng Khánh Linh | Week 4 method; `demo/finance.mjs`; T04-T05 | Sign-off các công thức và proxy benchmark |
| User flow, test cases | Nguyễn Quỳnh Anh | Week 5 scenarios; T01-T06 và bug log | Chạy lại UI path, ghi verifier thực tế |
| Build và integration | Lê Bảo An | `demo/`, yfinance API local, test runner | Tìm Python host và kiểm tra trên thiết bị khác |
| Dữ liệu và provenance | Trần Minh Ngọc | yfinance API, CSV Week 3 chỉ làm test fixture | Kiểm tra index benchmark và commodity coverage |
| UI/UX | Nguyễn Ngọc Anh | Hai interface samples Drive và màn hình demo | Review copy, responsive và user comprehension |

Các tên trong bảng là owner theo phân công đã ghi ở Week 5, không đồng nghĩa các thành viên đã tự chạy hoặc xác nhận bản build này. Việc xác nhận cá nhân cần được ghi bổ sung sau khi từng người kiểm tra.

## Production deployment

- URL: <https://g09-finfolio.vercel.app/>. Vercel project `g09-finfolio` thuộc cùng tài khoản đang host project SHB; là project riêng, không sửa cấu hình SHB.
- `vercel.json` chọn static frontend và Python Function tại `/api/market-data`; `requirements.txt` pin phiên bản yfinance. Backend không cache và không fallback về fixture khi Yahoo lỗi.
- Kiểm tra production ngày 26/09/2026: `/`, `/demo/styles.css`, `/demo/app.js`, `/docs/WEEK6.md` và `/api/market-data` đều HTTP 200. API trả nguồn Yahoo Finance qua yfinance cùng `fetched_at_utc`.
- GitHub integration tự động chưa có quyền với repo org. CLI deploy hoạt động; sau mỗi cập nhật cần deploy lại thủ công cho đến khi quyền Vercel GitHub App được cấp.
