/* =========================================================
 * ui/report.js — BÁO CÁO HỌC TẬP CHI TIẾT (VIP & Admin Board)
 *
 *  • Tổng quan theo khoảng thời gian (7 / 30 / 90 ngày) và theo lớp:
 *    thời gian học (đọc bài + luyện tập), số câu, độ chính xác, ngày học, điểm kiểm tra.
 *  • Biểu đồ: thời gian học mỗi ngày, số câu đúng/sai, độ chính xác theo thời gian,
 *    mức thành thạo từng bài, thời gian theo bài, lịch học 13 tuần, kiểu lỗi, điểm kiểm tra.
 *  • Bảng chi tiết từng bài học + xuất CSV / in.
 *  • Trang chi tiết 1 bài: kết quả từng dạng bài, lỗi gần đây, bài liên quan (nền tảng / tiếp theo).
 *
 * Biểu đồ vẽ bằng SVG/HTML thuần (không thư viện), có chú giải, di chuột/chạm để xem số liệu,
 * và bảng số liệu đi kèm. Màu theo bảng màu đã kiểm tra an toàn cho người mù màu.
 * ========================================================= */
(function (MA) {
  'use strict';
  const { $, $$, esc } = MA.U;
  const DAY = 864e5;
  const RANGES = [[7, '7 ngày'], [30, '30 ngày'], [90, '90 ngày']];
  const SER = { practice: { name: 'Luyện tập', c: 'var(--s1)' }, read: { name: 'Đọc bài', c: 'var(--s3)' }, ok: { name: 'Đúng', c: 'var(--s1)' }, bad: { name: 'Sai', c: 'var(--s2)' } };
  const STATUS = {
    new: { t: 'Chưa học', i: '○', c: 'st-new' }, learning: { t: 'Đang học', i: '📘', c: 'st-learn' },
    weak: { t: 'Cần ôn', i: '⚠️', c: 'st-weak' }, master: { t: 'Thành thạo', i: '⭐', c: 'st-master' }
  };

  // ---------- tiện ích ----------
  const pad = (n) => String(n).padStart(2, '0');
  const dkey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const dshort = (k) => { const [, m, d] = k.split('-'); return +d + '/' + +m; };
  const dlong = (k) => { const [y, m, d] = k.split('-'); return `${+d}/${+m}/${y}`; };
  const pct = (c, n) => n ? Math.round(c / n * 100) : null;
  function fmtDur(sec) {
    sec = Math.round(sec || 0); if (sec < 60) return sec ? sec + ' giây' : '0 phút';
    const m = Math.round(sec / 60); if (m < 60) return m + ' phút';
    return Math.floor(m / 60) + ' giờ ' + (m % 60 ? (m % 60) + ' phút' : '');
  }
  const mins = (sec) => Math.round((sec || 0) / 6) / 10;   // phút, 1 chữ số thập phân
  function niceMax(v) {
    if (v <= 0) return 4; const e = Math.pow(10, Math.floor(Math.log10(v))); const f = v / e;
    const n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10; return n * e;
  }
  const fmtN = (v) => (Math.round(v * 10) / 10).toLocaleString('vi-VN');
  const ago = (t) => t ? (MA.UI.ago ? MA.UI.ago(t) : new Date(t).toLocaleDateString('vi-VN')) : '—';

  // ---------- mô hình dữ liệu ----------
  function statusOf(p) {
    if (!p || (!p.n && !p.learned && !p.rs)) return 'new';
    if (p.n >= 10 && p.m >= 85) return 'master';
    if (p.n >= 5 && p.m < 50) return 'weak';
    return 'learning';
  }
  function build(u, grade, days) {
    const topics = MA.Data.topics(grade); const tids = new Set(topics.map(t => t.id));
    const now = new Date(); const dates = [];
    for (let i = days - 1; i >= 0; i--) dates.push(dkey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)));
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1).getTime();
    const act = u.activity || {};
    const per = {}; topics.forEach(t => { per[t.id] = { q: 0, c: 0, s: 0, rs: 0, days: 0 }; });
    let untracked = 0;
    const daily = dates.map(d => {
      const a = act[d] || {}; const tp = a.tp || {};
      let q = 0, c = 0, s = 0, rs = 0, aq = 0, ac = 0, as = 0;
      Object.entries(tp).forEach(([id, v]) => {
        aq += v[0] || 0; ac += v[1] || 0; as += v[2] || 0;
        if (!tids.has(id)) return;
        q += v[0] || 0; c += v[1] || 0; s += v[2] || 0; rs += v[3] || 0;
        const P = per[id]; P.q += v[0] || 0; P.c += v[1] || 0; P.s += v[2] || 0; P.rs += v[3] || 0; P.days++;
      });
      // dữ liệu trước khi có thống kê theo bài → tính vào lớp hiện tại của học sinh
      const rq = Math.max(0, (a.q || 0) - aq);
      if (rq && grade === u.grade) { q += rq; c += Math.max(0, (a.c || 0) - ac); s += Math.max(0, (a.s || 0) - as); untracked += rq; }
      return { d, q, c, s, rs, xp: a.xp || 0 };
    });
    const tot = daily.reduce((o, x) => { o.q += x.q; o.c += x.c; o.s += x.s; o.rs += x.rs; if (x.q || x.rs) o.days++; return o; }, { q: 0, c: 0, s: 0, rs: 0, days: 0 });
    const rows = topics.map(t => { const p = (u.topics || {})[t.id] || null; return { t, p, st: statusOf(p), r: per[t.id] }; });
    const exams = (u.history || []).filter(h => (h.kind === 'exam' || h.kind === 'daily') && h.at >= start && (!h.grade || h.grade === grade)).sort((a, b) => a.at - b.at);
    const errs = (u.errLog || []).filter(e => e.at >= start && tids.has(e.t));
    return { u, grade, days, dates, start, daily, tot, rows, exams, errs, untracked, topics };
  }
  // gom theo tuần khi khoảng thời gian dài
  function buckets(daily, days) {
    if (days <= 45) return daily.map(x => Object.assign({ label: dshort(x.d), title: dlong(x.d) }, x));
    const out = [];
    for (let i = daily.length; i > 0; i -= 7) {
      const part = daily.slice(Math.max(0, i - 7), i);
      const o = part.reduce((a, x) => { a.q += x.q; a.c += x.c; a.s += x.s; a.rs += x.rs; return a; }, { q: 0, c: 0, s: 0, rs: 0 });
      o.label = dshort(part[0].d); o.title = `Tuần ${dlong(part[0].d)} – ${dlong(part[part.length - 1].d)}`; out.unshift(o);
    }
    return out;
  }

  // ---------- lớp chú thích nổi (tooltip) ----------
  let tips = [];
  function tip(obj) { tips.push(obj); return tips.length - 1; }
  let tipEl = null;
  function showTip(i, x, y) {
    const t = tips[i]; if (!t) return;
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'rp-tip'; tipEl.setAttribute('role', 'tooltip'); document.body.appendChild(tipEl); }
    tipEl.textContent = '';
    const h = document.createElement('div'); h.className = 'rp-tip-h'; h.textContent = t.title; tipEl.appendChild(h);
    (t.rows || []).forEach(r => {
      const row = document.createElement('div'); row.className = 'rp-tip-r';
      if (r.c) { const k = document.createElement('i'); k.style.background = r.c; row.appendChild(k); }
      const v = document.createElement('b'); v.textContent = r.v; row.appendChild(v);
      const n = document.createElement('span'); n.textContent = r.n; row.appendChild(n);
      tipEl.appendChild(row);
    });
    tipEl.hidden = false;
    const W = tipEl.offsetWidth, H = tipEl.offsetHeight;
    let left = x + 14, top = y - H - 12;
    if (left + W > window.innerWidth - 8) left = x - W - 14;
    if (top < 8) top = y + 18;
    tipEl.style.left = Math.max(8, left) + 'px'; tipEl.style.top = top + window.scrollY + 'px';
  }
  const hideTip = () => { if (tipEl) tipEl.hidden = true; };
  function bindTips(root) {
    $$('[data-ti]', root).forEach(el => {
      const i = +el.dataset.ti;
      const xh = (on) => { const svg = el.closest('svg'); const line = svg && svg.querySelector('.rp-xh'); if (line && el.dataset.cx) { line.setAttribute('x1', el.dataset.cx); line.setAttribute('x2', el.dataset.cx); line.style.opacity = on ? 1 : 0; } el.classList.toggle('hov', on); };
      el.addEventListener('pointermove', (e) => { xh(true); showTip(i, e.clientX, e.clientY); });
      el.addEventListener('pointerleave', () => { xh(false); hideTip(); });
      el.addEventListener('focus', () => { xh(true); const r = el.getBoundingClientRect(); showTip(i, r.left + r.width / 2, r.top); });
      el.addEventListener('blur', () => { xh(false); hideTip(); });
    });
  }

  // ---------- thành phần biểu đồ ----------
  const legend = (keys) => `<div class="rp-legend">${keys.map(k => `<span><i style="background:${SER[k].c}"></i>${SER[k].name}</span>`).join('')}</div>`;
  const dataTable = (head, rows) => `<details class="rp-data"><summary>📋 Xem bảng số liệu</summary><div class="tbl-wrap"><table class="tbl small"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div></details>`;
  function roundTop(x, y, w, h, r) {
    r = Math.min(r, w / 2, h); if (h <= 0) return '';
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  // Cột chồng: items [{label,title, vals:{key:v}}], keys theo thứ tự từ đáy lên
  const narrow = () => window.innerWidth < 600;   // màn hình điện thoại: khung vẽ hẹp hơn để chữ trục đủ lớn
  function colChart(items, keys, opts = {}) {
    const W = narrow() ? 360 : 640, H = 210, L = 40, R = 8, T = 12, B = 26, ih = H - T - B;
    const totals = items.map(it => keys.reduce((a, k) => a + (it.vals[k] || 0), 0));
    const max = niceMax(Math.max(...totals, opts.minMax || 0));
    const band = (W - L - R) / items.length, bw = Math.max(3, Math.min(24, band * 0.62));
    const step = Math.max(1, Math.ceil(items.length / (narrow() ? 5 : 8)));
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = max * i / 4, y = T + ih - ih * i / 4; g += `<line class="rp-grid${i ? '' : ' base'}" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text class="rp-ax" x="${L - 6}" y="${y + 4}" text-anchor="end">${fmtN(v)}</text>`; }
    let bars = '', hits = '', labs = '';
    items.forEach((it, i) => {
      const cx = L + band * i + band / 2, x = cx - bw / 2; let y = T + ih; const segs = keys.filter(k => it.vals[k] > 0);
      segs.forEach((k, j) => {
        const h = it.vals[k] / max * ih; const top = j === segs.length - 1; const gap = j > 0 ? 2 : 0;
        const hh = Math.max(0, h - gap); y -= h;
        bars += top ? `<path d="${roundTop(x, y, bw, hh, 4)}" fill="${SER[k].c}"/>` : `<rect x="${x}" y="${y + 0}" width="${bw}" height="${hh}" fill="${SER[k].c}"/>`;
      });
      if ((i % step === 0 && items.length - 1 - i >= step / 2) || i === items.length - 1) labs += `<text class="rp-ax" x="${cx}" y="${H - 8}" text-anchor="middle">${esc(it.label)}</text>`;
      const ti = tip({ title: it.title || it.label, rows: keys.slice().reverse().map(k => ({ c: SER[k].c, v: opts.fmt ? opts.fmt(it.vals[k] || 0) : fmtN(it.vals[k] || 0), n: SER[k].name })).concat(opts.extra ? opts.extra(it) : []) });
      hits += `<rect class="rp-hit" x="${L + band * i}" y="${T}" width="${band}" height="${ih}" data-ti="${ti}" tabindex="0" aria-label="${esc(it.title || it.label)}"/>`;
    });
    return `${keys.length > 1 ? legend(keys) : ''}<svg class="rp-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.aria || '')}">${g}${bars}${labs}${hits}</svg>`;
  }
  // Đường (0..max), cho phép điểm trống (null)
  function lineChart(points, opts = {}) {
    const W = narrow() ? 360 : 640, H = 200, L = 40, R = 14, T = 14, B = 26, ih = H - T - B, max = opts.max || 100;
    const n = points.length, band = (W - L - R) / n; const X = (i) => L + band * i + band / 2, Y = (v) => T + ih - v / max * ih;
    let g = ''; (opts.ticks || [0, 25, 50, 75, 100]).forEach((v, i) => { const y = Y(v); g += `<line class="rp-grid${i ? '' : ' base'}" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text class="rp-ax" x="${L - 6}" y="${y + 4}" text-anchor="end">${v}${opts.unit || ''}</text>`; });
    let path = '', pen = false, dots = '', hits = '', labs = ''; const step = Math.max(1, Math.ceil(n / (narrow() ? 5 : 8)));
    points.forEach((p, i) => {
      if (p.v == null) { pen = false; } else { path += (pen ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(p.v).toFixed(1); pen = true; dots += `<circle class="rp-dot" cx="${X(i)}" cy="${Y(p.v)}" r="4.5"/>`; }
      if ((i % step === 0 && n - 1 - i >= step / 2) || i === n - 1) labs += `<text class="rp-ax" x="${X(i)}" y="${H - 8}" text-anchor="middle">${esc(p.label)}</text>`;
      const ti = tip({ title: p.title || p.label, rows: p.v == null ? [{ v: '—', n: 'không có dữ liệu' }] : [{ c: 'var(--s1)', v: fmtN(p.v) + (opts.unit || ''), n: opts.name || '' }].concat(p.extra || []) });
      hits += `<rect class="rp-hit" x="${L + band * i}" y="${T}" width="${band}" height="${ih}" data-ti="${ti}" data-cx="${X(i)}" tabindex="0" aria-label="${esc(p.title || p.label)}"/>`;
    });
    const last = [...points.keys()].reverse().find(i => points[i].v != null);
    const endLab = last != null ? `<text class="rp-val" x="${Math.min(X(last) + 8, W - 30)}" y="${Y(points[last].v) - 9}">${fmtN(points[last].v)}${opts.unit || ''}</text>` : '';
    return `<svg class="rp-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.aria || '')}">${g}<line class="rp-xh" x1="0" x2="0" y1="${T}" y2="${T + ih}"/><path class="rp-line" d="${path}"/>${dots}${endLab}${labs}${hits}</svg>`;
  }
  // Thanh ngang (HTML) — rows [{label, href, vals:{k:v}, text, title, extra, note}]
  function hbars(rows, keys, opts = {}) {
    const max = opts.max || Math.max(1, ...rows.map(r => keys.reduce((a, k) => a + (r.vals[k] || 0), 0)));
    return `${keys.length > 1 ? legend(keys) : ''}<div class="rp-hbars">${rows.map(r => {
      const segs = keys.filter(k => r.vals[k] > 0);
      const ti = tip({ title: r.title || r.label, rows: keys.map(k => ({ c: SER[k].c, v: opts.fmt ? opts.fmt(r.vals[k] || 0) : fmtN(r.vals[k] || 0), n: SER[k].name })).concat(r.extra || []) });
      const lab = r.href ? `<a href="${r.href}">${esc(r.label)}</a>` : esc(r.label);
      return `<div class="rp-hrow" data-ti="${ti}" tabindex="0"><span class="rp-hl">${lab}${r.note ? ` <small>${r.note}</small>` : ''}</span><span class="rp-track">${segs.map((k, j) => `<i style="width:${(r.vals[k] / max * 100).toFixed(2)}%;background:${SER[k].c}" class="${j === segs.length - 1 ? 'end' : ''}"></i>`).join('')}</span><b class="rp-hv">${r.text != null ? r.text : ''}</b></div>`;
    }).join('')}</div>`;
  }
  // Lịch học 13 tuần (ô màu theo số phút học mỗi ngày)
  function heatmap(u) {
    const act = u.activity || {}; const now = new Date(); const weeks = 13;
    const first = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (weeks * 7 - 1) - ((now.getDay() + 6) % 7) + 6);
    const cell = 15, gap = 3, L = 26, T = 18; let svg = '', months = '';
    const lvl = (m) => m <= 0 ? 0 : m < 10 ? 1 : m < 20 ? 2 : m < 40 ? 3 : 4;
    let lastMonth = -1;
    for (let w = 0; w < weeks; w++) for (let d = 0; d < 7; d++) {
      const day = new Date(first.getFullYear(), first.getMonth(), first.getDate() + w * 7 + d); if (day > now) continue;
      const k = dkey(day); const a = act[k] || {}; const m = ((a.s || 0) + (a.rs || 0)) / 60;
      const x = L + w * (cell + gap), y = T + d * (cell + gap);
      if (d === 0 && day.getMonth() !== lastMonth) { lastMonth = day.getMonth(); months += `<text class="rp-ax" x="${x}" y="11">Th${day.getMonth() + 1}</text>`; }
      const ti = tip({ title: dlong(k), rows: [{ c: 'var(--h3)', v: fmtDur((a.s || 0) + (a.rs || 0)), n: 'thời gian học' }, { v: String(a.q || 0), n: 'câu đã làm' }] });
      svg += `<rect class="rp-cell" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="var(--h${lvl(m)})" data-ti="${ti}" tabindex="0" aria-label="${dlong(k)}"/>`;
    }
    const days = ['T2', '', 'T4', '', 'T6', '', 'CN'].map((t, i) => t ? `<text class="rp-ax" x="0" y="${T + i * (cell + gap) + 12}">${t}</text>` : '').join('');
    const W = L + weeks * (cell + gap);
    return `<svg class="rp-svg rp-heat" viewBox="0 0 ${W} ${T + 7 * (cell + gap)}" role="img" aria-label="Lịch học 13 tuần">${months}${days}${svg}</svg>
      <div class="rp-scale"><span>Ít</span>${[0, 1, 2, 3, 4].map(i => `<i style="background:var(--h${i})"></i>`).join('')}<span>Nhiều</span><small class="muted">(0 · &lt;10 · 10–20 · 20–40 · 40+ phút/ngày)</small></div>`;
  }
  const tile = (label, value, sub) => `<div class="rp-tile"><span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const stChip = (k) => `<span class="st ${STATUS[k].c}">${STATUS[k].i} ${STATUS[k].t}</span>`;

  // ============================ TRANG BÁO CÁO ============================
  const Report = {
    statusOf, build, STATUS, fmtDur,
    state: { days: 30, grade: null },
    // base: đường dẫn gốc ('vip/report/<id>' hoặc 'admin/report/<id>'); opts.admin: chế độ quản trị
    render(el, u, opts = {}) {
      tips = []; hideTip();
      const acc = MA.Account.get(u.id) || {}; const base = opts.base;
      const st = this.state; if (!st.grade || st.uid !== u.id) { st.grade = u.grade; st.uid = u.id; }
      const grades = [1, 2, 3, 4, 5, 6].filter(g => g === u.grade || (u.xp && u.xp[g]) || MA.Data.topics(g).some(t => (u.topics || {})[t.id]));
      const M = build(u, st.grade, st.days); const T = M.tot;
      const studied = M.rows.filter(r => r.st !== 'new').length, mastered = M.rows.filter(r => r.st === 'master').length, weak = M.rows.filter(r => r.st === 'weak').length;
      const avgExam = M.exams.length ? Math.round(M.exams.reduce((a, h) => a + (h.score || 0), 0) / M.exams.length * 10) / 10 : null;
      const B = buckets(M.daily, st.days);
      const accPts = B.map(b => ({ label: b.label, title: b.title, v: b.q ? Math.round(b.c / b.q * 100) : null, extra: b.q ? [{ v: String(b.q), n: 'câu đã làm' }] : [] }));
      const timeRows = M.rows.filter(r => r.r.s + r.r.rs > 0).sort((a, b) => (b.r.s + b.r.rs) - (a.r.s + a.r.rs));
      const errStats = (() => { if (!MA.Coach) return []; const p = {}; M.errs.forEach(e => { const k = MA.Coach.classify(e); p[k] = (p[k] || 0) + 1; }); return Object.entries(p).sort((a, b) => b[1] - a[1]); })();
      const vip = MA.Account.typeOf(acc) === 'vip';

      el.innerHTML = `<div class="report">
        <div class="rp-head">
          <div><h1>📈 Báo cáo học tập${opts.admin ? '' : ' chi tiết'}: ${MA.U.av(u.avatar)} ${esc(u.name)}</h1>
            <p class="muted">Lớp đang học: ${u.grade}${vip ? ' · <span class="tag vip">👑 VIP</span>' : ''} · Tham gia từ ${u.created ? new Date(u.created).toLocaleDateString('vi-VN') : '—'} · Học gần nhất ${ago(acc.lastLogin)}</p></div>
          <div class="btn-row no-print"><button class="btn ghost small" id="rpCsv">⬇️ Xuất CSV</button><button class="btn ghost small" id="rpPrint">🖨️ In báo cáo</button></div>
        </div>
        <div class="card"><h3>🗓️ Lịch học 13 tuần gần nhất</h3>${heatmap(u)}</div>
        <div class="rp-filters no-print">
          <div class="seg" id="rpRange">${RANGES.map(([d, t]) => `<button data-d="${d}" class="${d === st.days ? 'on' : ''}">${t}</button>`).join('')}</div>
          ${grades.length > 1 ? `<div class="seg" id="rpGrade">${grades.map(g => `<button data-g="${g}" class="${g === st.grade ? 'on' : ''}">Lớp ${g}</button>`).join('')}</div>` : ''}
          <span class="muted small">Số liệu bên dưới: ${st.days} ngày gần nhất · Lớp ${st.grade}</span>
        </div>
        <div class="rp-tiles">
          ${tile('Thời gian học', fmtDur(T.s + T.rs), `Luyện tập ${fmtDur(T.s)} · Đọc bài ${fmtDur(T.rs)}`)}
          ${tile('Ngày có học', `${T.days}/${st.days}`, T.days ? `TB ${fmtDur((T.s + T.rs) / T.days)}/ngày học` : 'chưa có')}
          ${tile('Câu đã làm', T.q.toLocaleString('vi-VN'), `${T.c.toLocaleString('vi-VN')} câu đúng`)}
          ${tile('Độ chính xác', T.q ? pct(T.c, T.q) + '%' : '—', T.q ? (pct(T.c, T.q) >= 80 ? 'Tốt' : pct(T.c, T.q) >= 60 ? 'Khá' : 'Cần cố gắng') : '')}
          ${tile('Bài đã học', `${studied}/${M.rows.length}`, `⭐ ${mastered} thành thạo · ⚠️ ${weak} cần ôn`)}
          ${tile('Điểm kiểm tra TB', avgExam != null ? fmtN(avgExam) : '—', `${M.exams.length} bài kiểm tra / thử thách`)}
        </div>
        ${M.untracked ? `<p class="muted small">ℹ️ ${M.untracked} câu được làm trước khi hệ thống ghi nhận theo từng bài — đã tính vào tổng của lớp hiện tại nhưng chưa phân bổ cho bài cụ thể.</p>` : ''}
        <div class="grid2 rp-grid2">
          <div class="card"><h3>⏱️ Thời gian học ${st.days > 45 ? 'mỗi tuần' : 'mỗi ngày'} (phút)</h3>
            ${colChart(B.map(b => ({ label: b.label, title: b.title, vals: { practice: mins(b.s), read: mins(b.rs) } })), ['practice', 'read'], { fmt: (v) => fmtN(v) + ' phút', aria: 'Thời gian học' })}
            ${dataTable(['Ngày', 'Luyện tập (phút)', 'Đọc bài (phút)'], B.filter(b => b.s || b.rs).map(b => [b.title, fmtN(mins(b.s)), fmtN(mins(b.rs))]))}</div>
          <div class="card"><h3>✏️ Số câu đã làm ${st.days > 45 ? 'mỗi tuần' : 'mỗi ngày'}</h3>
            ${colChart(B.map(b => ({ label: b.label, title: b.title, vals: { ok: b.c, bad: b.q - b.c } })), ['ok', 'bad'], { aria: 'Số câu đúng sai', extra: (it) => { const n = it.vals.ok + it.vals.bad; return n ? [{ v: Math.round(it.vals.ok / n * 100) + '%', n: 'chính xác' }] : []; } })}
            ${dataTable(['Ngày', 'Đúng', 'Sai', '% đúng'], B.filter(b => b.q).map(b => [b.title, b.c, b.q - b.c, pct(b.c, b.q) + '%']))}</div>
          <div class="card"><h3>🎯 Độ chính xác ${st.days > 45 ? 'theo tuần' : 'theo ngày'} (%)</h3>
            ${T.q ? lineChart(accPts, { name: 'chính xác', unit: '%', aria: 'Độ chính xác theo thời gian' }) : '<p class="muted">Chưa có bài luyện tập trong khoảng thời gian này.</p>'}
            ${dataTable(['Thời gian', 'Số câu', '% đúng'], B.filter(b => b.q).map(b => [b.title, b.q, pct(b.c, b.q) + '%']))}</div>
          <div class="card"><h3>📝 Điểm kiểm tra & thử thách ngày (thang 10)</h3>
            ${M.exams.length ? lineChart(M.exams.slice(-20).map(h => ({ label: dshort(dkey(new Date(h.at))), title: `${h.title || (h.kind === 'daily' ? 'Thử thách ngày' : 'Bài kiểm tra')} · ${new Date(h.at).toLocaleDateString('vi-VN')}`, v: h.score })), { max: 10, ticks: [0, 2.5, 5, 7.5, 10], name: 'điểm', aria: 'Điểm kiểm tra' }) : '<p class="muted">Chưa làm bài kiểm tra nào trong khoảng thời gian này.</p>'}
            ${dataTable(['Ngày', 'Bài', 'Điểm'], M.exams.slice().reverse().map(h => [new Date(h.at).toLocaleString('vi-VN'), esc(h.title || h.kind), h.score]))}</div>
        </div>
        <div class="card"><h3>🧠 Mức thành thạo từng bài (hiện tại)</h3><p class="muted small">Thành thạo tính theo kết quả các lần luyện gần nhất (câu mới có trọng số lớn hơn). Bấm tên bài để xem chi tiết.</p>
          ${hbars(M.rows.map(r => ({ label: `${r.t.icon} ${r.t.title}`, href: `#/${base}/${encodeURIComponent(r.t.id)}`, vals: { practice: r.p ? r.p.m : 0 }, text: r.st === 'new' ? '—' : (r.p.m + '%'), note: stChip(r.st), title: r.t.title, extra: [{ v: STATUS[r.st].t, n: 'trạng thái' }, { v: String(r.p ? r.p.n : 0), n: 'câu đã làm (tổng)' }] })), ['practice'], { max: 100, fmt: (v) => v + '%' })}</div>
        <div class="grid2 rp-grid2">
          <div class="card"><h3>⌛ Thời gian theo bài (${st.days} ngày)</h3>
            ${timeRows.length ? hbars(timeRows.map(r => ({ label: `${r.t.icon} ${r.t.title}`, href: `#/${base}/${encodeURIComponent(r.t.id)}`, vals: { practice: mins(r.r.s), read: mins(r.r.rs) }, text: fmtDur(r.r.s + r.r.rs), title: r.t.title })), ['practice', 'read'], { fmt: (v) => fmtN(v) + ' phút' }) : '<p class="muted">Chưa có dữ liệu thời gian theo bài trong khoảng này.</p>'}</div>
          <div class="card"><h3>🧩 Kiểu lỗi hay gặp (${st.days} ngày)</h3>
            ${errStats.length ? hbars(errStats.map(([k, n]) => { const P = MA.Coach.PATTERNS[k]; return { label: `${P.icon} ${P.name}`, vals: { bad: n }, text: n + ' lần', title: P.name, extra: [{ v: P.advice, n: '' }] }; }), ['bad']) : '<p class="muted">Không có lỗi sai nào được ghi nhận. 🎉</p>'}
            ${errStats.length ? `<p class="muted small">💡 ${esc(MA.Coach.PATTERNS[errStats[0][0]].advice)}</p>` : ''}</div>
        </div>
        <div class="card"><div class="sec-head"><h3>📚 Chi tiết từng bài học — Lớp ${st.grade}</h3></div>
          <div class="tbl-wrap"><table class="tbl rp-table"><tr><th>Bài học</th><th>Trạng thái</th><th>Ngày học đầu</th><th>Đọc bài</th><th>Luyện tập</th><th>Số câu</th><th>% đúng</th><th>Thành thạo</th><th>Mức</th><th>Lần cuối</th><th></th></tr>
          ${M.rows.map(r => `<tr class="${r.st}"><td>${r.t.icon} ${esc(r.t.title)}</td><td>${stChip(r.st)}</td><td>${r.p && r.p.learned ? new Date(r.p.learned).toLocaleDateString('vi-VN') : '—'}</td><td>${fmtDur(r.r.rs)}</td><td>${fmtDur(r.r.s)}</td><td>${r.r.q || '—'}</td><td>${r.r.q ? pct(r.r.c, r.r.q) + '%' : '—'}</td><td>${r.p && r.p.n ? r.p.m + '%' : '—'}</td><td>${r.p ? ['', 'Cơ bản', 'Vận dụng', 'Nâng cao'][r.p.lv || 1] : '—'}</td><td>${r.p && r.p.last ? ago(r.p.last) : '—'}</td><td><a class="btn tiny ghost" href="#/${base}/${encodeURIComponent(r.t.id)}">Chi tiết ›</a></td></tr>`).join('')}</table></div>
          <p class="muted small">Đọc bài, luyện tập, số câu, % đúng: trong ${st.days} ngày gần nhất. Thành thạo, mức độ: trạng thái hiện tại.</p></div>
      </div>`;
      bindTips(el);
      $$('#rpRange button', el).forEach(b => b.onclick = () => { st.days = +b.dataset.d; this.render(el, u, opts); });
      $$('#rpGrade button', el).forEach(b => b.onclick = () => { st.grade = +b.dataset.g; this.render(el, u, opts); });
      $('#rpPrint', el).onclick = () => window.print();
      $('#rpCsv', el).onclick = () => {
        const head = ['Bài học', 'Trạng thái', 'Ngày học đầu', 'Đọc bài (phút)', 'Luyện tập (phút)', 'Số câu', 'Đúng', '% đúng', 'Thành thạo (%)', 'Mức', 'Lần cuối'];
        const lines = [head].concat(M.rows.map(r => [r.t.title, STATUS[r.st].t, r.p && r.p.learned ? new Date(r.p.learned).toLocaleDateString('vi-VN') : '', mins(r.r.rs), mins(r.r.s), r.r.q, r.r.c, r.r.q ? pct(r.r.c, r.r.q) : '', r.p && r.p.n ? r.p.m : '', r.p ? r.p.lv || 1 : '', r.p && r.p.last ? new Date(r.p.last).toLocaleString('vi-VN') : '']));
        const csv = '﻿' + lines.map(l => l.map(c => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
        MA.U.download(`bao-cao-${MA.U.slug(u.name)}-lop${st.grade}-${st.days}ngay.csv`, csv, 'text/csv');
      };
    },

    // ---------- Chi tiết 1 bài học ----------
    topic(el, u, tid, opts = {}) {
      tips = []; hideTip();
      const t = MA.Data.topic(tid); if (!t) { el.innerHTML = '<div class="card">Không tìm thấy bài học.</div>'; return; }
      const st = this.state; const days = st.days; const base = opts.base;
      const p = (u.topics || {})[t.id] || null; const status = statusOf(p);
      const M = build(u, t.grade, days); const act = u.activity || {};
      const daily = M.dates.map(d => { const v = ((act[d] || {}).tp || {})[t.id] || [0, 0, 0, 0]; return { d, q: v[0], c: v[1], s: v[2], rs: v[3] || 0 }; });
      const B = buckets(daily, days); const R = daily.reduce((o, x) => { o.q += x.q; o.c += x.c; o.s += x.s; o.rs += x.rs; return o; }, { q: 0, c: 0, s: 0, rs: 0 });
      const gens = t.gens.map((g, i) => ({ g, i, s: (u.gens || {})[t.id + '::' + g.name] || null }));
      const tried = gens.filter(x => x.s && x.s.n);
      const errs = (u.errLog || []).filter(e => e.t === t.id).slice(0, 10);
      const pre = (t.prereqs || []).map(MA.Data.topic).filter(Boolean);
      const next = MA.Data.topics(t.grade).filter(x => (x.prereqs || []).includes(t.id));
      const weakGen = tried.filter(x => x.s.c / x.s.n < 0.75).sort((a, b) => a.s.c / a.s.n - b.s.c / b.s.n)[0];
      const relRow = (x, kind) => { const q = (u.topics || {})[x.id]; const s2 = statusOf(q); return `<tr><td>${kind}</td><td><a href="#/${base}/${encodeURIComponent(x.id)}">${x.icon} ${esc(x.title)}</a></td><td>Lớp ${x.grade}</td><td>${stChip(s2)}</td><td>${q && q.n ? q.m + '%' : '—'}</td>${opts.admin ? '' : `<td><a class="btn tiny ghost" href="#/practice/${x.id}">✏️ Luyện</a></td>`}</tr>`; };
      el.innerHTML = `<div class="report">
        <nav class="crumbs no-print"><a href="#/${base}">📈 Báo cáo của ${esc(u.name)}</a> › <b>${esc(t.title)}</b></nav>
        <div class="rp-head"><div><h1>${t.icon} ${esc(t.title)}</h1><p class="muted">Lớp ${t.grade} · Chủ đề ${t.order || ''} · ${stChip(status)} · Mức hiện tại: <b>${p ? ['', 'Cơ bản', 'Vận dụng', 'Nâng cao'][p.lv || 1] : '—'}</b> · Học lần đầu: ${p && p.learned ? new Date(p.learned).toLocaleDateString('vi-VN') : '—'}</p></div>
          ${opts.admin ? '' : `<div class="btn-row no-print"><a class="btn small ghost" href="#/learn/${t.id}">📖 Xem lại bài</a><a class="btn small" href="#/practice/${t.id}">✏️ Luyện bài này</a>${weakGen && MA.Coach ? '<button class="btn small" id="rpFix">🩺 Bài bổ trợ dạng yếu</button>' : ''}</div>`}</div>
        <div class="rp-filters no-print"><div class="seg" id="rpRange">${RANGES.map(([d, tt]) => `<button data-d="${d}" class="${d === days ? 'on' : ''}">${tt}</button>`).join('')}</div><span class="muted small">Số liệu theo ngày: ${days} ngày gần nhất</span></div>
        <div class="rp-tiles">
          ${tile('Thành thạo (hiện tại)', p && p.n ? p.m + '%' : '—', p ? `${p.n} câu tổng · ${(pct(p.c, p.n) || 0)}% đúng` : 'chưa luyện')}
          ${tile('Thời gian đọc bài', fmtDur(R.rs), `Tổng từ trước: ${fmtDur(p && p.rs)}`)}
          ${tile('Thời gian luyện tập', fmtDur(R.s), `Tổng từ trước: ${fmtDur(p && p.s)}`)}
          ${tile('Câu trong kỳ', R.q, R.q ? pct(R.c, R.q) + '% đúng' : 'chưa có')}
          ${tile('Dạng bài đã làm', `${tried.length}/${gens.length}`, tried.length ? `${tried.filter(x => x.s.c / x.s.n >= 0.8).length} dạng ≥ 80% đúng` : '')}
        </div>
        <div class="grid2 rp-grid2">
          <div class="card"><h3>✏️ Số câu bài này ${days > 45 ? 'mỗi tuần' : 'mỗi ngày'}</h3>${R.q ? colChart(B.map(b => ({ label: b.label, title: b.title, vals: { ok: b.c, bad: b.q - b.c } })), ['ok', 'bad'], { aria: 'Số câu đúng sai' }) : '<p class="muted">Chưa luyện bài này trong khoảng thời gian đã chọn.</p>'}</div>
          <div class="card"><h3>⏱️ Thời gian bài này (phút)</h3>${R.s + R.rs ? colChart(B.map(b => ({ label: b.label, title: b.title, vals: { practice: mins(b.s), read: mins(b.rs) } })), ['practice', 'read'], { fmt: (v) => fmtN(v) + ' phút', aria: 'Thời gian' }) : '<p class="muted">Chưa có dữ liệu thời gian trong khoảng này.</p>'}</div>
        </div>
        <div class="card"><h3>🧮 Kết quả từng dạng bài (từ trước đến nay)</h3><p class="muted small">Độ dài thanh = % trả lời đúng. Dạng chưa làm hiển thị “—”.</p>
          ${hbars(gens.map(x => ({ label: `${['', '🟢', '🟡', '🔴'][x.g.level || 1]} ${x.g.name}`, href: opts.admin ? null : `#/practice/${t.id}/${x.i}`, vals: { practice: x.s && x.s.n ? Math.round(x.s.c / x.s.n * 100) : 0 }, text: x.s && x.s.n ? `${Math.round(x.s.c / x.s.n * 100)}% · ${x.s.n} câu` : '—', title: x.g.name, extra: x.s && x.s.n ? [{ v: `${x.s.c}/${x.s.n}`, n: 'đúng' }, { v: String(x.s.h || 0), n: 'lần dùng gợi ý' }, { v: fmtDur(x.s.s), n: 'thời gian' }, { v: ago(x.s.last), n: 'lần cuối' }] : [{ v: '—', n: 'chưa làm' }] })), ['practice'], { max: 100, fmt: (v) => v + '%' })}
          <p class="muted small">🟢 Cơ bản · 🟡 Vận dụng · 🔴 Nâng cao${opts.admin ? '' : ' · Bấm tên dạng bài để luyện riêng dạng đó.'}</p></div>
        <div class="grid2 rp-grid2">
          <div class="card"><h3>❌ Lỗi sai gần đây</h3>${errs.length ? `<div class="tbl-wrap"><table class="tbl small"><tr><th>Lúc</th><th>Dạng bài</th><th>Con trả lời</th><th>Đáp án</th><th>Kiểu lỗi</th></tr>${errs.map(e => { const k = MA.Coach ? MA.Coach.classify(e) : 'other'; const P = MA.Coach ? MA.Coach.PATTERNS[k] : { icon: '', name: '' }; return `<tr><td>${ago(e.at)}</td><td>${esc(e.g || '')}</td><td>${e.mc ? '(trắc nghiệm)' : esc(e.v === '' ? '(bỏ trống)' : e.v)}</td><td>${e.a == null ? '—' : esc(String(e.a))}</td><td>${P.icon} ${P.name}</td></tr>`; }).join('')}</table></div>` : '<p class="muted">Không có lỗi sai nào được ghi nhận với bài này. 🎉</p>'}</div>
          <div class="card"><h3>🔗 Bài liên quan</h3>${pre.length || next.length ? `<div class="tbl-wrap"><table class="tbl small"><tr><th></th><th>Bài</th><th>Lớp</th><th>Trạng thái</th><th>Thành thạo</th>${opts.admin ? '' : '<th></th>'}</tr>${pre.map(x => relRow(x, 'Nền tảng')).join('')}${next.map(x => relRow(x, 'Học tiếp')).join('')}</table></div>
            <p class="muted small">${pre.some(x => statusOf((u.topics || {})[x.id]) !== 'master') && status === 'weak' ? '💡 Bài này đang yếu: nên ôn lại các bài <b>nền tảng</b> trước khi luyện tiếp.' : 'Bài nền tảng nên đạt mức thành thạo trước khi học các bài tiếp theo.'}</p>` : '<p class="muted">Bài này không có bài nền tảng / bài tiếp theo được khai báo.</p>'}</div>
        </div>
      </div>`;
      bindTips(el);
      $$('#rpRange button', el).forEach(b => b.onclick = () => { st.days = +b.dataset.d; this.topic(el, u, tid, opts); });
      if ($('#rpFix', el)) $('#rpFix', el).onclick = () => {
        const w = { tid: t.id, t, gi: weakGen.i, gname: weakGen.g.name };
        const run = () => MA.Quiz.start(el, { kind: 'coach', kicker: '🩺 Bài tập bổ trợ sửa lỗi', title: `${t.icon} ${weakGen.g.name}`, questions: MA.Coach.remedial(w), back: base + '/' + encodeURIComponent(t.id), restart: run }); run();
      };
    }
  };
  MA.Report = Report;
  window.addEventListener('hashchange', hideTip);
  window.addEventListener('scroll', hideTip, { passive: true });
})(window.MA);
