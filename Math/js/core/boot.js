/* =========================================================
 * boot.js — TỰ KIỂM TRA KHI MỞ TRANG (viết ES5 để chạy được cả trình duyệt rất cũ)
 *  • Ghi lại tệp nào tải hỏng (bị chặn, mạng rớt, bộ nhớ đệm cũ…).
 *  • 4 giây sau khi trang tải xong mà ứng dụng chưa chạy:
 *      lần 1 → tự xoá bộ nhớ tạm của trang (service worker + cache) rồi tải lại;
 *      lần 2 → hiện hướng dẫn kèm nút "Tải lại" / "Xoá bộ nhớ tạm".
 *  • Trình duyệt quá cũ → báo rõ cần cập nhật, thay vì để trang trắng.
 * File này phải nạp ĐẦU TIÊN, trước mọi file js khác.
 * ========================================================= */
(function () {
  'use strict';
  var KEY = 'toanvui_heal', failed = [], errors = [];
  var ss = { get: function () { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } },
             set: function (v) { try { sessionStorage.setItem(KEY, v); } catch (e) { /* bỏ qua */ } },
             del: function () { try { sessionStorage.removeItem(KEY); } catch (e) { /* bỏ qua */ } } };

  // Trình duyệt có đủ tính năng tối thiểu không? (≈ Chrome 61, Safari 11, Firefox 60, Edge 79, Samsung 8)
  var modern = (function () {
    try { return !!(window.Promise && window.fetch && Object.entries && Array.prototype.includes && window.Symbol && ('noModule' in document.createElement('script'))); }   // nomodule ≈ có ES2017 (không dùng eval vì CSP chặn)
    catch (e) { return false; }
  })();

  window.addEventListener('error', function (e) {
    var t = e && e.target;
    if (t && t !== window && (t.tagName === 'SCRIPT' || t.tagName === 'LINK')) failed.push((t.src || t.href || '').split('/').slice(-2).join('/'));
    else if (e && e.message) errors.push(e.message);
  }, true);

  function started() {
    var app = document.getElementById('app');
    return !!(window.MA && window.MA.UI && app && !/Đang tải…/.test(app.textContent || ''));
  }
  function clearAndReload() {
    var jobs = [];
    try { if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) jobs.push(navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); })); } catch (e) { /* bỏ qua */ }
    try { if (window.caches && caches.keys) jobs.push(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); })); } catch (e) { /* bỏ qua */ }
    var go = function () { location.reload(); };
    if (window.Promise && jobs.length) Promise.all(jobs).then(go, go); else go();
  }
  function help() {
    var app = document.getElementById('app'); if (!app) return;
    var ua = navigator.userAgent, ios = /iphone|ipad|ipod/i.test(ua);
    app.innerHTML = '<div class="card" style="max-width:640px;margin:24px auto;line-height:1.6">' +
      '<h2>😕 Trình duyệt chưa mở được Toán Vui</h2>' +
      (modern ? '' : '<p><b>Trình duyệt này đã quá cũ.</b> Hãy cập nhật ' + (ios ? 'iOS (Cài đặt → Cài đặt chung → Cập nhật phần mềm)' : 'Chrome / Edge / Cốc Cốc / Firefox lên bản mới') + ' rồi mở lại.</p>') +
      (failed.length ? '<p class="muted">Không tải được: ' + failed.slice(0, 5).join(', ') + '</p>' : '') +
      '<p>Con thử lần lượt:</p><ol>' +
      '<li>Bấm <b>Xoá bộ nhớ tạm &amp; tải lại</b> bên dưới.</li>' +
      '<li>Tắt trình chặn quảng cáo (AdBlock, uBlock…) cho trang này.</li>' +
      '<li>Mở bằng trình duyệt khác (Edge, Chrome, Safari, Cốc Cốc, Firefox) – bản mới nhất.</li>' +
      '<li>Không mở bằng cách bấm đúp tệp index.html; hãy mở địa chỉ web của trang.</li></ol>' +
      '<p><button class="btn" id="bootClear">🧹 Xoá bộ nhớ tạm &amp; tải lại</button> <button class="btn ghost" id="bootReload">🔄 Tải lại</button></p>' +
      (errors.length ? '<details><summary class="muted">Chi tiết lỗi (gửi cho thầy cô / quản trị)</summary><pre style="white-space:pre-wrap;font-size:12px">' + errors.slice(0, 5).join('\n').replace(/</g, '&lt;') + '\n' + ua + '</pre></details>' : '') +
      '</div>';
    document.getElementById('bootClear').onclick = function () { ss.del(); clearAndReload(); };
    document.getElementById('bootReload').onclick = function () { location.reload(); };
  }
  function check() {
    if (started()) { ss.del(); return; }
    if (!ss.get() && modern) { ss.set('1'); clearAndReload(); return; }   // tự sửa 1 lần
    help();
  }
  // Phiên bản mong đợi = ?v= của chính boot.js; ui/core.js ghi window.TV_BUILD.
  // Khác nhau → trình duyệt đang dùng tệp cũ trong bộ nhớ tạm → xoá & tải lại 1 lần.
  var me = document.currentScript && document.currentScript.src, want = me && (me.match(/[?&]v=(\d+)/) || [])[1];
  window.addEventListener('load', function () {
    if (want && String(window.TV_BUILD) !== want && !ss.get()) { ss.set('1'); clearAndReload(); return; }
    setTimeout(check, 4000);
  });
  window.TV_BOOT = { failed: failed, errors: errors, modern: modern, clearAndReload: clearAndReload };
})();
