# Phân rã giá và tỷ giá

Đồng báo cáo của Finfolio là VND. Phân rã dựa trên đồng niêm yết của instrument, không dựa trên USD/VND được chọn khi nhập giá trị đầu kỳ.

## Return

Với tỷ giá F là số VND cho 1 USD:

`r_VND = (1 + r_local) × (1 + r_FX) − 1`

Ba đóng góp của một vị thế có tỷ trọng w tại đầu kỳ chọn:

- Giá tài sản: `w × r_local`.
- Tỷ giá: `w × r_FX`.
- Tương tác: `w × r_local × r_FX`.

Các phần cộng bằng đóng góp return VND hiện có. Tổng các vị thế khớp return mua và giữ của danh mục trong cùng kỳ. Lookback dùng giá trị vị thế tại đầu lookback để tính lại w, không dùng lại tỷ trọng lúc bắt đầu toàn bộ phân tích.

## Risk

Giữ nguyên mô hình risk hiện có: covariance return theo phiên và tỷ trọng đầu kỳ cố định. Tách return mỗi phiên thành ba thành phần trên; cộng có trọng số thành chuỗi giá, FX và tương tác của danh mục.

Với chuỗi thành phần c và return danh mục p:

`RC_c = Cov(c, p) / σ_p × √252`

Tổng ba RC bằng volatility năm hóa của danh mục. RC âm được giữ lại vì có thể phản ánh hiệu ứng giảm rủi ro. Khi volatility bằng 0, các RC bằng 0. Không cộng các volatility độc lập. Risk luôn dùng toàn kỳ thực có và cùng quy tắc loại khoảng trống trên 7 ngày như mô hình hiện tại, không đổi theo nút kỳ return.

## Giới hạn

- Cổ phiếu VND có FX bằng 0, kể cả khi người dùng nhập vốn ban đầu bằng USD.
- ETF USD phản ánh quy đổi giá ETF sang VND; không phân rã FX hoặc ngành của tài sản bên trong quỹ.
- Cùng nhãn ngày provider không có nghĩa các thị trường đóng cửa cùng thời điểm. Không diễn giải phân rã này thành quan hệ nhân quả kinh tế.
- Kết quả cũ trong session thiếu giá nguyên tệ phải phân tích lại; không giả định đóng góp FX bằng 0.
- Giao diện làm tròn hai chữ số nên tổng các số đã làm tròn có thể lệch 0,01 điểm phần trăm. CSV giữ độ chính xác đầy đủ.

## Kiểm tra

Unit tests kiểm tra đồng nhất return, đồng nhất covariance risk, lookback-start weights, VN-only với vốn nhập USD, volatility bằng 0 và kết quả cũ thiếu metadata. Dữ liệu mẫu chỉ dùng cho unit tests; giao diện phân tích vẫn lấy dữ liệu thị trường qua provider hiện có.

Tham chiếu nguyên lý kết hợp return giá và FX, cùng covariance trong risk: [CFA Institute — Currency Management: An Introduction](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/currency-management-introduction).
