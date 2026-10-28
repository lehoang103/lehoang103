/* =========================================================
 * nav.js — ĐƯỜNG DẪN TRANG (router)
 *
 *  • Trên hosting (http/https): đường dẫn gọn, không có “#”, ví dụ  ten-mien.vn/learn/g3_table
 *    (cần file .htaccess ở thư mục gốc — đã kèm sẵn — để tải lại trang không bị lỗi 404).
 *  • Mở trực tiếp file index.html (file://) hoặc tắt cleanUrls trong js/config/sync-config.js:
 *    dùng kiểu cũ  index.html#/learn/g3_table.
 *  • Liên kết cũ dạng  /#/learn  vẫn mở được và tự đổi sang dạng gọn.
 * Trong mã nguồn các liên kết vẫn viết  href="#/..."  — nav.js tự đổi khi hiển thị.
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const http = /^https?:$/.test(location.protocol);
  const clean = http && !!window.history && !!history.pushState && !((MA.SyncConfig || {}).cleanUrls === false) && window.MA_BASE != null;
  const base = clean ? window.MA_BASE : '';
  const fire = () => window.dispatchEvent(new Event('hashchange'));   // các màn hình đang lắng nghe 'hashchange'

  const Nav = {
    clean, base,
    // đường dẫn hiện tại, ví dụ 'learn/g3_table'
    path() {
      if (!clean) return location.hash.replace(/^#\/?/, '');
      return decodeURI(location.pathname.slice(base.length)).replace(/^\/+|\/+$/g, '').replace(/^index\.html$/, '');
    },
    view() { return (this.path() || 'home').split('/')[0]; },
    href(p) { return clean ? base + p : '#/' + p; },
    go(p, replace) {
      if (!clean) { location.hash = '#/' + p; return; }
      const url = base + p;
      if (location.pathname + location.search === url && !location.hash) return fire();
      history[replace ? 'replaceState' : 'pushState'](null, '', url); fire();
    },
    // đổi liên kết cũ “#/...” (bookmark, tin nhắn) sang dạng gọn
    fixLegacy() {
      if (clean && /^#\//.test(location.hash)) { history.replaceState(null, '', base + location.hash.slice(2)); return true; }
      return false;
    },
    // đổi href="#/x" → href="/x" để hiện đúng khi rê chuột, sao chép, mở tab mới
    rewrite(root) {
      if (!clean || !root || !root.querySelectorAll) return;
      if (root.matches && root.matches('a[href^="#/"]')) root.setAttribute('href', base + root.getAttribute('href').slice(2));
      root.querySelectorAll('a[href^="#/"]').forEach(a => a.setAttribute('href', base + a.getAttribute('href').slice(2)));
    }
  };

  if (clean) {
    window.addEventListener('popstate', fire);
    window.addEventListener('hashchange', () => Nav.fixLegacy(), true);   // chạy trước router
    // bấm liên kết nội bộ → chuyển trang không tải lại
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]'); if (!a || a.target || a.hasAttribute('download')) return;
      let href = a.getAttribute('href');
      if (href.startsWith('#/')) href = base + href.slice(2);
      else if (!href.startsWith(base) || /^[a-z]+:/i.test(href)) return;
      if (/\.(html?|php|js|css|json|csv|png|jpe?g|svg|pdf|zip)$/i.test(href) || href.startsWith(base + 'api/') || href.startsWith(base + 'assets/')) return;
      e.preventDefault(); Nav.go(href.slice(base.length));
    });
    document.addEventListener('DOMContentLoaded', () => {
      Nav.fixLegacy(); Nav.rewrite(document.body);
      new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && Nav.rewrite(n)))).observe(document.body, { childList: true, subtree: true });
    });
  }
  MA.Nav = Nav;
})(window.MA);
