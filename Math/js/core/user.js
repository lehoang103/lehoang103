/* =========================================================
 * user.js — Quản lý người học (đăng nhập bằng tên, không cần đăng ký),
 * điểm kinh nghiệm (XP), cấp bậc (rank) theo từng lớp, tiến độ từng chủ đề,
 * sổ lỗi sai, chuỗi ngày học, huy hiệu và bảng xếp hạng theo lớp (gồm cả bạn ảo 🤖 của MA.Bots).
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const S = MA.Store;

  // ---------- Bậc xếp hạng theo XP (tính riêng cho mỗi lớp) ----------
  const RANKS = [
    { min: 0, name: 'Mầm Non', icon: '🌱', color: '#7cb342' },
    { min: 100, name: 'Đồng', icon: '🥉', color: '#b26a3c' },
    { min: 300, name: 'Bạc', icon: '🥈', color: '#8a99a8' },
    { min: 700, name: 'Vàng', icon: '🥇', color: '#e0a100' },
    { min: 1500, name: 'Bạch Kim', icon: '💠', color: '#26a0b5' },
    { min: 3000, name: 'Kim Cương', icon: '💎', color: '#5b6cff' },
    { min: 6000, name: 'Cao Thủ', icon: '👑', color: '#b4398f' },
    { min: 10000, name: 'Thần Đồng Toán', icon: '🏆', color: '#e53935' }
  ];
  const XP = { 1: 10, 2: 15, 3: 25 };           // XP mỗi câu đúng theo mức độ
  const AVATARS = MA.U.AVATARS;

  const BADGES = {
    first: { icon: '🎯', name: 'Khởi đầu', desc: 'Trả lời đúng câu đầu tiên' },
    c50: { icon: '⭐', name: '50 câu đúng', desc: 'Trả lời đúng 50 câu' },
    c200: { icon: '🌟', name: '200 câu đúng', desc: 'Trả lời đúng 200 câu' },
    c500: { icon: '💫', name: '500 câu đúng', desc: 'Trả lời đúng 500 câu' },
    streak3: { icon: '🔥', name: 'Chăm chỉ', desc: 'Học 3 ngày liên tiếp' },
    streak7: { icon: '🏅', name: 'Bền bỉ', desc: 'Học 7 ngày liên tiếp' },
    combo10: { icon: '⚡', name: 'Combo 10', desc: 'Đúng 10 câu liên tiếp' },
    perfect: { icon: '💯', name: 'Điểm 10', desc: 'Đạt 10 điểm bài kiểm tra' },
    master: { icon: '🧠', name: 'Thành thạo', desc: 'Một chủ đề đạt mức thành thạo ≥ 85%' },
    daily: { icon: '📅', name: 'Thử thách ngày', desc: 'Hoàn thành thử thách hằng ngày' },
    fixer: { icon: '🛠️', name: 'Sửa sai', desc: 'Làm lại đúng 10 câu trong sổ lỗi sai' },
    hard: { icon: '🧗', name: 'Leo núi', desc: 'Đúng 20 câu nâng cao' }
  };

  function weekId(d = new Date()) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return t.getUTCFullYear() + '-W' + Math.ceil(((t - y0) / 864e5 + 1) / 7);
  }
  const slug = (s) => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-');

  function load() { return S.get('users', {}); }
  function save(users) { S.set('users', users); }

  function blank(name, grade, avatar, id) {
    return {
      id: id || slug(name) || ('hs-' + Date.now()), name: name.trim(), avatar: avatar || '🦉', grade,
      created: Date.now(), xp: {}, week: { id: weekId(), xp: {} },
      stats: { answered: 0, correct: 0, hard: 0, fixed: 0, bestCombo: 0 },
      topics: {}, mistakes: [], history: [], badges: [], streak: { days: 0, last: '' }, daily: {}, activity: {}
    };
  }

  const User = {
    RANKS, AVATARS, BADGES, XP, weekId,
    current: null,
    listeners: [],
    onChange(fn) { this.listeners.push(fn); },
    emit() { this.listeners.forEach(f => { try { f(this.current); } catch (e) { console.error(e); } }); },

    blank,
    all() { return Object.values(load()); },
    get(id) { return load()[id] || null; },
    // Đăng nhập bằng tên (+ SĐT cha/mẹ nếu có). Trả về user hoặc { error }
    login(name, grade, avatar, phone) {
      const r = MA.Account.resolve(name, phone);
      if (r.error) return r;
      if (!r.isNew && MA.Account.hasPassword(MA.Account.get(r.id))) return { error: 'Tài khoản này được bảo vệ bằng mật khẩu.', needPassword: r.id };
      const acc = MA.Account.ensure(r.id, { name: name.trim(), grade, avatar, phoneHash: r.phoneHash, phoneTail: r.phoneTail });
      if (acc.locked) return { error: 'Tài khoản đang tạm khóa. Vui lòng liên hệ quản trị viên.' };
      return this.loginId(r.id, { name: name.trim(), grade, avatar });
    },
    loginId(id, info = {}) {
      const acc = MA.Account.get(id); if (acc && acc.locked) return { error: 'Tài khoản đang tạm khóa. Vui lòng liên hệ quản trị viên.' };
      const users = load();
      let u = users[id] || blank(info.name || (acc && acc.name) || id, info.grade || (acc && acc.grade) || 2, info.avatar || (acc && acc.avatar), id);
      if (info.grade) u.grade = info.grade; if (info.avatar) u.avatar = info.avatar; if (info.name) u.name = info.name;
      users[id] = u; save(users);
      MA.Account.ensure(id, { name: u.name, grade: u.grade, avatar: u.avatar });
      MA.Account.logLogin(id, true);
      S.set('session', id);
      this.current = u; this.touchStreak(); this.emit();
      return u;
    },
    restore() {
      const id = S.get('session'); const users = load();
      const acc = id && MA.Account.get(id);
      if (id && users[id] && !(acc && acc.locked)) { this.current = users[id]; this.touchStreak(); MA.Account.ensure(id, users[id]); MA.Account.logLogin(id); }
      return this.current;
    },
    logout() { S.remove('session'); this.current = null; this.emit(); },
    // opts.server = true: quản trị xóa luôn trên máy chủ; mặc định chỉ xóa khỏi máy này
    remove(id, opts = {}) {
      if (MA.Sync) { if (opts.server && MA.Sync.isAdminLinked() && /^p[0-9a-f]{6}-/.test(id)) MA.Sync.op({ t: 'delete', id }); else MA.Sync.forget(id); }
      const users = load(); delete users[id]; save(users); MA.Account && MA.Account.remove(id); if (this.current && this.current.id === id) this.logout();
    },
    persist() { if (!this.current) return; const users = load(); users[this.current.id] = this.current; save(users); },
    setGrade(g) { if (!this.current) return; this.current.grade = g; this.persist(); this.emit(); },
    // v25: đổi ảnh đại diện (emoji có sẵn hoặc ảnh tải từ máy đã thu nhỏ) — lưu cả hồ sơ học lẫn tài khoản để đồng bộ
    setAvatar(a) {
      if (!this.current) return false; const v = MA.U.avOk(a); if (v !== a) return false;
      this.current.avatar = v; this.persist(); if (MA.Account) MA.Account.update(this.current.id, { avatar: v }); this.emit(); return true;
    },

    // ----- XP & rank -----
    gradeXp(u = this.current, g = u && u.grade) { return (u && u.xp[g]) || 0; },
    weekXp(u, g) { return u.week && u.week.id === weekId() ? (u.week.xp[g] || 0) : 0; },
    rankOf(xp) {
      let r = RANKS[0], next = null;
      for (let i = 0; i < RANKS.length; i++) { if (xp >= RANKS[i].min) { r = RANKS[i]; next = RANKS[i + 1] || null; } }
      const pct = next ? Math.round((xp - r.min) / (next.min - r.min) * 100) : 100;
      return Object.assign({}, r, { next, pct });
    },
    addXp(n) {
      const u = this.current; if (!u || n <= 0) return 0;
      const g = u.grade; const before = this.rankOf(this.gradeXp()).name;
      u.xp[g] = (u.xp[g] || 0) + n;
      if (!u.week || u.week.id !== weekId()) u.week = { id: weekId(), xp: {} };
      u.week.xp[g] = (u.week.xp[g] || 0) + n;
      this.day(u).xp += n;
      const after = this.rankOf(u.xp[g]);
      if (after.name !== before) { MA.Sound.levelUp(); MA.UI && MA.UI.celebrate(`${after.icon} Lên hạng ${after.name}!`, 'Con thật giỏi, tiếp tục cố gắng nhé!'); }
      this.persist(); this.emit();
      return n;
    },

    // ----- Ghi nhận kết quả một câu hỏi -----
    record(q, correct, opts = {}) {
      const u = this.current; if (!u) return 0;
      u.stats.answered++;
      // thống kê theo từng dạng bài (phục vụ tư vấn sửa lỗi)
      const sec = Math.max(0, Math.min(+opts.sec || 0, 300));
      if (q.genName) { u.gens = u.gens || {}; const gk = q.topicId + '::' + q.genName; const gs = u.gens[gk] || (u.gens[gk] = { n: 0, c: 0, h: 0, last: 0 }); gs.n++; if (correct) gs.c++; if (opts.hint) gs.h++; gs.last = Date.now(); gs.s = (gs.s || 0) + sec; gs.m = Math.round((gs.m == null ? (gs.n > 1 ? (gs.c - (correct ? 1 : 0)) / (gs.n - 1) * 100 : 50) : gs.m) * 0.7 + (correct && !opts.hint ? 100 : correct ? 60 : 0) * 0.3); }
      if (MA.Tutor) MA.Tutor.onAnswer(u, q, correct, opts);
      const dy = this.day(u); dy.q++; if (correct) dy.c++; dy.s += sec;
      // thống kê theo từng bài trong ngày: [số câu, đúng, giây luyện, giây đọc bài]
      if (q.topicId) { dy.tp = dy.tp || {}; const tp = dy.tp[q.topicId] || (dy.tp[q.topicId] = [0, 0, 0, 0]); tp[0]++; if (correct) tp[1]++; tp[2] += sec; }
      const t = u.topics[q.topicId] || (u.topics[q.topicId] = { n: 0, c: 0, m: 0, last: 0, lv: 1, streak: 0 });
      t.n++; t.last = Date.now(); t.s = (t.s || 0) + sec;
      t.m = Math.round(t.m * 0.8 + (correct ? 100 : 0) * 0.2);
      let gained = 0;
      if (correct) {
        u.stats.correct++; t.c++; t.streak = (t.streak || 0) + 1;
        if (q.level === 3) u.stats.hard++;
        // Thích ứng: đúng 3 câu liền thì tăng mức độ
        if (t.streak >= 3 && t.lv < 3) { t.lv++; t.streak = 0; }
        gained = XP[q.level || 1];
        if (opts.hint) gained = Math.ceil(gained / 2);
        if (opts.fast) gained += 5;
        if (opts.combo && opts.combo >= 5) gained += 5;
        if (opts.fromMistakes) { u.stats.fixed++; this.removeMistake(q); }
      } else {
        t.streak = 0; if (t.lv > 1 && t.n > 3 && t.m < 40) t.lv--;
        if (!opts.noMistake) this.addMistake(q, opts);
      }
      if (opts.combo) u.stats.bestCombo = Math.max(u.stats.bestCombo, opts.combo);
      this.checkBadges();
      this.persist();
      if (gained) this.addXp(gained); else this.emit();
      return gained;
    },
    // Nhật ký học tập theo ngày (phục vụ thống kê & KPI)
    day(u) { u.activity = u.activity || {}; const d = MA.U.today(); return u.activity[d] || (u.activity[d] = { q: 0, c: 0, s: 0, xp: 0 }); },
    // Thời gian đọc bài học (lý thuyết, ví dụ, hình minh họa) — ghi khi rời trang bài học
    addReadTime(id, sec) {
      const u = this.current; sec = Math.round(Math.min(+sec || 0, 1200)); if (!u || !id || sec < 5) return;
      const t = u.topics[id] || (u.topics[id] = { n: 0, c: 0, m: 0, last: 0, lv: 1, streak: 0 }); t.rs = (t.rs || 0) + sec;
      const dy = this.day(u); dy.rs = (dy.rs || 0) + sec; dy.tp = dy.tp || {}; const tp = dy.tp[id] || (dy.tp[id] = [0, 0, 0, 0]); tp[3] = (tp[3] || 0) + sec;
      this.persist();
    },
    topic(id) { return (this.current && this.current.topics[id]) || { n: 0, c: 0, m: 0, last: 0, lv: 1 }; },
    markLearned(id) { const u = this.current; if (!u) return; const t = u.topics[id] || (u.topics[id] = { n: 0, c: 0, m: 0, last: 0, lv: 1, streak: 0 }); if (!t.learned) { t.learned = Date.now(); this.persist(); this.addXp(5); } },

    // ----- Sổ lỗi sai -----
    addMistake(q, opts = {}) {
      const u = this.current; const key = q.text + '|' + q.answerText;
      const ex = u.mistakes.find(m => m.key === key);
      const val = opts.value == null ? '' : String(opts.value);
      // nhật ký lỗi (giữ lại cả khi đã sửa) để phân tích xu hướng
      u.errLog = (u.errLog || []); u.errLog.unshift({ t: q.topicId, g: q.genName, v: val, a: q.type === 'mc' ? (typeof q.answer === 'number' ? q.answer : null) : q.answer, ov: q.type === 'mc' ? (q.options || [])[+val] : undefined, mc: q.type === 'mc', h: !!opts.hint, at: Date.now(), gr: u.grade }); if (u.errLog.length > 300) u.errLog.length = 300;
      if (ex) { ex.times = (ex.times || 1) + 1; ex.at = Date.now(); ex.userValue = val; return; }
      const copy = JSON.parse(JSON.stringify(q)); copy.key = key; copy.at = Date.now(); copy.grade = u.grade; copy.userValue = val; copy.usedHint = !!opts.hint; copy.times = 1;
      u.mistakes.unshift(copy); if (u.mistakes.length > 80) u.mistakes.length = 80;
    },

    removeMistake(q) { const u = this.current; const key = q.key || (q.text + '|' + q.answerText); u.mistakes = u.mistakes.filter(m => m.key !== key); },
    mistakes(grade) { return this.current ? this.current.mistakes.filter(m => !grade || m.grade === grade) : []; },

    // ----- Gắn cờ câu khó (mọi tài khoản; riêng tư: không cộng XP, không vào xếp hạng) -----
    // u.flags = { items: [{ key, t, g, lv, q, src, ok, at, gr }], del: { key: at }, trial }
    flagStore(u = this.current) { if (!u) return null; const f = u.flags || (u.flags = { items: [], del: {} }); f.items = f.items || []; f.del = f.del || {}; return f; },
    flagKey(q) { return q.text + '|' + q.answerText; },
    isFlagged(q) { const f = this.flagStore(); return !!f && f.items.some(x => x.key === this.flagKey(q)); },
    flag(q, opts = {}) {
      const u = this.current; const f = this.flagStore(); if (!f) return false;
      const key = this.flagKey(q); if (f.items.some(x => x.key === key)) return true;
      const copy = JSON.parse(JSON.stringify(q)); delete copy.key; delete copy.fromMistake; delete copy.warm; delete copy.mtag; delete copy.flagTag;
      f.items.unshift({ key, t: q.topicId || '', g: q.genName || '', lv: q.level || 1, q: copy, src: opts.src || 'practice', ok: opts.ok == null ? null : !!opts.ok, at: Date.now(), gr: u.grade });
      delete f.del[key];
      if (f.items.length > 300) f.items.length = 300;
      f.items.forEach((x, i) => { if (i >= 100) delete x.q; });          // chỉ giữ bản sao 100 câu gần nhất để hồ sơ không phình to
      this.persist(); this.emit(); return true;
    },
    unflag(q) {
      const f = this.flagStore(); if (!f) return;
      const key = typeof q === 'string' ? q : this.flagKey(q);
      f.items = f.items.filter(x => x.key !== key); f.del[key] = Date.now();
      const ks = Object.keys(f.del); if (ks.length > 300) ks.sort((a, b) => f.del[a] - f.del[b]).slice(0, ks.length - 300).forEach(k => delete f.del[k]);
      this.persist(); this.emit();
    },
    toggleFlag(q, opts) { if (this.isFlagged(q)) { this.unflag(q); return false; } return this.flag(q, opts); },
    flags(grade) { const f = this.flagStore(); return f ? f.items.filter(x => !grade || x.gr === grade) : []; },
    // Nhóm cờ theo dạng bài: [{ k, tid, gname, t, gi, items, n, last, acc, s }]
    flagGroups(grade) {
      const u = this.current; const by = {};
      this.flags(grade).forEach(x => { const k = x.t + '::' + x.g; (by[k] = by[k] || []).push(x); });
      return Object.entries(by).map(([k, items]) => {
        const tid = items[0].t, gname = items[0].g; const t = MA.Data.topic(tid);
        const gi = t && t.gens ? t.gens.findIndex(g => g.name === gname) : -1;
        const s = (u.gens || {})[k] || null;
        return { k, tid, gname, t, gi, items, n: items.length, last: Math.max(...items.map(x => x.at)), s, acc: s && s.n ? s.c / s.n : null };
      }).filter(x => x.t);
    },

    // ----- Lịch sử bài làm -----
    addHistory(item) {
      const u = this.current; if (!u) return;
      u.history.unshift(Object.assign({ at: Date.now(), grade: u.grade }, item));
      if (u.history.length > 60) u.history.length = 60;
      if (item.kind === 'exam' && item.score === 10) this.grant('perfect');
      if (item.kind === 'daily') { u.daily[MA.U.today() + '_' + u.grade] = item.score; this.grant('daily'); }
      this.persist(); this.emit();
    },
    dailyDone() { const u = this.current; return u && u.daily[MA.U.today() + '_' + u.grade] != null; },

    // ----- Chuỗi ngày học -----
    touchStreak() {
      const u = this.current; if (!u) return; const t = MA.U.today();
      if (u.streak.last === t) return;
      const y = new Date(Date.now() - 864e5); const ys = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
      u.streak.days = u.streak.last === ys ? u.streak.days + 1 : 1; u.streak.last = t;
      this.checkBadges(); this.persist();
    },

    // ----- Huy hiệu -----
    grant(id) {
      const u = this.current; if (!u || u.badges.includes(id)) return;
      u.badges.push(id); const b = BADGES[id];
      MA.UI && MA.UI.toast(`${b.icon} Nhận huy hiệu “${b.name}”!`, 'good');
      this.persist();
    },
    checkBadges() {
      const u = this.current, s = u.stats;
      if (s.correct >= 1) this.grant('first');
      if (s.correct >= 50) this.grant('c50');
      if (s.correct >= 200) this.grant('c200');
      if (s.correct >= 500) this.grant('c500');
      if (u.streak.days >= 3) this.grant('streak3');
      if (u.streak.days >= 7) this.grant('streak7');
      if (s.bestCombo >= 10) this.grant('combo10');
      if (s.fixed >= 10) this.grant('fixer');
      if (s.hard >= 20) this.grant('hard');
      if (Object.values(u.topics).some(t => t.m >= 85 && t.n >= 10)) this.grant('master');
    },

    // ----- Bảng xếp hạng theo lớp -----
    // Gồm các bạn trên máy này + (nếu có máy chủ) các bạn đã đồng bộ ở máy khác
    leaderboard(grade, period = 'all') {
      const wk = period === 'week';
      const srv = MA.Sync && MA.Sync.lbCached(grade);
      // Hồ sơ có trên máy này VÀ trên máy chủ (máy chủ v18 gắn id): lấy số lớn hơn giữa 2 bản.
      // Bản trên máy có thể đã cũ (máy tính ít mở, quản trị giữ bản sao hồ sơ cả trường, phiên quản trị hết hạn…);
      // bản máy chủ có thể chậm vài giây so với bài con vừa làm trên chính máy này.
      const sAll = {}, sWk = {};
      if (srv) { (srv.all || []).forEach(e => { if (e.id) sAll[e.id] = e; }); (srv.week || []).forEach(e => { if (e.id) sWk[e.id] = e; }); }
      const users = this.all(), mine = {};
      const local = users.map(u => {
        mine[u.id] = 1;
        const a = sAll[u.id], w = sWk[u.id];
        if (!a && !w) return { u, xp: wk ? this.weekXp(u, grade) : (u.xp[grade] || 0) };
        const xp = Math.max(u.xp[grade] || 0, a ? a.xp : 0, w ? w.xp : 0);
        const wxp = Math.max(this.weekXp(u, grade), w ? w.wxp : 0, a ? a.wxp : 0);
        const correct = Math.max((u.stats || {}).correct || 0, (a || w).correct || 0);
        const m = Object.assign({}, u, { xp: Object.assign({}, u.xp, { [grade]: xp }), stats: Object.assign({}, u.stats, { correct }) });
        return { u: m, xp: wk ? wxp : xp };
      }).filter(r => r.xp > 0 || (this.current && r.u.id === this.current.id && r.u.grade === grade));
      const remote = srv ? (wk ? srv.week : srv.all).filter(e => !(e.id && mine[e.id])).map((e, i) => ({ u: { id: 'srv:' + i, name: e.name, avatar: e.avatar, xp: { [grade]: e.xp }, stats: { correct: e.correct }, remote: true }, xp: wk ? e.wxp : e.xp })) : [];
      // bạn ảo đua rank do quản trị tạo (MA.Bots) — luôn có dấu 🤖
      const bots = MA.Bots ? MA.Bots.entries(grade, period) : [];
      return local.concat(remote, bots).sort((a, b) => b.xp - a.xp);
    }
  };

  MA.User = User;
})(window.MA);
