/* =========================================================
 * pwa.js — CÀI ĐẶT NHƯ ỨNG DỤNG (PWA) & HỌC KHI MẤT MẠNG
 *  • Đăng kí Service Worker (sw.js): lưu sẵn giao diện + bộ câu hỏi → mở được khi không có mạng.
 *  • Bắt sự kiện “cài ứng dụng” để hiện nút 📲 trong menu cá nhân (Android / máy tính).
 *  • iPhone/iPad: hướng dẫn “Chia sẻ → Thêm vào MH chính”.
 * ========================================================= */
window.MA = window.MA || {};
(function (MA) {
  'use strict';
  const PWA = {
    prompt: null,
    standalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; },
    ios() { return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream; },
    canInstall() { return !this.standalone() && (!!this.prompt || this.ios()); },
    async install() {
      if (this.prompt) { this.prompt.prompt(); try { await this.prompt.userChoice; } catch (e) { /* bỏ qua */ } this.prompt = null; return; }
      if (this.ios() && MA.UI) MA.UI.modal('<h2>📲 Cài Toán Vui lên iPhone/iPad</h2><ol><li>Mở trang bằng <b>Safari</b>.</li><li>Bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên).</li><li>Chọn <b>“Thêm vào MH chính”</b>.</li></ol><p class="muted">Biểu tượng cú mèo sẽ xuất hiện trên màn hình chính như một ứng dụng.</p>');
    }
  };
  if (/^https?:$/.test(location.protocol) && 'serviceWorker' in navigator) {
    // Có bản mới → service worker mới tự kích hoạt; tải lại trang 1 lần để mọi tệp cùng một phiên bản
    // (tránh lẫn JS cũ – mới: lỗi "trình duyệt này chạy, trình duyệt kia không").
    const hadController = !!navigator.serviceWorker.controller; let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return; reloaded = true;
      const busy = document.querySelector('.quiz, .exam-run, .q-card');   // đang làm bài thì không tải lại giữa chừng
      if (busy) { if (MA.UI && MA.UI.toast) MA.UI.toast('🔄 Đã có bản mới – sẽ cập nhật khi con tải lại trang.'); return; }
      location.reload();
    });
    window.addEventListener('load', () => {
      let opts; try { opts = { updateViaCache: 'none' }; } catch (e) { opts = undefined; }
      navigator.serviceWorker.register('sw.js', opts).then(reg => {
        const check = () => { try { reg.update(); } catch (e) { /* bỏ qua */ } };
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
        setInterval(check, 30 * 60 * 1000);
      }).catch(() => { /* hosting không hỗ trợ: bỏ qua */ });
    });
  }
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); PWA.prompt = e; });
  MA.PWA = PWA;
})(window.MA);
