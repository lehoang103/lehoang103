/* =========================================================
 * accounts-config.js — FILE CẤU HÌNH TÀI KHOẢN (sửa được bằng tay)
 *
 * • admins: danh sách tài khoản quản trị. Mật khẩu KHÔNG lưu dạng chữ,
 *   chỉ lưu mã băm. Cách đổi mật khẩu dễ nhất: đăng nhập Admin Board →
 *   tab “Cài đặt” → “Đổi mật khẩu” → bấm “Tải file accounts-config.js”
 *   rồi chép đè file này.
 *   Đăng nhập lần đầu bằng mật khẩu mặc định sẽ BẮT BUỘC đổi mật khẩu mới.
 *   Khuyên dùng bản có máy chủ (api/): mật khẩu được kiểm tra bằng bcrypt ở máy chủ.
 *
 * • Mã kích hoạt VIP do máy chủ sinh ngẫu nhiên — không còn chuỗi bí mật trong file này.
 *
 * • presetAccounts: (tuỳ chọn) danh sách tài khoản tạo sẵn cho lớp học,
 *   ví dụ { name: 'Minh Anh', phone: '0912345678', grade: 3, type: 'vip', password: 'matkhau123' }
 *   Các tài khoản này tự xuất hiện trên mọi máy chạy trang web.
 *   Tài khoản VIP: bắt buộc có phone + password (≥ 6 kí tự); hiệu lực 1 năm kể từ ngày
 *   tài khoản được tạo trên máy. Mật khẩu ghi ở đây ai mở mã nguồn cũng đọc được →
 *   nên dặn phụ huynh đổi mật khẩu ở Khu vực VIP sau lần đăng nhập đầu tiên.
 * ========================================================= */
window.MA = window.MA || {};
MA.AccountsConfig = {
  admins: [
    { user: 'admin', name: 'Quản trị viên', passHash: '1eb5c529ded480' }
  ],
  presetAccounts: []
};
