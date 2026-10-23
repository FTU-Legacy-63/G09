# Lê Bảo An — Build và integration

## 1. My main responsibility
Đại diện nhóm; phụ trách build, integration, API, hosting và nối input → dữ liệu → logic → UI theo phân công đã xác nhận.

## 2. My concrete outputs
Artifact thuộc phạm vi: app vanilla JS, Python API routing VN/quốc tế, GitHub refresh workflow, Vercel config và build fonts. Phần code final có Codex hỗ trợ; tài khoản commit/upload không chứng minh tự viết mọi dòng.

## 3. Evidence links
[app.js](../../demo/app.js), [server.py](../../demo/server.py), [worker](../../demo/research-worker.mjs), [workflow](../../.github/workflows/update-vn-data.yml), [Vercel config](../../vercel.json), [README local](../../README.md).

## 4. How my work is used
API trả dữ liệu thật và metadata; finance tính trong browser; optimizer/Monte Carlo chạy worker để không chặn UI; đường dẫn riêng được Vercel rewrite về cùng shell. Không đưa mật khẩu/secret vào repo; endpoint freshness không chứa danh mục cá nhân.

## 5. Integration/testing/revision
Chuẩn bị tự chạy `npm ci && npm run build`, hai bộ test và local server. Chỉ rõ vì sao static server không có API, vì sao build không được trỏ sai thư mục public, và code main khác snapshot market-data. Audit/patch final do Codex thực hiện; personal reproduce và production acceptance: **chờ xác nhận**.

## 6. Remaining limitation
Provider và cron không có SLA; Vercel phải deploy đúng commit; không coi push GitHub là deploy thành công khi GitHub App chưa kết nối. Không chứng minh multi-user journal isolation bằng unit test alone; Google login cần kiểm tra cấu hình thực tế của project hiện hữu.
