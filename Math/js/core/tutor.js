/* =========================================================
 * tutor.js — BỘ MÁY HỌC TẬP THÍCH ỨNG (v2)
 *
 *  • Thành thạo theo TỪNG DẠNG BÀI (không chỉ theo chủ đề): mỗi dạng có điểm 0–100
 *    (trung bình trượt của các lần làm gần đây).
 *  • Ôn tập ngắt quãng (spaced repetition): mỗi dạng bài có "hộp" 0–6 và ngày ôn kế tiếp
 *    theo khoảng 1 – 3 – 7 – 14 – 30 – 60 ngày. Đúng (không dùng gợi ý) → giãn ra; sai → ôn lại sớm.
 *  • Chọn câu thông minh: ưu tiên dạng đến hạn ôn, dạng còn yếu, dạng chưa làm.
 *  • Nhiệm vụ hôm nay (~15 phút): ôn đến hạn + sửa lỗi sai + học tiếp bài mới.
 *  • Chẩn đoán lỗi sai tức thì (quên nhớ, lệch 1, sai dấu, sai hàng/dấu phẩy…).
 *  • Bài kiểm tra đầu vào: xác định chủ đề đã biết để không phải học lại.
 *  • Giảm trắc nghiệm: câu Vận dụng / Nâng cao có đáp số là số → chuyển sang tự nhập đáp số.
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const DAY = 864e5;
  const IV = [0, 1, 3, 7, 14, 30, 60];                // số ngày giữa các lần ôn theo hộp 0..6
  const gkey = (tid, name) => tid + '::' + name;
  const dayStart = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const endToday = () => dayStart() + DAY - 1;

  const PATTERNS = {
    carry: { icon: '🔢', name: 'Quên nhớ / quên mượn khi tính', tip: 'Kết quả lệch đúng 10, 100 hoặc 1000 — con có thể đã quên <b>nhớ</b> (hoặc <b>mượn</b>) ở một hàng. Đặt tính và đánh dấu chấm nhỏ mỗi lần có nhớ nhé!', advice: 'Khi đặt tính, đánh một chấm nhỏ lên hàng bên trái mỗi lần có nhớ (mượn). Tính xong hãy thử lại bằng phép tính ngược (cộng ↔ trừ).' },
    off1: { icon: '±1', name: 'Lệch 1 đơn vị (đếm thiếu / đếm thừa)', tip: 'Con chỉ lệch <b>1 đơn vị</b>! Hãy vẽ ra nháp và đếm lại từng mục — nhớ xem có tính cả hai đầu không.', advice: 'Với bài đếm, trồng cây, số liền trước/sau: vẽ hình ra nháp và đếm từng mục. Nhớ quy tắc “số cây = số khoảng + 1” khi trồng cả hai đầu.' },
    sign: { icon: '➖', name: 'Sai dấu (âm / dương)', tip: 'Con tính đúng độ lớn nhưng <b>sai dấu</b>. Nhớ lại quy tắc dấu nhé!', advice: 'Nhắc lại quy tắc dấu: cùng dấu nhân/chia ra dương, khác dấu ra âm; trừ một số âm là cộng số đối. Vẽ trục số khi cộng trừ số nguyên.' },
    scale: { icon: '📏', name: 'Sai đơn vị đo / vị trí dấu phẩy', tip: 'Kết quả gấp hoặc kém đáp án đúng 10, 100, 1000 lần — con xem lại <b>vị trí dấu phẩy</b> hoặc <b>đổi đơn vị</b> nhé.', advice: 'Viết rõ bảng đơn vị trước khi đổi. Khi nhân/chia số thập phân, đếm đủ số chữ số phần thập phân. Kiểm tra kết quả có hợp lí về độ lớn không.' },
    swap: { icon: '🔀', name: 'Viết nhầm thứ tự chữ số', tip: 'Các chữ số đúng nhưng <b>đổi chỗ</b> cho nhau. Con đọc lại số thật chậm trước khi ghi nhé.', advice: 'Đọc to đáp số theo từng hàng (nghìn, trăm, chục, đơn vị) trước khi viết.' },
    near: { icon: '🎯', name: 'Gần đúng – sai ở bước tính cuối', tip: 'Rất gần rồi! Cách làm có vẻ đúng hướng, con <b>tính lại bước cuối</b> thật cẩn thận nhé.', advice: 'Cách làm đã đúng hướng! Con hãy cẩn thận ở bước tính cuối: tính lại một lần nữa trên nháp trước khi ghi đáp số.' },
    mc: { icon: '🔘', name: 'Chọn nhầm phương án trắc nghiệm', tip: 'Đừng đoán nhé! Tính ra nháp trước rồi mới chọn phương án.', advice: 'Đừng đoán! Tính ra nháp trước rồi mới so với các phương án. Loại trừ các phương án chắc chắn sai (sai đơn vị, quá lớn/quá nhỏ).' },
    skip: { icon: '⏭️', name: 'Bỏ trống / xem lời giải ngay', tip: '', advice: 'Hãy dùng nút “Gợi ý” trước khi xem lời giải. Tự làm thử dù chưa chắc – sai cũng giúp con nhớ lâu hơn.' },
    other: { icon: '📖', name: 'Hiểu sai đề / chọn sai phép tính', tip: 'Con đọc lại đề 2 lần, gạch chân từ khóa (nhiều hơn, ít hơn, gấp, chia đều…) rồi xem cách giải bên dưới nhé.', advice: 'Đọc đề 2 lần, gạch chân từ khóa (nhiều hơn, ít hơn, gấp, chia đều…), tóm tắt bằng sơ đồ đoạn thẳng trước khi chọn phép tính.' }
  };
  const close = (x, y) => Math.abs(x - y) < 1e-9;
  const digits = (x) => String(Math.abs(x)).replace(/\D/g, '').split('').sort().join('');

  const Tutor = {
    IV, PATTERNS, gkey,

    // ---------- Phân loại lỗi sai (dùng chung cho phản hồi tức thì, Khu vực VIP, báo cáo) ----------
    // e = { v: giá trị con trả lời, a: đáp án đúng, mc: là trắc nghiệm?, ov: chữ của phương án đã chọn }
    classify(e) {
      if (e.v === '' || e.v === '\u0000' || e.v == null) return 'skip';
      let v = MA.U.parseNum(e.mc ? (e.ov == null ? '' : MA.U.stripHtml(String(e.ov))) : e.v), a = MA.U.parseNum(String(e.a));
      if (isNaN(v) || isNaN(a)) return e.mc ? 'mc' : 'other';
      const d = Math.abs(v - a);
      if (a !== 0 && close(v, -a)) return 'sign';
      if ([10, 100, 1000].some(x => close(d, x))) return 'carry';
      if (close(d, 1)) return 'off1';
      if (a !== 0 && v !== 0 && [10, 100, 1000, 0.1, 0.01, 0.001].some(r => close(v / a, r))) return 'scale';
      if (Number.isInteger(v) && Number.isInteger(a) && Math.abs(a) >= 10 && digits(v) === digits(a)) return 'swap';
      if (a !== 0 && d / Math.abs(a) <= 0.1) return 'near';
      return e.mc ? 'mc' : 'other';
    },
    // Lời nhắn ngắn hiện ngay dưới câu trả lời sai
    diagnose(q, value) {
      const mc = q.type === 'mc';
      const k = this.classify({ v: value, a: mc ? (typeof q.answer === 'number' ? q.answer : MA.U.stripHtml(String(q.answer))) : q.answer, mc, ov: mc ? (q.options || [])[+value] : null });
      if (k === 'other' || k === 'mc' || k === 'skip') return null;   // chỉ nhắc khi nhận ra lỗi cụ thể (đỡ rối mắt)
      const p = PATTERNS[k]; return p && p.tip ? { k, icon: p.icon, text: p.tip } : null;
    },

    // ---------- Ghi nhận 1 câu trả lời (gọi từ MA.User.record) ----------
    onAnswer(u, q, correct, opts = {}) {
      if (!u || !q.topicId || !q.genName || q.custom) return;
      const s = u.srs || (u.srs = {}); const k = gkey(q.topicId, q.genName);
      const it = s[k] || (s[k] = { b: 0, due: 0 }); const now = Date.now();
      if (correct && !opts.hint) {
        if (it.b === 0 || now >= it.due) it.b = Math.min(it.b + 1, IV.length - 1);   // chỉ thăng hộp khi đến hạn (tránh "học dồn")
        it.due = dayStart(now) + IV[it.b] * DAY;
      } else if (correct) it.due = Math.min(it.due || Infinity, dayStart(now) + DAY);    // đúng nhờ gợi ý: ôn lại ngày mai
      else { it.b = Math.max(1, it.b - 2); it.due = dayStart(now) + DAY; }                // sai: lùi hộp, ôn lại ngày mai
      it.last = now;
    },

    // ---------- Mức thành thạo ----------
    genMastery(u, tid, name) { const g = (u.gens || {})[gkey(tid, name)]; if (!g || !g.n) return null; return g.m != null ? g.m : Math.round(g.c / g.n * 100); },
    // Thống kê dạng bài của một chủ đề: đã thành thạo (≥ 80%, ≥ 3 lần) / đang học / chưa làm
    topicGens(u, t) {
      const gens = (t.gens || []).filter(g => !g.custom && (!MA.Content || MA.Content.genAllowed(t, g)));
      let done = 0, tried = 0;
      gens.forEach(g => { const s = (u.gens || {})[gkey(t.id, g.name)]; if (s && s.n) { tried++; const m = s.m != null ? s.m : s.c / s.n * 100; if (m >= 80 && s.n >= 3) done++; } });
      return { total: gens.length, done, tried };
    },

    // ---------- Chọn dạng bài khi sinh câu hỏi ----------
    pickGen(t, pool) {
      const u = MA.User && MA.User.current; if (!u || pool.length < 2) return MA.U.pick(pool);
      const now = endToday();
      const w = pool.map(g => {
        const k = gkey(t.id, g.name), s = (u.gens || {})[k], r = (u.srs || {})[k];
        if (!s || !s.n) return 2;                                   // chưa làm: ưu tiên vừa
        const m = s.m != null ? s.m : s.c / s.n * 100;
        let x = 1;
        if (r && r.due && r.due <= now) x *= 3;                     // đến hạn ôn
        if (m < 60) x *= 3; else if (m < 80) x *= 1.8; else if (s.n >= 5) x *= 0.5;   // yếu → nhiều hơn; đã vững → ít hơn
        return x;
      });
      let sum = w.reduce((a, b) => a + b, 0), r = MA.U.rnd() * sum;
      for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
      return pool[pool.length - 1];
    },

    // ---------- Giảm trắc nghiệm ----------
    // Câu Vận dụng (60%) và Nâng cao (100%) có đáp số là SỐ → học sinh tự nhập đáp số thay vì chọn.
    toTyped(q) {
      if (!q || q.type !== 'mc' || q.keepMc || q.custom) return q;
      if (MA.UI && MA.UI.settings && MA.UI.settings.typed === false) return q;
      if (typeof q.answer !== 'number' || !isFinite(q.answer)) return q;
      const lv = q.level || 1; if (lv < 2 || (lv === 2 && MA.U.rnd() > 0.6)) return q;
      const plain = MA.U.stripHtml(q.text);
      if (/nào|chọn|khoanh|phương án|đáp án|đúng hay sai|điền dấu|[<>=]\s*\?|\?\s*[<>=]/i.test(plain)) return q;   // câu cần nhìn phương án
      if (!(q.options || []).every(o => !isNaN(MA.U.parseNum(MA.U.stripHtml(o))))) return q;
      q.type = 'num'; q.converted = true; delete q.options; delete q.correct;
      return q;
    },

    // ---------- Ôn tập đến hạn ----------
    dueGens(u, grade, n = 99) {
      const tids = new Set(MA.Data.topics(grade).filter(t => !MA.Content || !MA.Content.topicLocked(t)).map(t => t.id)); const now = endToday();
      return Object.entries(u.srs || {}).map(([k, r]) => { const [tid, name] = k.split('::'); return { k, tid, name, r }; })
        .filter(x => tids.has(x.tid) && x.r.due && x.r.due <= now)
        .map(x => { const t = MA.Data.topic(x.tid); const gi = t.gens.findIndex(g => g.name === x.name); return Object.assign(x, { t, gi }); })
        .filter(x => x.gi >= 0 && (!MA.Content || MA.Content.genAllowed(x.t, x.t.gens[x.gi])))
        .sort((a, b) => a.r.due - b.r.due || a.r.b - b.r.b).slice(0, n);
    },
    // Bài nên học tiếp: chủ đề đầu tiên chưa vững (bỏ qua chủ đề đã "biết" qua bài đầu vào)
    nextTopic(u, grade) {
      const ts = MA.Data.topics(grade).filter(t => !MA.Content || !MA.Content.topicLocked(t));
      return ts.find(t => { const p = (u.topics || {})[t.id]; return !(p && (p.placed || p.m >= 60)); }) || ts.find(t => ((u.topics || {})[t.id] || {}).m < 80) || ts[0];
    },

    // ---------- Nhiệm vụ hôm nay (~15 phút, ~10 câu) ----------
    missionKey(u) { return MA.U.today() + '_' + u.grade; },
    missionDone(u) { return !!(u.mission && u.mission[this.missionKey(u)] != null); },
    missionPlan(u) {
      const grade = u.grade; const due = this.dueGens(u, grade, 5);
      const mist = (u.mistakes || []).filter(m => m.grade === grade).slice(0, 3);
      const t = this.nextTopic(u, grade); const learned = t && (u.topics[t.id] || {}).learned;
      return { due, mist, topic: t, learned, nNew: Math.max(3, 10 - due.length - mist.length) };
    },
    missionQuestions(u) {
      const p = this.missionPlan(u); const out = []; const seen = new Set();
      const add = (q, tag) => { if (!q) return; const key = q.text + '|' + (q.options || []).join(); if (seen.has(key)) return; seen.add(key); q.mtag = tag; out.push(q); };
      p.due.forEach(d => add(MA.Data.make(d.tid, null, d.gi), '🔁 Ôn đến hạn'));
      p.mist.forEach(m => { const c = JSON.parse(JSON.stringify(m)); c.fromMistake = true; add(c, '📒 Sửa lỗi'); });
      if (p.topic) { const lv = Math.max(1, (u.topics[p.topic.id] || {}).lv || 1); for (let i = 0; i < p.nNew + 3 && out.length < 11; i++) add(MA.Data.make(p.topic.id, i < 2 ? 1 : lv), '✨ Bài mới'); }
      return { plan: p, questions: out };
    },
    finishMission(u, score) { u.mission = u.mission || {}; u.mission[this.missionKey(u)] = score; const ks = Object.keys(u.mission).sort(); if (ks.length > 60) ks.slice(0, ks.length - 60).forEach(k => delete u.mission[k]); },

    // ---------- Bài kiểm tra đầu vào ----------
    placementQuestions(grade) {
      const ts = MA.Data.topics(grade).filter(t => !MA.Content || !MA.Content.topicLocked(t));
      const qs = []; ts.forEach(t => { const q = MA.Data.make(t.id, 1); if (q) qs.push(q); });
      MA.U.shuffle(ts).slice(0, Math.max(0, 15 - qs.length)).forEach(t => { const q = MA.Data.make(t.id, 2); if (q) qs.push(q); });
      return qs.slice(0, 15);
    },
    applyPlacement(u, res) {
      const by = {}; res.forEach(r => { const id = r.q.topicId; by[id] = by[id] || { n: 0, c: 0 }; by[id].n++; if (r.correct) by[id].c++; });
      const known = [];
      Object.entries(by).forEach(([id, s]) => { if (s.c === s.n) { const p = u.topics[id] || (u.topics[id] = { n: 0, c: 0, m: 0, last: 0, lv: 1, streak: 0 }); p.placed = Date.now(); p.m = Math.max(p.m, 70); p.lv = Math.max(p.lv || 1, 2); known.push(id); } });
      u.placement = u.placement || {}; u.placement[u.grade] = { at: Date.now(), known: known.length, total: Object.keys(by).length };
      return known;
    },
    needsPlacement(u) { return !(u.placement && u.placement[u.grade]) && !MA.Data.topics(u.grade).some(t => ((u.topics || {})[t.id] || {}).n > 0); }
  };

  MA.Tutor = Tutor;
})(window.MA);
