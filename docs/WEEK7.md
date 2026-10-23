# Week 7 — Final audit và chuẩn bị verification

Đối chiếu [yêu cầu Week 7](https://github.com/FTU-Legacy-63/NHA408E/blob/master/docs/weeks/week-7.md) và [Final Repo Readiness](https://github.com/FTU-Legacy-63/NHA408E/blob/master/docs/assessment/final-repo-readiness.md). Giữ Weeks 1–6 như evidence lịch sử; tài liệu này cập nhật trạng thái final, không viết lại các bài cũ.

## Core flow và evidence

Target user: nhà đầu tư cá nhân có kiến thức tài chính, muốn hiểu và so sánh nhiều asset class trong một danh mục giả định. Nhập giá trị từng tài sản VND/USD → kiểm tra nguồn/currency → giá trị và PnL → đóng góp return/risk/FX → so benchmark → tùy chọn tối ưu hóa hoặc mô phỏng → tự ghi quyết định trong nhật ký tài khoản.

| Hạng mục | Evidence | Trạng thái |
| --- | --- | --- |
| Product và hướng dẫn chạy | [README](../README.md), `/portfolio`, `/analysis` | Local đã chạy bằng dữ liệu provider thật; kiểm tra production sau deploy |
| Logic, nguồn, giả định | [scope](PRODUCT_SCOPE.md), [FX](FX_ATTRIBUTION.md), [final methods](FINAL_METHODS.md) | Có; giới hạn được công bố |
| Tối ưu hóa riêng | [method](OPTIMIZATION.md), `/optimize` | Có min volatility + max Sharpe; không tự áp dụng |
| Monte Carlo | [simulation](../demo/simulation.mjs), `/simulation` | Có seeded joint block bootstrap; không phải dự báo |
| Account/decision | [setup](ACCOUNT_SETUP.md), [decision snapshot](../demo/decision-record.mjs) | Giữ integration hiện tại; lần audit này chưa đăng nhập Google bằng tài khoản người dùng |
| Test | `npm test`; `python3 -m unittest discover -s demo -p 'test_*.py'` | 46 JS + 35 Python pass tại 23/10/2026; không coi là user acceptance của nhóm |
| Contribution / footprint | [bản đồ và hướng dẫn](individual/README.md) | Phân công đã xác nhận; từng người phải tự xác nhận outputs/hiểu biết |
| Release/backup | Hướng dẫn cuối trang | Chỉ tag sau khi kiểm tra đúng production commit; chưa tuyên bố đã release |

## Dữ liệu và refresh

Audit tìm thấy job không hỏng liên tục: run [39804586251](https://github.com/FTU-Legacy-63/G09/actions/runs/39804586251) thành công, snapshot `fbcb6ef` có 26/26 mã đến 22/10/2026. Vấn đề có thể đến từ end date cũ được lưu, báo cáo sessionStorage không tự fetch, cache có timestamp mới nhưng nến cũ, và phiên chung VN/Mỹ/FX khác nhau.

Revision: thêm endpoint metadata `/api/data-status` không chứa holdings; kiểm tra last session thay vì chỉ tuổi tải; chế độ theo dõi ngày mới nhất, nút tải lại, kiểm tra mỗi 15 phút/khi quay lại tab. Cron 16:17 và 20:47 VN thứ Hai–Sáu; không bảo đảm chạy đúng phút. Không giả nến vào ngày nghỉ, chưa có holiday calendar. Khoảng lịch sử cố định không tự đổi. Nếu snapshot thiếu/cũ, thử provider; lỗi nguồn báo lỗi, không thay fixture. Dữ liệu quốc tế vẫn bảo thủ bỏ ngày UTC đang mở.

## Test expected / actual và bug status

| Case | Expected | Actual |
| --- | --- | --- |
| Hai tài sản độc lập variance 0,04 / 0,09 | Min-vol 69,23% / 30,77% | Pass analytic tolerance |
| Mean excess 0,08 / 0,18 cùng covariance | Max-Sharpe khoảng 50% / 50% | Pass; khác min-vol |
| Lãi suất bỏ trống / nhập rõ 0% | Chặn Sharpe / cho phép | Pass |
| Cap không khả thi / cap khả thi | Báo lỗi / tổng 100%, tuân thủ cap | Pass |
| Analysis chưa yêu cầu tối ưu | Không chạy optimizer | Pass, input `optimize:false` |
| VaR ties, flat data, sample ngắn | ES đúng tail mass; null khi không xác định | Pass unit tests |
| Monte Carlo cùng seed, flat history | Tái lập; mọi percentile bằng vốn, tỷ lệ lỗ 0 | Pass |
| Recent fetch nhưng old session | Thử provider thay vì coi cache mới | Pass mock test |
| Fixed historical range | Không tự dời ngày khi auto refresh | Pass |
| Risk sample quá ngắn | Chặn optimizer ở `max(120,10N)`, không hiển thị annualized metrics dưới 60 return | Pass unit tests; arithmetic fixtures không phải decision-grade |

Bug/giới hạn còn mở: cron best-effort; nghỉ lễ chưa có calendar; đa thị trường không đồng bộ giờ đóng cửa; metadata phân loại hiện tại không point-in-time; không Brinson khi thiếu historical constituents; 252 phiên xấp xỉ; max-Sharpe xấp xỉ/in-sample; chưa phí/thuế/tái đầu tư cổ tức; chưa kiểm định ngoài mẫu Monte Carlo; human account acceptance và personal sign-off phải do người thật thực hiện.

## Revision và thiết kế

Giữ lịch sử Git; patch final tách analysis/optimization/simulation, thêm metrics và giải thích, freshness status, self-host Be Vietnam Pro/Fraunces theo ZIP/PDF của nhóm, top navigation và tone forest/paper. Giữ chart **giá trị VND**, không quay về base 100 dù reference có gợi ý phần trăm. Không thực thi phần mô tả “không optimizer” trong design guide vì yêu cầu mới của nhóm đã bổ sung optimizer riêng.

## Checklist trước buổi đánh giá

1. Checkout đúng main commit đã kiểm tra; `npm ci && npm run build`, cài Python requirements rồi chạy `python3 demo/server.py`.
2. Có Internet để tải giá thật; khi provider không phản hồi, dùng unit fixture để giải thích logic **với nhãn dữ liệu kiểm thử**, không giả là báo cáo live.
3. Demo nhỏ FPT/HPG/GLD với 40/35/25 triệu VND; benchmark VN30, lãi suất 4% ghi rõ giả định; min-vol và Max-Sharpe cùng caps 80/60. Không học thuộc một return cố định vì giá thay đổi.
4. Mở source timestamps, contribution totals, mục phương pháp và giới hạn; chạy mô phỏng seed 42 hai lần để đối chiếu.
5. Mỗi thành viên tự đọc footprint, mở được file evidence và giải thích một calculation/test. Nếu chưa thực hiện, không nhận là đã làm.
6. Sau production smoke test: ghi commit URL, tạo tag release khớp commit, lưu ảnh màn hình và bản local/fixture làm backup; không gắn nhãn release trước khi kiểm tra.
