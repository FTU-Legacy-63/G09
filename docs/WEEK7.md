# Week 7 — Final audit và chuẩn bị verification

Đối chiếu [yêu cầu Week 7](https://github.com/FTU-Legacy-63/NHA408E/blob/master/docs/weeks/week-7.md) và [Final Repo Readiness](https://github.com/FTU-Legacy-63/NHA408E/blob/master/docs/assessment/final-repo-readiness.md). Giữ Weeks 1–6 như evidence lịch sử; tài liệu này cập nhật trạng thái final, không viết lại các bài cũ.

## Core flow và evidence

Target user: nhà đầu tư cá nhân có kiến thức tài chính, muốn hiểu và so sánh nhiều asset class trong một danh mục giả định. Nhập giá trị từng tài sản VND/USD → kiểm tra nguồn/currency → giá trị và PnL → đóng góp return/risk/FX → so benchmark → tùy chọn tối ưu hóa hoặc mô phỏng → tự ghi quyết định trong nhật ký tài khoản.

| Hạng mục | Evidence | Trạng thái |
| --- | --- | --- |
| Product và hướng dẫn chạy | [README](../README.md), `/portfolio`, `/analysis` | Local chạy bằng provider thật; production đã deploy READY, smoke test và deployment theo release |
| Logic, nguồn, giả định | [scope](PRODUCT_SCOPE.md), [FX](FX_ATTRIBUTION.md), [final methods](FINAL_METHODS.md) | Có; giới hạn được công bố |
| Tối ưu hóa riêng | [method](OPTIMIZATION.md), `/optimize` | Có min volatility + max Sharpe; không tự áp dụng |
| Monte Carlo | [simulation](../demo/simulation.mjs), `/simulation` | Có seeded joint block bootstrap; không phải dự báo |
| Account/decision | [setup](ACCOUNT_SETUP.md), [decision snapshot](../demo/decision-record.mjs) | Giữ integration hiện tại; lần audit này chưa đăng nhập Google bằng tài khoản người dùng |
| Test | `npm test`; `python3 -m unittest discover -s demo -p 'test_*.py'` | 50 JS + 35 Python pass tại 23/10/2026; không coi là user acceptance của nhóm |
| Contribution / footprint | [bản đồ và hướng dẫn](individual/README.md) | Phân công đã xác nhận; từng người phải tự xác nhận outputs/hiểu biết |
| Release/backup | [Final version / source backup](https://github.com/FTU-Legacy-63/G09/releases/tag/v2.0.0-final-20261023) | Tag dùng để checkout bản đánh giá; lần triển khai và verification được ghi trong release |

## Dữ liệu và refresh

Audit tìm thấy job không hỏng liên tục: run [39804586251](https://github.com/FTU-Legacy-63/G09/actions/runs/39804586251) thành công, snapshot `fbcb6ef` có 26/26 mã đến 22/10/2026. Vấn đề có thể đến từ end date cũ được lưu, báo cáo sessionStorage không tự fetch, cache có timestamp mới nhưng nến cũ, và phiên chung VN/Mỹ/FX khác nhau.

Revision: thêm endpoint metadata `/api/data-status` không chứa holdings; kiểm tra last session thay vì chỉ tuổi tải; chế độ theo dõi ngày mới nhất, nút tải lại, kiểm tra mỗi 15 phút/khi quay lại tab. Cron 16:17 và 20:47 VN thứ Hai–Sáu; không bảo đảm chạy đúng phút. Không giả nến vào ngày nghỉ, chưa có holiday calendar. Khoảng lịch sử cố định không tự đổi. Nếu snapshot thiếu/cũ, thử provider; lỗi nguồn báo lỗi, không thay fixture. Dữ liệu quốc tế vẫn bảo thủ bỏ ngày UTC đang mở.

## Test expected / actual và bug status

| Case | Expected | Actual |
| --- | --- | --- |
| Hai tài sản độc lập variance 0,04 / 0,09 | Min-vol 69,23% / 30,77% | Pass analytic tolerance |
| Mean excess 0,08 / 0,18 cùng covariance | Max-Sharpe khoảng 50% / 50% | Pass; khác min-vol |
| Không nhập lãi suất / tùy chỉnh 0% | Tự dùng default 3% như 1.0 / giữ 0% nếu người dùng chọn | Pass; default là giả định, không market quote |
| Cap không khả thi / cap khả thi | Báo lỗi / tổng 100%, tuân thủ cap | Pass |
| Analysis chưa yêu cầu tối ưu | Không chạy optimizer | Pass, input `optimize:false` |
| VaR ties, flat data, sample ngắn | ES đúng tail mass; null khi không xác định | Pass unit tests |
| Monte Carlo cùng seed, flat history | Tái lập; mọi percentile bằng vốn, tỷ lệ lỗ 0 | Pass |
| Recent fetch nhưng old session | Thử provider thay vì coi cache mới | Pass mock test |
| Fixed historical range | Không tự dời ngày khi auto refresh | Pass |
| Risk sample quá ngắn | Chặn optimizer ở `max(120,10N)`, không hiển thị annualized metrics dưới 60 return | Pass unit tests; arithmetic fixtures không phải decision-grade |

Bug/giới hạn còn mở: cron best-effort; nghỉ lễ chưa có calendar; đa thị trường không đồng bộ giờ đóng cửa; metadata phân loại hiện tại không point-in-time; không Brinson khi thiếu historical constituents; 252 phiên xấp xỉ; max-Sharpe xấp xỉ/in-sample; chưa phí/thuế/tái đầu tư cổ tức; chưa kiểm định ngoài mẫu Monte Carlo; human account acceptance và personal sign-off phải do người thật thực hiện.

### Verification 23/10/2026

- Build local thành công với 30 font faces tự host và bundle browser hiện hữu; 50 JS + 35 Python tests pass sau revision RF mặc định.
- Browser dùng giá provider thật: FPT/HPG/GLD, 40/35/25 triệu VND, VN30, RF 4% ghi là giả định; phân tích từ 25/10/2021 đến phiên chung 21/10/2026. Không cố định số return để làm acceptance khi giá còn cập nhật.
- Min-vol và Max-Sharpe chạy riêng; bảng trước/sau và tổng tỷ trọng 100%. Có trường hợp min-vol đạt giới hạn vòng lặp, UI công bố chưa hội tụ thay vì gọi là nghiệm chính xác.
- Monte Carlo 2.000 đường × 252 phiên, seed 42 chạy trên worker; fan chart, histogram, percentiles và giải thích tail hiển thị. Kiểm tra 375/768/1440 px; sửa nav flex min-width để trang không tràn ngang, bảng dài cuộn trong wrapper. Sau reload: console 0 errors/0 warnings; lỗi favicon cũ đã sửa bằng SVG cục bộ.
- Mã nguồn đã push `main` ở commit `28a3f0e`; [refresh run 39883471984](https://github.com/FTU-Legacy-63/G09/actions/runs/39883471984) **success**, gồm cả fetch/validate và publish. Production `/api/data-status` đọc snapshot mới lúc 08:21:27 VN, có 26 mã, không lagging symbol; phiên 22/10 là đúng vì sáng 23/10 chưa đóng phiên.
- Lượt deploy đầu trả `Not authorized`; thử lại chỉ định rõ scope `an-4f7e` đã thành công. Deployment [`dpl_5JwT34XtaUAFEzcttDGBvcKiU1fh`](https://vercel.com/an-4f7e/g09-finfolio/5JwT34XtaUAFEzcttDGBvcKiU1fh) READY, alias website giữ nguyên. Public `/portfolio`, `/optimize` và endpoint metadata mở được; không đổi host hay tạo project khác. Nhóm đã kết nối GitHub–Vercel để những push tiếp theo tự tạo deployment; luôn đối chiếu trạng thái build.

## Revision và thiết kế

Giữ lịch sử Git; patch final tách analysis/optimization/simulation, thêm metrics và giải thích, freshness status, self-host Be Vietnam Pro/Fraunces theo ZIP/PDF của nhóm, top navigation và tone forest/paper. Giữ chart **giá trị VND**, không quay về base 100 dù reference có gợi ý phần trăm. Không thực thi phần mô tả “không optimizer” trong design guide vì yêu cầu mới của nhóm đã bổ sung optimizer riêng.

Theo phản hồi tiếp ngày 23/10: bỏ việc bắt nhập RF để chạy Sharpe. Đối chiếu 1.0 cho thấy request tự gửi 3%; final dùng cùng giả định mặc định, công bố rõ và để tùy chỉnh trong phần nâng cao. Không tự nhận đã có nguồn lãi suất thị trường. Người dùng không phải nhập gì thêm trong flow mặc định.

## Checklist trước buổi đánh giá

1. Checkout đúng main commit đã kiểm tra; `npm ci && npm run build`, cài Python requirements rồi chạy `python3 demo/server.py`.
2. Có Internet để tải giá thật; khi provider không phản hồi, dùng unit fixture để giải thích logic **với nhãn dữ liệu kiểm thử**, không giả là báo cáo live.
3. Demo nhỏ FPT/HPG/GLD với 40/35/25 triệu VND; benchmark VN30, lãi suất 4% ghi rõ giả định; min-vol và Max-Sharpe cùng caps 80/60. Không học thuộc một return cố định vì giá thay đổi.
4. Mở source timestamps, contribution totals, mục phương pháp và giới hạn; chạy mô phỏng seed 42 hai lần để đối chiếu.
5. Mỗi thành viên tự đọc footprint, mở được file evidence và giải thích một calculation/test. Nếu chưa thực hiện, không nhận là đã làm.
6. Sau production smoke test: ghi commit URL, tạo tag release khớp commit, lưu ảnh màn hình và bản local/fixture làm backup; không gắn nhãn release trước khi kiểm tra.
