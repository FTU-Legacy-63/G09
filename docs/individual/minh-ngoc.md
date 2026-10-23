# Trần Minh Ngọc — Data và provenance

## 1. My main responsibility
Phụ trách input/data dictionary, nguồn giá, benchmark, currency và phân loại theo phân công đã xác nhận.

## 2. My concrete outputs
Artifact thuộc phạm vi: nguồn/assumptions Week 3, catalog/universe, metadata ngành và phương án kiểm tra phiên mới nhất. Phần freshness final có Codex hỗ trợ; cá nhân cần xác nhận cụ thể phần đã tự chuẩn bị/review.

## 3. Evidence links
[Week 3](../WEEK3.md), [VN source](../../demo/vn_data.py), [VN universe](../../demo/vn_universe.json), [global source](../../demo/global_data.py), [classification](../../demo/classification.py), [source tests](../../demo/test_vn_data.py).

## 4. How my work is used
Tách identifier, listing currency, input currency, session date và fetched timestamp. Ví dụ: nhập 1.000 USD vào cổ phiếu VN vẫn là giá niêm yết VND, vốn đổi bằng tỷ giá phiên đầu; không biến cổ phiếu đó thành một vị thế USD có FX exposure hằng ngày. Sector/Industry là phân loại hiện tại, không tự nhận point-in-time.

## 5. Integration/testing/revision
Chuẩn bị mở `/api/data-status` để chỉ phiên và timestamp. Giải thích snapshot mới không có nghĩa mọi nến đã mới; benchmark thiếu không được cắt dữ liệu holdings; Mỹ/FX có thể làm ngày chung cũ hơn VN. Tự tái lập source tests và một mã ngoài universe; kết quả cá nhân: **chờ xác nhận**. Unit tests final do Codex chạy.

## 6. Remaining limitation
26 mã refresh định kỳ không phải toàn bộ thị trường; ngoài universe tải theo request. Chưa holiday calendar, corporate-action audit độc lập hay historical classification. Real-data tool vẫn cần fixture riêng để tái lập logic; fixture không thay thế source live khi lỗi.
