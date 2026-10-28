/* =========================================================
 * bots.js — BẠN ẢO ĐUA RANK (tài khoản ảo theo từng lớp)
 *  • Quản trị tạo nhóm bạn ảo cho mỗi lớp (Admin → 🤖 Bạn ảo đua rank):
 *    số lượng, tốc độ (Chậm / Vừa / Nhanh / Siêu tốc), XP khởi đầu.
 *  • Cấu hình nằm trong nội dung (MA.Content → bots) nên phát hành cho mọi máy
 *    giống câu hỏi / đề thi: máy chủ tự đồng bộ, hoặc qua file content-config.js.
 *  • XP của bạn ảo KHÔNG lưu ở đâu cả: được tính lại từ hạt giống (seed) + ngày
 *    → mọi máy thấy cùng một con số, tăng dần mỗi ngày (có ngày nghỉ, ngày chăm),
 *    trong ngày tăng dần từ 7h đến 21h. Có XP tuần cho bảng “Tuần này”.
 *  • Luôn hiện dấu 🤖 trên bảng xếp hạng; không tính vào KPI / thống kê / báo cáo.
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const LEVELS = {
    slow: { name: 'Chậm', icon: '🐢', base: 70, act: 0.55 },
    mid: { name: 'Vừa', icon: '🚲', base: 150, act: 0.7 },
    fast: { name: 'Nhanh', icon: '🚀', base: 260, act: 0.8 },
    pro: { name: 'Siêu tốc', icon: '⚡', base: 420, act: 0.9 }
  };
  const WARM = [[0, 'Bắt đầu từ 0 XP'], [7, 'Như đã học 1 tuần'], [30, 'Như đã học 1 tháng'], [90, 'Như đã học 3 tháng'], [180, 'Như đã học 6 tháng']];
  const MAX_N = 30, MAX_DAYS = 800;
  const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Trương', 'Mai', 'Lâm'];
  const DEM = ['Minh', 'Gia', 'Bảo', 'Ngọc', 'Thanh', 'Anh', 'Khánh', 'Hoàng', 'Thu', 'Đức', 'Phương', 'Hải', 'Quỳnh', 'Tuấn', 'Thảo', 'Nhật', 'An', 'Hữu', 'Kim', 'Diệu', 'Tường', 'Như'];
  const TEN = ['An', 'Bình', 'Châu', 'Dũng', 'Duy', 'Giang', 'Hà', 'Hân', 'Hiếu', 'Hưng', 'Huy', 'Khang', 'Khoa', 'Khôi', 'Lam', 'Linh', 'Long', 'Mai', 'Minh', 'My', 'Nam', 'Ngân', 'Nhi', 'Phúc', 'Quân', 'Quang', 'Sơn', 'Tâm', 'Thư', 'Trang', 'Trí', 'Tú', 'Uyên', 'Vy', 'Yến', 'Đạt', 'Chi', 'Hùng', 'Lộc', 'Phong', 'Thảo', 'Vinh', 'Kiên', 'Na', 'Ánh'];

  // ---------- số ngẫu nhiên có hạt giống (cùng hạt giống → cùng kết quả trên mọi máy) ----------
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = hashStr(String(seed)); return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pickR = (r, arr) => arr[Math.floor(r() * arr.length)];

  // ngày theo giờ máy (số ngày kể từ 1/1/1970) — dùng ngày địa phương để “hôm nay” khớp với học sinh
  const dayNum = (d = new Date()) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
  const dayStr = (n) => new Date(n * 864e5).toISOString().slice(0, 10);

  function groups() { const c = MA.Content.get(); if (!Array.isArray(c.bots)) c.bots = []; return c.bots; }

  // Danh tính một bạn ảo: tên (viết tắt như bảng xếp hạng chung "N.M. Anh"), ảnh đại diện, tính cách học
  function identity(g, i) {
    const r = rng(g.seed + '|id|' + i);
    const ho = pickR(r, HO), dem = pickR(r, DEM), ten = pickR(r, TEN);
    const av = MA.U.AVATARS || ['🦉'];
    return {
      name: ho[0] + '.' + dem[0] + '. ' + ten,
      avatar: av[Math.floor(r() * (av.length - 1))],   // bỏ 🚀 cuối danh sách cho đỡ trùng
      fac: 0.55 + r() * 0.9,                           // chăm chỉ: 0,55 – 1,45 lần tốc độ nhóm
      act: Math.min(0.97, Math.max(0.3, LEVELS[g.level].act + (r() - 0.5) * 0.25))  // xác suất học mỗi ngày
    };
  }
  // XP nhận được trong một ngày
  function gainOn(g, i, id, d) {
    const r = rng(g.seed + '|d|' + i + '|' + d);
    if (r() > id.act) return 0;
    const v = LEVELS[g.level].base * id.fac * (0.35 + 1.3 * r());
    return Math.max(10, Math.round(v / 5) * 5);
  }

  let memo = { key: '', data: {} };
  // Danh sách bạn ảo (đang bật) của một lớp, kèm XP hiện tại và XP tuần này
  function list(grade, opts = {}) {
    const now = new Date(), today = dayNum(now);
    const key = today + '|' + now.getHours() + '|' + Math.floor(now.getMinutes() / 10) + '|' + JSON.stringify(groups());
    if (memo.key !== key) memo = { key, data: {} };
    const ck = grade + '|' + (opts.all ? 1 : 0);
    if (memo.data[ck]) return memo.data[ck];
    const h = now.getHours() + now.getMinutes() / 60;
    const frac = Math.min(1, Math.max(0, (h - 7) / 14));     // hôm nay: tăng dần 7h → 21h
    const monday = today - ((now.getDay() + 6) % 7);
    const out = [];
    groups().filter(g => +g.grade === +grade && (opts.all || g.on !== false) && LEVELS[g.level]).forEach(g => {
      const from = Math.max(today - MAX_DAYS, (+g.start || today) - (+g.warm || 0));
      for (let i = 0; i < Math.min(MAX_N, +g.n || 0); i++) {
        const id = identity(g, i); let xp = 0, wxp = 0;
        for (let d = from; d <= today; d++) {
          let v = gainOn(g, i, id, d);
          if (d === today) v = Math.floor(v * frac / 5) * 5;
          xp += v; if (d >= monday) wxp += v;
        }
        out.push({ id: 'bot:' + g.id + ':' + i, gid: g.id, name: id.name, avatar: id.avatar, xp, wxp, correct: Math.round(xp / 13), on: g.on !== false });
      }
    });
    return (memo.data[ck] = out);
  }
  // Dòng cho bảng xếp hạng (cùng dạng với MA.User.leaderboard)
  function entries(grade, period = 'all') {
    return list(grade).map(b => ({ u: { id: b.id, name: b.name, avatar: b.avatar, xp: { [grade]: b.xp }, stats: { correct: b.correct }, bot: true }, xp: period === 'week' ? b.wxp : b.xp }))
      .filter(r => r.xp > 0);
  }

  const Bots = {
    LEVELS, WARM, MAX_N, groups, list, entries, identity, dayStr,
    enabled() { return groups().some(g => g.on !== false && +g.n > 0); },
    add({ grade, n, level, warm }) {
      const g = { id: 'bt' + Date.now().toString(36), grade: +grade, n: Math.max(1, Math.min(MAX_N, +n || 5)), level: LEVELS[level] ? level : 'mid',
        warm: Math.max(0, Math.min(365, +warm || 0)), start: dayNum(), seed: Math.random().toString(36).slice(2, 10), on: true, created: Date.now() };
      groups().push(g); MA.Content.save(); return g;
    },
    update(id, patch) { const g = groups().find(x => x.id === id); if (!g) return null; Object.assign(g, patch); if (patch.n != null) g.n = Math.max(1, Math.min(MAX_N, +patch.n || 1)); MA.Content.save(); return g; },
    reseed(id) { return this.update(id, { seed: Math.random().toString(36).slice(2, 10) }); },
    remove(id) { const c = MA.Content.get(); c.bots = groups().filter(x => x.id !== id); MA.Content.save(); }
  };

  MA.Bots = Bots;
})(window.MA);
