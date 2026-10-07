# Tài khoản và quyền riêng tư Finfolio

## Cấu hình đăng nhập Google

Website giữ nguyên Vercel. Supabase quản lý danh tính và database; Finfolio không nhận mật khẩu Google.

1. Tạo project Google Cloud, mở Google Auth Platform.
2. Branding: tên ứng dụng **Finfolio**; chọn email hỗ trợ của nhóm. Nếu yêu cầu, thêm domain `supabase.co` và `vercel.app` trong Authorized domains. Thông tin email hỗ trợ có thể xuất hiện ở màn hình consent; không dùng email cá nhân nếu không muốn công khai.
3. Audience: External. Trong giai đoạn Testing, thêm các email thành viên/tester vào Test users. Trước khi mở cho người dùng khác, kiểm tra yêu cầu chuyển sang Production của Google.
4. Data Access: chỉ `openid`, `userinfo.email`, `userinfo.profile`. Không yêu cầu Gmail, Drive hoặc quyền Google Cloud.
5. Clients → Create client → Web application.
6. Authorized JavaScript origins: `https://g09-finfolio.vercel.app`.
7. Authorized redirect URI: dùng callback URL hiển thị trong Supabase Dashboard → Authentication → Sign In / Providers → Google: `https://<project-ref>.supabase.co/auth/v1/callback`.
8. Nhập Client ID và Client Secret **trực tiếp trong Supabase Dashboard**, bật Google provider. Không ghi Secret vào mã nguồn, Vercel frontend hoặc chat.
9. Supabase → Authentication → URL Configuration:
   - Site URL: `https://g09-finfolio.vercel.app`.
   - Redirect URLs: `https://g09-finfolio.vercel.app/account`.
   - Nếu kiểm tra local: thêm đúng địa chỉ `http://127.0.0.1:8138/account`; không dùng wildcard cho các domain tùy ý.
10. Vercel Environment Variables: `SUPABASE_URL` và `SUPABASE_PUBLISHABLE_KEY` (loại `sb_publishable_...`), rồi deploy lại.

Ứng dụng kiểm tra Google provider và không giả vờ đăng nhập khi chưa cấu hình. Tạo project Supabase và bật Google OAuth là hai bước khác nhau.

## Chạy local từ máy khác

```sh
npm ci
npm run build
python3 -m pip install -r requirements.txt
python3 demo/server.py --port 8138
```

Clone repo không có `.env.account.local`, token quản trị hay phiên Supabase của người tạo. Không cấu hình tài khoản thì vẫn phân tích được; trang tài khoản báo chưa cấu hình. Nếu cần chức năng tài khoản local, người chạy phải tự dùng public application config hoặc project riêng và đăng nhập Google bằng tài khoản của họ. Không sao chép `.codex`, `.vercel`, các tệp `.env` hoặc browser profile của người khác.

## Quyền dữ liệu

- Bảng `decisions` bật RLS: đọc/lưu/xóa chỉ khi `auth.uid()` trùng `user_id`; anonymous sign-in không được truy cập.
- Không cấp UPDATE; không dùng `service_role`/secret admin trong ứng dụng.
- Public URL và publishable key nhận diện backend ứng dụng, không cho phép đọc dữ liệu của người dùng khác. Chúng không phải bí mật; không thể dùng chúng để chứng minh website hoàn toàn vô danh.
- Chỉ lưu quyết định, lý do và snapshot tóm tắt (mã, tỷ trọng, vốn, kỳ phân tích, return/risk, benchmark). Không lưu lịch sử giá, email hoặc Google token trong bảng nhật ký.
- Phiên web dùng PKCE và `sessionStorage` theo tab. Không ghi Google provider tokens vào storage. Đóng tab yêu cầu đăng nhập lại; đăng xuất xóa bản nháp và kết quả local, không xóa nhật ký trên database.
- SDK và browser vẫn xử lý thông tin danh tính của tài khoản đang đăng nhập. Mọi JavaScript có quyền cùng origin hoặc người có quyền đọc browser profile/máy đó có thể là rủi ro; đây không phải bảo đảm vô danh hay chống quản trị viên.
- Người dùng có thể xóa từng quyết định, có xác nhận. Đọc dữ liệu trực tiếp bằng API vẫn chịu RLS, không chỉ ẩn trên UI.
- Supabase/Vercel/Google có thể giữ log vận hành; Supabase admin vẫn có quyền quản trị. Không xóa hay che audit log để giả lập bảo đảm không có dấu vết.
- Git commit, lịch sử repo và tên tài khoản GitHub có thể nhận diện tác giả. Thay đổi này không tự sửa hay xóa lịch sử Git.

## Kiểm tra đã thực hiện

Kiểm tra database với hai danh tính giả lập trong transaction: đọc chéo, xóa chéo, giả mạo owner và truy cập anonymous đều bị chặn. Transaction rollback không để lại dữ liệu test. Unit tests kiểm tra snapshot whitelist, validation và loại bỏ provider tokens. Đăng nhập Google thật và lưu/đọc sau refresh cần kiểm tra sau khi cấu hình Google provider xong; chưa được tính là hoàn tất trước bước đó.

Tham chiếu: [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
