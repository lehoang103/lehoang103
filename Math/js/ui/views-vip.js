/* =========================================================
 * ui/views-vip.js — KHU VỰC VIP
 *  • Thiết lập bắt buộc: SĐT cha/mẹ + mật khẩu (≥ 6 kí tự)
 *  • KPI của tôi (so với các bạn cùng lớp)
 *  • Tư vấn sửa lỗi sai chuyên sâu + bài tập bổ trợ + lộ trình 7 ngày
 *  • Luyện tập chuyên sâu nâng cao · Tất cả các kì thi
 * Hiệu lực: 1 năm kể từ ngày kích hoạt.
 * ========================================================= */
(function (MA) {
  'use strict';
  const { $, $$, esc } = MA.U;
  const UI = MA.UI, A = MA.Account, K = MA.Analytics, CH = MA.Charts;
  const fmtDate = (t) => t ? new Date(t).toLocaleDateString('vi-VN') : '—';
  const fmtTime = (t) => t ? new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  function colChart(items, color) {
    const max = Math.max(1, ...items.map(i => i.v));
    return `<div class="cchart">${items.map(i => `<div class="cc-col" title="${esc(i.title || i.l)}: ${i.v}"><span class="cc-v">${i.v || ''}</span><i style="height:${Math.round(i.v / max * 100)}%;background:${color || 'var(--accent)'}"></i><span class="cc-l">${i.l}</span></div>`).join('')}</div>`;
  }
  const hbar = (v, max, col) => `<div class="hbar"><i style="width:${Math.max(2, Math.round(v / (max || 1) * 100))}%;background:${col || 'var(--accent)'}"></i></div>`;

  // ---------------- Phân loại lỗi sai ----------------
  const PATTERNS = (MA.Tutor && MA.Tutor.PATTERNS) || {
    carry: { icon: '🔢', name: 'Quên nhớ / quên mượn khi tính', advice: 'Khi đặt tính, đánh một chấm nhỏ lên hàng bên trái mỗi lần có nhớ (mượn). Tính xong hãy thử lại bằng phép tính ngược (cộng ↔ trừ).' },
    off1: { icon: '±1', name: 'Lệch 1 đơn vị (đếm thiếu / đếm thừa)', advice: 'Với bài đếm, trồng cây, số liền trước/sau: vẽ hình ra nháp và đếm từng mục. Nhớ quy tắc “số cây = số khoảng + 1” khi trồng cả hai đầu.' },
    sign: { icon: '➖', name: 'Sai dấu (âm / dương)', advice: 'Nhắc lại quy tắc dấu: cùng dấu nhân/chia ra dương, khác dấu ra âm; trừ một số âm là cộng số đối. Vẽ trục số khi cộng trừ số nguyên.' },
    scale: { icon: '📏', name: 'Sai đơn vị đo / vị trí dấu phẩy', advice: 'Viết rõ bảng đơn vị trước khi đổi. Khi nhân/chia số thập phân, đếm đủ số chữ số phần thập phân. Kiểm tra kết quả có hợp lí về độ lớn không.' },
    near: { icon: '🎯', name: 'Gần đúng – sai ở bước tính cuối', advice: 'Cách làm đã đúng hướng! Con hãy cẩn thận ở bước tính cuối: tính lại một lần nữa trên nháp trước khi ghi đáp số.' },
    mc: { icon: '🔘', name: 'Chọn nhầm phương án trắc nghiệm', advice: 'Đừng đoán! Tính ra nháp trước rồi mới so với các phương án. Loại trừ các phương án chắc chắn sai (sai đơn vị, quá lớn/quá nhỏ).' },
    skip: { icon: '⏭️', name: 'Bỏ trống / xem lời giải ngay', advice: 'Hãy dùng nút “Gợi ý” trước khi xem lời giải. Tự làm thử dù chưa chắc – sai cũng giúp con nhớ lâu hơn.' },
    other: { icon: '📖', name: 'Hiểu sai đề / chọn sai phép tính', advice: 'Đọc đề 2 lần, gạch chân từ khóa (nhiều hơn, ít hơn, gấp, chia đều…), tóm tắt bằng sơ đồ đoạn thẳng trước khi chọn phép tính.' }
  };
  function classify(e) {
    if (MA.Tutor) return MA.Tutor.classify(e);
    if (e.v === '' || e.v === '\u0000') return 'skip';
    if (e.mc) return 'mc';
    const v = MA.U.parseNum(e.v), a = MA.U.parseNum(String(e.a));
    if (isNaN(v) || isNaN(a)) return 'other';
    const d = Math.abs(v - a);
    if (a !== 0 && Math.abs(v + a) < 1e-9) return 'sign';
    if ([10, 100, 1000].some(x => Math.abs(d - x) < 1e-9)) return 'carry';
    if (Math.abs(d - 1) < 1e-9) return 'off1';
    if (a !== 0 && v !== 0 && [10, 100, 1000, 0.1, 0.01, 0.001].some(r => Math.abs(v / a - r) < 1e-9)) return 'scale';
    if (a !== 0 && d / Math.abs(a) <= 0.1) return 'near';
    return 'other';
  }

  const Coach = {
    PATTERNS, classify,
    analyze(u, grade) {
      const topics = MA.Data.topics(grade); const tids = new Set(topics.map(t => t.id));
      const log = (u.errLog || []).filter(e => tids.has(e.t));
      const pat = {}; log.forEach(e => { const k = classify(e); pat[k] = (pat[k] || 0) + 1; });
      const weak = Object.entries(u.gens || {}).map(([k, s]) => { const [tid, gname] = k.split('::'); return { tid, gname, s }; })
        .filter(x => tids.has(x.tid) && x.s.n >= 2 && x.s.c / x.s.n < 0.75)
        .map(x => { const t = MA.Data.topic(x.tid); const gi = t.gens.findIndex(g => g.name === x.gname); return Object.assign(x, { t, gi, gen: t.gens[gi], acc: Math.round(x.s.c / x.s.n * 100), score: (x.s.n - x.s.c) * 2 + (1 - x.s.c / x.s.n) * 6 }); })
        .filter(x => x.gi >= 0).sort((a, b) => b.score - a.score).slice(0, 6);
      weak.forEach(w => { const p = {}; log.filter(e => e.t === w.tid && e.g === w.gname).forEach(e => { const k = classify(e); p[k] = (p[k] || 0) + 1; }); w.patterns = Object.entries(p).sort((a, b) => b[1] - a[1]); });
      const weakTopics = topics.map(t => ({ t, p: u.topics[t.id] })).filter(x => x.p && x.p.n >= 3 && x.p.m < 60).sort((a, b) => a.p.m - b.p.m).slice(0, 4);
      return { log, pat: Object.entries(pat).sort((a, b) => b[1] - a[1]), weak, weakTopics, total: log.length };
    },
    // Bộ bài tập bổ trợ: nền tảng (dễ) → cùng dạng bài
    remedial(w) {
      const qs = []; const pre = (w.t.prereqs || []).map(MA.Data.topic).filter(Boolean);
      if (pre.length) MA.Data.makeSet(pre.map(p => p.id), 2, 1).forEach(q => { q.warm = true; qs.push(q); });
      for (let i = 0; i < 2; i++) { const q = MA.Data.make(w.tid, 1); if (q) qs.push(q); }
      for (let i = 0; i < 4; i++) { const q = MA.Data.make(w.tid, null, w.gi); if (q) qs.push(q); }
      return qs;
    }
  };
  // ---------- Bổ trợ trọng tâm từ các câu gắn cờ ----------
  // Điểm ưu tiên: P = 3·min(số cờ, 3) + 4·(1 − tỉ lệ đúng) + 2·số lần sai 14 ngày (tối đa 3)
  Coach.flagPriority = function (u, gp) {
    const since = Date.now() - 14 * 864e5;
    const e14 = Math.min(3, (u.errLog || []).filter(e => e.t === gp.tid && e.g === gp.gname && e.at >= since).length);
    const acc = gp.acc == null ? 0.5 : gp.acc;
    return 3 * Math.min(gp.n, 3) + 4 * (1 - acc) + 2 * e14;
  };
  // 8 câu: ôn nền (nếu nền yếu) → 1 câu gốc đã gắn cờ → câu mới cùng dạng → 1 câu nâng mức
  Coach.flagRemedial = function (gp) {
    const qs = []; const t = gp.t; const lv = gp.gi >= 0 ? t.gens[gp.gi].level : (gp.items[0].lv || 1);
    const pre = (t.prereqs || []).map(MA.Data.topic).filter(Boolean).filter(p => MA.User.topic(p.id).m < 70);
    if (pre.length) MA.Data.makeSet(pre.map(p => p.id), Math.min(2, pre.length + 1), 1).forEach(q => { q.warm = true; qs.push(q); });
    const orig = gp.items.filter(x => x.q); if (orig.length) qs.push(Object.assign(JSON.parse(JSON.stringify(MA.U.pick(orig).q)), { flagTag: '🚩 Câu đã gắn cờ' }));
    const sig = q => q.text + '|' + q.answerText + '|' + JSON.stringify(q.visual || '') + '|' + JSON.stringify(q.input || '');
    const seen = new Set(qs.map(sig)); let guard = 0;
    const same = () => gp.gi >= 0 ? MA.Data.make(gp.tid, null, gp.gi) : MA.Data.make(gp.tid, lv);
    while (qs.length < 7 && guard++ < 40) { const q = same(); if (q && !seen.has(sig(q))) { seen.add(sig(q)); qs.push(q); } }
    while (qs.length < 7 && guard++ < 50) { const q = same(); if (q) qs.push(q); }   // dạng ít biến thể: chấp nhận lặp
    let up = null; for (let i = 0; i < 5 && !up; i++) { const q = MA.Data.make(gp.tid, Math.min(3, lv + 1)); if (q && !seen.has(sig(q))) up = q; }
    if (up) { up.flagTag = '⬆️ Nâng mức'; qs.push(up); }
    return qs;
  };
  // Tổng kết sau bài bổ trợ: đúng bao nhiêu câu cùng dạng, gợi ý bỏ cờ khi đã vững
  Coach.flagSummary = function (gp, res, trial) {
    const same = res.filter(r => r.q.topicId === gp.tid && (gp.gi < 0 || r.q.genName === gp.gname) && !r.q.warm);
    const ok = same.filter(r => r.correct && !r.hint).length; const good = same.length && ok / same.length >= 0.8;
    const html = `<div class="card soft"><h3>🚩 Dạng “${esc(gp.gname || gp.t.title)}”</h3><p>Con làm đúng <b>${ok}/${same.length}</b> câu cùng dạng (không dùng gợi ý). ${good ? 'Con đã vững dạng này rồi! Có thể bỏ cờ ở trang <b>Cờ của con</b>. 🎉' : 'Cần luyện thêm một chút nữa nhé — làm chậm, kiểm tra lại từng bước. 💪'}</p>
      ${trial ? '<p class="muted">🎁 Đây là lượt dùng thử. Nâng cấp <b>👑 VIP</b> để luyện bổ trợ không giới hạn cho mọi dạng đã gắn cờ.</p>' : ''}<div class="btn-row"><a class="btn ghost" href="#/review/flags">🚩 Về trang Cờ của con</a></div></div>`;
    return { html };
  };
  MA.Coach = Coach;

  // ============================ THIẾT LẬP BẮT BUỘC ============================
  MA.Views.vipsetup = {
    render(app) {
      const a = A.current();
      app.innerHTML = `<div class="card vip-setup"><div class="big-emoji">👑</div><h1>Hoàn tất thiết lập tài khoản VIP</h1>
        <p>Chúc mừng <b>${esc(a.name)}</b> đã được cấp quyền VIP! Để bảo vệ tài khoản, VIP đăng nhập bằng <b>số điện thoại cha/mẹ</b> và <b>mật khẩu</b>. Cha/mẹ hãy bổ sung thông tin dưới đây.</p>
        ${a.phoneHash ? `<div class="acc-row"><span>Số điện thoại</span><b>✔ Đã liên kết (•••${esc((a.phoneTail || '').slice(-3))})</b></div>` : `<label class="fld"><span>Số điện thoại cha/mẹ</span><input id="vsPhone" type="tel" inputmode="numeric" placeholder="09xx xxx xxx"></label>`}
        ${A.hasPassword(a) ? '' : `<label class="fld"><span>Mật khẩu chung của gia đình (ít nhất 6 kí tự)</span><input id="vsPw" type="password" autocomplete="new-password"></label><label class="fld"><span>Nhập lại mật khẩu</span><input id="vsPw2" type="password" autocomplete="new-password"></label>`}
        <div class="btn-row"><button class="btn big" id="vsGo">Lưu và vào học 🚀</button><button class="btn ghost" id="vsOut">Đăng xuất</button></div>
        <p class="muted small">Lần sau, chọn tab <b>👑 VIP</b> ở màn hình đăng nhập và nhập SĐT + mật khẩu.</p></div>`;
      $('#vsGo', app).onclick = () => {
        if (!a.phoneHash) { const p = $('#vsPhone', app).value; if (!A.normPhone(p)) return UI.toast('Số điện thoại chưa đúng.', 'bad'); if (A.byPhone(p).some(x => x.id !== a.id && MA.U.slug(x.name) === MA.U.slug(a.name))) return UI.toast('Số này đã có một tài khoản cùng tên.', 'bad'); A.linkPhone(a.id, p); }
        if (!A.hasPassword(a)) { const p1 = $('#vsPw', app).value; if (p1.length < 6) return UI.toast('Mật khẩu cần ít nhất 6 kí tự.', 'bad'); if (p1 !== $('#vsPw2', app).value) return UI.toast('Nhập lại mật khẩu chưa khớp.', 'bad'); A.setPassword(a.id, p1); }
        MA.Sound.complete(); UI.toast('✅ Đã thiết lập xong tài khoản VIP!', 'good'); UI.go('vip');
      };
      $('#vsOut', app).onclick = () => { MA.User.logout(); UI.go('login'); };
    }
  };

  // ============================ DÙNG THỬ VIP ============================
  // Hồ sơ đăng ký bằng SĐT cha/mẹ: tặng dùng thử VIP. Kích hoạt bắt buộc nhập SĐT + đặt mật khẩu.
  MA.Views.viptrial = {
    render(app) {
      const a = A.current(), lbl = A.trialLabel();
      if (!A.trialEligible(a)) {
        app.innerHTML = `<div class="card vip-setup"><div class="big-emoji">🎁</div><h1>Dùng thử VIP</h1><p>Hồ sơ này không còn áp dụng dùng thử (mỗi số điện thoại chỉ dùng thử 1 lần, hoặc đã có gói VIP).</p><div class="btn-row"><a class="btn" href="#/vip">👑 Khu vực VIP</a><a class="btn ghost" href="#/home">Về trang chủ</a></div></div>`;
        return;
      }
      app.innerHTML = `<div class="card vip-setup vip-trial"><div class="big-emoji">🎁</div><h1>Tặng ${lbl} dùng thử VIP</h1>
        <p>Hồ sơ đăng ký bằng <b>số điện thoại cha/mẹ</b> được dùng thử miễn phí <b>${lbl}</b> mọi tính năng VIP. Để kích hoạt, cha/mẹ hãy nhập <b>số điện thoại</b> và đặt <b>mật khẩu đăng nhập</b>.</p>
        <ul class="vip-perks"><li>📝 Tham gia tất cả các kì thi, đề HSG và thi thử TIMO 3 vòng</li><li>🏆 Luyện chuyên sâu nâng cao</li><li>📊 KPI học tập & 🩺 tư vấn sửa lỗi sai</li></ul>
        <label class="fld"><span>Số điện thoại cha/mẹ${a.phoneHash ? ` <small class="muted">(số đã đăng ký, đuôi •••${esc((a.phoneTail || '').slice(-3))})</small>` : ''}</span><input id="vtPhone" type="tel" inputmode="numeric" maxlength="14" placeholder="09xx xxx xxx" autocomplete="username"></label>
        <label class="fld"><span>Mật khẩu đăng nhập (ít nhất 6 kí tự)</span><input id="vtPw" type="password" autocomplete="new-password"></label>
        <label class="fld"><span>Nhập lại mật khẩu</span><input id="vtPw2" type="password" autocomplete="new-password"></label>
        <div class="btn-row"><button class="btn big" id="vtGo">🎁 Kích hoạt dùng thử</button><button class="btn ghost" id="vtSkip">Để sau</button></div>
        <p class="muted small">⏱ Thời gian dùng thử tính từ lúc kích hoạt; mỗi số điện thoại được dùng thử 1 lần. Sau khi kích hoạt, hồ sơ đăng nhập bằng <b>SĐT + mật khẩu</b> (tab 👑 VIP ở màn hình đăng nhập). Hết hạn dùng thử, con vẫn học bình thường; nhập mã VIP để dùng tiếp 1 năm.</p></div>`;
      const go = async () => {
        const phone = $('#vtPhone', app).value, p1 = $('#vtPw', app).value;
        if (!A.normPhone(phone)) { UI.toast('Số điện thoại chưa đúng (cần 10 chữ số, bắt đầu bằng 0).', 'bad'); return $('#vtPhone', app).focus(); }
        if (p1.length < 6) { UI.toast('Mật khẩu cần ít nhất 6 kí tự.', 'bad'); return $('#vtPw', app).focus(); }
        if (p1 !== $('#vtPw2', app).value) { UI.toast('Nhập lại mật khẩu chưa khớp.', 'bad'); return $('#vtPw2', app).focus(); }
        const btn = $('#vtGo', app); btn.disabled = true; btn.textContent = '⏳ Đang kích hoạt…';
        const r = await A.startTrial(phone, p1);
        btn.disabled = false; btn.textContent = '🎁 Kích hoạt dùng thử';
        if (r.error) { UI.toast(r.error, 'bad'); if (!A.trialEligible()) UI.route(); return; }
        MA.Sound.levelUp(); UI.celebrate('🎁 Đã kích hoạt VIP dùng thử!', `Dùng đến ${new Date(r.until).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}`);
        UI.go('vip');
      };
      $('#vtGo', app).onclick = go;
      ['#vtPhone', '#vtPw', '#vtPw2'].forEach(s => { $(s, app).onkeydown = (e) => { if (e.key === 'Enter') go(); }; });
      $('#vtSkip', app).onclick = () => { A.update(a.id, { trialSkip: true }); UI.toast('Có thể kích hoạt dùng thử bất cứ lúc nào ở mục 👑 VIP.'); const v = MA.Nav.path(); if (!v || v.startsWith('vip')) UI.go('home'); else UI.route(); };
      setTimeout(() => { const i = $('#vtPhone', app); if (i) i.focus(); }, 50);
    }
  };

  // ============================ KHU VỰC VIP ============================
  MA.Views.vip = {
    render(app, params) {
      const sub = params[0];
      if (sub === 'trial') return MA.Views.viptrial.render(app);
      if (sub && !A.isVip()) { UI.vipModal('Tính năng này chỉ dành cho tài khoản VIP.'); return this.hub(app); }
      if (sub === 'kpi') return this.kpi(app);
      if (sub === 'report') return this.report(app, params.slice(1));
      if (sub === 'coach') return this.coach(app);
      if (sub === 'advanced') return this.advanced(app);
      this.hub(app);
    },
    hub(app) {
      const a = A.current(), vip = A.isVip(), info = A.vipInfo(a), left = info ? info.days : 0;
      const tiles = [['report', '📈', 'Báo cáo học tập chi tiết', 'Thống kê đến từng bài học: thời gian đọc bài & luyện tập, kết quả, dạng bài yếu, bài liên quan — kèm biểu đồ.'], ['kpi', '📊', 'KPI của tôi', 'Điểm KPI, chuyên cần, độ chính xác, so sánh với các bạn cùng lớp.'], ['coach', '🩺', 'Tư vấn sửa lỗi sai', 'Phân tích lỗi hay mắc, nguyên nhân, bài tập bổ trợ và lộ trình 7 ngày.'], ['advanced', '🏆', 'Luyện chuyên sâu nâng cao', 'Chỉ bài mức Nâng cao, chuyên đề HSG, thử thách tính giờ.'], ['flags', '🚩', 'Bổ trợ trọng tâm từ cờ', 'Tự tạo bài luyện cho đúng những dạng toán con đã gắn cờ “khó”.'], ['exam', '📝', 'Tham gia tất cả kì thi', 'Đề thi HSG và mọi đề do thầy cô biên soạn.']];
      app.innerHTML = `<div class="page-head"><h1>👑 Khu vực VIP</h1></div>
        ${vip && a && info && info.trial ? `<div class="card vip-status"><div class="vs-top"><span class="big-emoji">🎁</span><div><h2>Đang dùng thử VIP</h2><p class="muted">Kích hoạt lúc <b>${fmtTime(info.from)}</b> · dùng đến <b>${fmtTime(info.until)}</b></p></div><div class="vs-left"><b>${info.hours}</b><small>giờ còn lại</small></div></div>
            <div class="mbar"><i style="width:${Math.min(100, Math.round((info.until - Date.now()) / Math.max(1, info.until - info.from) * 100))}%;background:linear-gradient(90deg,#ffc94d,#f29f3d)"></i></div>
            <p class="small">Thích VIP? Cha/mẹ liên hệ thầy cô để nhận <b>mã VIP</b> và dùng tiếp <b>1 năm</b> (vẫn giữ nguyên kết quả học).</p>
            <div class="btn-row"><a class="btn small" href="#/rank/me">🔑 Nhập mã VIP</a><button class="btn small ghost" id="vpChg">🔒 Đổi mật khẩu chung</button></div></div>
          ${this.familyCard(a, info)}`
        : vip && a ? `<div class="card vip-status"><div class="vs-top"><span class="big-emoji">👑</span><div><h2>Tài khoản VIP đang hoạt động</h2><p class="muted">Kích hoạt ngày <b>${fmtDate(info && info.from)}</b> · hiệu lực đến hết ngày <b>${fmtDate(info && info.until)}</b></p></div><div class="vs-left"><b>${left}</b><small>ngày còn lại</small></div></div>
            ${info && info.until ? `<div class="mbar"><i style="width:${Math.round(left / A.VIP_DAYS * 100)}%;background:linear-gradient(90deg,#ffc94d,#f29f3d)"></i></div>` : ''}
            <div class="btn-row"><button class="btn small ghost" id="vpChg">🔒 Đổi mật khẩu chung</button></div></div>
          ${this.familyCard(a, info)}`
          : `<div class="card vip-status"><h2>Nâng cấp lên tài khoản VIP</h2><p>Đặc quyền VIP có hiệu lực <b>1 năm kể từ ngày kích hoạt</b>:</p>
            <ul class="vip-perks"><li>📝 Tham gia <b>tất cả các kì thi</b>, kể cả đề thi học sinh giỏi và đề do thầy cô biên soạn</li><li>🏆 <b>Luyện tập chuyên sâu nâng cao</b></li><li>📊 Xem <b>thống kê KPI</b> học tập của chính mình</li><li>🩺 <b>Tư vấn sâu</b> về lỗi sai và các dạng bài tập bổ trợ</li></ul>
            ${info && info.trialAt ? `<p class="small">⏱ Thời gian <b>dùng thử VIP</b> đã kết thúc (${fmtTime(info.until)}). Kết quả học vẫn được giữ nguyên.</p>` : ''}
            <p class="muted small">Tài khoản VIP đăng nhập bằng số điện thoại cha/mẹ + mật khẩu. Cha/mẹ liên hệ thầy cô để nhận mã kích hoạt, rồi nhập tại Hồ sơ → Tài khoản.</p>
            <div class="btn-row">${A.trialEligible(a) ? `<a class="btn" href="#/vip/trial">🎁 Dùng thử VIP ${A.trialLabel()} miễn phí</a>` : ''}<a class="btn ${A.trialEligible(a) ? 'ghost' : ''}" href="#/rank/me">🔑 Nhập mã VIP</a></div></div>`}
        <div class="grid2">${tiles.map(t => `<a class="card mode ${vip ? '' : 'locked'}" href="#/${t[0] === 'exam' ? 'exam' : t[0] === 'flags' ? 'review/flags' : 'vip/' + t[0]}"><span class="m-ic">${t[1]}</span><h3>${t[2]} ${vip ? '' : '🔒'}</h3><p>${t[3]}</p></a>`).join('')}</div>`;
      $$('[data-switch]', app).forEach(x => x.onclick = () => { const r = MA.User.loginId(x.dataset.switch); if (r.error) return UI.toast(r.error, 'bad'); UI.toast(`Đã chuyển sang hồ sơ ${esc(r.name)}`, 'good'); UI.go('vip'); });
      if ($('#famAdd', app)) $('#famAdd', app).onclick = () => MA.Views.login.chooseProfile({ list: [a], family: info.family }, (id) => { const r = MA.User.loginId(id); if (!r.error) UI.go('vip'); });
      if ($('#vpChg', app)) $('#vpChg', app).onclick = () => UI.modal(`<h2>🔒 Đổi mật khẩu</h2><label class="fld"><span>Mật khẩu hiện tại</span><input id="cpO" type="password"></label><label class="fld"><span>Mật khẩu mới (≥ 6 kí tự)</span><input id="cpN" type="password"></label><label class="fld"><span>Nhập lại</span><input id="cpR" type="password"></label><div class="btn-row"><button class="btn" id="cpGo">Lưu</button></div>`, (b, close) => {
        $('#cpGo', b).onclick = () => { if (!A.checkPassword(a.id, $('#cpO', b).value)) return UI.toast('Mật khẩu hiện tại chưa đúng.', 'bad'); if ($('#cpN', b).value !== $('#cpR', b).value) return UI.toast('Nhập lại chưa khớp.', 'bad'); const r = A.setPassword(a.id, $('#cpN', b).value); if (r.error) return UI.toast(r.error, 'bad'); close(); UI.toast('✅ Đã đổi mật khẩu chung cho cả gia đình', 'good'); };
      });
    },

    // ---------- Gói VIP gia đình: theo dõi riêng từng hồ sơ ----------
    familyCard(a, info) {
      if (!info || !info.family) return '';
      const vipOn = A.isVip();
      const rows = info.members.map(m => { const u = MA.User.get(m.id); return { m, u, k: u ? K.kpi(u, m) : null }; }).filter(x => x.u);
      return `<div class="card fam-card"><div class="sec-head"><h3>👪 Hồ sơ học trong gói VIP (${info.members.length}/${A.MAX_MEMBERS})</h3>${info.slots > 0 ? '<button class="btn small" id="famAdd">➕ Thêm hồ sơ anh/chị/em</button>' : ''}</div>
        <p class="muted small">Dùng chung số điện thoại và mật khẩu; mỗi con có kết quả, KPI, sổ lỗi sai và xếp hạng riêng.</p>
        <div class="fam-grid">${rows.map(x => { const rt = K.rating(x.k.score); const me = x.m.id === a.id; return `<div class="fam-m ${me ? 'me' : ''}">
          <div class="fam-h"><span class="big-av">${MA.U.av(x.m.avatar)}</span><div><b>${esc(x.m.name)}</b>${me ? ' <small class="tag">đang học</small>' : ''}<div class="muted small">Lớp ${x.m.grade} · học ${UI.ago(x.m.lastLogin)}</div></div><div class="fam-kpi"><b>${x.k.score}</b><small>KPI</small></div></div>
          <div class="ch-track lg"><i style="width:${Math.max(2, x.k.score)}%;background:var(--s2)"></i></div><div class="small fam-rt">${rt.i} ${rt.t}</div>
          <div class="fam-stats"><span><b>${x.k.activeDays30}</b>ngày học/30</span><span><b>${x.k.q30}</b>câu/30 ngày</span><span><b>${x.k.acc}%</b>đúng</span></div>
          <div class="btn-row">${vipOn ? `<a class="btn small ghost" href="#/vip/report/${encodeURIComponent(x.m.id)}">📈 Báo cáo</a>` : ''}${me ? '' : `<button class="btn small ghost" data-switch="${x.m.id}">🔄 Chuyển sang</button>`}</div></div>`; }).join('')}</div></div>`;
    },
    // ---------- Báo cáo học tập chi tiết (của con hoặc anh/chị/em trong gói) ----------
    report(app, params) {
      const me = A.current(); const info = A.vipInfo(me);
      const allowed = new Set([me.id].concat(info && info.family ? info.family.members : []));
      const id = params[0] && allowed.has(params[0]) ? params[0] : me.id;
      const u = id === me.id ? MA.User.current : MA.User.get(id); if (!u) return this.hub(app);
      const base = 'vip/report/' + encodeURIComponent(id);
      const others = [...allowed].filter(x => x !== id).map(x => A.get(x)).filter(Boolean);
      app.innerHTML = `<div class="no-print rp-top"><a class="link" href="#/vip">‹ Khu vực VIP</a>${others.length ? ` · Xem báo cáo của: ${others.map(o => `<a class="btn tiny ghost" href="#/vip/report/${encodeURIComponent(o.id)}">${MA.U.av(o.avatar)} ${esc(o.name)}</a>`).join(' ')}` : ''}</div><div id="rpBox"></div>`;
      if (params[1]) MA.Report.topic($('#rpBox', app), u, decodeURIComponent(params[1]), { base, admin: id !== me.id });
      else MA.Report.render($('#rpBox', app), u, { base });
    },
    // ---------- KPI của tôi ----------
    kpi(app) {
      const u = MA.User.current; const k = K.kpi(u); const rt = K.rating(k.score);
      const peers = K.all({ grade: u.grade }).filter(x => x.id !== u.id); const avg = K.groupAvg(peers);
      const days30 = K.lastDays(30).map(d => ({ l: d.slice(8), v: (u.activity && u.activity[d] && u.activity[d].q) || 0, title: d }));
      const exams = (u.history || []).filter(h => h.kind === 'exam' || h.kind === 'daily').slice(0, 10).reverse();
      const ts = MA.Data.topics(u.grade).map(t => ({ t, p: u.topics[t.id] })).filter(x => x.p && x.p.n >= 3);
      const strong = ts.filter(x => x.p.m >= 60).sort((a, b) => b.p.m - a.p.m).slice(0, 3), weak = ts.filter(x => x.p.m < 60).sort((a, b) => a.p.m - b.p.m).slice(0, 3);
      const PARTS = [['chuyenCan', 'Chuyên cần', 25, 'Học đều đặn mỗi ngày – chỉ cần 15 phút/ngày, đủ 20 ngày trong tháng là đạt tối đa.'], ['khoiLuong', 'Khối lượng bài', 20, 'Làm thêm bài luyện tập: mục tiêu 300 câu trong 30 ngày.'], ['chinhXac', 'Độ chính xác', 25, 'Xem “Tư vấn sửa lỗi sai” để biết con hay sai ở đâu và luyện bổ trợ.'], ['ketQua', 'Kết quả kiểm tra', 20, 'Làm bài kiểm tra 15 phút hoặc Thử thách hằng ngày để có điểm kiểm tra.'], ['thuThach', 'Thử thách nâng cao', 10, 'Vào “Luyện chuyên sâu nâng cao” – mục tiêu 50 câu nâng cao làm đúng.']];
      const lowest = PARTS.slice().sort((a, b) => k.parts[a[0]] - k.parts[b[0]])[0];
      const ROWS = ['activeDays30', 'q30', 'acc', 'examAvg', 'mastery', 'hard', 'fixed', 'streak', 'secPerQ'];
      app.innerHTML = `<nav class="crumbs"><a href="#/vip">👑 VIP</a> › <b>KPI của tôi</b></nav>
        <div class="card kpi-hero"><div class="kpi-ring" style="--p:${k.score}"><b>${k.score}</b><small>/100</small></div><div><h1>KPI học tập của ${esc(u.name)}</h1><p><span class="tag ${rt.c}">${rt.i} ${rt.t}</span> · Lớp ${u.grade} · tính trên 30 ngày gần nhất</p>
          <div class="tip">🦉 <b>Để tăng KPI nhanh nhất:</b> ${lowest[3]}</div></div></div>
        <div class="grid2">
          <div class="card"><h3>🕸️ Thành phần KPI</h3><p class="muted small ch-sub">${peers.length ? 'So với trung bình các bạn cùng lớp' : 'Điểm từng thành phần (0–100)'} · trọng số: ${PARTS.map(p => p[1] + ' ' + p[2] + '%').join(', ')}</p>${CH.radar(PARTS.map(p => p[1]), [{ name: esc(u.name), c: 'var(--s2)', vals: PARTS.map(p => k.parts[p[0]]) }].concat(peers.length ? [{ name: 'TB các bạn', c: 'var(--s1)', vals: PARTS.map(p => peers.reduce((a, x) => a + x.parts[p[0]], 0) / peers.length) }] : []), { aria: 'Thành phần KPI' })}<div class="kpi-parts">${PARTS.map(p => `<div><span>${p[1]}</span><small>${p[2]}%</small><b>${Math.round(k.parts[p[0]])}</b></div>`).join('')}</div></div>
          <div class="card"><h3>📊 ${peers.length ? `So với các bạn cùng lớp (${peers.length} bạn)` : 'Các chỉ số học tập'}</h3>${CH.pairs(ROWS.map(key => { const m = K.METRICS.find(x => x.k === key); const un = m.unit && m.unit.length < 4 ? m.unit : (key === 'secPerQ' ? 's' : ''); return { label: m.name, vals: peers.length ? [k[key], avg[key]] : [k[key]], unit: un, best: m.best }; }), [{ name: 'Của con', c: 'var(--s2)' }].concat(peers.length ? [{ name: 'TB các bạn', c: 'var(--s1)' }] : []), { cols: 1 })}${peers.length ? '' : '<p class="muted small">Chưa có bạn cùng lớp trên máy này để so sánh.</p>'}</div>
        </div>
        <div class="card"><h3>✏️ Số câu đã làm mỗi ngày (30 ngày)</h3>${CH.cols(K.lastDays(30).map(d => { const a = (u.activity && u.activity[d]) || {}; return { label: d.slice(8), title: d.split('-').reverse().join('/'), vals: [a.c || 0, Math.max(0, (a.q || 0) - (a.c || 0))] }; }), [{ name: 'Đúng', c: 'var(--s3)' }, { name: 'Sai', c: 'var(--s5)' }], { w: 960, h: 230, aria: 'Số câu mỗi ngày' })}</div>
        <div class="grid2">
          <div class="card"><h3>📝 Điểm 10 bài kiểm tra gần nhất</h3>${exams.length ? CH.cols(exams.map((h, i) => ({ label: String(i + 1), title: h.title || ('Bài ' + (i + 1)), vals: [h.score] })), [{ name: 'Điểm', c: 'var(--s1)' }], { w: 440, h: 190, bw: 30, labelAll: true, aria: 'Điểm kiểm tra' }) : '<p class="muted">Chưa có bài kiểm tra.</p>'}</div>
          <div class="card"><h3>💪 Điểm mạnh & cần cố gắng</h3>${ts.length ? `<h4>Mạnh nhất</h4>${strong.length ? '' : '<p class="muted small">Chưa có chủ đề đạt từ 60% – cố lên nhé!</p>'}${strong.map(x => `<div class="ml-row"><span>${x.t.icon} ${x.t.title}</span>${UI.masteryBar(x.p.m)}<b>${x.p.m}%</b></div>`).join('')}<h4>Cần cố gắng</h4>${weak.length ? '' : '<p class="muted small">Không có chủ đề nào dưới 60%. Tuyệt vời!</p>'}${weak.map(x => `<a class="ml-row" href="#/learn/${x.t.id}"><span>${x.t.icon} ${x.t.title}</span>${UI.masteryBar(x.p.m)}<b>${x.p.m}%</b></a>`).join('')}` : '<p class="muted">Luyện tập thêm để có dữ liệu.</p>'}</div>
        </div>`;
      CH.bind(app);
    },

    // ---------- Tư vấn sửa lỗi sai ----------
    coach(app) {
      const u = MA.User.current; const r = Coach.analyze(u, u.grade);
      const plan = []; const ws = r.weak.length ? r.weak : [];
      for (let d = 1; d <= 7; d++) {
        if (d === 7) plan.push(['Ngày 7', '📝 Làm bài Kiểm tra 15 phút tổng hợp để đo tiến bộ']);
        else if (ws.length) { const w = ws[(d - 1) % ws.length]; plan.push([`Ngày ${d}`, `${d % 3 === 1 ? '📖 Đọc lại bài' : '🎯 Luyện bổ trợ'} “${w.t.title} · ${w.gname}”${d % 3 === 0 ? ' + sửa lỗi trong sổ' : ''}`]); }
        else plan.push([`Ngày ${d}`, '✏️ Luyện tập thích ứng 10 câu + Thử thách hằng ngày']);
      }
      app.innerHTML = `<nav class="crumbs"><a href="#/vip">👑 VIP</a> › <b>Tư vấn sửa lỗi sai</b></nav>
        <div class="page-head"><h1>🩺 Tư vấn sửa lỗi sai chuyên sâu</h1><p class="muted">Hệ thống phân tích ${r.total} lần làm sai gần đây của con ở ${MA.Data.grade(u.grade).name}, tìm nguyên nhân và gợi ý bài tập bổ trợ phù hợp.</p></div>
        ${r.total < 5 && !r.weak.length ? `<div class="card empty"><div class="big-emoji">🔍</div><p>Con cần làm thêm bài luyện tập (ít nhất khoảng 10–20 câu) để hệ thống có đủ dữ liệu phân tích nhé!</p><a class="btn" href="#/practice">Luyện tập ngay</a></div>` : ''}
        ${r.pat.length ? `<div class="card"><h3>🧩 Con hay mắc những kiểu lỗi nào?</h3>${r.pat.map(([k, n]) => { const p = PATTERNS[k]; return `<div class="pat"><div class="pat-h"><span class="pat-ic">${p.icon}</span><b>${p.name}</b>${hbar(n, r.pat[0][1], 'var(--bad)')}<span class="pat-n">${n} lần</span></div><p class="muted">💡 ${p.advice}</p></div>`; }).join('')}</div>` : ''}
        ${r.weak.length ? `<h2>🎯 Các dạng bài cần bổ trợ</h2><div class="weak-list">${r.weak.map((w, i) => { const pre = (w.t.prereqs || []).map(MA.Data.topic).filter(Boolean).filter(p => MA.User.topic(p.id).m < 70); const words = MA.U.slug(w.gname).split('-').filter(x => x.length > 2); const pit = (w.t.pitfalls || []).find(p => { const ps = MA.U.slug(p.wrong + ' ' + p.right + ' ' + p.why); return words.some(x => ps.includes(x)); }); const mist = MA.User.mistakes(u.grade).filter(m => m.topicId === w.tid && m.genName === w.gname).length; return `<div class="card weak">
            <div class="weak-h"><span class="tc-icon">${w.t.icon}</span><div><small>${w.t.title}</small><h3>${w.gname} ${UI.levelTag(w.gen.level)}</h3><span class="muted small">Đúng ${w.s.c}/${w.s.n} lần (${w.acc}%)${w.s.h ? ` · dùng gợi ý ${w.s.h} lần` : ''}</span></div><div class="weak-acc ${w.acc < 40 ? 'bad' : ''}">${w.acc}%</div></div>
            <div class="weak-b"><div><h4>🔎 Nguyên nhân thường gặp</h4><ul>${w.patterns.slice(0, 2).map(([k, n]) => `<li>${PATTERNS[k].icon} ${PATTERNS[k].name} <small class="muted">(${n} lần)</small></li>`).join('') || '<li>Chưa đủ dữ liệu chi tiết</li>'}${pit ? `<li>⚠️ Lỗi điển hình: <s>${pit.wrong}</s> → <b>${pit.right}</b></li>` : ''}</ul></div>
              <div><h4>🧭 Lời khuyên</h4><p>${w.acc < 40 ? 'Con nên <b>ôn lại lý thuyết</b> trước, làm các câu mức Cơ bản cho thật chắc rồi mới quay lại dạng này.' : 'Con đã nắm được cách làm, cần <b>luyện thêm</b> để tránh sai sót. Làm chậm, kiểm tra lại từng bước.'}</p>${pre.length ? `<p>Kiến thức nền nên ôn: ${pre.map(p => `<button class="chip" data-peek="${p.id}">${p.icon} ${p.title}</button>`).join(' ')}</p>` : ''}</div></div>
            <div class="btn-row"><button class="btn" data-rem="${i}">🎯 Luyện bổ trợ (${Math.min(8, 6 + (pre.length ? 2 : 0))} câu)</button><button class="btn ghost" data-peek="${w.tid}">📖 Xem lại bài</button>${mist ? `<a class="btn ghost" href="#/review/mistakes">📒 Làm lại ${mist} câu sai</a>` : ''}</div></div>`; }).join('')}</div>` : (r.total >= 5 ? '<div class="card"><p>🎉 Chưa có dạng bài nào đáng lo – độ chính xác các dạng đều trên 75%. Tiếp tục duy trì nhé!</p></div>' : '')}
        ${r.weakTopics.length ? `<div class="card soft"><h3>📚 Chủ đề mức thành thạo còn thấp</h3><div class="btn-row">${r.weakTopics.map(x => `<a class="btn ghost" href="#/practice/${x.t.id}">${x.t.icon} ${x.t.title} · ${x.p.m}%</a>`).join('')}</div></div>` : ''}
        <div class="card"><h3>🗓️ Lộ trình sửa lỗi 7 ngày</h3><ol class="plan">${plan.map(p => `<li><b>${p[0]}:</b> ${p[1]}</li>`).join('')}</ol><p class="muted small">Mỗi ngày khoảng 15–20 phút. Sau 7 ngày, quay lại trang này để xem tiến bộ.</p></div>`;
      $$('[data-peek]', app).forEach(b => b.onclick = () => UI.lessonPeek(b.dataset.peek));
      $$('[data-rem]', app).forEach(b => b.onclick = () => { const w = r.weak[+b.dataset.rem]; const run = () => MA.Quiz.start(app, { kind: 'coach', kicker: '🩺 Bài tập bổ trợ sửa lỗi', title: `${w.t.icon} ${w.gname}`, questions: Coach.remedial(w), back: 'vip/coach', restart: run }); run(); });
    },

    // ---------- Luyện chuyên sâu nâng cao ----------
    advanced(app) {
      const u = MA.User.current; const topics = MA.Data.topics(u.grade);
      let sel = new Set(topics.map(t => t.id)), count = 15;
      app.innerHTML = `<nav class="crumbs"><a href="#/vip">👑 VIP</a> › <b>Luyện chuyên sâu nâng cao</b></nav>
        <div class="page-head"><h1>🏆 Luyện tập chuyên sâu nâng cao</h1><p class="muted">Toàn bộ câu hỏi ở mức <b>Nâng cao</b> – dạng toán tư duy, bồi dưỡng học sinh giỏi.</p></div>
        <div class="card setup"><div class="fld"><span>Chủ đề</span><div class="chips" id="adT">${topics.map(t => `<button class="chip on" data-id="${t.id}">${t.icon} ${t.title}<small>${t.gens.filter(g => g.level === 3).length} dạng NC</small></button>`).join('')}</div></div>
          <div class="fld"><span>Số câu</span><div class="seg" id="adN">${[10, 15, 20, 30].map(v => `<button data-v="${v}" class="${v === 15 ? 'on' : ''}">${v} câu</button>`).join('')}</div></div>
          <div class="btn-row"><button class="btn big" id="adGo">🏆 Luyện nâng cao</button><button class="btn big ghost" id="adFast">⚡ Thử thách HSG tốc độ (10 câu · 15 phút)</button></div></div>
        <div class="card"><h3>🎯 Luyện theo chuyên đề nâng cao</h3>${topics.map(t => { const gs = t.gens.map((g, i) => ({ g, i })).filter(x => x.g.level === 3); return gs.length ? `<div class="forms"><div>${t.icon} <b>${t.title}</b></div><div class="form-list">${gs.map(x => `<a class="chip" href="#/practice/${t.id}/${x.i}">${x.g.name}</a>`).join('')}</div></div>` : ''; }).join('')}</div>`;
      $$('#adT .chip', app).forEach(c => c.onclick = () => { c.classList.toggle('on'); sel[c.classList.contains('on') ? 'add' : 'delete'](c.dataset.id); });
      $$('#adN button', app).forEach(b => b.onclick = () => { $$('#adN button', app).forEach(x => x.classList.toggle('on', x === b)); count = +b.dataset.v; });
      $('#adGo', app).onclick = () => { if (!sel.size) return UI.toast('Chọn ít nhất một chủ đề', 'bad'); const ids = MA.U.shuffle([...sel]); const run = () => MA.Quiz.start(app, { kind: 'advanced', kicker: '🏆 Luyện chuyên sâu nâng cao', title: `Nâng cao – ${MA.Data.grade(u.grade).name}`, count, next: (i) => MA.Data.make(ids[i % ids.length], 3), back: 'vip/advanced', restart: run }); run(); };
      $('#adFast', app).onclick = () => { const qs = MA.Data.makeSet([...sel], 10, 3); const run = () => MA.Quiz.start(app, { kind: 'exam', kicker: '⚡ Thử thách HSG tốc độ', title: `Thử thách HSG – ${MA.Data.grade(u.grade).name}`, questions: MA.Data.makeSet([...sel], 10, 3), timeLimit: 15 * 60, back: 'vip/advanced', restart: run }); if (!qs.length) return UI.toast('Chưa có câu hỏi', 'bad'); run(); };
    }
  };
})(window.MA);
