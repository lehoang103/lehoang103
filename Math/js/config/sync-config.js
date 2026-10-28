/* =========================================================
 * sync-config.js — CẤU HÌNH ĐỒNG BỘ VỚI MÁY CHỦ (hosting PHP) & KIỂU ĐƯỜNG DẪN
 *
 * • api: đường dẫn tới api/index.php. Mặc định 'api/index.php' (cùng thư mục với index.html).
 *   Nếu đặt API ở tên miền khác: 'https://api.ten-mien.vn/index.php' (nhớ sửa allow_origin trong api/config.php).
 * • enabled: false → tắt hẳn đồng bộ, website chạy như bản offline (dữ liệu chỉ trên trình duyệt).
 * Khi mở index.html trực tiếp từ máy (file://) đồng bộ tự tắt.
 * ========================================================= */
window.MA = window.MA || {};
MA.SyncConfig = {
  api: 'api/index.php',
  enabled: true,
  timeout: 12000,      // ms chờ máy chủ trả lời
  debounce: 2500,      // ms gom các thay đổi trước khi gửi
  pullEvery: 300000,   // ms — tự tải dữ liệu mới khi đang mở trang (5 phút)
  cleanUrls: true      // đường dẫn gọn (ten-mien.vn/learn) thay vì (ten-mien.vn/#/learn).
                       // Cần file .htaccess ở thư mục gốc (Apache/LiteSpeed). Hosting không hỗ trợ → đặt false.
};
