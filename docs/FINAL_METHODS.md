# Chỉ số và mô phỏng của final

## Đọc số trước khi quyết định

Các chỉ số cùng dựa trên giá lịch sử đã quy về VND, chưa gồm tái đầu tư cổ tức, phí và thuế. Không cộng các CAGR hoặc volatility từng tài sản thành CAGR/risk danh mục.

| Chỉ số | Người dùng hiểu được gì? | Điều kiện / giới hạn |
| --- | --- | --- |
| CAGR | Tốc độ tăng đều hằng năm tương đương từ vốn đầu kỳ đến cuối kỳ | Ít nhất 365 ngày lịch và 252 return; không phải dự báo |
| Max drawdown | Đã từng giảm sâu bao nhiêu từ một đỉnh trước đó? | Tệ nhất trong mẫu, không phải giới hạn lỗ tương lai |
| Realized volatility | Đường giá trị mua và giữ dao động ra sao? | Ít nhất 60 return; độ lệch chuẩn return × √252, khác fixed-weight Euler attribution |
| Sharpe | Lợi nhuận vượt lãi suất giả định so với dao động tổng thể | Cần lãi suất khai báo, ít nhất 60 return, mẫu có biến động |
| Sortino | Lợi nhuận vượt mục tiêu so với dao động dưới mục tiêu | Downside deviation tính trên toàn bộ mẫu, mục tiêu = lãi suất ngày |
| Calmar | CAGR so với drawdown | Chỉ có khi CAGR đủ mẫu và drawdown âm |
| VaR 95% một phiên | Ngưỡng lỗ phân vị 95% của mẫu | Ít nhất 100 return; không phải mức lỗ tối đa |
| CVaR / ES 95% | Lỗ trung bình trong 5% khối lượng mẫu tệ nhất | Gồm phần quan sát biên phân số; rất nhạy với ít ngày cực đoan |
| Skewness | Mẫu lệch về đuôi lãi hay đuôi lỗ? | Hiệu chỉnh sai lệch mẫu, ít nhất 30 return; không phải nhãn tốt/xấu |
| Excess kurtosis | Mức cực đoan của đuôi so với chuẩn | Chuẩn tham chiếu 0; không chỉ là độ nhọn của đỉnh |
| Beta / alpha | Độ nhạy và phần chênh so với mô hình benchmark | Ít nhất 60 cặp return; alpha cần lãi suất, không chứng minh kỹ năng |
| Tracking error / IR | Danh mục lệch khỏi benchmark bao nhiêu? | Cùng cặp return, 60 quan sát; IR không xác định khi TE = 0 |
| Correlation | Tài sản từng cùng chiều đến mức nào? | Không bất biến theo thời gian, không chứng minh quan hệ nhân quả |

Covariance mẫu dùng mẫu số n−1. Sharpe = √252 × mean(return−rf ngày) / sample SD. CAGR dùng số ngày lịch/365,25. Max drawdown lấy minimum(value/running peak−1). VaR dùng empirical nearest rank của loss = −return. ES lấy trung bình đúng phần đuôi 5%, không lấy tất cả quan sát trùng ngưỡng. VaR/ES có thể âm nếu phân vị là lãi, không cắt về 0. Đại lượng không xác định hiển thị “—”, không giả thành 0.

Risk attribution/optimizer chỉ mở ở UI với ít nhất `max(120, 10N)` return chung theo policy Week 4; annualized metrics mua và giữ cần 60 return. Core arithmetic functions vẫn cho phép fixture ngắn để kiểm thử reconciliation, không coi fixture là kết quả đủ tin cậy cho người dùng. Dùng cùng sample covariance cho fixed-weight risk và optimizer; **chưa triển khai Ledoit–Wolf, frontier đầy đủ, estimator return thứ hai hoặc turnover constraint**. Đây là khác biệt so với bản draft tham vọng, không được mô tả là đã hoàn tất. Historical mean có estimation error cao; chưa có sensitivity report hai estimator.

## Monte Carlo

Mô phỏng **joint moving-block bootstrap**: lấy lại các block 5 return chung liên tiếp, cùng một hàng cho tất cả tài sản. Giữ tương quan giữa các mã trong từng mẫu và một phần cấu trúc ngắn hạn; không ghép block qua khoảng return đã bị loại do gap trên 7 ngày. Nếu không có block hợp lệ thì dùng block 1 và công bố block thực tế.

Vốn khởi đầu là **giá trị cuối kỳ phân tích**, tỷ trọng là **tỷ trọng cuối kỳ**. Tiếp tục mua và giữ quantity, không tự tái cân bằng mỗi ngày. Có thể chọn 21/63/126/252/504 phiên, 1.000/2.000/5.000 đường; seed xác định giúp tái lập. Cần ít nhất 60 return chung. Không hỗ trợ cash flow hay dự báo lịch giao dịch tương lai.

Hiển thị dải phân vị 5–95%, dải 25–75%, trung vị, phân phối cuối kỳ, tỷ lệ đường mô phỏng lỗ và VaR/CVaR **theo toàn horizon**. Không gọi dải này là khoảng bảo đảm hoặc xác suất tương lai đã kiểm chứng. VaR mô phỏng 252 phiên không phải VaR lịch sử một phiên. Không ngoại suy căn bậc hai thời gian để biến một đại lượng thành đại lượng kia.

Giả định lịch sử còn hữu ích cho tương lai; không tạo ra cú sốc chưa từng có, thay đổi chế độ hay thanh khoản mới. Không mô hình hóa độc lập FX vì FX đã nằm trong return VND; không cộng thêm FX lần thứ hai. Annualization 252 là xấp xỉ cho danh mục đa thị trường/crypto. Kết quả có thể thay đổi mạnh theo cửa sổ lịch sử và block length. Chưa có out-of-sample validation hay stress scenario do người dùng định nghĩa.

## Nguồn phương pháp và implementation

- [NIST: skewness và kurtosis](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35b.htm).
- [CFA Institute: Measuring and Managing Market Risk](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/measuring-managing-market-risk).
- Code thực tế: [metrics.mjs](../demo/metrics.mjs), [simulation.mjs](../demo/simulation.mjs), [kiểm thử](../demo/research.test.mjs). Đây là implementation nội bộ, không tuyên bố đã được CFA/NIST chứng nhận.
