/* =========================================================
 * ui/charts.js — BỘ BIỂU ĐỒ DÙNG CHUNG (SVG/HTML, không thư viện ngoài)
 * Dùng cho KPI (quản trị & VIP), tổng quan hệ thống.
 *   MA.Charts.cols(items, series, opts)   cột (chồng) theo ngày / theo lớp
 *   MA.Charts.radar(axes, series, opts)   mạng nhện 5 thành phần KPI
 *   MA.Charts.donut(slices, opts)         vành khuyên phân bố xếp loại
 *   MA.Charts.pairs(rows, series, opts)   thanh ngang ghép cặp để so sánh
 *   MA.Charts.rank(rows, opts)            thanh xếp hạng điểm KPI
 *   MA.Charts.bind(root)                  gắn chú thích nổi (hover / focus)
 * Màu: --s1..--s6 (bảng màu đã kiểm tra mù màu, có biến thể nền tối).
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (v) => typeof v === 'number' ? (Math.round(v * 10) / 10).toLocaleString('vi-VN') : String(v);
  const PAL = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)', 'var(--s6)'];
  const narrow = () => window.innerWidth < 600;
  function niceMax(v) { if (v <= 5) return 5; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }

  // ---------- chú thích nổi ----------
  const tips = []; let tipEl = null;
  const tip = (o) => { tips.push(o); return tips.length - 1; };
  function show(i, x, y) {
    const t = tips[i]; if (!t) return;
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'rp-tip'; tipEl.setAttribute('role', 'tooltip'); document.body.appendChild(tipEl); }
    tipEl.textContent = '';
    const h = document.createElement('div'); h.className = 'rp-tip-h'; h.textContent = t.title; tipEl.appendChild(h);
    (t.rows || []).forEach(r => {
      const row = document.createElement('div'); row.className = 'rp-tip-r';
      if (r.c) { const k = document.createElement('i'); k.style.background = r.c; row.appendChild(k); }
      const v = document.createElement('b'); v.textContent = r.v; row.appendChild(v);
      const n = document.createElement('span'); n.textContent = r.n || ''; row.appendChild(n);
      tipEl.appendChild(row);
    });
    tipEl.hidden = false;
    const W = tipEl.offsetWidth, H = tipEl.offsetHeight;
    let left = x + 14, top = y - H - 12;
    if (left + W > window.innerWidth - 8) left = x - W - 14;
    if (top < 8) top = y + 18;
    tipEl.style.left = Math.max(8, left) + 'px'; tipEl.style.top = top + window.scrollY + 'px';
  }
  const hide = () => { if (tipEl) tipEl.hidden = true; };
  function bind(root) {
    (root || document).querySelectorAll('[data-ct]').forEach(el => {
      if (el._ct) return; el._ct = 1; const i = +el.dataset.ct;
      el.addEventListener('pointermove', (e) => { el.classList.add('hov'); show(i, e.clientX, e.clientY); });
      el.addEventListener('pointerleave', () => { el.classList.remove('hov'); hide(); });
      el.addEventListener('focus', () => { el.classList.add('hov'); const r = el.getBoundingClientRect(); show(i, r.left + r.width / 2, r.top); });
      el.addEventListener('blur', () => { el.classList.remove('hov'); hide(); });
    });
  }
  window.addEventListener('hashchange', hide);

  const legend = (series) => `<div class="rp-legend">${series.map((s, i) => `<span><i style="background:${s.c || PAL[i]}"></i>${esc(s.name)}</span>`).join('')}</div>`;
  function roundTop(x, y, w, h, r) {
    r = Math.min(r, w / 2, h); if (h <= 0) return '';
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }

  // ---------- Cột (chồng) ----------
  // items [{label, title, vals:[v1, v2…]}], series [{name, c}] (thứ tự từ đáy lên)
  function cols(items, series, opts = {}) {
    const W = narrow() ? 360 : (opts.w || 640), H = opts.h || 190, L = 34, R = 6, T = 14, B = 24, ih = H - T - B;
    const totals = items.map(it => it.vals.reduce((a, v) => a + (v || 0), 0));
    const allInt = items.every(it => it.vals.every(v => Number.isInteger(v || 0))); const top = Math.max(...totals, 1);
    const max = allInt && top <= 20 ? Math.ceil(top / 4) * 4 : niceMax(top);
    const band = (W - L - R) / Math.max(1, items.length), bw = Math.max(4, Math.min(opts.bw || 26, band * 0.62));
    const step = Math.max(1, Math.ceil(items.length / (narrow() || W < 500 ? 6 : 10)));
    let g = '', bars = '', labs = '', hits = '', vals = '';
    for (let i = 0; i <= 4; i++) { const v = max * i / 4, y = T + ih - ih * i / 4; g += `<line class="rp-grid${i ? '' : ' base'}" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text class="rp-ax" x="${L - 6}" y="${y + 4}" text-anchor="end">${fmt(v)}</text>`; }
    const peak = totals.indexOf(Math.max(...totals));
    items.forEach((it, i) => {
      const cx = L + band * i + band / 2, x = cx - bw / 2; let y = T + ih;
      const segs = it.vals.map((v, k) => ({ v: v || 0, k })).filter(s => s.v > 0);
      segs.forEach((s, j) => {
        const h = s.v / max * ih, gap = j > 0 ? 2 : 0, hh = Math.max(0, h - gap); y -= h;
        const c = (series[s.k] && series[s.k].c) || PAL[s.k];
        bars += j === segs.length - 1 ? `<path d="${roundTop(x, y, bw, hh, 4)}" fill="${c}"/>` : `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" fill="${c}"/>`;
      });
      if (opts.labelAll || i === peak && totals[i] > 0 || i === items.length - 1 && totals[i] > 0) vals += `<text class="rp-val" x="${cx}" y="${y - 5}" text-anchor="middle">${fmt(totals[i])}</text>`;
      if ((i % step === 0 && items.length - 1 - i >= step / 2) || i === items.length - 1) labs += `<text class="rp-ax" x="${cx}" y="${H - 7}" text-anchor="middle">${esc(it.label)}</text>`;
      const ti = tip({ title: it.title || it.label, rows: series.map((s, k) => ({ c: s.c || PAL[k], v: fmt(it.vals[k] || 0), n: s.name })).reverse().concat(series.length > 1 ? [{ v: fmt(totals[i]), n: 'tổng' }] : []) });
      hits += `<rect class="rp-hit" x="${L + band * i}" y="${T}" width="${band}" height="${ih}" data-ct="${ti}" tabindex="0" aria-label="${esc(it.title || it.label)}"/>`;
    });
    return `${series.length > 1 ? legend(series) : ''}<svg class="rp-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.aria || '')}">${g}${bars}${vals}${labs}${hits}</svg>`;
  }

  // ---------- Mạng nhện (radar) ----------
  // axes ['Chuyên cần', …], series [{name, c, vals:[0..100]}]
  function radar(axes, series, opts = {}) {
    const S = 300, cx = S / 2, cy = S / 2 + 4, R = 98, n = axes.length;
    const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * v / 100, cy + Math.sin(a) * R * v / 100]; };
    let g = '';
    [25, 50, 75, 100].forEach(r => { g += `<polygon class="ch-ring${r === 100 ? ' out' : ''}" points="${axes.map((_, i) => pt(i, r).join(',')).join(' ')}"/>`; });
    axes.forEach((a, i) => {
      const [x, y] = pt(i, 100); g += `<line class="rp-grid" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`;
      const [lx, ly] = pt(i, 122); const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end';
      g += `<text class="ch-axl" x="${lx}" y="${ly + 4}" text-anchor="${anchor}">${esc(a)}</text>`;
    });
    [50, 100].forEach(r => { g += `<text class="rp-ax" x="${cx - 5}" y="${cy - R * r / 100 + 12}" text-anchor="end">${r}</text>`; });
    let polys = '', dots = '';
    series.forEach((s, k) => {
      const c = s.c || PAL[k]; const P = s.vals.map((v, i) => pt(i, Math.max(0, Math.min(100, v || 0))));
      polys += `<polygon points="${P.map(p => p.join(',')).join(' ')}" fill="${c}" fill-opacity="${series.length > 2 ? .06 : .12}" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>`;
      P.forEach((p, i) => {
        const ti = tip({ title: axes[i], rows: series.map((t, j) => ({ c: t.c || PAL[j], v: fmt(Math.round(t.vals[i] || 0)), n: t.name })) });
        dots += `<circle class="ch-dot" cx="${p[0]}" cy="${p[1]}" r="4.5" fill="${c}" data-ct="${ti}" tabindex="0" aria-label="${esc(s.name + ' · ' + axes[i] + ': ' + Math.round(s.vals[i] || 0))}"/>`;
      });
    });
    return `${series.length > 1 ? legend(series) : ''}<svg class="rp-svg ch-radar" viewBox="-40 -6 ${S + 80} ${S + 8}" role="img" aria-label="${esc(opts.aria || 'Biểu đồ thành phần')}">${g}${polys}${dots}</svg>`;
  }

  // ---------- Vành khuyên ----------
  // slices [{name, v, c, icon}]
  function donut(slices, opts = {}) {
    const tot = slices.reduce((a, s) => a + s.v, 0); const S = 160, c = S / 2, r = 62, w = 22;
    let a0 = -Math.PI / 2, arcs = '';
    slices.forEach((s, i) => {
      if (!s.v) return;
      const a1 = a0 + s.v / tot * Math.PI * 2; const big = a1 - a0 > Math.PI ? 1 : 0;
      const p = (a) => [c + Math.cos(a) * r, c + Math.sin(a) * r];
      const [x0, y0] = p(a0), [x1, y1] = p(a1 - (s.v === tot ? 0.0001 : 0));
      const ti = tip({ title: `${s.icon || ''} ${s.name}`, rows: [{ c: s.c, v: String(s.v), n: `học sinh (${Math.round(s.v / tot * 100)}%)` }] });
      arcs += `<path class="ch-arc" d="M${x0},${y0}A${r},${r} 0 ${big} 1 ${x1},${y1}" stroke="${s.c}" stroke-width="${w}" fill="none" data-ct="${ti}" tabindex="0"/>`;
      a0 = a1;
    });
    const list = `<ul class="ch-dleg">${slices.map(s => `<li><i style="background:${s.c}"></i><span>${s.icon || ''} ${esc(s.name)}</span><b>${s.v}</b><small>${tot ? Math.round(s.v / tot * 100) : 0}%</small></li>`).join('')}</ul>`;
    return `<div class="ch-donut"><svg viewBox="0 0 ${S} ${S}" role="img" aria-label="${esc(opts.aria || '')}">${tot ? arcs : `<circle cx="${c}" cy="${c}" r="${r}" stroke="var(--rp-grid)" stroke-width="${w}" fill="none"/>`}<text x="${c}" y="${c + 2}" text-anchor="middle" class="ch-dnum">${tot}</text><text x="${c}" y="${c + 20}" text-anchor="middle" class="rp-ax">${esc(opts.unit || '')}</text></svg>${list}</div>`;
  }

  // ---------- Thanh ghép cặp ----------
  // rows [{label, vals:[…], unit, best:'max'|'min'}], series [{name, c}]
  function pairs(rows, series, opts = {}) {
    const two = series.length === 2;
    return `${legend(series)}<div class="ch-pairs${opts.cols === 1 ? ' one' : ''}">${rows.map(r => {
      const max = Math.max(...r.vals.map(v => +v || 0), 0.0001); const u = r.unit || '';
      let delta = '';
      if (two && opts.delta !== false) {
        const d = Math.round(((+r.vals[0] || 0) - (+r.vals[1] || 0)) * 10) / 10; const good = r.best === 'min' ? d < 0 : d > 0;
        delta = `<span class="ch-delta ${d === 0 ? '' : good ? 'up' : 'down'}">${d === 0 ? '±0' : (d > 0 ? '▲ +' : '▼ ') + fmt(d)}</span>`;
      }
      const ti = tip({ title: r.label, rows: series.map((s, k) => ({ c: s.c || PAL[k], v: fmt(r.vals[k]) + u, n: s.name })) });
      return `<div class="ch-pair" data-ct="${ti}" tabindex="0"><div class="ch-ph"><span>${esc(r.label)}</span>${delta}</div>${r.vals.map((v, k) => `<div class="ch-pb"><span class="ch-track"><i style="width:${Math.max(1.5, (+v || 0) / max * 100).toFixed(1)}%;background:${(series[k] && series[k].c) || PAL[k]}"></i></span><b>${fmt(v)}${u}</b></div>`).join('')}</div>`;
    }).join('')}</div>`;
  }

  // ---------- Xếp hạng ----------
  // rows [{label, sub, v, c, badge, href}]
  function rank(rows, opts = {}) {
    const max = opts.max || 100;
    return `<div class="ch-rank">${rows.map((r, i) => {
      const ti = tip({ title: r.label, rows: [{ c: r.c, v: fmt(r.v) + (opts.unit || ''), n: opts.name || '' }].concat(r.extra || []) });
      return `<div class="ch-rrow" data-ct="${ti}" tabindex="0"><span class="ch-rn">${i + 1 + (opts.offset || 0)}</span><span class="ch-rl">${r.label}${r.sub ? ` <small>${r.sub}</small>` : ''}</span><span class="ch-track lg"><i style="width:${Math.max(1.5, r.v / max * 100).toFixed(1)}%;background:${r.c || PAL[0]}"></i></span><b>${fmt(r.v)}</b><span class="ch-rb">${r.badge || ''}</span></div>`;
    }).join('')}</div>`;
  }

  const table = (head, rows, summary) => `<details class="rp-data"><summary>📋 ${summary || 'Xem bảng số liệu'}</summary><div class="tbl-wrap"><table class="tbl small"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div></details>`;

  MA.Charts = { PAL, cols, radar, donut, pairs, rank, table, bind, hide };
})(window.MA);
