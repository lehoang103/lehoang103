<?php
/* =========================================================
 * api/config.php — CẤU HÌNH MÁY CHỦ ĐỒNG BỘ (sửa file này khi đưa lên hosting)
 *
 * 1) CƠ SỞ DỮ LIỆU
 *    • MySQL / MariaDB (khuyên dùng trên hosting): tạo database + user trong cPanel
 *      (mục “MySQL Databases”), rồi điền 4 dòng host / name / user / pass bên dưới.
 *    • Để trống 'user' → tự dùng SQLite (một file trong thư mục api/data/) — tiện chạy thử.
 *    Bảng dữ liệu được TỰ ĐỘNG tạo ở lần truy cập đầu tiên, không cần import SQL.
 *
 * 2) vip_secret: PHẢI GIỐNG HỆT vipSecret trong js/config/accounts-config.js
 *    (để máy chủ kiểm tra được mã kích hoạt VIP do Admin Board tạo ra).
 *
 * 3) default_admin: tài khoản quản trị được tạo ở lần chạy đầu tiên.
 *    → Đăng nhập Admin Board và ĐỔI MẬT KHẨU NGAY (tab Cài đặt).
 *
 * Kiểm tra cài đặt: mở trình duyệt tới  https://ten-mien-cua-ban/api/index.php?check=1
 * ========================================================= */
return [
  'db' => [
    'host'    => 'localhost',
    'port'    => 3306,
    'name'    => 'toanvui',          // tên database (cPanel thường có tiền tố, ví dụ: abcxyz_toanvui)
    'user'    => '',                 // user MySQL (để trống = dùng SQLite)
    'pass'    => '',                 // mật khẩu MySQL
    'sqlite'  => __DIR__ . '/data/toanvui.sqlite',
  ],
  'vip_secret'    => '',
  'default_admin' => ['user' => 'admin', 'name' => 'Quản trị viên', 'pass' => ''],
  'token_days'    => 180,            // phiên đăng nhập trên mỗi thiết bị giữ trong bao nhiêu ngày
  'timezone'      => 'Asia/Ho_Chi_Minh',
  'allow_origin'  => '',             // để trống nếu web và api cùng tên miền; '*' hoặc 'https://abc.vn' nếu khác
  'max_profile_kb'=> 2048,           // giới hạn dung lượng dữ liệu học của 1 hồ sơ
];
