/* =========================================================
 * storage.js — Lưu trữ dữ liệu trên trình duyệt (localStorage)
 * Có dự phòng bộ nhớ tạm nếu trình duyệt chặn localStorage.
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const PREFIX = 'toanvui_';
  const mem = {};
  let ok = true; const memOnly = {}; const hooks = [];
  try { localStorage.setItem(PREFIX + '_t', '1'); localStorage.removeItem(PREFIX + '_t'); } catch (e) { ok = false; }

  MA.Store = {
    available: ok,
    get(key, def) {
      try {
        const raw = ok && !memOnly[key] ? localStorage.getItem(PREFIX + key) : mem[key];
        return raw == null ? def : JSON.parse(raw);
      } catch (e) { return def; }
    },
    set(key, val) {
      const raw = JSON.stringify(val);
      try { if (ok) { localStorage.setItem(PREFIX + key, raw); delete memOnly[key]; } else mem[key] = raw; }
      catch (e) { mem[key] = raw; memOnly[key] = 1; console.warn('Không lưu được dữ liệu (bộ nhớ trình duyệt đầy?)', e); }
      hooks.forEach(f => { try { f(key); } catch (e) { /* bỏ qua */ } });
    },
    onSet(fn) { hooks.push(fn); },
    remove(key) { try { if (ok) localStorage.removeItem(PREFIX + key); delete mem[key]; } catch (e) { /* bỏ qua */ } },
    // Sao lưu / khôi phục toàn bộ dữ liệu (dùng để chuyển máy)
    exportAll() {
      const out = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k.startsWith(PREFIX)) out[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k));
        }
      } catch (e) { Object.keys(mem).forEach(k => out[k] = JSON.parse(mem[k])); }
      return out;
    },
    importAll(obj) { Object.keys(obj || {}).forEach(k => this.set(k, obj[k])); }
  };
})(window.MA);
