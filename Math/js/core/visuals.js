/* =========================================================
 * visuals.js — Thư viện hình minh họa trực quan (SVG/HTML)
 * Mọi câu hỏi, ví dụ, lời giải đều có thể kèm visual: { type, ...data }
 * Gọi: MA.Vis.render(visual) -> chuỗi HTML
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const C = { blue: '#4a7bd8', orange: '#f29f3d', green: '#2fa36b', red: '#e5534b', purple: '#8e6cd8', yellow: '#f6c343', teal: '#22a4b5', pink: '#e35d9b', ink: '#2b3445', soft: '#8792a6', paper: '#fffdf6', line: '#d7dce6' };
  const PAL = [C.blue, C.orange, C.green, C.purple, C.pink, C.teal, C.red, C.yellow];
  const fmt = (n) => MA.U.fmt(n);
  const svg = (w, h, body, cls = '') => `<svg class="vis-svg ${cls}" viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px" role="img" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 15}" fill="${o.fill || C.ink}" text-anchor="${o.anchor || 'middle'}" font-weight="${o.bold ? 800 : 600}" dominant-baseline="middle"${o.italic ? ' font-style="italic"' : ''}>${s}</text>`;

  // ---------------- 1. Đặt tính cột dọc (+, −, ×) có số nhớ ----------------
  function column(v) {
    const { op } = v; const a = Math.abs(v.a), b = Math.abs(v.b);
    let res, carries = [], partials = null;
    const A = String(a), B = String(b);
    if (op === '+') {
      res = a + b; let c = 0; const L = Math.max(A.length, B.length);
      for (let i = 0; i < L; i++) { const s = (+A[A.length - 1 - i] || 0) + (+B[B.length - 1 - i] || 0) + c; c = s >= 10 ? 1 : 0; carries[i + 1] = c ? 1 : 0; }
    } else if (op === '-') {
      res = a - b; let br = 0;
      for (let i = 0; i < A.length; i++) { const d = (+A[A.length - 1 - i]) - (+B[B.length - 1 - i] || 0) - br; br = d < 0 ? 1 : 0; carries[i + 1] = br; }
    } else { // ×
      res = a * b;
      if (B.length > 1) partials = B.split('').reverse().map((d, i) => a * (+d));
      else { let c = 0; for (let i = 0; i < A.length; i++) { const s = (+A[A.length - 1 - i]) * b + c; c = Math.floor(s / 10); carries[i + 1] = c; } }
    }
    const R = String(res);
    const strs = [A, B, R].concat(partials ? partials.map((p, i) => String(p) + ' '.repeat(i)) : []);
    const W = Math.max(...strs.map(r => r.length));
    const cell = (ch, cls = '') => `<span class="cc ${cls}">${ch === ' ' ? '&nbsp;' : ch}</span>`;
    const line = (s, sign, cls) => { let h = cell(sign || ' ', 'op'); for (let i = 0; i < W - s.length; i++) h += cell(' '); for (const ch of s) h += cell(ch, ch === ' ' ? '' : cls); return `<div class="crow">${h}</div>`; };
    let carryRow = '';
    if (!partials && carries.some(x => x)) {
      let h = cell(' '); for (let i = W - 1; i >= 0; i--) { const c = carries[i]; h += cell(c ? String(c) : ' ', 'carry'); }
      carryRow = `<div class="crow small">${h}</div>`;
    }
    const sign = { '+': '+', '-': '−', '×': '×' }[op];
    let body = carryRow + line(A) + line(B, sign) + '<div class="cbar"></div>';
    if (partials) { partials.forEach((p, i) => { body += line(String(p) + ' '.repeat(i), i === partials.length - 1 ? '+' : '', 'partial'); }); body += '<div class="cbar"></div>'; }
    body += line(R, '', 'res');
    const note = v.note ? `<div class="vis-note">${v.note}</div>` : (carryRow ? `<div class="vis-note"><span class="carry-dot">●</span> Số nhỏ màu đỏ là số <b>${op === '-' ? 'mượn (trả)' : 'nhớ'}</b> sang hàng bên trái</div>` : '');
    return `<div class="column-wrap"><div class="column">${body}</div>${note}</div>`;
  }

  // Lời giải từng bước cho phép tính cột
  function columnSteps(a, b, op) {
    const A = String(a), B = String(b), steps = [];
    const names = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn'];
    if (op === '+') {
      let c = 0; const L = Math.max(A.length, B.length);
      for (let i = 0; i < L; i++) {
        const x = +A[A.length - 1 - i] || 0, y = +B[B.length - 1 - i] || 0, s = x + y + c;
        steps.push(`Hàng ${names[i]}: ${x} + ${y}${c ? ' + 1 (nhớ)' : ''} = ${s}, viết <b>${s % 10}</b>${s >= 10 ? ', nhớ 1' : ''}.`);
        c = s >= 10 ? 1 : 0;
      }
      if (c) steps.push('Hạ 1 đã nhớ xuống hàng tiếp theo.');
      steps.push(`Vậy ${fmt(a)} + ${fmt(b)} = <b>${fmt(a + b)}</b>.`);
    } else if (op === '-') {
      let br = 0;
      for (let i = 0; i < A.length; i++) {
        const x = +A[A.length - 1 - i], y = (+B[B.length - 1 - i] || 0) + br;
        if (i >= B.length && !br) { steps.push(`Hàng ${names[i]}: hạ ${x}.`); continue; }
        if (x < y) { steps.push(`Hàng ${names[i]}: ${x} không trừ được ${y}${br ? ` (${y - 1} + 1 đã mượn)` : ''}, lấy ${x + 10} − ${y} = <b>${x + 10 - y}</b>, viết ${x + 10 - y}, nhớ 1.`); br = 1; }
        else { steps.push(`Hàng ${names[i]}: ${x} − ${y}${br ? ` (${y - 1} thêm 1 đã nhớ)` : ''} = <b>${x - y}</b>, viết ${x - y}.`); br = 0; }
      }
      steps.push(`Vậy ${fmt(a)} − ${fmt(b)} = <b>${fmt(a - b)}</b>. Thử lại: ${fmt(a - b)} + ${fmt(b)} = ${fmt(a)} ✔`);
    } else if (op === '×' && B.length === 1) {
      let c = 0;
      for (let i = 0; i < A.length; i++) {
        const x = +A[A.length - 1 - i], s = x * b + c;
        steps.push(`${b} × ${x} = ${x * b}${c ? `, thêm ${c} bằng ${s}` : ''}, viết <b>${s % 10}</b>${s >= 10 ? `, nhớ ${Math.floor(s / 10)}` : ''}.`);
        c = Math.floor(s / 10);
      }
      if (c) steps.push(`Viết ${c} (số nhớ cuối cùng).`);
      steps.push(`Vậy ${fmt(a)} × ${b} = <b>${fmt(a * b)}</b>.`);
    } else {
      B.split('').reverse().forEach((d, i) => steps.push(`Nhân ${fmt(a)} với ${d}${i ? ` (tích riêng thứ ${i + 1} viết lùi sang trái ${i} cột)` : ''} được ${fmt(a * d)}.`));
      steps.push(`Cộng các tích riêng: ${fmt(a)} × ${fmt(b)} = <b>${fmt(a * b)}</b>.`);
    }
    return steps;
  }

  // ---------------- 2. Phép chia (đặt tính kiểu Việt Nam) ----------------
  function division(v) {
    const { a, b } = v; const A = String(a); const rows = []; let cur = 0, q = '', started = false;
    for (let i = 0; i < A.length; i++) {
      cur = cur * 10 + (+A[i]);
      if (!started && cur < b && i < A.length - 1) continue;
      started = true; const d = Math.floor(cur / b); q += d;
      rows.push({ upTo: i, cur, prod: d * b, rem: cur - d * b }); cur = cur - d * b;
    }
    const place = (str, endIdx) => { const arr = Array(A.length).fill(' '); for (let i = 0; i < str.length; i++) { const p = endIdx - (str.length - 1 - i); if (p >= 0) arr[p] = str[i]; } return arr.map(c => c === ' ' ? '&nbsp;' : c).join(''); };
    let left = `<div class="dv-line">${A}</div>`;
    rows.forEach((r, k) => {
      const last = k === rows.length - 1;
      left += `<div class="dv-line dv-sub">${last ? place(String(r.rem), r.upTo) : place(String(r.rem) + A[r.upTo + 1], r.upTo + 1)}</div>`;
    });
    return `<div class="division"><div class="dv-left">${left}</div><div class="dv-right"><div class="dv-b">${b}</div><div class="dv-q">${q}</div></div></div>`;
  }
  function divisionSteps(a, b) {
    const A = String(a), st = []; let cur = 0, started = false;
    for (let i = 0; i < A.length; i++) {
      const prev = cur; cur = cur * 10 + (+A[i]);
      if (!started && cur < b && i < A.length - 1) continue;
      const first = !started; started = true;
      const d = Math.floor(cur / b);
      st.push(`${first ? '' : `Hạ ${A[i]} được ${cur}; `}${cur} chia ${b} được <b>${d}</b>, viết ${d}; ${d} nhân ${b} bằng ${d * b}; ${cur} trừ ${d * b} bằng ${cur - d * b}.`);
      cur = cur - d * b; void prev;
    }
    st.push(`Vậy ${fmt(a)} : ${b} = <b>${fmt(Math.floor(a / b))}</b>${a % b ? ` (dư ${a % b})` : ''}.`);
    return st;
  }

  // ---------------- 3. Bó que tính / khối chục – đơn vị ----------------
  function blocks(v) {
    const nums = v.nums || [v.n]; let x = 10, out = '', H = 120;
    nums.forEach((n, k) => {
      const h = Math.floor(n / 100), t = Math.floor(n % 100 / 10), u = n % 10;
      const x0 = x;
      for (let i = 0; i < h; i++) { out += `<rect x="${x}" y="20" width="56" height="56" rx="3" fill="${C.purple}" opacity=".85"/><path d="M${x} 20 ${'M' + x + ' ' + (20 + 5.6 * 0) }" />`; for (let g = 1; g < 10; g++) out += `<line x1="${x + g * 5.6}" y1="20" x2="${x + g * 5.6}" y2="76" stroke="#fff" stroke-width=".6"/><line x1="${x}" y1="${20 + g * 5.6}" x2="${x + 56}" y2="${20 + g * 5.6}" stroke="#fff" stroke-width=".6"/>`; x += 62; }
      for (let i = 0; i < t; i++) { out += `<rect x="${x}" y="16" width="9" height="66" rx="2" fill="${C.orange}"/><rect x="${x - 1}" y="45" width="11" height="6" rx="2" fill="${C.red}"/>`; x += 13; }
      if (t) x += 6;
      for (let i = 0; i < u; i++) { out += `<rect x="${x}" y="${16 + (i % 2) * 0}" width="5" height="66" rx="2" fill="${C.yellow}" stroke="#d29a00" stroke-width=".6"/>`; x += 9; }
      out += T((x0 + x) / 2, 100, `${n}${h ? ` = ${h} trăm ${t} chục ${u} đơn vị` : ` = ${t} chục ${u} đơn vị`}`, { size: 13, fill: C.soft });
      if (k < nums.length - 1) { x += 14; out += T(x, 50, v.op || '+', { size: 26, bold: true }); x += 24; }
    });
    return svg(Math.max(x + 10, 200), H, out) + `<div class="vis-note">🟧 1 bó = 1 chục que · 🟨 que rời = đơn vị${nums.some(n => n >= 100) ? ' · 🟪 1 tấm = 1 trăm' : ''}</div>`;
  }

  // ---------------- 4. Sơ đồ đoạn thẳng (Bar model) ----------------
  // rows: [{label, segs:[{v, text, color, dashed, q}]}], total: {text}, right: {text, rows:[i,j]}
  function bar(v) {
    const rows = v.rows; const max = Math.max(...rows.map(r => r.segs.reduce((s, x) => s + x.v, 0)));
    const LW = 92, W = 420, unit = (W - LW - 70) / max, RH = 30, gap = 46;
    let out = '', y = 24;
    rows.forEach((r, ri) => {
      let x = LW;
      out += T(LW - 10, y + RH / 2, r.label, { anchor: 'end', size: 14, bold: true });
      r.segs.forEach((s, si) => {
        const w = s.v * unit, col = s.color || PAL[(ri + si) % PAL.length];
        out += `<rect x="${x}" y="${y}" width="${w}" height="${RH}" rx="4" fill="${s.dashed ? 'none' : col}" fill-opacity="${s.dashed ? 0 : .88}" stroke="${s.dashed ? col : '#fff'}" stroke-width="${s.dashed ? 2 : 1.5}" ${s.dashed ? 'stroke-dasharray="6 4"' : ''}/>`;
        if (s.inner) out += T(x + w / 2, y + RH / 2, s.inner, { size: 13, fill: s.dashed ? col : '#fff', bold: true });
        if (s.text) { // ngoặc nhọn phía trên/dưới đoạn
          const top = s.pos !== 'bottom'; const by = top ? y - 4 : y + RH + 4, d = top ? -7 : 7;
          out += `<path d="M${x + 2} ${by} q0 ${d} 6 ${d} L${x + w / 2 - 5} ${by + d} l5 ${d} l5 ${-d} L${x + w - 8} ${by + d} q6 0 6 ${-d}" fill="none" stroke="${s.q ? C.red : C.soft}" stroke-width="1.6"/>`;
          out += T(x + w / 2, by + d * 2.4, s.text, { size: 13, fill: s.q ? C.red : C.ink, bold: !!s.q });
        }
        x += w;
      });
      y += RH + gap;
    });
    if (v.right) { // ngoặc tổng bên phải gộp các hàng
      const xs = LW + max * unit + 10, y1 = 24, y2 = 24 + (rows.length - 1) * (RH + gap) + RH;
      out += `<path d="M${xs} ${y1} q8 0 8 8 L${xs + 8} ${(y1 + y2) / 2 - 6} l7 6 l-7 6 L${xs + 8} ${y2 - 8} q0 8 -8 8" fill="none" stroke="${v.right.q ? C.red : C.soft}" stroke-width="1.8"/>`;
      out += T(xs + 18, (y1 + y2) / 2, v.right.text, { anchor: 'start', size: 13, fill: v.right.q ? C.red : C.ink, bold: true });
    }
    return svg(W + 40, y - gap + 30, out);
  }

  // ---------------- 5. Cân đĩa thăng bằng ----------------
  function balance(v) {
    const box = (x, items, color) => items.map((it, i) => {
      const w = Math.max(34, String(it).length * 11 + 14), xx = x - (items.length * 44) / 2 + i * 44 + 22 - w / 2;
      const isX = /[xXy?]/.test(String(it)) && String(it).length <= 3;
      return `<rect x="${xx}" y="${58 - 30}" width="${w}" height="28" rx="6" fill="${isX ? C.red : color}"/>` + T(xx + w / 2, 58 - 16, it, { size: 14, fill: '#fff', bold: true });
    }).join('');
    const out = `<line x1="60" y1="60" x2="300" y2="60" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
      <line x1="180" y1="60" x2="180" y2="128" stroke="${C.ink}" stroke-width="5"/><path d="M150 132 h60 l-10 -10 h-40z" fill="${C.ink}"/>
      <circle cx="180" cy="58" r="6" fill="${C.yellow}" stroke="${C.ink}" stroke-width="2"/>
      <path d="M70 60 l-10 26 h80 l-10 -26" fill="none" stroke="${C.soft}" stroke-width="1.5"/><path d="M60 86 h80 q-4 10 -40 10 q-36 0 -40 -10z" fill="${C.line}"/>
      <path d="M230 60 l-10 26 h80 l-10 -26" fill="none" stroke="${C.soft}" stroke-width="1.5"/><path d="M220 86 h80 q-4 10 -40 10 q-36 0 -40 -10z" fill="${C.line}"/>
      ${box(100, v.left, C.blue)}${box(260, v.right, C.green)}
      ${T(180, 150, v.caption || 'Hai bên cân nặng bằng nhau', { size: 12, fill: C.soft })}`;
    return svg(360, 160, out);
  }

  // ---------------- 6. Trục số (số nguyên, dãy số, bước nhảy) ----------------
  function numberline(v) {
    const { min, max } = v; const step = v.step || 1; const W = 520, L = 30, Rr = W - 30;
    const X = (n) => L + (n - min) / (max - min) * (Rr - L);
    let out = `<line x1="${L - 10}" y1="80" x2="${Rr + 14}" y2="80" stroke="${C.ink}" stroke-width="2"/><path d="M${Rr + 14} 80 l-8 -5 v10z" fill="${C.ink}"/>`;
    const every = Math.max(1, Math.ceil((max - min) / step / 20));
    for (let n = min, k = 0; n <= max + 1e-9; n += step, k++) {
      const hl = (v.highlight || []).includes(n);
      out += `<line x1="${X(n)}" y1="74" x2="${X(n)}" y2="86" stroke="${C.ink}" stroke-width="${n === 0 ? 2.5 : 1.3}"/>`;
      if (k % every === 0 || hl || n === 0) out += T(X(n), 102, (v.hide || []).includes(n) ? '?' : fmt(+n.toFixed(4)), { size: 12, fill: hl ? C.red : (n < 0 ? C.blue : C.ink), bold: hl || n === 0 });
    }
    (v.jumps || []).forEach((j, i) => {
      const x1 = X(j.from), x2 = X(j.to), h = 22 + (i % 2) * 8, col = j.color || PAL[i % PAL.length];
      out += `<path d="M${x1} 72 Q${(x1 + x2) / 2} ${72 - h * 2} ${x2} 72" fill="none" stroke="${col}" stroke-width="2.2"/><path d="M${x2} 72 l${x2 > x1 ? -7 : 7} -6 l${x2 > x1 ? 1 : -1} 8z" fill="${col}"/>`;
      out += T((x1 + x2) / 2, 72 - h - 8, j.label, { size: 12, fill: col, bold: true });
    });
    (v.points || []).forEach(p => { out += `<circle cx="${X(p.v)}" cy="80" r="6" fill="${p.color || C.red}"/>` + (p.label ? T(X(p.v), 120, p.label, { size: 12, fill: p.color || C.red, bold: true }) : ''); });
    return svg(W + 10, 130, out);
  }

  // ---------------- 7. Phân số (hình tròn / thanh) ----------------
  function fraction(v) {
    const items = v.items || [{ n: v.n, d: v.d, label: v.label }];
    let out = '', x = 10; const shape = v.shape || 'circle';
    items.forEach((it, k) => {
      const col = PAL[k % PAL.length];
      if (shape === 'circle') {
        const r = 46, cx = x + r, cy = 56;
        const wholes = Math.max(1, Math.ceil(it.n / it.d));
        for (let w = 0; w < wholes; w++) {
          const ccx = cx + w * (2 * r + 10);
          for (let i = 0; i < it.d; i++) {
            const a1 = (i / it.d) * 2 * Math.PI - Math.PI / 2, a2 = ((i + 1) / it.d) * 2 * Math.PI - Math.PI / 2;
            const filled = w * it.d + i < it.n;
            const p = it.d === 1 ? `<circle cx="${ccx}" cy="${cy}" r="${r}"` : `<path d="M${ccx} ${cy} L${ccx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A${r} ${r} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${ccx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)}Z"`;
            out += `${p} fill="${filled ? col : '#fff'}" stroke="${C.ink}" stroke-width="1.3"/>`;
          }
        }
        const w = wholes * (2 * r + 10);
        out += T(x + w / 2 - 5, 122, it.label || `${it.n}/${it.d}`, { size: 15, bold: true, fill: col });
        x += w + 18;
      } else {
        const W = 260, H = 30; const wholes = Math.max(1, Math.ceil(it.n / it.d));
        const y = 10 + k * 52;
        for (let i = 0; i < it.d * wholes; i++) out += `<rect x="${110 + i * W / it.d}" y="${y}" width="${W / it.d}" height="${H}" fill="${i < it.n ? col : '#fff'}" stroke="${C.ink}" stroke-width="1.2"/>`;
        out += T(100, y + H / 2, it.label || `${it.n}/${it.d}`, { anchor: 'end', size: 15, bold: true, fill: col });
        x = Math.max(x, 120 + W * wholes);
      }
    });
    const h = shape === 'circle' ? 135 : items.length * 52 + 10;
    return svg(Math.max(x, 160), h, out);
  }

  // ---------------- 8. Đồng hồ ----------------
  function clock(v) {
    const cx = 80, cy = 80, r = 66; let out = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="4"/>`;
    for (let i = 1; i <= 12; i++) { const a = i / 12 * 2 * Math.PI - Math.PI / 2; out += T(cx + 52 * Math.cos(a), cy + 52 * Math.sin(a), i, { size: 14, bold: true }); }
    for (let i = 0; i < 60; i++) { const a = i / 60 * 2 * Math.PI; const r1 = i % 5 ? 62 : 59; out += `<line x1="${cx + r1 * Math.sin(a)}" y1="${cy - r1 * Math.cos(a)}" x2="${cx + 65 * Math.sin(a)}" y2="${cy - 65 * Math.cos(a)}" stroke="${C.soft}" stroke-width="${i % 5 ? .8 : 2}"/>`; }
    const ha = ((v.h % 12) + v.m / 60) / 12 * 2 * Math.PI, ma = v.m / 60 * 2 * Math.PI;
    out += `<line x1="${cx}" y1="${cy}" x2="${cx + 34 * Math.sin(ha)}" y2="${cy - 34 * Math.cos(ha)}" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
    out += `<line x1="${cx}" y1="${cy}" x2="${cx + 50 * Math.sin(ma)}" y2="${cy - 50 * Math.cos(ma)}" stroke="${C.red}" stroke-width="3.5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="5" fill="${C.ink}"/>`;
    return svg(160, 162, out) + '<div class="vis-note">Kim ngắn chỉ giờ · <span style="color:#e5534b">kim dài</span> chỉ phút</div>';
  }

  // ---------------- 9. Hình học phẳng ----------------
  // Nếu đề có số đo cụ thể → vẽ đúng tỉ lệ bằng geo (G.*); không có số → hình mẫu cũ
  function shapeGeo(v) {
    const k = v.kind, lb = v.labels || {}; const ok = (...a) => a.every(x => x > 0 && isFinite(x));
    const cap = v.caption;
    if (k === 'polyline') {
      let lens = v.lens || v.segs.map(num); const known = lens.filter(x => x > 0); const avg = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 1;
      lens = lens.map(x => x > 0 ? x : avg);
      return G.zigzag(lens, { labels: v.segs, names: v.names, start: v.start, end: v.end, caption: cap, noLabels: v.noLabels });
    }
    if (k === 'tri') {
      const names = v.vnames, base = num(lb.b), h = num(v.height);
      if (v.height && ok(base, h)) return Object.assign(G.triBH(base, h, { baseLabel: lb.b, hLabel: v.height, names, noNames: !names }), { caption: cap });
      const a = num(lb.a), b = num(lb.b), c = num(lb.c);
      if (ok(a, b, c) && a + b > c && a + c > b && b + c > a) return Object.assign(G.triSSS(a, b, c, { names, noNames: !names, labels: { AB: lb.a, BC: lb.b, CA: lb.c } }), { caption: cap });
      return null;
    }
    if (k === 'rect') { const w = num(lb.top != null ? lb.top : lb.bottom), h = num(lb.left != null ? lb.left : lb.right); if (ok(w, h)) return G.rect(w, h, { labels: lb, names: v.vnames, caption: cap, marks: v.marks, inside: v.inside }); return null; }
    if (k === 'square') { const a = num(lb.top); if (ok(a)) return G.square(a, { label: lb.top, names: v.vnames, caption: cap, marks: v.marks, inside: v.inside }); return null; }
    if (k === 'para') {
      const b = num(lb.bottom), h = num(v.height), sd = num(lb.left);
      if (ok(b, h)) return G.para(b, h, { labels: lb, hLabel: v.height, names: v.vnames, caption: cap });
      if (ok(b, sd)) return G.para(b, sd * 0.82, { side: sd, labels: lb, names: v.vnames, caption: cap });
      return null;
    }
    if (k === 'trap') { const a = num(lb.top), b = num(lb.bottom), h = num(v.height); if (ok(a, b, h)) return G.trap(a, b, h, { labels: lb, hLabel: v.height, names: v.vnames, caption: cap, vuong: v.vuong }); return null; }
    if (k === 'rhombus') {
      if (v.diag) { const d1 = num(v.diag[0]), d2 = num(v.diag[1]); if (ok(d1, d2)) return G.rhombus(d1, d2, { diag: v.diag, names: v.vnames, caption: cap }); }
      if (lb.a != null) return G.rhombus(1.25, 1, { side: lb.a, names: v.vnames, caption: cap });
      return null;
    }
    if ((k === 'eqtri' || k === 'hexagon') && (lb.a != null || v.split)) {
      const g = G.regular(k === 'eqtri' ? 3 : 6, { label: lb.a, fill: k === 'eqtri' ? 'rgba(46,163,107,.16)' : undefined, maxW: 180, maxH: 160, caption: cap });
      if (v.split) { g.P._O = [0, 0]; g.lines = g.lines.concat(Object.keys(g.P).filter(q => /^_\d/.test(q)).map(q => ({ a: '_O', b: q, dash: true, col: C.purple, w: 1.5 }))); }
      return g;
    }
    if (k === 'circle' && (v.dLabel != null || v.rLabel != null)) {
      const P = { O: [0, 0], _A: [-1, 0], _B: [1, 0], _R: [Math.cos(-0.9), Math.sin(-0.9)] };
      const g = { type: 'geo', P, circles: [{ c: 'O', r: 1 }], lines: [], dots: ['O'], show: ['O'], lp: { O: v.dLabel != null ? 'nw' : 's' }, maxW: 150, maxH: 150, caption: cap };
      if (v.dLabel != null) { P._A = [-1, 0]; P._B = [1, 0]; g.lines.push({ a: '_A', b: '_B', col: C.green, w: 2.2, t: v.dLabel, side: -1, off: 26, tcol: C.green }); g.show.push('_A', '_B'); g.names = { _A: v.ends ? v.ends[0] : 'A', _B: v.ends ? v.ends[1] : 'B' }; g.lp._A = 'w'; g.lp._B = 'e'; g.dots.push('_A', '_B'); }
      if (v.rLabel != null) g.lines.push({ a: 'O', b: '_R', col: C.red, w: 2.2, t: v.rLabel, side: 1, off: 14 });
      return g;
    }
    return null;
  }
  function shape(v) {
    const pg = shapeGeo(v); if (pg) return geo(pg);
    const k = v.kind, lb = v.labels || {}; let out = '', W = 300, H = 190;
    const poly = (pts, fill) => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill || 'rgba(74,123,216,.14)'}" stroke="${C.blue}" stroke-width="2.5" stroke-linejoin="round"/>`;
    const side = (p, q, text, off = 14) => { if (!text) return ''; const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; const dx = q[1] - p[1], dy = p[0] - q[0]; const L = Math.hypot(dx, dy) || 1; return T(mx + dx / L * off, my + dy / L * off, text, { size: 14, bold: true, fill: C.red }); };
    const verts = (pts, names) => names ? pts.map((p, i) => { const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length, cy = pts.reduce((s, q) => s + q[1], 0) / pts.length; const dx = p[0] - cx, dy = p[1] - cy, L = Math.hypot(dx, dy) || 1; return T(p[0] + dx / L * 14, p[1] + dy / L * 14, names[i], { size: 14, bold: true }); }).join('') : '';
    let pts;
    switch (k) {
      case 'rect': case 'square': { const w = k === 'square' ? 130 : 200, h = k === 'square' ? 130 : 110; const x = (W - w) / 2, y = 30; pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; out += poly(pts) + side(pts[0], pts[1], lb.top, -14) + side(pts[1], pts[2], lb.right, -18) + side(pts[3], pts[0], lb.left, -18) + side(pts[2], pts[3], lb.bottom, -14); [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].forEach((p, i) => { const sx = i === 0 || i === 3 ? 1 : -1, sy = i < 2 ? 1 : -1; out += `<path d="M${p[0] + sx * 10} ${p[1]} v${sy * 10} h${-sx * 10}" fill="none" stroke="${C.soft}" stroke-width="1.2"/>`; }); H = h + 70; break; }
      case 'tri': { pts = v.pts || [[150, 22], [260, 160], [40, 160]]; out += poly(pts, 'rgba(242,159,61,.18)') + side(pts[0], pts[1], lb.a, -16) + side(pts[1], pts[2], lb.b, -16) + side(pts[2], pts[0], lb.c, -16); if (v.height) out += `<line x1="${pts[0][0]}" y1="${pts[0][1]}" x2="${pts[0][0]}" y2="160" stroke="${C.red}" stroke-dasharray="5 4" stroke-width="2"/>` + T(pts[0][0] + 14, 100, v.height, { size: 14, fill: C.red, bold: true, anchor: 'start' }); break; }
      case 'eqtri': { pts = [[150, 20], [235, 167], [65, 167]]; out += poly(pts, 'rgba(46,163,107,.16)') + side(pts[0], pts[1], lb.a, -16) + side(pts[1], pts[2], lb.b, -16) + side(pts[2], pts[0], lb.c, -16); break; }
      case 'hexagon': { pts = []; for (let i = 0; i < 6; i++) { const a = i / 6 * 2 * Math.PI - Math.PI / 6; pts.push([150 + 78 * Math.cos(a), 95 + 78 * Math.sin(a)]); } out += poly(pts, 'rgba(142,108,216,.16)') + side(pts[4], pts[5], lb.a, -16); if (v.split) for (let i = 0; i < 6; i++) out += `<line x1="150" y1="95" x2="${pts[i][0]}" y2="${pts[i][1]}" stroke="${C.purple}" stroke-dasharray="4 4"/>`; H = 190; break; }
      case 'para': { pts = [[90, 35], [270, 35], [210, 145], [30, 145]]; out += poly(pts) + side(pts[0], pts[1], lb.top, -14) + side(pts[2], pts[3], lb.bottom, -14) + side(pts[3], pts[0], lb.left, -16); if (v.height) out += `<line x1="90" y1="35" x2="90" y2="145" stroke="${C.red}" stroke-dasharray="5 4" stroke-width="2"/>` + T(100, 95, v.height, { size: 14, fill: C.red, bold: true, anchor: 'start' }); break; }
      case 'rhombus': { pts = [[150, 15], [250, 95], [150, 175], [50, 95]]; out += poly(pts, 'rgba(227,93,155,.14)'); if (v.diag) { out += `<line x1="150" y1="15" x2="150" y2="175" stroke="${C.red}" stroke-dasharray="5 4" stroke-width="2"/><line x1="50" y1="95" x2="250" y2="95" stroke="${C.green}" stroke-dasharray="5 4" stroke-width="2"/>` + T(162, 55, v.diag[0], { size: 14, fill: C.red, bold: true, anchor: 'start' }) + T(205, 84, v.diag[1], { size: 14, fill: C.green, bold: true }); } out += side(pts[0], pts[1], lb.a, -16); H = 190; break; }
      case 'trap': { pts = [[95, 35], [205, 35], [265, 145], [35, 145]]; out += poly(pts, 'rgba(34,164,181,.16)') + side(pts[0], pts[1], lb.top, -14) + side(pts[2], pts[3], lb.bottom, -14) + side(pts[3], pts[0], lb.left, -16) + side(pts[1], pts[2], lb.right, -16); if (v.height) out += `<line x1="95" y1="35" x2="95" y2="145" stroke="${C.red}" stroke-dasharray="5 4" stroke-width="2"/>` + T(105, 95, v.height, { size: 14, fill: C.red, bold: true, anchor: 'start' }); break; }
      case 'circle': { out += `<circle cx="150" cy="95" r="72" fill="rgba(74,123,216,.12)" stroke="${C.blue}" stroke-width="2.5"/><circle cx="150" cy="95" r="3" fill="${C.ink}"/><line x1="150" y1="95" x2="222" y2="95" stroke="${C.red}" stroke-width="2"/>` + T(186, 84, lb.r || 'r', { size: 14, fill: C.red, bold: true }); break; }
      case 'polyline': { // đường gấp khúc
        const segs = v.segs; const n = segs.length; let x = 30, y = 150; pts = [[x, y]];
        segs.forEach((s, i) => { x += (W - 60) / n; y = i % 2 === 0 ? 50 : 150; pts.push([x, y]); });
        out += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="3" stroke-linejoin="round"/>`;
        pts.forEach((p, i) => { out += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${C.ink}"/>` + T(p[0], p[1] + (p[1] > 100 ? 18 : -16), 'ABCDEFG'[i], { size: 13, bold: true }); });
        segs.forEach((s, i) => { out += side(pts[i], pts[i + 1], s, i % 2 ? 18 : -18); });
        break;
      }
      case 'segment': { // đoạn thẳng, trung điểm
        const pts2 = v.points || [{ x: 40, n: 'A' }, { x: 260, n: 'B' }];
        out += `<line x1="${pts2[0].x}" y1="90" x2="${pts2[pts2.length - 1].x}" y2="90" stroke="${C.blue}" stroke-width="3"/>`;
        pts2.forEach(p => { out += `<circle cx="${p.x}" cy="90" r="5" fill="${p.c || C.ink}"/>` + T(p.x, 70, p.n, { size: 15, bold: true, fill: p.c || C.ink }); });
        (v.lens || []).forEach(l => { out += T((l.a + l.b) / 2, 115, l.t, { size: 13, fill: C.red, bold: true }); });
        H = 140; break;
      }
    }
    if (pts && v.vnames) out += verts(pts, v.vnames);
    if (v.caption) out += T(W / 2, H - 8, v.caption, { size: 12, fill: C.soft });
    return svg(W, H, out);
  }

  // ---------------- 10. Trồng cây trên đường ----------------
  function trees(v) {
    const n = v.gaps; const W = Math.min(560, 70 + n * 60); let out = `<line x1="20" y1="80" x2="${W - 20}" y2="80" stroke="${C.soft}" stroke-width="3"/>`;
    const ends = v.ends || 'both'; const step = (W - 60) / n;
    for (let i = 0; i <= n; i++) {
      const x = 30 + i * step; const has = ends === 'both' || (ends === 'one' && i > 0) || (ends === 'none' && i > 0 && i < n);
      out += has ? T(x, 56, '🌳', { size: 28 }) : `<circle cx="${x}" cy="80" r="4" fill="${C.soft}"/>`;
      if (i < n) out += T(x + step / 2, 98, v.label || '', { size: 11, fill: C.red, bold: true });
    }
    out += T(W / 2, 120, `${n} khoảng cách`, { size: 12, fill: C.soft });
    return svg(W, 130, out);
  }

  // ---------------- 11. Mảng / nhóm đồ vật (nhân, chia) ----------------
  function array(v) {
    const { rows, cols } = v; const icon = v.icon || '●'; const s = Math.min(34, 360 / cols);
    let out = '';
    for (let r = 0; r < rows; r++) {
      out += `<rect x="6" y="${8 + r * (s + 8) - 3}" width="${cols * s + 8}" height="${s + 6}" rx="8" fill="none" stroke="${PAL[r % PAL.length]}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
      for (let c = 0; c < cols; c++) out += T(10 + c * s + s / 2, 8 + r * (s + 8) + s / 2, icon, { size: s * 0.72 });
    }
    const H = rows * (s + 8) + 34;
    out += T((cols * s + 16) / 2, H - 12, v.caption || `${rows} nhóm, mỗi nhóm ${cols}: ${rows} × ${cols} = ${rows * cols}`, { size: 13, fill: C.soft });
    return svg(Math.max(cols * s + 20, 260), H, out);
  }

  // ---------------- 12. Đếm đồ vật / tranh ----------------
  function objects(v) {
    return `<div class="objects">${v.groups.map(g => `<div class="obj-group"><div class="obj-icons">${(g.icon || '🍎').repeat(Math.min(g.count, 40))}</div>${g.label ? `<div class="obj-label">${g.label}</div>` : ''}</div>`).join(v.op ? `<div class="obj-op">${v.op}</div>` : '')}</div>`;
  }

  // ---------------- 13. Sơ đồ cây phân tích thừa số nguyên tố ----------------
  function factorTree(v) {
    let n = v.n; const levels = []; let d = 2;
    while (n > 1 && !MA.U.isPrime(n)) { while (n % d) d++; levels.push([n, d]); n = n / d; }
    let out = ''; const dy = 46; let x = 160, y = 24;
    levels.forEach(([m, p], i) => {
      out += `<circle cx="${x}" cy="${y}" r="18" fill="#fff" stroke="${C.blue}" stroke-width="2"/>` + T(x, y, m, { size: 13, bold: true });
      out += `<line x1="${x - 8}" y1="${y + 16}" x2="${x - 38}" y2="${y + dy - 16}" stroke="${C.soft}" stroke-width="1.6"/><line x1="${x + 8}" y1="${y + 16}" x2="${x + 38}" y2="${y + dy - 16}" stroke="${C.soft}" stroke-width="1.6"/>`;
      out += `<circle cx="${x - 44}" cy="${y + dy}" r="16" fill="${C.green}"/>` + T(x - 44, y + dy, p, { size: 13, bold: true, fill: '#fff' });
      x += 44; y += dy;
    });
    out += `<circle cx="${x}" cy="${y}" r="16" fill="${C.green}"/>` + T(x, y, n, { size: 13, bold: true, fill: '#fff' });
    out += T(160, y + 34, `${v.n} = ${MA.U.factorize(v.n).join(' · ')}`, { size: 14, bold: true, fill: C.ink });
    return svg(Math.max(320, x + 40), y + 50, out) + '<div class="vis-note">🟢 Vòng xanh là số nguyên tố (không tách được nữa)</div>';
  }

  // ---------------- 14. Biểu đồ cột / tranh ----------------
  function barchart(v) {
    const d = v.data; const max = Math.max(...d.map(x => x.value)); const W = Math.max(300, d.length * 70 + 60), H = 210;
    const top = Math.ceil(max / (v.tick || 5)) * (v.tick || 5) || 1;
    let out = `<line x1="40" y1="20" x2="40" y2="170" stroke="${C.ink}"/><line x1="40" y1="170" x2="${W - 10}" y2="170" stroke="${C.ink}"/>`;
    for (let t = 0; t <= top; t += (v.tick || 5)) { const y = 170 - t / top * 140; out += `<line x1="36" y1="${y}" x2="${W - 10}" y2="${y}" stroke="${C.line}" stroke-dasharray="3 3"/>` + T(30, y, t, { size: 11, anchor: 'end', fill: C.soft }); }
    d.forEach((x, i) => { const h = x.value / top * 140, bx = 60 + i * 70; out += `<rect x="${bx}" y="${170 - h}" width="40" height="${h}" rx="3" fill="${PAL[i % PAL.length]}"/>` + T(bx + 20, 162 - h, x.hide ? '?' : x.value, { size: 12, bold: true }) + T(bx + 20, 186, x.label, { size: 12 }); });
    if (v.unit) out += T(44, 10, v.unit, { size: 11, anchor: 'start', fill: C.soft });
    return svg(W, H, out);
  }
  function pictograph(v) {
    return `<table class="picto">${v.data.map(r => `<tr><th>${r.label}</th><td>${(v.icon || '⭐').repeat(r.value / (v.per || 1))}</td></tr>`).join('')}</table><div class="vis-note">Mỗi ${v.icon || '⭐'} = ${v.per || 1} ${v.unit || ''}</div>`;
  }

  // ---------------- 15. Góc ----------------
  function angle(v) {
    const g = G.angle(v.deg, { o: v.o, x: v.x, y: v.y, label: v.label });
    if (Math.abs(v.deg - 90) < 1e-6 && v.label !== '') { g.texts = [{ at: [0.32, -0.32], t: v.label || '90°', col: C.red, size: 13 }]; }
    return geo(g);
  }

  // ---------------- 16. Thước đo độ dài ----------------
  function ruler(v) {
    const len = v.max || 15, u = 28; let out = `<rect x="10" y="60" width="${len * u + 20}" height="44" rx="4" fill="#ffe9a8" stroke="#d1a63a"/>`;
    for (let i = 0; i <= len * 2; i++) { const x = 20 + i * u / 2; out += `<line x1="${x}" y1="60" x2="${x}" y2="${i % 2 ? 70 : 78}" stroke="${C.ink}" stroke-width="1"/>`; if (i % 2 === 0) out += T(x, 92, i / 2, { size: 11 }); }
    const from = v.from || 0, to = v.to;
    out += `<rect x="${20 + from * u}" y="30" width="${(to - from) * u}" height="18" rx="9" fill="${v.color || C.orange}"/>` + T(20 + (from + to) / 2 * u, 22, v.label || '', { size: 12, bold: true });
    return svg(len * u + 40, 110, out);
  }

  // ---------------- 17. Tiền Việt Nam ----------------
  function money(v) {
    const col = { 1000: '#c7b28a', 2000: '#b8a07a', 5000: '#5aa1c8', 10000: '#c9a24c', 20000: '#5b8ad6', 50000: '#d1689a', 100000: '#4f9e5d', 200000: '#c46e4b', 500000: '#3fa3b5', 500: '#c0c0c0', 200: '#c9a24c' };
    return `<div class="money">${v.notes.map(n => `<span class="note" style="background:${col[n] || '#9ab'}">${fmt(n)}<small>đồng</small></span>`).join('')}</div>`;
  }

  // ---------------- 18. Dãy số / chuỗi phép tính (tính ngược) ----------------
  function chain(v) {
    // items: ['?', '+25', 30, '−14', 41]
    return `<div class="chain">${v.items.map((it, i) => i % 2 === 0 ? `<span class="ch-box ${it === '?' ? 'q' : ''}">${it}</span>` : `<span class="ch-arrow"><small>${it}</small>→</span>`).join('')}</div>` + (v.back ? `<div class="chain back">${v.back.map((it, i) => i % 2 === 0 ? `<span class="ch-box ${i === v.back.length - 1 ? 'ans' : ''}">${it}</span>` : `<span class="ch-arrow"><small>${it}</small>→</span>`).join('')}</div><div class="vis-note">Hàng dưới: đi ngược từ cuối về đầu, đổi + thành −, × thành :</div>` : '');
  }
  function sequence(v) {
    return `<div class="seq">${v.items.map((x, i) => `<span class="seq-box ${x === '?' ? 'q' : ''}">${x}</span>${i < v.items.length - 1 ? `<span class="seq-step">${v.steps ? (v.steps[i] || '') : ''}</span>` : ''}`).join('')}</div>`;
  }

  // ---------------- 19. Biểu đồ Ven (ước chung, bội chung) ----------------
  function venn(v) {
    const out = `<circle cx="125" cy="95" r="80" fill="rgba(74,123,216,.13)" stroke="${C.blue}" stroke-width="2"/><circle cx="235" cy="95" r="80" fill="rgba(242,159,61,.15)" stroke="${C.orange}" stroke-width="2"/>`
      + T(105, 12, v.A.label, { size: 13, bold: true, fill: C.blue }) + T(255, 12, v.B.label, { size: 13, bold: true, fill: C.orange })
      + wrap(v.A.items, 85, 95) + wrap(v.B.items, 275, 95) + wrap(v.both, 180, 95, C.red);
    function wrap(arr, x, y, fill) { const lines = []; for (let i = 0; i < arr.length; i += 3) lines.push(arr.slice(i, i + 3).join(', ')); return lines.map((l, i) => T(x, y + (i - (lines.length - 1) / 2) * 18, l, { size: 13, bold: !!fill, fill: fill || C.ink })).join(''); }
    return svg(360, 185, out) + (v.note ? `<div class="vis-note">${v.note}</div>` : '');
  }

  // ---------------- 20. Lưới ô vuông (diện tích) ----------------
  function grid(v) {
    const s = 26; let out = '';
    for (let r = 0; r < v.h; r++) for (let c = 0; c < v.w; c++) out += `<rect x="${20 + c * s}" y="${16 + r * s}" width="${s}" height="${s}" fill="${(v.fill === undefined || r * v.w + c < v.fill) ? 'rgba(46,163,107,.25)' : '#fff'}" stroke="${C.green}"/>`;
    out += T(20 + v.w * s / 2, 30 + v.h * s, v.caption || `${v.w} × ${v.h} = ${v.w * v.h} ô vuông`, { size: 13, fill: C.soft });
    return svg(v.w * s + 40, v.h * s + 44, out);
  }

  // ---------------- 21. Bình nước / Lít ----------------
  function jugs(v) {
    let out = '', x = 20;
    v.items.forEach((it, i) => {
      const h = 90, fill = Math.min(1, it.l / (v.max || Math.max(...v.items.map(t => t.l))));
      out += `<path d="M${x} 20 h50 v${h} q0 10 -10 10 h-30 q-10 0 -10 -10z" fill="#fff" stroke="${C.ink}" stroke-width="2"/>`;
      out += `<rect x="${x + 2}" y="${20 + h * (1 - fill) + 2}" width="46" height="${h * fill + 6}" fill="${PAL[i % PAL.length]}" opacity=".7"/>`;
      out += T(x + 25, 140, it.label || `${it.l} l`, { size: 13, bold: true });
      x += 80;
    });
    return svg(x, 155, out);
  }

  // ---------------- 22. Chuyển động (quãng đường) ----------------
  function motion(v) {
    const out = `<line x1="30" y1="70" x2="470" y2="70" stroke="${C.ink}" stroke-width="2"/><circle cx="30" cy="70" r="5" fill="${C.ink}"/><circle cx="470" cy="70" r="5" fill="${C.ink}"/>`
      + T(30, 92, v.A || 'A', { bold: true }) + T(470, 92, v.B || 'B', { bold: true }) + T(250, 92, v.dist || '', { size: 13, fill: C.red, bold: true })
      + T(60, 50, v.icon1 || '🚗', { size: 26 }) + (v.v1 ? T(110, 40, v.v1, { size: 12, fill: C.blue, bold: true }) : '')
      + (v.icon2 ? T(440, 50, v.icon2, { size: 26 }) + (v.v2 ? T(390, 40, v.v2, { size: 12, fill: C.orange, bold: true }) : '') : '');
    return svg(500, 105, out);
  }

  // ---------------- 23. Hình hộp chữ nhật / lập phương ----------------
  function cuboid(v) {
    let a = v.cube ? 120 : 160, b = v.cube ? 120 : 90, d = v.cube ? 50 : 55; const x0 = 62, y0 = 60;
    { const L = v.labels || {}; const na = num(L.a), nb = num(L.b), nc = num(L.c);
      if (!v.cube && na > 0 && nb > 0 && nc > 0) { // đúng tỉ lệ: dài (a) × rộng (b, chiều sâu) × cao (c)
        const m = Math.max(na, nb, nc); const [x, y, z] = [na, nb, nc].map(t => Math.max(t, m / 4));
        const s = Math.min(190 / x, 120 / z, 150 / y); a = x * s; b = z * s; d = Math.max(18, y * s * 0.55);
      } }
    const fr = [[x0, y0], [x0 + a, y0], [x0 + a, y0 + b], [x0, y0 + b]];
    const bk = fr.map(([x, y]) => [x + d, y - d * 0.7]);
    const P = (p) => p.map(q => q.join(',')).join(' ');
    let out = `<polygon points="${P([fr[0], fr[1], bk[1], bk[0]])}" fill="${v.open ? '#fff' : 'rgba(74,123,216,.25)'}" stroke="${C.blue}" stroke-width="2"/>`
      + `<polygon points="${P([fr[1], fr[2], bk[2], bk[1]])}" fill="rgba(74,123,216,.35)" stroke="${C.blue}" stroke-width="2"/>`
      + `<polygon points="${P(fr)}" fill="rgba(74,123,216,.15)" stroke="${C.blue}" stroke-width="2"/>`
      + `<line x1="${fr[3][0]}" y1="${fr[3][1]}" x2="${bk[3][0]}" y2="${bk[3][1]}" stroke="${C.soft}" stroke-dasharray="5 4"/><line x1="${bk[3][0]}" y1="${bk[3][1]}" x2="${bk[2][0]}" y2="${bk[2][1]}" stroke="${C.soft}" stroke-dasharray="5 4"/><line x1="${bk[3][0]}" y1="${bk[3][1]}" x2="${bk[0][0]}" y2="${bk[0][1]}" stroke="${C.soft}" stroke-dasharray="5 4"/>`;
    const lb = v.labels || {};
    if (lb.a) out += T(x0 + a / 2, y0 + b + 16, lb.a, { size: 14, fill: C.red, bold: true });
    if (lb.b) out += T(x0 + a + d / 2 + 14, y0 + b - d * 0.35 + 6, lb.b, { size: 14, fill: C.red, bold: true, anchor: 'start' });
    if (lb.c) out += T(x0 - 8, y0 + b / 2, lb.c, { size: 14, fill: C.red, bold: true, anchor: 'end' });
    if (v.open) out += T(x0 + a / 2 + d / 2, y0 - d * 0.35, 'không nắp', { size: 11, fill: C.soft });
    return svg(x0 + a + d + 70, y0 + b + 30, out);
  }

  // ---------------- 24. Biểu đồ hình quạt tròn ----------------
  function pie(v) {
    const cx = 100, cy = 100, r = 80; let a0 = -Math.PI / 2, out = '';
    const tot = v.data.reduce((s, d) => s + d.value, 0);
    v.data.forEach((d, i) => {
      const a1 = a0 + d.value / tot * 2 * Math.PI, col = PAL[i % PAL.length];
      out += `<path d="M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}Z" fill="${col}" stroke="#fff" stroke-width="2"/>`;
      const am = (a0 + a1) / 2; if (d.value / tot >= 0.07) out += T(cx + r * 0.62 * Math.cos(am), cy + r * 0.62 * Math.sin(am), d.hide ? '?' : (d.pct ? d.value + '%' : d.value), { size: 13, fill: '#fff', bold: true });
      out += `<rect x="205" y="${30 + i * 26}" width="14" height="14" rx="3" fill="${col}"/>` + T(226, 37 + i * 26, d.label, { size: 13, anchor: 'start' });
      a0 = a1;
    });
    return svg(340, 200, out);
  }

  // ---------------- 25. Nhiệt kế ----------------
  function thermo(v) {
    const min = v.min != null ? v.min : -10, max = v.max != null ? v.max : 40, H = 200, X = 60; const Y = (t) => 20 + (max - t) / (max - min) * (H - 50);
    let out = `<rect x="${X - 8}" y="14" width="16" height="${H - 36}" rx="8" fill="#fff" stroke="${C.ink}" stroke-width="2"/><circle cx="${X}" cy="${H - 18}" r="14" fill="${C.red}" stroke="${C.ink}" stroke-width="2"/>`;
    out += `<rect x="${X - 4}" y="${Y(v.t)}" width="8" height="${H - 18 - Y(v.t)}" fill="${C.red}"/>`;
    for (let t = min; t <= max; t += (v.step || 5)) out += `<line x1="${X + 10}" y1="${Y(t)}" x2="${X + 18}" y2="${Y(t)}" stroke="${C.ink}"/>` + T(X + 24, Y(t), t + '°', { size: 11, anchor: 'start', fill: t < 0 ? C.blue : C.ink });
    return svg(130, H + 4, out);
  }


  // =====================================================================
  // 26. HÌNH HỌC ĐÚNG TỈ LỆ — visual { type: 'geo', P: {A:[x,y],…}, … }
  //   Toạ độ thật (y hướng xuống), tự co giãn vừa khung → độ dài trên hình
  //   đúng tỉ lệ với số đo trong đề. Dùng các hàm dựng sẵn MA.Vis.G.*
  //   P      : { tên: [x, y] }  (tên bắt đầu bằng _ thì không ghi nhãn)
  //   polys  : [{ p:[tên…], fill, stroke, dash, w }]
  //   lines  : [{ a, b, t, q, dash, col, w, side:±1, off, ext:[ea, eb], arrow:'a'|'b'|'ab', hide }]
  //   dims   : [{ a, b, t, q, off }]  (đường kích thước có vạch hai đầu)
  //   ticks  : [{ a, b, n }]          (vạch đánh dấu đoạn bằng nhau)
  //   right  : [[P1, V, P2]]          (kí hiệu góc vuông tại V)
  //   arcs   : [{ o, a, b, t, r, col, dir }]
  //   circles: [{ c, r, fill, stroke, dash }]
  //   texts  : [{ at, t, col, size, bold, anchor, dx, dy }]
  //   dots   : true | [tên]; show: [tên]; lp: { tên: 'n'|'s'|'e'|'w'|'ne'|… }; lpAll
  // =====================================================================
  const num = (s) => { if (typeof s === 'number') return s; const m = String(s == null ? '' : s).replace(/<[^>]+>/g, '').match(/^\s*(\d+(?:,\d+)?)(?!\s*\/)/); return m ? parseFloat(m[1].replace(',', '.')) : NaN; };
  const DIRS = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0], ne: [.75, -.75], nw: [-.75, -.75], se: [.75, .75], sw: [-.75, .75] };
  function geo(v) {
    const P = v.P || {}; const gp = (k) => Array.isArray(k) ? k : P[k];
    const xs = [], ys = [];
    Object.keys(P).forEach(k => { xs.push(P[k][0]); ys.push(P[k][1]); });
    (v.circles || []).forEach(c => { const p = gp(c.c); xs.push(p[0] - c.r, p[0] + c.r); ys.push(p[1] - c.r, p[1] + c.r); });
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const mw = v.maxW || 300, mh = v.maxH || 180, w = x1 - x0, h = y1 - y0;
    let s = Math.min(w > 1e-9 ? mw / w : Infinity, h > 1e-9 ? mh / h : Infinity); if (!isFinite(s)) s = 1;
    const padX = v.padX != null ? v.padX : (v.pad != null ? v.pad : 40), padY = v.padY != null ? v.padY : (v.pad != null ? v.pad : 30);
    const fw = w * s + 2 * padX, W = Math.max(v.minW || 180, fw), offX = (W - fw) / 2;
    const H = h * s + 2 * padY + (v.caption ? 20 : 0);
    const X = (k) => { const p = gp(k); return [offX + padX + (p[0] - x0) * s, padY + (p[1] - y0) * s]; };
    const shown = v.show || Object.keys(P).filter(k => k[0] !== '_');
    let cx = 0, cy = 0; const cpts = shown.length ? shown : Object.keys(P);
    cpts.forEach(k => { const q = X(k); cx += q[0]; cy += q[1]; }); cx /= cpts.length || 1; cy /= cpts.length || 1;
    if (v.center) { const q = X(v.center); cx = q[0]; cy = q[1]; }
    const f = (n) => +n.toFixed(1);
    const tw = (t, size) => String(t).replace(/<[^>]+>/g, '').length * size * 0.56 + 2;
    const labels = []; const ext = [];
    const addL = (x, y, t, o) => { const size = o.size || 14; const w = tw(t, size), a = o.anchor || 'middle'; const lx = a === 'start' ? x : a === 'end' ? x - w : x - w / 2; ext.push([lx, y - size * 0.6], [lx + w, y + size * 0.6]); labels.push(T(f(x), f(y), t, o)); };
    const lab = (x, y, t, o = {}) => addL(x, y, t, Object.assign({ size: 14, bold: true, fill: C.red }, o));
    // khoảng lệch để nhãn không đè lên nét: theo bề rộng chữ và hướng pháp tuyến
    const gapFor = (t, size, n, base) => base + tw(t, size) / 2 * Math.abs(n[0]) + size * 0.55 * Math.abs(n[1]);
    // pháp tuyến hướng ra xa tâm hình (hoặc theo side)
    const normal = (A, B, side) => {
      const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1; let n = [dy / L, -dx / L];
      if (side === 1 || side === -1) return side === 1 ? n : [-n[0], -n[1]];
      const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      const d1 = Math.hypot(mx + n[0] * 10 - cx, my + n[1] * 10 - cy), d2 = Math.hypot(mx - n[0] * 10 - cx, my - n[1] * 10 - cy);
      if (Math.abs(d1 - d2) < 0.5) { if (n[1] > 0 || (Math.abs(n[1]) < 1e-6 && n[0] > 0)) n = [-n[0], -n[1]]; }
      else if (d2 > d1) n = [-n[0], -n[1]];
      return n;
    };
    let out = '';
    Object.keys(P).forEach(k => ext.push(X(k)));
    (v.circles || []).forEach(c => { const q = X(c.c); ext.push([q[0] - c.r * s, q[1] - c.r * s], [q[0] + c.r * s, q[1] + c.r * s]); });
    (v.curves || []).forEach(c => { const A = X(c.a), Q = X(c.c), B = X(c.b); ext.push([(A[0] + 2 * Q[0] + B[0]) / 4, (A[1] + 2 * Q[1] + B[1]) / 4]); out += `<path d="M${f(A[0])} ${f(A[1])} Q${f(Q[0])} ${f(Q[1])} ${f(B[0])} ${f(B[1])}" fill="none" stroke="${c.col || C.blue}" stroke-width="${c.w || 3}" stroke-linecap="round"/>`; });
    (v.polys || []).forEach(p => { out += `<polygon points="${p.p.map(k => X(k).map(f).join(',')).join(' ')}" fill="${p.fill || 'rgba(74,123,216,.13)'}" stroke="${p.stroke || C.blue}" stroke-width="${p.w || 2.5}" stroke-linejoin="round"${p.dash ? ' stroke-dasharray="6 4"' : ''}/>`; });
    (v.circles || []).forEach(c => { const q = X(c.c); out += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(c.r * s)}" fill="${c.fill || 'rgba(74,123,216,.12)'}" stroke="${c.stroke || C.blue}" stroke-width="${c.w || 2.5}"${c.dash ? ' stroke-dasharray="6 4"' : ''}/>`; });
    (v.lines || []).forEach(l => {
      let A = X(l.a), B = X(l.b); const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, u = [dx / L, dy / L];
      const ext = l.ext || [0, 0]; const A2 = [A[0] - u[0] * ext[0], A[1] - u[1] * ext[0]], B2 = [B[0] + u[0] * ext[1], B[1] + u[1] * ext[1]];
      const col = l.col || C.blue; ext.push(A2, B2);
      if (!l.hide) out += `<line x1="${f(A2[0])}" y1="${f(A2[1])}" x2="${f(B2[0])}" y2="${f(B2[1])}" stroke="${col}" stroke-width="${l.w || 2.5}" stroke-linecap="round"${l.dash ? ' stroke-dasharray="6 4"' : ''}/>`;
      const arrow = (P0, d) => `<path d="M${f(P0[0])} ${f(P0[1])} l${f(-d[0] * 10 + d[1] * 5)} ${f(-d[1] * 10 - d[0] * 5)} l${f(-d[1] * 10)} ${f(d[0] * 10)}z" fill="${col}"/>`;
      if (l.arrow && /b/.test(l.arrow)) out += arrow(B2, u);
      if (l.arrow && /a/.test(l.arrow)) out += arrow(A2, [-u[0], -u[1]]);
      if (l.t != null && l.t !== '') { const n = normal(A, B, l.side), sz = l.q ? 16 : 14, o = gapFor(l.t, sz, n, l.off != null ? Math.min(l.off, 8) : 6); lab((A[0] + B[0]) / 2 + n[0] * o, (A[1] + B[1]) / 2 + n[1] * o, l.t, { fill: l.tcol || C.red, size: sz }); }
    });
    (v.dims || []).forEach(d => {
      const A = X(d.a), B = X(d.b); const n = normal(A, B, d.side); const o = d.off || 22;
      const a = [A[0] + n[0] * o, A[1] + n[1] * o], b = [B[0] + n[0] * o, B[1] + n[1] * o], col = d.col || C.soft;
      out += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${col}" stroke-width="1.5"/>`;
      [a, b].forEach(p => { out += `<line x1="${f(p[0] - n[0] * 6)}" y1="${f(p[1] - n[1] * 6)}" x2="${f(p[0] + n[0] * 6)}" y2="${f(p[1] + n[1] * 6)}" stroke="${col}" stroke-width="1.5"/>`; });
      if (d.guide !== false) [[A, a], [B, b]].forEach(([p, q]) => { out += `<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}" stroke="${C.line}" stroke-width="1" stroke-dasharray="3 3"/>`; });
      { const sz = d.q ? 16 : 13, g = gapFor(d.t, sz, n, 4); lab((a[0] + b[0]) / 2 + n[0] * g, (a[1] + b[1]) / 2 + n[1] * g, d.t, { fill: d.q ? C.red : C.ink, size: sz }); }
    });
    (v.ticks || []).forEach(t => {
      const A = X(t.a), B = X(t.b); const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1; const u = [dx / L, dy / L], n = [-u[1], u[0]];
      for (let i = 0; i < (t.n || 1); i++) { const m = [(A[0] + B[0]) / 2 + u[0] * (i - ((t.n || 1) - 1) / 2) * 5, (A[1] + B[1]) / 2 + u[1] * (i - ((t.n || 1) - 1) / 2) * 5]; out += `<line x1="${f(m[0] - n[0] * 6)}" y1="${f(m[1] - n[1] * 6)}" x2="${f(m[0] + n[0] * 6)}" y2="${f(m[1] + n[1] * 6)}" stroke="${C.red}" stroke-width="2"/>`; }
    });
    (v.right || []).forEach(([a, o, b]) => {
      const O = X(o), A = X(a), B = X(b); const ua = [A[0] - O[0], A[1] - O[1]], ub = [B[0] - O[0], B[1] - O[1]]; const la = Math.hypot(...ua) || 1, lb = Math.hypot(...ub) || 1; const k = 11;
      const p1 = [O[0] + ua[0] / la * k, O[1] + ua[1] / la * k], p3 = [O[0] + ub[0] / lb * k, O[1] + ub[1] / lb * k], p2 = [p1[0] + ub[0] / lb * k, p1[1] + ub[1] / lb * k];
      out += `<path d="M${f(p1[0])} ${f(p1[1])} L${f(p2[0])} ${f(p2[1])} L${f(p3[0])} ${f(p3[1])}" fill="none" stroke="${C.red}" stroke-width="1.6"/>`;
    });
    (v.arcs || []).forEach(a => {
      const O = X(a.o), A = X(a.a), B = X(a.b); const r = a.r || 26; const a1 = Math.atan2(A[1] - O[1], A[0] - O[0]); let d = Math.atan2(B[1] - O[1], B[0] - O[0]) - a1;
      while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
      if (a.dir) d = a.dir * (Math.abs(Math.abs(d) - Math.PI) < 1e-6 ? Math.PI : (Math.sign(d) === a.dir ? Math.abs(d) : 2 * Math.PI - Math.abs(d)));
      const a2 = a1 + d, col = a.col || C.red;
      out += `<path d="M${f(O[0] + r * Math.cos(a1))} ${f(O[1] + r * Math.sin(a1))} A${r} ${r} 0 ${Math.abs(d) > Math.PI ? 1 : 0} ${d > 0 ? 1 : 0} ${f(O[0] + r * Math.cos(a2))} ${f(O[1] + r * Math.sin(a2))}" fill="none" stroke="${col}" stroke-width="2.2"/>`;
      if (a.t) { const am = a1 + d / 2, nn = [Math.cos(am), Math.sin(am)], rr = r + gapFor(a.t, 13, nn, 4); lab(O[0] + rr * nn[0], O[1] + rr * nn[1], a.t, { fill: col, size: 13 }); }
    });
    const dots = v.dots === true ? shown : (v.dots || []);
    dots.forEach(k => { const q = X(k); out += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="4.2" fill="${(v.dotCol && v.dotCol[k]) || C.ink}"/>`; });
    shown.forEach(k => {
      const q = X(k); let d = (v.lp && v.lp[k]) || v.lpAll; let dir;
      if (Array.isArray(d)) dir = d; else if (d) dir = DIRS[d];
      else { const dx = q[0] - cx, dy = q[1] - cy, L = Math.hypot(dx, dy); dir = L < 1 ? DIRS.n : [dx / L, dy / L]; }
      const name = (v.names && v.names[k]) || k;
      const g = gapFor(name, 15, dir, 7); addL(q[0] + dir[0] * g, q[1] + dir[1] * g, name, { size: 15, bold: true, fill: (v.nameCol && v.nameCol[k]) || C.ink, italic: /^[a-z]'?$/.test(name) });
    });
    (v.texts || []).forEach(t => { const q = X(t.at); addL(q[0] + (t.dx || 0), q[1] + (t.dy || 0), t.t, { size: t.size || 14, bold: t.bold !== false, fill: t.col || C.ink, anchor: t.anchor }); });
    out += labels.join('');
    // khung hình vừa khít mọi nét và nhãn
    let mx0 = Math.min(...ext.map(p => p[0])) - 8, mx1 = Math.max(...ext.map(p => p[0])) + 8, my0 = Math.min(...ext.map(p => p[1])) - 8, my1 = Math.max(...ext.map(p => p[1])) + 8;
    if (mx1 - mx0 < (v.minW || 0)) { const c = (mx0 + mx1) / 2; mx0 = c - v.minW / 2; mx1 = c + v.minW / 2; }
    if (v.caption) { const cw = tw(v.caption, 12.5) + 12, cc = (mx0 + mx1) / 2; if (mx1 - mx0 < cw) { mx0 = cc - cw / 2; mx1 = cc + cw / 2; } my1 += 22; out += T(f((mx0 + mx1) / 2), f(my1 - 10), v.caption, { size: 12.5, fill: C.soft }); }
    const VW = f(mx1 - mx0), VH = f(my1 - my0);
    void W; void H;
    return `<svg class="vis-svg" viewBox="${f(mx0)} ${f(my0)} ${VW} ${VH}" width="100%" style="max-width:${VW}px" role="img" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  }

  // ---------- Các hàm dựng hình (trả về visual geo) ----------
  const G = {
    // kẹp tỉ lệ để hình quá dẹt vẫn nhìn được (vẫn giữ cạnh dài hơn là dài hơn)
    clamp(a, b, k = 6) { if (a >= b) return b * k < a ? [a, a / k] : [a, b]; const r = G.clamp(b, a, k); return [r[1], r[0]]; },
    // Đường gấp khúc: lens = độ dài thật; labels = nhãn từng đoạn; names = tên các điểm
    zigzag(lens, o = {}) {
      const names = o.names || 'ABCDEGHIKLMN'.slice(0, lens.length + 1).split(''); const th = (o.deg || 52) * Math.PI / 180;
      const P = {}; let x = 0, y = 0; P[names[0]] = [0, 0]; const lp = {}; lp[names[0]] = 's';
      const mx = Math.max(...lens); const dl = lens.map(L => Math.max(L, mx * 0.3)); // đoạn quá ngắn vẫn đủ chỗ ghi số (vẫn ngắn hơn rõ rệt)
      dl.forEach((L, i) => { x += L * Math.cos(th); y += (i % 2 ? 1 : -1) * L * Math.sin(th); P[names[i + 1]] = [x, y]; lp[names[i + 1]] = i % 2 ? 's' : 'n'; });
      const labels = o.labels || lens.map(L => fmt(L) + ' ' + (o.unit || 'cm'));
      const lines = lens.map((L, i) => ({ a: names[i], b: names[i + 1], t: o.noLabels ? '' : labels[i], q: labels[i] === '?', side: i % 2 ? -1 : 1, w: 3 }));
      const texts = [];
      if (o.start) texts.push({ at: names[0], t: o.start, size: 24, dx: -22, dy: -6, bold: false });
      if (o.end) texts.push({ at: names[lens.length], t: o.end, size: 24, dx: 22, dy: lens.length % 2 ? 6 : -6, bold: false });
      return { type: 'geo', P, lines, dots: true, lp, texts, maxW: o.maxW || 300, maxH: o.maxH || 120, caption: o.caption };
    },
    // Tam giác ABC theo 3 cạnh (AB, BC, CA) — B, C nằm ở đáy
    triSSS(AB, BC, CA, o = {}) {
      const [nA, nB, nC] = o.names || ['A', 'B', 'C']; const x = (AB * AB - CA * CA + BC * BC) / (2 * BC); const y = Math.sqrt(Math.max(0, AB * AB - x * x));
      const P = {}; P[nA] = [x, -y]; P[nB] = [0, 0]; P[nC] = [BC, 0];
      const L = o.labels || {}; const lb = (k, v) => L[k] !== undefined ? L[k] : (v != null && o.unit !== false ? fmt(v) + ' ' + (o.unit || 'cm') : '');
      return { type: 'geo', P, polys: [{ p: [nA, nB, nC], fill: o.fill || 'rgba(242,159,61,.18)' }], lines: [{ a: nA, b: nB, t: lb('AB', AB), hide: true }, { a: nB, b: nC, t: lb('BC', BC), hide: true }, { a: nC, b: nA, t: lb('CA', CA), hide: true }].map(l => Object.assign(l, { q: l.t === '?' })), show: o.noNames ? [] : [nA, nB, nC], maxW: o.maxW || 260, maxH: o.maxH || 160, caption: o.caption };
    },
    // Tam giác biết đáy & chiều cao (đường cao kẻ từ đỉnh A)
    triBH(base, h, o = {}) {
      const [nA, nB, nC] = o.names || ['A', 'B', 'C']; const [b2, h2] = G.clamp(base, h, 2.6); const fx = o.foot != null ? o.foot : 0.32;
      const P = {}; P[nA] = [b2 * fx, -h2]; P[nB] = [0, 0]; P[nC] = [b2, 0]; P._H = [b2 * fx, 0];
      const g = { type: 'geo', P, polys: [{ p: [nA, nB, nC], fill: 'rgba(242,159,61,.18)' }], lines: [{ a: nB, b: nC, t: o.baseLabel != null ? o.baseLabel : fmt(base) + ' ' + (o.unit || 'cm'), hide: true, side: -1 }], show: o.noNames ? [] : [nA, nB, nC], maxW: o.maxW || 260, maxH: o.maxH || 150, caption: o.caption, texts: [] };
      if (o.hLabel !== false) { g.lines.push({ a: nA, b: '_H', dash: true, col: C.red, w: 2, t: o.hLabel != null ? o.hLabel : fmt(h) + ' ' + (o.unit || 'cm'), side: 1, off: 10 }); g.right = [[nA, '_H', nC]]; g.lines[g.lines.length - 1].tcol = C.red; }
      if (o.inside) g.texts.push({ at: [b2 * 0.55, -h2 * 0.3], t: o.inside, col: C.ink, size: 13 });
      return g;
    },
    // Tam giác vuông tại A (A ở góc dưới trái)
    rightTri(a, b, o = {}) {
      const [nA, nB, nC] = o.names || ['A', 'B', 'C']; const [w, h] = G.clamp(b, a, 4); const P = {}; P[nA] = [0, 0]; P[nB] = [0, -h]; P[nC] = [w, 0];
      const lb = (v, k) => o.labels && o.labels[k] !== undefined ? o.labels[k] : fmt(v) + ' ' + (o.unit || 'cm');
      return { type: 'geo', P, polys: [{ p: [nA, nB, nC], fill: 'rgba(46,163,107,.16)' }], lines: [{ a: nA, b: nB, t: lb(a, 'AB'), hide: true, side: 1 }, { a: nA, b: nC, t: lb(b, 'AC'), hide: true, side: -1 }], right: o.noMark ? [] : [[nB, nA, nC]], show: o.noNames ? [] : [nA, nB, nC], maxW: o.maxW || 240, maxH: o.maxH || 150, caption: o.caption };
    },
    // Hình chữ nhật ABCD (A trên-trái, B trên-phải, C dưới-phải, D dưới-trái)
    rect(w, h, o = {}) {
      const [W2, H2] = G.clamp(w, h, o.k || 6); const n = o.names || ['A', 'B', 'C', 'D'];
      const P = {}; P[n[0]] = [0, 0]; P[n[1]] = [W2, 0]; P[n[2]] = [W2, H2]; P[n[3]] = [0, H2];
      const lines = []; const L = o.labels || {};
      if (L.top != null) lines.push({ a: n[0], b: n[1], t: L.top, hide: true, side: 1 });
      if (L.bottom != null) lines.push({ a: n[3], b: n[2], t: L.bottom, hide: true, side: -1 });
      if (L.left != null) lines.push({ a: n[0], b: n[3], t: L.left, hide: true, side: -1, off: 10 + String(L.left).length * 3.6 });
      if (L.right != null) lines.push({ a: n[1], b: n[2], t: L.right, hide: true, side: 1, off: 10 + String(L.right).length * 3.6 });
      lines.forEach(l => { l.q = l.t === '?'; });
      const g = { type: 'geo', P, polys: [{ p: n, fill: o.fill || 'rgba(74,123,216,.13)' }], lines, show: o.names ? n : [], right: o.marks === false ? [] : [[n[3], n[0], n[1]], [n[0], n[1], n[2]], [n[1], n[2], n[3]], [n[2], n[3], n[0]]], maxW: o.maxW || 260, maxH: o.maxH || 140, caption: o.caption, texts: [] };
      if (o.inside) g.texts.push({ at: [W2 / 2, H2 / 2], t: o.inside, size: 14, col: C.ink });
      return g;
    },
    square(a, o = {}) { const L = o.labels || { top: o.label != null ? o.label : fmt(a) + ' ' + (o.unit || 'cm') }; return G.rect(a, a, Object.assign({}, o, { labels: L, maxW: o.maxW || 150, maxH: o.maxH || 150 })); },
    // Hình bình hành: đáy, chiều cao, cạnh bên (tuỳ chọn)
    para(base, h, o = {}) {
      const n = o.names || ['A', 'B', 'C', 'D']; let [b2, h2] = G.clamp(base, h, 4); let dx = o.side && o.side > h ? Math.sqrt(o.side * o.side - h * h) * (b2 / base) : b2 * 0.35;
      if (o.side) { // giữ đúng tỉ lệ cạnh bên/đáy
        const k = b2 / base; dx = Math.sqrt(Math.max(o.side * o.side - h * h, (o.side * 0.5) ** 2)) * k; if (o.side <= h) { h2 = o.side * k * 0.87; dx = o.side * k * 0.5; }
      }
      const P = {}; P[n[0]] = [dx, 0]; P[n[1]] = [dx + b2, 0]; P[n[2]] = [b2, h2]; P[n[3]] = [0, h2]; P._H = [dx, h2];
      const L = o.labels || {}; const lines = [];
      if (L.bottom != null) lines.push({ a: n[3], b: n[2], t: L.bottom, hide: true, side: -1 });
      if (L.top != null) lines.push({ a: n[0], b: n[1], t: L.top, hide: true, side: 1 });
      if (L.left != null) lines.push({ a: n[3], b: n[0], t: L.left, hide: true, off: 12 + String(L.left).length * 3 });
      const g = { type: 'geo', P, polys: [{ p: n, fill: 'rgba(74,123,216,.13)' }], lines, show: o.names ? n : [], maxW: o.maxW || 270, maxH: o.maxH || 130, caption: o.caption, right: [] };
      if (o.hLabel != null) { lines.push({ a: n[0], b: '_H', dash: true, col: C.red, w: 2, t: o.hLabel, side: 1, off: 10 + String(o.hLabel).length * 3, tcol: C.red }); g.right.push([n[0], '_H', n[2]]); }
      return g;
    },
    // Hình thang: đáy bé a (trên), đáy lớn b (dưới), chiều cao h; vuông: true → hình thang vuông
    trap(a, b, h, o = {}) {
      const n = o.names || ['A', 'B', 'C', 'D']; const k = Math.max(a, b, h); const sc = (x) => x; const [bb, hh] = G.clamp(b, h, 4); const aa = a * bb / b;
      const off = o.vuong ? 0 : (bb - aa) / 2; const P = {}; P[n[0]] = [off, 0]; P[n[1]] = [off + aa, 0]; P[n[2]] = [bb, hh]; P[n[3]] = [0, hh]; P._H = [off + (o.vuong ? 0 : 0), hh]; void k; void sc;
      const L = o.labels || {}; const lines = [];
      if (L.top != null) lines.push({ a: n[0], b: n[1], t: L.top, hide: true, side: 1 });
      if (L.bottom != null) lines.push({ a: n[3], b: n[2], t: L.bottom, hide: true, side: -1 });
      const g = { type: 'geo', P, polys: [{ p: n, fill: 'rgba(34,164,181,.16)' }], lines, show: o.names ? n : [], maxW: o.maxW || 270, maxH: o.maxH || 140, caption: o.caption, right: o.vuong ? [[n[1], n[0], n[3]], [n[0], n[3], n[2]]] : [] };
      if (o.hLabel != null && !o.vuong) { lines.push({ a: n[0], b: '_H', dash: true, col: C.red, w: 2, t: o.hLabel, side: 1, tcol: C.red }); g.right.push([n[0], '_H', n[2]]); }
      if (o.hLabel != null && o.vuong) lines.push({ a: n[0], b: n[3], t: o.hLabel, hide: true, side: -1, off: 10 + String(o.hLabel).length * 3, tcol: C.red });
      return g;
    },
    // Hình thoi: d1 (đường chéo đứng), d2 (đường chéo nằm)
    rhombus(d1, d2, o = {}) {
      const n = o.names || ['A', 'B', 'C', 'D']; const [v1, v2] = G.clamp(d1, d2, 2.6); const P = {}; P[n[0]] = [0, -v1 / 2]; P[n[1]] = [v2 / 2, 0]; P[n[2]] = [0, v1 / 2]; P[n[3]] = [-v2 / 2, 0]; P._O = [0, 0];
      const g = { type: 'geo', P, polys: [{ p: n, fill: 'rgba(227,93,155,.14)' }], lines: [], show: o.names ? n : [], maxW: o.maxW || 230, maxH: o.maxH || 170, caption: o.caption, right: [], texts: [] };
      if (o.diag) { g.lines.push({ a: n[0], b: n[2], dash: true, col: C.red, w: 2 }, { a: n[3], b: n[1], dash: true, col: C.green, w: 2 }); g.right.push([n[0], '_O', n[1]]); g.texts.push({ at: n[2], t: o.diag[0], col: C.red, dy: 16, size: 13 }, { at: n[1], t: o.diag[1], col: C.green, dx: 8, anchor: 'start', size: 13 }); }
      if (o.side != null) g.lines.push({ a: n[0], b: n[1], t: o.side, hide: true, side: 1 });
      return g;
    },
    // Đa giác đều n cạnh
    regular(nS, o = {}) {
      const P = {}; const names = o.names || []; const keys = [];
      for (let i = 0; i < nS; i++) { const a = Math.PI / 2 + Math.PI / nS + i * 2 * Math.PI / nS; const k = names[i] || '_' + i; keys.push(k); P[k] = [Math.cos(a), Math.sin(a)]; }
      const lines = []; if (o.label != null) keys.forEach((k, i) => { if (o.allSides || i === 0) lines.push({ a: k, b: keys[(i + 1) % nS], t: o.label, hide: true, off: 13 }); });
      return { type: 'geo', P, polys: [{ p: keys, fill: o.fill || 'rgba(142,108,216,.16)', stroke: o.stroke }], lines, show: names.length ? keys : [], maxW: o.maxW || 170, maxH: o.maxH || 150, caption: o.caption };
    },
    // Tứ giác có 4 cạnh cho trước (a=AB, b=BC, c=CD, d=DA); null nếu không dựng được
    quad(a, b, c, d, o = {}) {
      const lo = Math.max(Math.abs(a - d), Math.abs(b - c)), hi = Math.min(a + d, b + c); if (lo >= hi) return null;
      const e = lo + (hi - lo) * 0.55; // đường chéo BD
      const n = o.names || ['A', 'B', 'C', 'D'];
      const ang = (p, q, r) => Math.acos(Math.max(-1, Math.min(1, (p * p + q * q - r * r) / (2 * p * q))));
      const aB = ang(a, e, d); // góc ABD
      const aC = ang(b, e, c); // góc DBC
      const P = {}; P[n[1]] = [0, 0]; P[n[3]] = [e, 0];
      P[n[0]] = [a * Math.cos(aB), -a * Math.sin(aB)]; P[n[2]] = [b * Math.cos(aC), b * Math.sin(aC)];
      // xoay để cạnh BC nằm dưới cho dễ nhìn
      const u = o.unit || 'cm';
      return { type: 'geo', P, polys: [{ p: n, fill: 'rgba(34,164,181,.16)' }], lines: [[n[0], n[1], a], [n[1], n[2], b], [n[2], n[3], c], [n[3], n[0], d]].map(([p, q, v]) => ({ a: p, b: q, t: fmt(v) + ' ' + u, hide: true })), show: o.noNames ? [] : n, maxW: o.maxW || 240, maxH: o.maxH || 170 };
    },
    // Điểm trên đường thẳng / tia / đoạn thẳng. pts: [{n, x}] (x là toạ độ thật)
    // kind: 'segment' | 'ray' | 'line'; dims: [{a, b, t, q, row}] (row > 0: bên dưới, < 0: bên trên)
    onLine(pts, o = {}) {
      const P = {}; pts.forEach(p => { P[p.n] = [p.x, 0]; }); const first = pts[0].n, last = pts[pts.length - 1].n;
      const lines = [], kind = o.kind || 'segment'; const span = pts[pts.length - 1].x - pts[0].x || 1;
      const ext = kind === 'line' ? [30, 30] : kind === 'ray' ? [0, 34] : [0, 0];
      lines.push({ a: first, b: last, ext, w: 3, arrow: kind === 'ray' && o.arrow !== false ? 'b' : '' });
      const texts = [];
      if (o.endNames) { if (o.endNames[0]) texts.push({ at: first, t: o.endNames[0], dx: -40, dy: -14, col: C.ink }); if (o.endNames[1]) texts.push({ at: last, t: o.endNames[1], dx: kind === 'segment' ? 0 : 40, dy: -14, col: C.ink }); }
      const dims = (o.dims || []).map(d => ({ a: d.a, b: d.b, t: d.t, q: d.t === '?', side: (d.row || 1) > 0 ? -1 : 1, off: 22 * Math.abs(d.row || 1) + 6 }));
      void span;
      return { type: 'geo', P, lines, dims, ticks: o.ticks || [], dots: pts.map(p => p.n), dotCol: o.dotCol, nameCol: o.dotCol, lpAll: 'n', show: pts.filter(p => !p.hide).map(p => p.n), texts, maxW: o.maxW || 290, maxH: 1, padY: 18 + 24 * Math.max(0, ...(o.dims || []).map(d => Math.abs(d.row || 1))), padX: kind === 'segment' ? 30 : 48, caption: o.caption };
    },
    // Hình tam giác có các đoạn kẻ từ đỉnh xuống đáy: k đoạn → k+1 tam giác nhỏ
    fanTri(parts, o = {}) {
      const P = { A: [0.45, -0.85] }; const xs = [0]; let acc = 0; const ws = Array.from({ length: parts }, (_, i) => 1 + ((i * 7) % 3) * 0.25); const tot = ws.reduce((a, b) => a + b, 0);
      ws.forEach(w => { acc += w; xs.push(acc / tot); });
      const names = o.names || []; const keys = xs.map((x, i) => names[i] || '_b' + i); xs.forEach((x, i) => { P[keys[i]] = [x, 0]; });
      const lines = keys.slice(1, -1).map(k => ({ a: 'A', b: k, w: 2.2 }));
      return { type: 'geo', P, polys: [{ p: ['A', keys[0], keys[keys.length - 1]], fill: 'rgba(242,159,61,.16)' }], lines, show: names.length ? ['A'].concat(keys) : [], lp: { A: 'n' }, lpAll: names.length ? 's' : undefined, maxW: o.maxW || 240, maxH: o.maxH || 150 };
    },
    // Hình chữ nhật chia thành rows × cols ô chữ nhật (không phải ô vuông)
    strip(cols, rows, o = {}) {
      const w = o.cw || 1.5, h = o.ch || 1; const P = {}; const lines = [];
      for (let i = 0; i <= cols; i++) { P['_t' + i] = [i * w, 0]; P['_b' + i] = [i * w, rows * h]; if (i > 0 && i < cols) lines.push({ a: '_t' + i, b: '_b' + i, w: 2.2 }); }
      for (let j = 1; j < rows; j++) { P['_l' + j] = [0, j * h]; P['_r' + j] = [cols * w, j * h]; lines.push({ a: '_l' + j, b: '_r' + j, w: 2.2 }); }
      return { type: 'geo', P, polys: [{ p: ['_t0', '_t' + cols, '_b' + cols, '_b0'], fill: 'rgba(74,123,216,.12)' }], lines, show: [], maxW: o.maxW || Math.min(300, 70 * cols), maxH: o.maxH || 46 * rows };
    },
    // n tia chung gốc O (không có hai tia đối nhau)
    rays(n, o = {}) {
      const names = o.names || 'xyztmnuv'.slice(0, n).split(''); const spread = o.spread || 160; const P = { O: [0, 0] };
      let angs = []; const gap = spread / n; let a = o.start != null ? o.start : 8; for (let i = 0; i < n; i++) { angs.push(a); a += gap * (0.75 + ((i * 5) % 4) * 0.12); }
      const k = spread / (angs[n - 1] - angs[0] || 1); angs = angs.map(x => (x - angs[0]) * k + (o.start != null ? o.start : 8));
      const lines = [], show = ['O'], lp = { O: 's' }; const nm = {};
      angs.forEach((d, i) => { const r = d * Math.PI / 180; const key = '_r' + i; P[key] = [Math.cos(r), -Math.sin(r)]; lines.push({ a: 'O', b: key, w: 2.4, arrow: o.arrow ? 'b' : '' }); show.push(key); nm[key] = names[i]; lp[key] = [Math.cos(r), -Math.sin(r)]; });
      return { type: 'geo', P, lines, dots: ['O'], show, names: nm, lp, maxW: o.maxW || 240, maxH: o.maxH || 130, center: 'O' };
    },
    // n điểm, không có 3 điểm thẳng hàng (nằm trên một đường cong lồi)
    scatter(n, o = {}) {
      const names = o.names || 'ABCDEGHIKLMNPQ'.slice(0, n).split(''); const P = {};
      for (let i = 0; i < n; i++) { const t = Math.PI * 2 * i / n + 0.3 + ((i * 7) % 5) * 0.06; P[names[i]] = [Math.cos(t) * 1.5, Math.sin(t)]; }
      return { type: 'geo', P, dots: true, maxW: o.maxW || 230, maxH: o.maxH || 140, center: [0, 0] };
    },
    // Góc xOy có số đo deg (Ox nằm ngang)
    angle(deg, o = {}) {
      const r = deg * Math.PI / 180; const P = { O: [0, 0], _x: [1, 0], _y: [Math.cos(r), -Math.sin(r)] };
      const nm = { O: o.o || 'O', _x: o.x || 'x', _y: o.y || 'y' };
      const g = { type: 'geo', P, lines: [{ a: 'O', b: '_x', w: 3 }, { a: 'O', b: '_y', w: 3 }], dots: ['O'], show: ['O', '_x', '_y'], names: nm, lp: { O: deg > 150 ? 's' : 'sw', _x: 'e', _y: [Math.cos(r), -Math.sin(r)] }, maxW: o.maxW || 220, maxH: o.maxH || 120, padX: 30, center: 'O' };
      if (deg >= 179.9) { P._y = [-1, 0]; g.lp._y = 'w'; g.lp.O = 's'; g.maxH = 1; g.padY = 46; }
      if (Math.abs(deg - 90) < 1e-6 && o.mark !== false) g.right = [['_x', 'O', '_y']];
      else if (o.arc !== false) g.arcs = [{ o: 'O', a: '_x', b: '_y', t: o.label != null ? o.label : deg + '°', r: deg < 30 ? 64 : 24, dir: -1 }];
      return g;
    }
  };

  // ---------------- 27. Khối hình (lập phương, hộp chữ nhật, cầu, trụ, nón) ----------------
  function solid1(k, x, y, col) {
    const st = `stroke="${C.ink}" stroke-width="1.6" stroke-linejoin="round"`;
    if (k === 'cube' || k === 'cuboid') {
      const a = k === 'cube' ? 56 : 78, b = k === 'cube' ? 56 : 44, d = k === 'cube' ? 26 : 24;
      const x0 = x - (a + d) / 2, y0 = y - (b - d * 0.7) / 2 + 4;
      return `<polygon points="${x0},${y0} ${x0 + a},${y0} ${x0 + a + d},${y0 - d * .7} ${x0 + d},${y0 - d * .7}" fill="${col}" opacity=".75" ${st}/><polygon points="${x0 + a},${y0} ${x0 + a + d},${y0 - d * .7} ${x0 + a + d},${y0 + b - d * .7} ${x0 + a},${y0 + b}" fill="${col}" opacity=".95" ${st}/><rect x="${x0}" y="${y0}" width="${a}" height="${b}" fill="${col}" opacity=".55" ${st}/>`;
    }
    if (k === 'sphere') return `<circle cx="${x}" cy="${y}" r="34" fill="${col}" opacity=".7" ${st}/><ellipse cx="${x}" cy="${y}" rx="34" ry="10" fill="none" stroke="${C.ink}" stroke-width="1" stroke-dasharray="4 3"/><ellipse cx="${x - 11}" cy="${y - 13}" rx="9" ry="6" fill="#fff" opacity=".5"/>`;
    if (k === 'cylinder') return `<path d="M${x - 28} ${y - 26} v52 a28 9 0 0 0 56 0 v-52" fill="${col}" opacity=".7" ${st}/><ellipse cx="${x}" cy="${y - 26}" rx="28" ry="9" fill="${col}" ${st}/>`;
    if (k === 'cone') return `<path d="M${x} ${y - 36} L${x - 30} ${y + 26} a30 9 0 0 0 60 0 Z" fill="${col}" opacity=".75" ${st}/>`;
    return '';
  }
  function solids(v) {
    // mỗi khối là một hình nhỏ riêng → tự xuống dòng trên điện thoại
    const cell = (inner, w) => `<div style="flex:0 0 auto;width:${w}px">${svg(w, 135, inner)}</div>`;
    let out = '';
    if (v.object) out += cell(T(55, 58, v.object, { size: 54, bold: false }) + (v.objectLabel ? T(55, 120, v.objectLabel, { size: 12, fill: C.soft }) : ''), 110);
    v.items.forEach((it, i) => { out += cell(solid1(it.k, 60, 62, it.c || PAL[i % PAL.length]) + (it.label ? T(60, 122, it.label, { size: 12.5, bold: true }) : ''), 124); });
    return `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px 6px">${out}</div>`;
  }
  // ---------------- 28. Dãy hình phẳng nhỏ (đếm hình, nhận dạng) ----------------
  function shapeIcon(k, x, y, s, col) {
    const st = `fill="${col}" stroke="${C.ink}" stroke-width="1.4" stroke-linejoin="round"`;
    if (k === 'tri') return `<polygon points="${x},${y - s * .55} ${x + s * .55},${y + s * .42} ${x - s * .55},${y + s * .42}" ${st}/>`;
    if (k === 'square') return `<rect x="${x - s * .42}" y="${y - s * .42}" width="${s * .84}" height="${s * .84}" ${st}/>`;
    if (k === 'rect') return `<rect x="${x - s * .6}" y="${y - s * .34}" width="${s * 1.2}" height="${s * .68}" ${st}/>`;
    if (k === 'circle') return `<circle cx="${x}" cy="${y}" r="${s * .45}" ${st}/>`;
    return '';
  }
  function shapes(v) {
    const s = v.size || 40, gap = v.gap || 12; let x = 10, out = '';
    const rows = []; let row = []; v.items.forEach(it => { row.push(it); if (row.length === (v.perRow || 9)) { rows.push(row); row = []; } }); if (row.length) rows.push(row);
    let W = 0;
    rows.forEach((r, ri) => { x = 10; r.forEach((it, i) => { const sz = s * (it.z || 1); const w = it.k === 'rect' ? sz * 1.25 : sz; out += shapeIcon(it.k, x + w / 2, 10 + ri * (s + 22) + s / 2 + (s - sz) / 2, sz, it.c || PAL[i % PAL.length]); if (it.label) out += T(x + w / 2, 10 + ri * (s + 22) + s + 12, it.label, { size: 11.5, fill: C.soft }); x += w + gap; }); W = Math.max(W, x); });
    return svg(W + 4, rows.length * (s + 22) + 10, out);
  }

  const R = { geo, solids, shapes, cuboid, pie, thermo, column, division, blocks, bar, balance, numberline, fraction, clock, shape, trees, array, objects, factorTree, barchart, pictograph, angle, ruler, money, chain, sequence, venn, grid, jugs, motion };

  MA.Vis = {
    C, G, num, columnSteps, divisionSteps,
    add(type, fn) { R[type] = fn; },   // đăng ký kiểu hình mới (vd. 'raw' của TIMO)
    render(v) {
      if (!v) return '';
      const list = Array.isArray(v) ? v : [v];
      return list.map(x => {
        const f = R[x.type]; if (!f) return '';
        try { return `<figure class="vis vis-${x.type}">${f(x)}${x.title ? `<figcaption>${x.title}</figcaption>` : ''}</figure>`; }
        catch (e) { console.error('Lỗi vẽ hình', x, e); return ''; }
      }).join('');
    }
  };
})(window.MA);
