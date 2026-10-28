/* =========================================================
 * grade6-hk2.js — LỚP 6 HỌC KÌ 2: TÁCH CHỦ ĐỀ THEO CHƯƠNG SGK + DẠNG BÀI MỚI (18/10/2026)
 * Theo SGK Toán 6 – Tập hai (Kết nối tri thức với cuộc sống):
 *   Chương VI   Phân số        → g6_frac (Bài 23–24) · g6_fracops (Bài 25–26) · g6_fracword (Bài 27)
 *   Chương VII  Số thập phân   → g6_dec (Bài 28–30) · g6_pct (Bài 31)
 *   Chương VIII Hình cơ bản    → g6_lines (Bài 32–35) · g6_angle (Bài 36–37)
 *   Chương IX   Dữ liệu, XS    → g6_stats (Bài 38–41) · g6_prob (Bài 42–43)
 * Dạng bài cũ được CHUYỂN sang chủ đề mới (giữ nguyên tên); mức thành thạo chủ đề cũ vẫn giữ.
 * Nạp SAU grade6-more.js, TRƯỚC grade6-lythuyet*.js, interactive.js, curriculum.js.
 * ========================================================= */
(function (MA) {
  'use strict';
  const { R, pick, Q, fmt, shuffle, gcd, lcm, frac, fracHtml, fracStr, round } = MA.U;
  const D = MA.Data;
  const nz = (a, b) => { let x; do { x = R(a, b); } while (x === 0); return x; };
  const cmp = (a, b) => a > b ? '>' : a < b ? '<' : '=';
  const SIGNS = ['>', '<', '='];
  const sF = (a, b) => fracHtml(a, b);                       // phân số có dấu, đã rút gọn
  const rawF = (a, b) => a < 0 ? '−' + frac(-a, b) : frac(a, b);   // phân số giữ nguyên (không rút gọn)
  const N = (x) => x < 0 ? `(${fmt(x)})` : fmt(x);

  // ---------- Công cụ tách chủ đề ----------
  const take = (fromId, names) => {
    const t = D.topic(fromId); if (!t) return [];
    const out = t.gens.filter(g => names.includes(g.name));
    t.gens = t.gens.filter(g => !names.includes(g.name));
    return out;
  };
  const takeRules = (fromId, titles) => {
    const t = D.topic(fromId); if (!t) return [];
    const out = t.rules.filter(r => titles.includes(r.title));
    t.rules = t.rules.filter(r => !titles.includes(r.title));
    return out;
  };
  const set = (id, o) => Object.assign(D.topic(id), o);
  const add = (id, gens) => D.extend(id, gens);

  // ---------- Hình: biểu đồ cột kép ----------
  if (MA.Vis && MA.Vis.add) MA.Vis.add('bar2', (v) => {
    const C = MA.Vis.C, d = v.data, nm = v.names || ['A', 'B'];
    const max = Math.max(...d.map(x => Math.max(x.a, x.b))); const tick = v.tick || 5; const top = Math.ceil(max / tick) * tick || 1;
    const W = Math.max(320, d.length * 84 + 60), T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 12}" fill="${o.fill || C.ink}" text-anchor="${o.anchor || 'middle'}" font-weight="${o.bold ? 800 : 600}" dominant-baseline="middle">${s}</text>`;
    let out = `<line x1="40" y1="30" x2="40" y2="180" stroke="${C.ink}"/><line x1="40" y1="180" x2="${W - 10}" y2="180" stroke="${C.ink}"/>`;
    for (let t = 0; t <= top; t += tick) { const y = 180 - t / top * 140; out += `<line x1="36" y1="${y}" x2="${W - 10}" y2="${y}" stroke="${C.line}" stroke-dasharray="3 3"/>` + T(30, y, t, { size: 11, anchor: 'end', fill: C.soft }); }
    d.forEach((x, i) => { const bx = 58 + i * 84; [[x.a, C.blue], [x.b, C.orange]].forEach(([val, col], k) => { const h = val / top * 140; out += `<rect x="${bx + k * 30}" y="${180 - h}" width="26" height="${h}" rx="3" fill="${col}"/>` + T(bx + k * 30 + 13, 172 - h, x.hide === k ? '?' : val, { bold: true }); }); out += T(bx + 28, 196, x.label); });
    out += `<rect x="${W - 150}" y="6" width="12" height="12" rx="2" fill="${C.blue}"/>` + T(W - 134, 12, nm[0], { anchor: 'start' }) + `<rect x="${W - 80}" y="6" width="12" height="12" rx="2" fill="${C.orange}"/>` + T(W - 64, 12, nm[1], { anchor: 'start' });
    return `<svg class="vis-svg" viewBox="0 0 ${W} 206" width="100%" style="max-width:${W}px" role="img" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  });

  // =====================================================================
  // CHƯƠNG VI — PHÂN SỐ
  // =====================================================================
  const opsGens = take('g6_frac', ['Cộng trừ phân số', 'Nhân chia phân số', 'Số nghịch đảo', 'Tổng phân số đặc biệt', 'Tìm x phân số']);
  const wordGens = take('g6_frac', ['Phân số của một số', 'Tìm một số biết phân số', 'Bài toán còn lại']);
  const opsRules = takeRules('g6_frac', ['Cộng, trừ phân số', 'Nhân, chia phân số']);
  const wordRules = takeRules('g6_frac', ['Hai bài toán cơ bản về phân số']);
  set('g6_frac', {
    title: 'Phân số · Phân số bằng nhau · So sánh · Hỗn số',
    tagline: 'Mở rộng phân số · Tính chất cơ bản · Rút gọn · Quy đồng · So sánh · Hỗn số dương',
    summary: 'Phân số a/b với a, b là số nguyên, b ≠ 0. Hai phân số a/b và c/d bằng nhau nếu a · d = b · c. So sánh phân số bằng cách đưa về cùng mẫu dương. Hỗn số dương gồm phần nguyên và phần phân số nhỏ hơn 1.'
  });
  D.topic('g6_frac').rules.unshift({ title: 'Mở rộng phân số – Phân số bằng nhau', desc: 'a/b với a, b ∈ ℤ, b ≠ 0 là một phân số (a là tử, b là mẫu). Hai phân số a/b và c/d bằng nhau nếu <b>a · d = b · c</b>. Mọi phân số đều viết được dưới dạng có mẫu dương: a/(−b) = −a/b.', formula: 'a/b = c/d ⇔ a · d = b · c', example: `${frac(-3, 4)} = ${frac(6, -8)} vì (−3) · (−8) = 4 · 6 = 24`, tip: 'Số nguyên a cũng là phân số a/1.' });
  D.topic('g6_frac').rules.push({ title: 'Hỗn số dương', desc: 'Phân số lớn hơn 1 viết được dưới dạng hỗn số: lấy tử chia mẫu, thương là phần nguyên, số dư là tử của phần phân số.', example: `${frac(17, 5)} = 3${frac(2, 5)} vì 17 : 5 = 3 dư 2; ngược lại 2${frac(1, 4)} = ${frac(9, 4)}`, tip: 'Hỗn số → phân số: phần nguyên × mẫu + tử, giữ mẫu.' });

  add('g6_frac', [
    { level: 1, name: 'Đưa về mẫu dương', fn() { let a = R(1, 9), b = R(2, 12); if (gcd(a, b) !== 1 || a === b) return this.fn(); const neg = R(0, 1); const shown = neg ? `${frac(a, '−' + b)}` : `${frac('−' + a, '−' + b)}`; const ans = neg ? '−' + frac(a, b) : frac(a, b); return Q({ text: `Phân số nào bằng phân số ${shown}?`, answer: ans, options: [ans, neg ? frac(a, b) : '−' + frac(a, b), frac(b, a), '−' + frac(b, a)], keepMc: true, hint: 'Nhân cả tử và mẫu với −1 để được mẫu dương.', steps: [`${shown} = ${frac((neg ? '' : '−') + a + ' · (−1)', '−' + b + ' · (−1)')} = <b>${ans}</b>.`] }); } },
    { level: 1, name: 'Tìm x: phân số bằng nhau', fn() { const d = R(2, 9), c = R(1, d * 2), k = R(2, 6); const b = d * k; if (gcd(c, d) !== 1) return this.fn(); const top = R(0, 1); return Q({ text: top ? `Tìm số nguyên x, biết: ${frac('x', b)} = ${frac(c, d)}` : `Tìm số nguyên x, biết: ${frac(c * k, 'x')} = ${frac(c, d)}`, answer: top ? c * k : b, wrongs: top ? [c + k, b * c / d + 1, c * d] : [d + k, b + 1, c * d], hint: 'Hai phân số bằng nhau: a · d = b · c.', steps: [top ? `x · ${d} = ${b} · ${c} ⇒ x = ${b * c} : ${d} = <b>${c * k}</b>.` : `${c * k} · ${d} = x · ${c} ⇒ x = ${c * k * d} : ${c} = <b>${b}</b>.`] }); } },
    { level: 2, name: 'Phân số ra hỗn số', fn() { const d = R(2, 9), q = R(1, 9), r = R(1, d - 1); const n = q * d + r; const rev = R(0, 1); const mix = `${q}${frac(r, d)}`; if (rev) return Q({ text: `Viết hỗn số <b>${mix}</b> dưới dạng phân số.`, answer: `${n}/${d}`, inputHint: 'Nhập dạng a/b', hint: 'Phần nguyên × mẫu + tử, giữ nguyên mẫu.', steps: [`${q} · ${d} + ${r} = ${n} → <b>${frac(n, d)}</b>.`] });
      return Q({ text: `Viết phân số ${frac(n, d)} dưới dạng hỗn số.`, answer: mix, options: [mix, `${r}${frac(q, d)}`, `${q + 1}${frac(r, d)}`, `${q}${frac(r, d + 1)}`], keepMc: true, hint: 'Lấy tử chia mẫu: thương là phần nguyên, số dư là tử mới.', steps: [`${n} : ${d} = ${q} dư ${r} → <b>${mix}</b>.`] }); } },
    { level: 2, name: 'So sánh phân số âm', fn() { const b = R(2, 9), d = R(2, 9); const a = R(1, b + 3), c = R(1, d + 3); if (a * d === b * c || gcd(a, b) !== 1 || gcd(c, d) !== 1) return this.fn(); const kind = R(0, 2); const x = kind === 2 ? a / b : -a / b, y = -c / d; const s = cmp(x, y); const L = lcm(b, d); return Q({ text: `So sánh: ${kind === 2 ? frac(a, b) : '−' + frac(a, b)} ... ${kind === 1 ? frac(c, '−' + d) : '−' + frac(c, d)}`, answer: s, options: SIGNS, shuffle: false, hint: kind === 2 ? 'Phân số dương luôn lớn hơn phân số âm.' : 'Quy đồng mẫu dương rồi so sánh tử (số nguyên âm).', steps: kind === 2 ? ['Phân số dương > 0 > phân số âm.', `Vậy <b>${s}</b>.`] : [`Mẫu chung ${L}: ${rawF(Math.round(x * L), L)} và ${rawF(Math.round(y * L), L)}.`, `${fmt(Math.round(x * L))} ${s} ${fmt(Math.round(y * L))} nên chọn <b>${s}</b>.`] }); } },
    { level: 3, name: 'Sắp xếp phân số', fn() { const fs = []; while (fs.length < 3) { const b = R(2, 9), a = nz(-8, 8); if (gcd(Math.abs(a), b) !== 1) continue; if (fs.some(f => f[0] * b === a * f[1])) continue; fs.push([a, b]); } const s = fs.slice().sort((p, q) => p[0] / p[1] - q[0] / q[1]); const show = (l) => l.map(f => rawF(f[0], f[1])).join('; '); const ans = show(s); return Q({ text: `Sắp xếp các phân số theo thứ tự tăng dần: ${show(fs)}`, answer: ans, options: [ans, show(s.slice().reverse()), show([s[1], s[0], s[2]]), show([s[0], s[2], s[1]])], keepMc: true, hint: 'Phân số âm < 0 < phân số dương; quy đồng để so sánh các phân số cùng dấu.', steps: [`Thứ tự tăng dần: <b>${ans}</b>.`] }); } }
  ]);

  D.addTopics(6, [{
    id: 'g6_fracops', icon: '➗', title: 'Phép tính với phân số',
    tagline: 'Cộng · Trừ · Số đối · Nhân · Chia · Số nghịch đảo · Tính chất phép tính',
    summary: 'Cộng, trừ phân số (cùng mẫu, khác mẫu), số đối; nhân, chia phân số, phân số nghịch đảo; các tính chất giao hoán, kết hợp, phân phối giúp tính nhanh.',
    prereqs: ['g6_frac'],
    rules: [
      { title: 'Số đối của phân số', desc: 'Hai phân số có tổng bằng 0 là hai số đối nhau. Số đối của a/b là −a/b. Trừ phân số: a/b − c/d = a/b + (−c/d).', formula: 'a/b + (−a/b) = 0', example: `Số đối của ${frac(3, 7)} là −${frac(3, 7)}`, tip: 'Trừ đi một phân số = cộng với số đối của nó.' }
    ].concat(opsRules, [
      { title: 'Tính chất của phép cộng, phép nhân phân số', desc: 'Giao hoán, kết hợp, cộng với 0, nhân với 1 và tính chất phân phối: a/b · (c/d + e/f) = a/b · c/d + a/b · e/f.', example: `${frac(2, 5)} · ${frac(3, 7)} + ${frac(2, 5)} · ${frac(4, 7)} = ${frac(2, 5)} · 1 = ${frac(2, 5)}`, tip: 'Thấy thừa số chung → đặt ra ngoài để tính nhanh.' }
    ]),
    poem: ['Cùng mẫu cộng tử giữ nguyên,', 'Khác mẫu quy đồng rồi liền cộng ngay!', 'Chia thì đảo ngược phân này,', 'Rồi nhân tử mẫu, thế này là xong!'],
    pitfalls: [
      { wrong: `${frac(1, 2)} + ${frac(1, 3)} = ${frac(2, 5)}`, right: `${frac(3, 6)} + ${frac(2, 6)} = ${frac(5, 6)}`, why: 'Không cộng mẫu với mẫu!' },
      { wrong: `${frac(2, 3)} : ${frac(4, 5)} = ${frac(8, 15)}`, right: `${frac(2, 3)} · ${frac(5, 4)} = ${frac(5, 6)}`, why: 'Chia phải đảo ngược phân số thứ hai rồi nhân.' },
      { wrong: `Số nghịch đảo của −${frac(2, 3)} là ${frac(3, 2)}`, right: `Số nghịch đảo của −${frac(2, 3)} là −${frac(3, 2)}`, why: 'Tích hai số nghịch đảo bằng 1 (dương) nên chúng cùng dấu.' }
    ],
    examples: [{ q: `Tính nhanh: ${frac(5, 9)} · ${frac(7, 13)} + ${frac(5, 9)} · ${frac(6, 13)}`, steps: [`Đặt thừa số chung: ${frac(5, 9)} · (${frac(7, 13)} + ${frac(6, 13)})`, `= ${frac(5, 9)} · 1 = <b>${frac(5, 9)}</b>.`] }],
    gens: opsGens.concat([
      { level: 1, name: 'Số đối của phân số', fn() { const a = R(1, 9), b = R(2, 12); if (gcd(a, b) !== 1) return this.fn(); const neg = R(0, 1); const ans = neg ? frac(a, b) : '−' + frac(a, b); return Q({ text: `Số đối của ${neg ? '−' + frac(a, b) : frac(a, b)} là:`, answer: ans, options: [ans, neg ? '−' + frac(a, b) : frac(a, b), neg ? frac(b, a) : '−' + frac(b, a), neg ? '−' + frac(b, a) : frac(b, a)], keepMc: true, hint: 'Hai số đối nhau có tổng bằng 0.', steps: [`Số đối là <b>${ans}</b>.`] }); } },
      { level: 1, name: 'Cộng trừ cùng mẫu', fn() { const m = R(3, 15), a = nz(-12, 12), b = nz(-12, 12); const add = R(0, 1); const num = add ? a + b : a - b; if (!num) return this.fn(); return Q({ text: `Tính: ${rawF(a, m)} ${add ? '+' : '−'} ${rawF(b, m)}`, answer: fracStr(num, m), simplest: true, inputHint: 'Nhập dạng a/b', hint: 'Cùng mẫu: cộng (trừ) các tử, giữ nguyên mẫu, rồi rút gọn.', steps: [`= ${frac(`${N(a)} ${add ? '+' : '−'} ${N(b)}`, m)} = ${rawF(num, m)} = <b>${sF(num, m)}</b>.`] }); } },
      { level: 2, name: 'Chia phân số cho số nguyên', fn() { const a = nz(-9, 9), b = R(2, 9), n = nz(-6, 6); if (gcd(Math.abs(a), b) !== 1 || Math.abs(n) === 1) return this.fn(); return Q({ text: `Tính: ${rawF(a, b)} : ${N(n)}`, answer: fracStr(a, b * n), simplest: true, inputHint: 'Nhập dạng a/b', hint: `Chia cho ${n} là nhân với ${frac(1, n)}.`, steps: [`= ${rawF(a, b)} · ${sF(1, n)} = <b>${sF(a, b * n)}</b>.`] }); } },
      { level: 2, name: 'Tính nhanh: phân phối', fn() { const a = R(1, 9), b = R(2, 11), d = R(5, 15), c = R(1, d - 1), e = d - c; if (gcd(a, b) !== 1) return this.fn(); const minus = R(0, 3) === 0; const t = minus ? `${frac(a, b)} · ${frac(d + c, d)} − ${frac(a, b)} · ${frac(c, d)}` : `${frac(a, b)} · ${frac(c, d)} + ${frac(a, b)} · ${frac(e, d)}`; return Q({ text: `Tính nhanh: ${t}`, answer: fracStr(a, b), simplest: true, inputHint: 'Nhập dạng a/b', hint: `Đặt ${frac(a, b)} làm thừa số chung.`, steps: [minus ? `= ${frac(a, b)} · (${frac(d + c, d)} − ${frac(c, d)}) = ${frac(a, b)} · 1` : `= ${frac(a, b)} · (${frac(c, d)} + ${frac(e, d)}) = ${frac(a, b)} · 1`, `= <b>${frac(a, b)}</b>.`] }); } },
      { level: 3, name: 'Biểu thức phân số', fn() { const b = R(2, 6), d = R(2, 6), a = R(1, 5), c = R(1, 5), e = R(2, 5), f = R(1, 4); if (b === d) return this.fn(); const n1 = a * d + c * b, d1 = b * d; const num = n1 * f, den = d1 * e; return Q({ text: `Tính: (${frac(a, b)} + ${frac(c, d)}) : ${frac(e, f)}`, answer: fracStr(num, den), simplest: true, inputHint: 'Nhập dạng a/b', hint: 'Trong ngoặc trước, rồi chia (nhân với số nghịch đảo).', steps: [`${frac(a, b)} + ${frac(c, d)} = ${sF(n1, d1)}.`, `${sF(n1, d1)} : ${frac(e, f)} = ${sF(n1, d1)} · ${frac(f, e)} = <b>${sF(num, den)}</b>.`] }); } }
    ])
  }, {
    id: 'g6_fracword', icon: '🧺', title: 'Hai bài toán về phân số',
    tagline: 'Giá trị phân số của một số · Tìm một số biết giá trị phân số của nó',
    summary: 'Hai bài toán cơ bản: tìm m/n của số b (lấy b · m/n) và tìm một số biết m/n của nó bằng a (lấy a : m/n). Áp dụng vào bài toán thực tế: thời gian, tiền, học sinh, quãng đường…',
    prereqs: ['g6_fracops'],
    rules: wordRules.concat([
      { title: 'Đổi đơn vị bằng phân số', desc: 'Giá trị phân số của một đại lượng: 3/4 giờ = 60 · 3/4 = 45 phút; 2/5 m = 100 · 2/5 = 40 cm.', example: `${frac(3, 4)} giờ = 45 phút; ${frac(2, 5)} kg = 400 g`, tip: 'Đổi 1 đơn vị lớn ra đơn vị nhỏ rồi nhân với phân số.' },
      { title: 'Bài toán “phần còn lại”', desc: 'Khi đề nói “… số còn lại”, phân số được tính trên phần CÒN LẠI, không phải trên tổng ban đầu.', example: `Có 60 kg, ngày 1 bán ${frac(1, 3)} (20 kg), ngày 2 bán ${frac(1, 2)} số còn lại (20 kg) → còn 20 kg.`, tip: 'Vẽ sơ đồ đoạn thẳng để không nhầm “tổng” và “còn lại”.' }
    ]),
    poem: ['“Của” một số – nhân ngay phân số,', 'Biết phần mà tìm cả – chia ra liền!'],
    pitfalls: [
      { wrong: `${frac(2, 5)} số sách là 12 quyển → số sách = 12 · ${frac(2, 5)}`, right: `Số sách = 12 : ${frac(2, 5)} = 30 quyển`, why: 'Biết giá trị phân số của một số → phải CHIA cho phân số.' },
      { wrong: `Bán ${frac(1, 2)} số còn lại → tính ${frac(1, 2)} của tổng`, right: `Tính ${frac(1, 2)} của phần còn lại sau lần bán trước`, why: 'Đọc kĩ “số còn lại”.' }
    ],
    examples: [{ q: `Bạn Mai đọc một cuốn sách. Ngày đầu đọc ${frac(1, 3)} cuốn sách, ngày thứ hai đọc ${frac(2, 5)} cuốn sách, ngày thứ ba đọc nốt 32 trang. Cuốn sách dày bao nhiêu trang?`, steps: [`Hai ngày đầu đọc: ${frac(1, 3)} + ${frac(2, 5)} = ${frac(11, 15)} cuốn sách.`, `32 trang ứng với 1 − ${frac(11, 15)} = ${frac(4, 15)} cuốn sách.`, `Cuốn sách dày: 32 : ${frac(4, 15)} = <b>120</b> (trang).`] }],
    gens: wordGens.concat([
      { level: 1, name: 'Đổi đơn vị bằng phân số', fn() { const T = pick([['giờ', 'phút', 60, [2, 3, 4, 5, 6, 10, 12, 15, 20]], ['m', 'cm', 100, [2, 4, 5, 10, 20, 25]], ['kg', 'g', 1000, [2, 4, 5, 8, 10, 20, 25]], ['ngày', 'giờ', 24, [2, 3, 4, 6, 8, 12]]]); const d = pick(T[3]), n = R(1, d - 1); if (gcd(n, d) !== 1) return this.fn(); const v = T[2] * n / d; return Q({ text: `${frac(n, d)} ${T[0]} = ? ${T[1]}`, answer: v, wrongs: [T[2] * d / n === Math.floor(T[2] * d / n) ? T[2] * d / n : v + T[2] / d, T[2] / d, v + n], unit: T[1], hint: `1 ${T[0]} = ${T[2]} ${T[1]}; lấy ${T[2]} · ${frac(n, d)}.`, steps: [`${T[2]} · ${frac(n, d)} = <b>${fmt(v)}</b> ${T[1]}.`] }); } },
      { level: 2, name: 'Phần còn lại của tổng', fn() { const d = R(3, 9), n = R(1, d - 1), k = R(3, 8); if (gcd(n, d) !== 1) return this.fn(); const tot = d * k; const T = pick([['Lớp 6A có', 'học sinh', 'là học sinh nữ', 'học sinh nam'], ['Một thùng có', 'quả cam', 'đã được bán', 'quả cam chưa bán'], ['Một mảnh vải dài', 'm', 'đã được cắt ra', 'm vải còn lại']]); return Q({ text: `${T[0]} ${tot} ${T[1]}, trong đó ${frac(n, d)} ${T[2]}. Có bao nhiêu ${T[3]}?`, answer: tot - n * k, wrongs: [n * k, tot - n, (d - n) * k + k], unit: T[3].split(' ')[0] === 'm' ? 'm' : T[3].split(' ')[0] + ' ' + T[3].split(' ')[1], hint: `Tìm ${frac(n, d)} của ${tot} rồi lấy tổng trừ đi (hoặc tính ${frac(d - n, d)} của ${tot}).`, steps: [`Phần còn lại chiếm 1 − ${frac(n, d)} = ${frac(d - n, d)}.`, `${tot} · ${frac(d - n, d)} = <b>${tot - n * k}</b>.`] }); } },
      { level: 2, name: 'Tìm tổng số tiền', fn() { const d = R(3, 8), n = R(1, d - 1), k = pick([5, 10, 15, 20, 25]); if (gcd(n, d) !== 1) return this.fn(); const a = n * k * 1000; return Q({ text: `Bạn An dùng ${frac(n, d)} số tiền tiết kiệm để mua sách, hết ${fmt(a)} đồng. Hỏi bạn An có bao nhiêu tiền tiết kiệm?`, answer: d * k * 1000, wrongs: [a * n / d === Math.floor(a * n / d) ? a * n / d : a + 1000, a * d, (d - n) * k * 1000], unit: 'đồng', hint: 'Biết giá trị phân số của một số → chia cho phân số.', steps: [`${fmt(a)} : ${frac(n, d)} = ${fmt(a)} · ${frac(d, n)} = <b>${fmt(d * k * 1000)}</b> (đồng).`] }); } },
      { level: 3, name: 'Ba ngày – phần cuối', fn() { const d1 = pick([2, 3, 4, 5]), d2 = pick([3, 4, 5, 6]); if (d1 === d2) return this.fn(); const L = lcm(d1, d2); const used = L / d1 + L / d2; if (used >= L) return this.fn(); const k = R(2, 6); const tot = L * k; const rest = tot - used * k; const T = pick([['Một người đi quãng đường AB. Ngày thứ nhất đi', 'quãng đường, ngày thứ hai đi', 'quãng đường, ngày thứ ba đi nốt', 'km', 'Quãng đường AB dài bao nhiêu ki-lô-mét?'], ['Bạn Mai đọc một cuốn sách. Ngày đầu đọc', 'cuốn sách, ngày thứ hai đọc', 'cuốn sách, ngày thứ ba đọc nốt', 'trang', 'Cuốn sách dày bao nhiêu trang?']]); return Q({ text: `${T[0]} ${frac(1, d1)} ${T[1]} ${frac(1, d2)} ${T[2]} ${rest} ${T[3]}. ${T[4]}`, answer: tot, wrongs: [rest * 2, tot + k, rest * L / (L - used) + L], unit: T[3], hint: `Tìm phân số ứng với phần cuối: 1 − ${frac(1, d1)} − ${frac(1, d2)}.`, steps: [`Hai ngày đầu: ${frac(1, d1)} + ${frac(1, d2)} = ${sF(used, L)}.`, `Phần còn lại: 1 − ${sF(used, L)} = ${sF(L - used, L)} ứng với ${rest} ${T[3]}.`, `Cả quãng: ${rest} : ${sF(L - used, L)} = <b>${tot}</b> (${T[3]}).`] }); } }
    ])
  }]);

  // =====================================================================
  // CHƯƠNG VII — SỐ THẬP PHÂN
  // =====================================================================
  const pctGens = take('g6_dec', ['Phần trăm ra thập phân', 'm% của một số', 'Tỉ số phần trăm', 'Tỉ số hai số', 'Giảm giá', 'Tăng rồi giảm', 'Tìm giá gốc', 'Tiết kiệm có lãi']);
  const pctRules = takeRules('g6_dec', ['Tỉ số phần trăm']);
  set('g6_dec', {
    title: 'Số thập phân · Tính toán · Làm tròn và ước lượng',
    tagline: 'Số thập phân âm · So sánh · Cộng trừ nhân chia · Làm tròn · Ước lượng',
    summary: 'Phân số thập phân (mẫu là lũy thừa của 10) viết được dưới dạng số thập phân. Số thập phân gồm phần nguyên và phần thập phân, có thể âm. Tính toán với số thập phân theo quy tắc dấu như số nguyên; làm tròn và ước lượng để kiểm tra nhanh kết quả.',
    prereqs: ['g6_fracops'],
    poem: ['Dấu phẩy thẳng cột mới cộng,', 'Nhân xong đếm đủ phần sau mới tròn!'],
    pitfalls: D.topic('g6_dec').pitfalls.filter(p => !/20%/.test(p.wrong)).concat([{ wrong: '−2,5 > −2,1', right: '−2,5 < −2,1', why: 'Với hai số âm, số nào có phần “không dấu” lớn hơn thì nhỏ hơn.' }])
  });
  D.topic('g6_dec').rules.unshift({ title: 'Số thập phân – số đối – so sánh', desc: 'Số thập phân âm: −0,5; −3,25… Số đối của 3,25 là −3,25. So sánh: số âm < 0 < số dương; hai số dương: so sánh phần nguyên, rồi lần lượt từng hàng thập phân; hai số âm: số nào có số đối lớn hơn thì nhỏ hơn.', example: '−3,7 < −3,15 vì 3,7 > 3,15', tip: 'Thêm chữ số 0 vào cuối phần thập phân cho đủ hàng để so sánh dễ hơn.' });
  D.topic('g6_dec').rules.push({ title: 'Làm tròn số nguyên – Ước lượng', desc: 'Làm tròn số đến hàng chục, trăm, nghìn… như với số thập phân: xét chữ số ngay bên phải hàng làm tròn. Ước lượng: làm tròn các số rồi tính để biết kết quả khoảng bao nhiêu.', example: '12 345 ≈ 12 000 (hàng nghìn); 19,8 · 5,1 ≈ 20 · 5 = 100', tip: 'Ước lượng giúp phát hiện nhanh đặt sai dấu phẩy.' });

  add('g6_dec', [
    { level: 1, name: 'Số đối số thập phân', fn() { const x = round(nz(-999, 999) / 100, 2); return Q({ text: `Số đối của <b>${fmt(x)}</b> là:`, answer: -x, wrongs: [x, round(-x + (x > 0 ? -1 : 1) * 0.1, 2), round(1 / x, 2) || -x * 10], mcOpts: { positive: false }, keepMc: true, hint: 'Hai số đối nhau có tổng bằng 0.', steps: [`${fmt(x)} + ${N(-x)} = 0 → <b>${fmt(-x)}</b>.`] }); } },
    { level: 1, name: 'So sánh số thập phân âm', fn() { const a = R(10, 999) / 100, b = R(10, 999) / 100; if (a === b) return this.fn(); const k = R(0, 2); const x = k === 0 ? -a : k === 1 ? -a : a, y = k === 2 ? -b : -b; return Q({ text: `So sánh: <b>${fmt(x)} ... ${fmt(y)}</b>`, answer: cmp(x, y), options: SIGNS, shuffle: false, hint: 'Số âm: số nào có số đối lớn hơn thì nhỏ hơn.', steps: [`${fmt(x)} ${cmp(x, y)} ${fmt(y)}.`] }); } },
    { level: 2, name: 'Cộng trừ thập phân khác dấu', fn() { const a = round(R(11, 999) / 10, 1), b = round(R(11, 999) / 10, 1); const op = R(0, 2); const x = op === 0 ? -a : a; const v = op === 0 ? round(-a + b, 1) : op === 1 ? round(a - b, 1) : round(-a - b, 1); const text = op === 0 ? `(−${fmt(a)}) + ${fmt(b)}` : op === 1 ? `${fmt(a)} − ${fmt(b)}` : `(−${fmt(a)}) − ${fmt(b)}`; return Q({ text: `Tính: <b>${text}</b>`, answer: v, wrongs: [-v, round(a + b, 1), round(v + 1, 1)], mcOpts: { positive: false }, hint: 'Áp dụng quy tắc cộng, trừ số nguyên cho số thập phân.', steps: [`${text} = <b>${fmt(v)}</b>.`] }); } },
    { level: 2, name: 'Ước lượng kết quả', fn() { const A = R(2, 30), B = R(2, 12); const a = round(A + pick([-0.3, -0.2, -0.1, 0.1, 0.2, 0.3]), 1), b = round(B + pick([-0.2, -0.1, 0.1, 0.2]), 1); if (Math.round(a) !== A || Math.round(b) !== B) return this.fn(); return Q({ text: `Làm tròn các thừa số đến hàng đơn vị để ước lượng tích <b>${fmt(a)} · ${fmt(b)}</b>. Kết quả ước lượng là:`, answer: A * B, wrongs: [A * B * 10, A + B, (A + 1) * B], keepMc: true, hint: 'Làm tròn từng số đến hàng đơn vị rồi nhân.', steps: [`${fmt(a)} ≈ ${A}; ${fmt(b)} ≈ ${B}.`, `${A} · ${B} = <b>${A * B}</b>.`] }); } },
    { level: 3, name: 'Làm tròn số nguyên', fn() { const n = R(10000, 999999); const p = pick([10, 100, 1000]); const v = Math.round(n / p) * p; const name = { 10: 'chục', 100: 'trăm', 1000: 'nghìn' }[p]; return Q({ text: `Làm tròn số <b>${fmt(n)}</b> đến hàng ${name}.`, answer: v, wrongs: [Math.floor(n / p) * p === v ? v + p : Math.floor(n / p) * p, v - p, Math.round(n / (p * 10)) * p * 10 === v ? v + 2 * p : Math.round(n / (p * 10)) * p * 10], hint: `Xét chữ số ngay bên phải hàng ${name}: ≥ 5 thì tăng 1, < 5 thì giữ nguyên; các chữ số sau thay bằng 0.`, steps: [`${fmt(n)} ≈ <b>${fmt(v)}</b>.`] }); } }
  ]);

  D.addTopics(6, [{
    id: 'g6_pct', icon: '💯', title: 'Tỉ số và tỉ số phần trăm',
    tagline: 'Tỉ số hai số, hai đại lượng · Tỉ số % · Giá trị % của một số · Tỉ lệ bản đồ · Giảm giá, lãi suất',
    summary: 'Tỉ số của a và b (b ≠ 0) là a : b. Tỉ số của hai đại lượng cùng loại phải đổi về cùng đơn vị. Tỉ số phần trăm của a và b là a : b · 100%. Tìm m% của b: b · m/100; tìm số biết m% của nó bằng a: a : m/100.',
    prereqs: ['g6_dec'],
    rules: [
      { title: 'Tỉ số của hai số, hai đại lượng', desc: 'Tỉ số của a và b (b ≠ 0) là a : b, viết a/b. Với hai đại lượng cùng loại: đổi về <b>cùng đơn vị</b> rồi mới lập tỉ số.', example: `Tỉ số của 30 cm và 2 m là 30 : 200 = ${frac(3, 20)}`, tip: 'Tỉ số không kèm đơn vị.' }
    ].concat(pctRules, [
      { title: 'Hai bài toán về tỉ số phần trăm', desc: '① Giá trị m% của số b là b · m : 100. ② Biết m% của một số bằng a thì số đó là a : m · 100.', example: '25% của 160 là 40; 25% của một số là 40 → số đó là 40 : 25 · 100 = 160.', tip: 'Giống hai bài toán về phân số: m% = m/100.' },
      { title: 'Tỉ lệ bản đồ', desc: 'Tỉ lệ bản đồ 1 : n nghĩa là 1 cm trên bản đồ ứng với n cm ngoài thực tế. Khoảng cách thực = khoảng cách trên bản đồ · n.', example: 'Tỉ lệ 1 : 100 000, trên bản đồ 3 cm → thực tế 300 000 cm = 3 km', tip: '100 000 cm = 1 km.' }
    ]),
    poem: ['Phần trăm là chia một trăm,', 'Nhân rồi chia lại chẳng nhầm được đâu!', 'Đơn vị phải đổi cho đều,', 'Tỉ số mới đúng, chẳng điều gì sai!'],
    pitfalls: [
      { wrong: 'Tỉ số của 30 cm và 2 m là 30 : 2 = 15', right: `30 cm : 200 cm = ${frac(3, 20)}`, why: 'Hai đại lượng phải cùng đơn vị.' },
      { wrong: 'Giảm 20% rồi tăng 20% thì về giá cũ', right: '100 → 80 → 96', why: '20% sau tính trên giá đã giảm (nhỏ hơn).' }
    ],
    examples: [{ q: 'Một chiếc áo giá 250 000 đồng, được giảm 20%. Hỏi giá sau khi giảm?', steps: ['Số tiền giảm: 250 000 · 20 : 100 = 50 000 (đồng).', 'Giá mới: 250 000 − 50 000 = <b>200 000</b> (đồng).', 'Cách khác: 250 000 · 80% = 200 000 (đồng).'] }],
    gens: pctGens.concat([
      { level: 1, name: 'Tỉ số hai đại lượng', fn() { const T = pick([['cm', 'm', 100], ['g', 'kg', 1000], ['phút', 'giờ', 60], ['m', 'km', 1000]]); const big = R(1, 5); const small = R(1, T[2] * big - 1); if (small % 5 && T[2] !== 60) return this.fn(); return Q({ text: `Tỉ số của ${small} ${T[0]} và ${big} ${T[1]} là:`, answer: fracStr(small, T[2] * big), simplest: true, inputHint: 'Nhập dạng a/b (tối giản)', hint: `Đổi ${big} ${T[1]} = ${T[2] * big} ${T[0]} rồi lập tỉ số.`, steps: [`${big} ${T[1]} = ${T[2] * big} ${T[0]}.`, `Tỉ số: ${small} : ${T[2] * big} = <b>${sF(small, T[2] * big)}</b>.`] }); } },
      { level: 2, name: 'Tìm số biết m% của nó', fn() { const p = pick([5, 10, 20, 25, 40, 50, 75, 60]), b = R(2, 30) * 20; const a = b * p / 100; if (!Number.isInteger(a)) return this.fn(); return Q({ text: `${p}% của một số là ${fmt(a)}. Tìm số đó.`, answer: b, wrongs: [a * p / 100 === Math.floor(a * p / 100) && a * p / 100 !== b ? a * p / 100 : a + p, a * 100, b / 2], hint: 'Số đó = a : m · 100.', steps: [`${fmt(a)} : ${p} · 100 = <b>${fmt(b)}</b>.`] }); } },
      { level: 2, name: 'Tỉ lệ bản đồ', fn() { const n = pick([10000, 20000, 50000, 100000, 200000, 500000, 1000000]); const cm = R(2, 15); const real = cm * n; const km = real / 100000; const inKm = km >= 1 && Number.isInteger(km * 10); return Q({ text: `Trên bản đồ tỉ lệ 1 : ${fmt(n)}, khoảng cách giữa hai địa điểm là ${cm} cm. Khoảng cách thực tế là bao nhiêu ${inKm ? 'ki-lô-mét' : 'mét'}?`, answer: inKm ? km : real / 100, wrongs: inKm ? [km * 10, round(km / 10, 2), cm * n / 1000] : [real, real / 1000, real / 10], unit: inKm ? 'km' : 'm', hint: `Khoảng cách thực = ${cm} · ${fmt(n)} (cm), rồi đổi đơn vị.`, steps: [`${cm} · ${fmt(n)} = ${fmt(real)} cm.`, inKm ? `${fmt(real)} cm = <b>${fmt(km)}</b> km.` : `${fmt(real)} cm = <b>${fmt(real / 100)}</b> m.`] }); } },
      { level: 3, name: 'Tỉ số % hai đại lượng khác đơn vị', fn() { const T = pick([['phút', 'giờ', 60], ['cm', 'm', 100], ['g', 'kg', 1000]]); const big = R(1, 3); const p = pick([10, 20, 25, 40, 50, 75, 80]); const small = T[2] * big * p / 100; if (!Number.isInteger(small)) return this.fn(); return Q({ text: `Tỉ số phần trăm của ${small} ${T[0]} và ${big} ${T[1]} là:`, answer: p, unit: '%', wrongs: [round(small / big, 2), 100 - p, p * 2 > 100 ? p / 2 : p * 2], hint: `Đổi ${big} ${T[1]} ra ${T[0]} trước.`, steps: [`${big} ${T[1]} = ${T[2] * big} ${T[0]}.`, `${small} : ${T[2] * big} · 100% = <b>${p}%</b>.`] }); } }
    ])
  }]);

  // =====================================================================
  // CHƯƠNG VIII — NHỮNG HÌNH HÌNH HỌC CƠ BẢN
  // =====================================================================
  const angleGens = take('g6_lines', ['Loại góc', 'Số đo góc đặc biệt', 'Tên đỉnh, cạnh góc', 'Đếm góc', 'Kim đồng hồ', 'Góc kim đồng hồ rưỡi']);
  const angleRules = takeRules('g6_lines', ['Góc và số đo góc']);
  set('g6_lines', {
    title: 'Điểm, đường thẳng, tia, đoạn thẳng',
    tagline: 'Điểm thuộc đường thẳng · Ba điểm thẳng hàng · Tia · Đoạn thẳng · Trung điểm',
    summary: 'Điểm và đường thẳng; ba điểm thẳng hàng, điểm nằm giữa hai điểm; tia, hai tia đối nhau, trùng nhau; đoạn thẳng và độ dài; trung điểm của đoạn thẳng.',
    poem: ['Nằm giữa thì cộng hai đoạn,', 'Trung điểm chia đôi gọn gàng như nhau!']
  });
  D.topic('g6_lines').rules.unshift(
    { title: 'Điểm và đường thẳng', desc: 'Điểm đặt tên bằng chữ in hoa (A, B…), đường thẳng bằng chữ thường (a, d…) hoặc hai điểm thuộc nó (AB). A ∈ d: A thuộc d; B ∉ d: B không thuộc d. Có một và chỉ một đường thẳng đi qua hai điểm phân biệt. Hai đường thẳng phân biệt hoặc cắt nhau (có 1 điểm chung) hoặc song song (không có điểm chung).', example: 'Ba điểm cùng thuộc một đường thẳng là ba điểm thẳng hàng.', tip: 'Đường thẳng không bị giới hạn về hai phía.' },
    { title: 'Tia – hai tia đối nhau', desc: 'Hình gồm điểm O và một phần đường thẳng bị chia ra bởi O là một tia gốc O. Hai tia chung gốc tạo thành một đường thẳng là hai <b>tia đối nhau</b>.', example: 'O nằm trên đường thẳng xy thì Ox và Oy là hai tia đối nhau.', tip: 'Đọc tên tia: gốc viết trước (tia Ox, không viết xO).' }
  );
  add('g6_lines', [
    { level: 1, name: 'Kí hiệu điểm thuộc đường thẳng', fn() { const P = pick(['A', 'B', 'C', 'M', 'N', 'E', 'K']), d = pick(['a', 'b', 'd', 'm', 'n']); const inn = R(0, 1); const ans = `${P} ${inn ? '∈' : '∉'} ${d}`; return Q({ text: `Quan sát hình vẽ: điểm ${P} ${inn ? 'nằm trên' : 'không nằm trên'} đường thẳng ${d}. Kí hiệu là:`, visual: { type: 'geo', P: { _1: [0, 0.35], _2: [3, -0.35], [P]: inn ? [1.3, 0.047] : [1.5, -0.75], _d: [3, -0.35] }, lines: [{ a: '_1', b: '_2', ext: [24, 24], w: 2.5 }], dots: [P], show: [P, '_d'], names: { _d: d }, lp: { [P]: inn ? 'n' : 'n', _d: [1.6, 0.4] }, maxW: 250, maxH: 80 }, answer: ans, options: [ans, `${P} ${inn ? '∉' : '∈'} ${d}`, `${d} ∈ ${P}`, `${d} ∉ ${P}`], keepMc: true, hint: '“∈” đọc là thuộc, “∉” đọc là không thuộc; điểm viết trước.', steps: [`<b>${ans}</b>.`] }); } },
    { level: 1, name: 'Đếm đoạn thẳng', fn() { const n = R(3, 10); const v = n * (n - 1) / 2; const nm = 'ABCDEGHIKM'.slice(0, n).split(''); let x = 0; const pts = nm.map((c, i) => { const p = { n: c, x }; x += 1 + ((i * 3) % 4) * 0.25; return p; }); return Q({ text: `Trên đường thẳng ở hình dưới có ${n} điểm phân biệt. Có bao nhiêu đoạn thẳng có hai đầu mút là hai trong ${n} điểm đó?`, visual: MA.Vis.G.onLine(pts, { kind: 'line' }), answer: v, wrongs: [n * (n - 1), n - 1, n], unit: 'đoạn thẳng', hint: 'Mỗi cặp điểm cho một đoạn thẳng: n · (n − 1) : 2.', steps: [`${n} · ${n - 1} : 2 = <b>${v}</b>.`] }); } },
    { level: 2, name: 'Hai tia đối nhau', fn() { const O = pick(['O', 'A', 'M', 'I']); const [x, y] = pick([['x', 'y'], ['m', 'n'], ['x', "x'"], ['t', 'z']]); const q = R(0, 1); if (q) return Q({ text: `Điểm ${O} nằm trên đường thẳng ${x}${y} (như hình). Hai tia ${O}${x} và ${O}${y} là hai tia:`, visual: { type: 'geo', P: { _x: [-1, 0], [O]: [0, 0], _y: [1.3, 0] }, lines: [{ a: '_x', b: '_y', w: 2.8, arrow: 'ab' }], dots: [O], show: [O, '_x', '_y'], names: { _x: x, _y: y }, lp: { [O]: 's', _x: 'n', _y: 'n' }, maxW: 240, maxH: 1, padY: 26 }, answer: 'Đối nhau', options: ['Đối nhau', 'Trùng nhau', 'Song song', 'Không có điểm chung'], keepMc: true, hint: 'Hai tia chung gốc tạo thành một đường thẳng.', steps: [`${O}${x} và ${O}${y} chung gốc ${O}, tạo thành đường thẳng ${x}${y} → <b>đối nhau</b>.`] });
      const P3 = (O === 'A') ? ['M', 'B'] : ['A', 'B']; return Q({ text: `Cho ba điểm ${P3[0]}, ${O}, ${P3[1]} thẳng hàng, ${O} nằm giữa ${P3[0]} và ${P3[1]} (như hình). Hai tia nào đối nhau?`, visual: MA.Vis.G.onLine([{ n: P3[0], x: 0 }, { n: O, x: 1.2 }, { n: P3[1], x: 2.6 }], { kind: 'line', dotCol: { [O]: '#e5534b' } }), answer: `${O}${P3[0]} và ${O}${P3[1]}`, options: [`${O}${P3[0]} và ${O}${P3[1]}`, `${P3[0]}${O} và ${P3[1]}${O}`, `${P3[0]}${P3[1]} và ${P3[1]}${P3[0]}`, `${O}${P3[0]} và ${P3[0]}${P3[1]}`], keepMc: true, hint: 'Hai tia đối nhau có chung gốc là điểm nằm giữa.', steps: [`Gốc chung là ${O} → <b>${O}${P3[0]} và ${O}${P3[1]}</b>.`] }); } },
    { level: 3, name: 'Trung điểm trên trục số', fn() { const a = R(-9, 5), b = a + 2 * R(2, 6); return Q({ text: `Trên trục số, điểm A biểu diễn số ${fmt(a)}, điểm B biểu diễn số ${fmt(b)}. Trung điểm M của đoạn thẳng AB biểu diễn số nào?`, visual: { type: 'numberline', min: a - 1, max: b + 1, step: 1, points: [{ v: a, label: 'A' }, { v: b, label: 'B' }] }, answer: (a + b) / 2, wrongs: [(b - a) / 2, (a + b) / 2 + 1, (a + b) / 2 - 1], mcOpts: { positive: false }, keepMc: true, hint: 'AB dài b − a đơn vị; M cách A một nửa độ dài đó.', steps: [`AB = ${fmt(b)} − ${N(a)} = ${b - a}.`, `M cách A: ${(b - a) / 2} → M = ${fmt(a)} + ${(b - a) / 2} = <b>${fmt((a + b) / 2)}</b>.`] }); } }
  ]);

  D.addTopics(6, [{
    id: 'g6_angle', icon: '📏', title: 'Góc · Số đo góc',
    tagline: 'Đỉnh, cạnh của góc · Điểm trong góc · Đo góc · Góc nhọn, vuông, tù, bẹt',
    summary: 'Góc là hình gồm hai tia chung gốc. Đo góc bằng thước đo góc (đơn vị độ). Phân loại góc theo số đo: nhọn, vuông, tù, bẹt; so sánh hai góc qua số đo.',
    prereqs: ['g6_lines'],
    rules: [
      { title: 'Góc', desc: 'Góc là hình gồm hai tia chung gốc. Gốc chung là <b>đỉnh</b>, hai tia là hai <b>cạnh</b> của góc. Góc xOy kí hiệu ∠xOy (đỉnh O viết ở giữa). Hai tia đối nhau tạo thành <b>góc bẹt</b>.', example: '∠xOy có đỉnh O, cạnh Ox, Oy; cũng đọc là ∠yOx.', tip: 'Chữ ở giữa luôn là đỉnh.' }
    ].concat(angleRules, [
      { title: 'So sánh hai góc', desc: 'Hai góc bằng nhau nếu số đo bằng nhau; góc nào có số đo lớn hơn thì lớn hơn.', example: '∠A = 50°, ∠B = 70° → ∠A < ∠B', tip: 'Đo góc: đặt tâm thước trùng đỉnh, một cạnh đi qua vạch 0.' }
    ]),
    poem: ['Hai tia chung gốc thành góc,', 'Nhọn dưới chín mươi, tù hơn – bẹt thì một trăm tám mươi!'],
    pitfalls: [
      { wrong: 'Góc xOy kí hiệu ∠Oxy', right: '∠xOy – đỉnh O ở giữa', why: 'Chữ cái chỉ đỉnh phải viết ở giữa.' },
      { wrong: 'Góc 90° là góc nhọn', right: 'Góc 90° là góc vuông', why: 'Góc nhọn phải nhỏ hơn 90°.' }
    ],
    examples: [{ q: 'Lúc 3 giờ, kim giờ và kim phút tạo thành góc bao nhiêu độ? Đó là góc gì?', visual: { type: 'angle', deg: 90 }, steps: ['Mặt đồng hồ chia 12 phần, mỗi phần 30°.', 'Từ số 12 đến số 3 có 3 phần: 3 · 30° = <b>90°</b> → <b>góc vuông</b>.'] }],
    gens: angleGens.concat([
      { level: 1, name: 'Đọc tên góc', fn() { const O = pick(['O', 'A', 'B', 'M', 'I']); const [x, y] = pick([['x', 'y'], ['m', 'n'], ['x', 'z'], ['t', 'y'], ['a', 'b']]); const ans = `∠${x}${O}${y}`; return Q({ text: `Góc ở hình dưới có đỉnh ${O}, hai cạnh là ${O}${x} và ${O}${y}. Góc đó được kí hiệu là:`, visual: { type: 'angle', deg: R(35, 140), o: O, x, y, label: '' }, answer: ans, options: [ans, `∠${O}${x}${y}`, `∠${x}${y}${O}`, `∠${O}${y}${x}`], keepMc: true, hint: 'Đỉnh viết ở giữa.', steps: [`<b>${ans}</b> (hoặc ∠${y}${O}${x}).`] }); } },
      { level: 1, name: 'So sánh hai góc', fn() { const a = R(10, 175), b = R(10, 175); return Q({ text: `∠A = ${a}°, ∠B = ${b}°. So sánh: ∠A ... ∠B`, answer: cmp(a, b), options: SIGNS, shuffle: false, hint: 'Góc nào có số đo lớn hơn thì lớn hơn.', steps: [`${a}° ${cmp(a, b)} ${b}° → ∠A ${cmp(a, b)} ∠B.`] }); } },
      { level: 2, name: 'Góc trong hình quen thuộc', fn() { const T = pick([['tam giác đều', 60, 'eqtri'], ['hình vuông', 90, 'square'], ['hình chữ nhật', 90, 'rect'], ['lục giác đều', 120, 'hexagon']]); const ask = R(0, 1); const kind = T[1] < 90 ? 'Góc nhọn' : T[1] === 90 ? 'Góc vuông' : 'Góc tù'; if (ask) return Q({ text: `Mỗi góc của ${T[0]} là:`, visual: { type: 'shape', kind: T[2] }, answer: kind, options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'], shuffle: false, hint: 'Nhớ số đo góc của hình rồi so với 90°.', steps: [`Mỗi góc của ${T[0]} bằng ${T[1]}° → <b>${kind.toLowerCase()}</b>.`] });
        return Q({ text: `Mỗi góc của ${T[0]} có số đo bao nhiêu độ?`, visual: { type: 'shape', kind: T[2] }, answer: T[1], wrongs: [60, 90, 120, 180].filter(x => x !== T[1]), unit: '°', keepMc: true, hint: 'Tam giác đều 60°, hình vuông và hình chữ nhật 90°, lục giác đều 120°.', steps: [`<b>${T[1]}°</b>.`] }); } },
      { level: 2, name: 'Góc bẹt', fn() { const O = pick(['O', 'A', 'M', 'I', 'K']); const [x, y] = pick([['x', 'y'], ['m', 'n'], ['a', 'b'], ['t', 'z']]); const q = R(0, 1); return Q({ text: q ? `Điểm ${O} nằm trên đường thẳng ${x}${y} (như hình). Góc ${x}${O}${y} có số đo bao nhiêu độ?` : `Hai tia ${O}${x}, ${O}${y} đối nhau (như hình). Góc ${x}${O}${y} là góc gì?`, visual: { type: 'angle', deg: 180, o: O, x: y, y: x, label: '?' }, answer: q ? 180 : 'Góc bẹt', ...(q ? { wrongs: [90, 360, 0], unit: '°' } : { options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'], shuffle: false }), keepMc: true, hint: 'Hai tia đối nhau tạo thành góc bẹt.', steps: [`∠${x}${O}${y} là góc bẹt, số đo <b>180°</b>.`] }); } }
    ])
  }]);

  // =====================================================================
  // CHƯƠNG IX — DỮ LIỆU VÀ XÁC SUẤT THỰC NGHIỆM
  // =====================================================================
  const probGens = take('g6_stats', ['Xác suất thực nghiệm', 'Xác suất dạng thập phân', 'Số lần không xảy ra', 'Xác suất ngược', 'Dự đoán theo xác suất']);
  const probRules = takeRules('g6_stats', ['Xác suất thực nghiệm']);
  set('g6_stats', {
    title: 'Dữ liệu · Bảng thống kê · Biểu đồ',
    tagline: 'Thu thập, phân loại dữ liệu · Bảng thống kê · Biểu đồ tranh · Biểu đồ cột · Biểu đồ cột kép',
    summary: 'Thu thập, phân loại dữ liệu (số liệu, không phải số liệu), phát hiện dữ liệu không hợp lí; biểu diễn dữ liệu bằng bảng thống kê, biểu đồ tranh, biểu đồ cột, biểu đồ cột kép; đọc và phân tích số liệu.',
    poem: ['Đọc biểu đồ chú thích trước,', 'Hai màu cột kép – nhìn kĩ chớ nhầm!']
  });
  D.topic('g6_stats').rules.unshift({ title: 'Dữ liệu và thu thập dữ liệu', desc: 'Dữ liệu là số (số liệu) hoặc không phải số (tên, màu, ý kiến…). Thu thập bằng quan sát, làm thí nghiệm, lập phiếu hỏi, phỏng vấn… Cần kiểm tra tính hợp lí: dữ liệu sai định dạng hoặc vô lí (vd. chiều cao học sinh 15 m) phải loại bỏ.', example: 'Môn thể thao yêu thích: dữ liệu không phải số. Chiều cao (cm): số liệu.', tip: 'Dùng bảng kiểm đếm (gạch ||||) khi thu thập.' });
  D.topic('g6_stats').rules.push({ title: 'Biểu đồ cột kép', desc: 'Biểu đồ cột kép vẽ hai cột cạnh nhau cho mỗi đối tượng để so sánh hai bộ dữ liệu cùng loại. Chú thích cho biết màu của từng bộ dữ liệu.', visual: { type: 'bar2', names: ['Nam', 'Nữ'], data: [{ label: '6A', a: 18, b: 20 }, { label: '6B', a: 22, b: 17 }, { label: '6C', a: 15, b: 19 }] }, example: 'Lớp 6B có 22 bạn nam, 17 bạn nữ.', tip: 'Luôn xem chú thích màu trước khi đọc.' });
  const CLS = ['6A', '6B', '6C', '6D', '6E'];
  const bar2 = (k) => { const data = CLS.slice(0, k).map(l => ({ label: l, a: R(5, 25), b: R(5, 25) })); return data; };
  add('g6_stats', [
    { level: 1, name: 'Dữ liệu không hợp lí', fn() { const kind = pick([['Chiều cao (cm) của 5 bạn lớp 6', () => R(130, 160), (x) => x * 10], ['Cân nặng (kg) của 5 bạn lớp 6', () => R(28, 50), (x) => x * 10], ['Số học sinh của 5 lớp', () => R(30, 45), (x) => -x], ['Điểm kiểm tra (thang 10) của 5 bạn', () => R(4, 10), (x) => x + 10]]); const vals = []; while (vals.length < 4) { const v = kind[1](); if (!vals.includes(v)) vals.push(v); } const bad = kind[2](vals[0]); const list = shuffle(vals.slice(1).concat(bad)); return Q({ text: `${kind[0]}: ${list.map(fmt).join('; ')}. Giá trị nào <b>không hợp lí</b>?`, answer: fmt(bad), options: list.map(fmt), keepMc: true, hint: 'Tìm giá trị vô lí so với thực tế.', steps: [`<b>${fmt(bad)}</b> không hợp lí trong thực tế.`] }); } },
    { level: 2, name: 'Đọc biểu đồ cột kép', fn() { const data = bar2(4); const i = R(0, 3), s = R(0, 1); const q = R(0, 1); const v = s ? data[i].b : data[i].a; return Q({ text: q ? `Biểu đồ cột kép cho biết số học sinh nam, nữ của các lớp. Lớp ${data[i].label} có tất cả bao nhiêu học sinh?` : `Biểu đồ cột kép cho biết số học sinh nam, nữ của các lớp. Lớp ${data[i].label} có bao nhiêu học sinh ${s ? 'nữ' : 'nam'}?`, visual: { type: 'bar2', names: ['Nam', 'Nữ'], data }, answer: q ? data[i].a + data[i].b : v, wrongs: q ? [data[i].a, data[i].b, data[i].a + data[i].b + 1] : [s ? data[i].a : data[i].b, v + 1, v - 1], unit: 'học sinh', hint: 'Xanh: nam · Cam: nữ. Đọc số trên đầu cột.', steps: [q ? `${data[i].a} + ${data[i].b} = <b>${data[i].a + data[i].b}</b>.` : `Cột ${s ? 'cam' : 'xanh'} của lớp ${data[i].label}: <b>${v}</b>.`] }); } },
    { level: 2, name: 'Biểu đồ cột kép: so sánh', fn() { const data = bar2(4); if (new Set(data.map(d => d.a - d.b)).size < 4 || data.some(d => d.a === d.b)) return this.fn(); const q = R(0, 1); if (q) { const cnt = data.filter(d => d.b > d.a).length; return Q({ text: 'Biểu đồ cột kép cho biết số học sinh nam, nữ của các lớp. Có bao nhiêu lớp có số học sinh nữ nhiều hơn số học sinh nam?', visual: { type: 'bar2', names: ['Nam', 'Nữ'], data }, answer: cnt, wrongs: [0, 1, 2, 3, 4].filter(x => x !== cnt), keepMc: true, hint: 'So sánh cột cam với cột xanh ở từng lớp.', steps: [data.map(d => `${d.label}: ${d.b > d.a ? 'nữ nhiều hơn' : 'nam nhiều hơn'}`).join('; ') + '.', `<b>${cnt}</b> lớp.`] }); }
      const best = data.slice().sort((x, y) => Math.abs(y.a - y.b) - Math.abs(x.a - x.b))[0]; return Q({ text: 'Lớp nào có chênh lệch giữa số học sinh nam và nữ <b>lớn nhất</b>?', visual: { type: 'bar2', names: ['Nam', 'Nữ'], data }, answer: best.label, options: data.map(d => d.label), shuffle: false, keepMc: true, hint: 'Tính hiệu số nam và nữ của từng lớp.', steps: [data.map(d => `${d.label}: ${Math.abs(d.a - d.b)}`).join('; ') + '.', `Lớn nhất: <b>${best.label}</b>.`] }); } },
    { level: 3, name: 'Bảng thống kê thiếu số liệu', fn() { const items = shuffle(['Bóng đá', 'Cầu lông', 'Bơi', 'Cờ vua', 'Bóng rổ']).slice(0, 4); const vals = items.map(() => R(3, 15)); const k = R(0, 3); const tot = vals.reduce((a, b) => a + b, 0); return Q({ text: `Bảng thống kê môn thể thao yêu thích của lớp 6A (${tot} học sinh, mỗi bạn chọn một môn):<br>${items.map((it, i) => `${it}: <b>${i === k ? '?' : vals[i]}</b>`).join(' · ')}<br>Số bạn thích ${items[k]} là bao nhiêu?`, answer: vals[k], wrongs: [vals[k] + 1, vals[k] - 1 || vals[k] + 2, tot - vals[k]], unit: 'học sinh', hint: 'Lấy tổng số học sinh trừ tổng các số đã biết.', steps: [`${tot} − (${vals.filter((_, i) => i !== k).join(' + ')}) = <b>${vals[k]}</b>.`] }); } }
  ]);

  const DIE = [['nhỏ hơn 7', 'c'], ['lớn hơn 0', 'c'], ['bằng 7', 'k'], ['bằng 0', 'k'], ['lớn hơn 6', 'k'], ['là số chẵn', 'p'], ['là số nguyên tố', 'p'], ['chia hết cho 3', 'p'], ['bằng 6', 'p'], ['nhỏ hơn 3', 'p']];
  const EV = { c: 'Chắc chắn xảy ra', k: 'Không thể xảy ra', p: 'Có thể xảy ra' };
  D.addTopics(6, [{
    id: 'g6_prob', icon: '🎲', title: 'Kết quả có thể · Sự kiện · Xác suất thực nghiệm',
    tagline: 'Kết quả có thể của trò chơi, thí nghiệm · Sự kiện chắc chắn, không thể, có thể · Xác suất thực nghiệm',
    summary: 'Liệt kê các kết quả có thể của một trò chơi, thí nghiệm (gieo xúc xắc, tung đồng xu, rút thẻ…); nhận biết sự kiện chắc chắn, không thể, có thể xảy ra; tính xác suất thực nghiệm = số lần sự kiện xảy ra : tổng số lần thực hiện.',
    prereqs: ['g6_stats'],
    rules: [
      { title: 'Kết quả có thể', desc: 'Kết quả có thể là những gì có thể xảy ra khi thực hiện trò chơi, thí nghiệm. Tung đồng xu: 2 kết quả (S, N). Gieo xúc xắc: 6 kết quả (1, 2, …, 6 chấm).', example: 'Rút 1 thẻ trong 10 thẻ đánh số 1 – 10: có 10 kết quả có thể.', tip: 'Liệt kê đầy đủ, không bỏ sót, không trùng.' },
      { title: 'Sự kiện', desc: 'Sự kiện <b>chắc chắn</b> xảy ra: luôn xảy ra; <b>không thể</b> xảy ra: không bao giờ xảy ra; <b>có thể</b> xảy ra: có lúc xảy ra, có lúc không.', example: 'Gieo xúc xắc: “số chấm nhỏ hơn 7” chắc chắn; “số chấm bằng 7” không thể; “số chấm là số chẵn” có thể.', tip: 'Xét tất cả các kết quả có thể để kết luận.' }
    ].concat(probRules),
    poem: ['Chắc chắn – luôn luôn sẽ đến,', 'Không thể – chẳng bao giờ,', 'Có thể – lúc có lúc không,', 'Số lần chia tổng – xác suất ra liền!'],
    pitfalls: [
      { wrong: 'Tung đồng xu 10 lần được 7 lần ngửa → xác suất thực nghiệm mặt sấp là 7/10', right: 'Mặt sấp: 3 lần → 3/10', why: 'Đọc kĩ sự kiện được hỏi.' },
      { wrong: '“Gieo được 6 chấm” là sự kiện không thể', right: 'Là sự kiện có thể xảy ra', why: 'Mặt 6 chấm là một kết quả có thể.' }
    ],
    examples: [{ q: 'Gieo xúc xắc 40 lần, mặt 6 chấm xuất hiện 8 lần. Tính xác suất thực nghiệm xuất hiện mặt 6 chấm.', steps: [`P = 8 : 40 = ${frac(8, 40)} = <b>${frac(1, 5)}</b>.`] }],
    gens: probGens.concat([
      { level: 1, name: 'Số kết quả có thể', fn() { const T = pick([['Tung một đồng xu', 2], ['Gieo một con xúc xắc 6 mặt', 6], ['Rút ngẫu nhiên một thẻ từ hộp có các thẻ đánh số từ 1 đến ' + R(5, 20), 0], ['Lấy ngẫu nhiên một quả bóng từ hộp có bóng xanh, đỏ, vàng (mỗi màu một quả)', 3], ['Quay một vòng quay chia thành ' + R(4, 12) + ' ô có màu khác nhau', 0]]); const n = T[1] || +T[0].match(/\d+(?!.*\d)/)[0]; return Q({ text: `${T[0]}. Có bao nhiêu kết quả có thể?`, answer: n, wrongs: [n - 1, n + 1, n * 2], keepMc: true, hint: 'Liệt kê tất cả những gì có thể xảy ra.', steps: [`Có <b>${n}</b> kết quả có thể.`] }); } },
      { level: 1, name: 'Chắc chắn – không thể – có thể', fn() { const [e, k] = pick(DIE); return Q({ text: `Gieo một con xúc xắc 6 mặt. Sự kiện “Số chấm xuất hiện ${e}” là sự kiện:`, answer: EV[k], options: [EV.c, EV.k, EV.p], shuffle: false, keepMc: true, hint: 'Xét lần lượt 6 kết quả có thể: 1, 2, 3, 4, 5, 6.', steps: [`Sự kiện “${e}”: <b>${EV[k].toLowerCase()}</b>.`] }); } },
      { level: 2, name: 'Đếm kết quả thuận lợi', fn() { const n = R(10, 30), k = pick([2, 3, 4, 5]); const kind = R(0, 1); const cnt = kind ? Math.floor(n / k) : [...Array(n).keys()].map(i => i + 1).filter(x => x > 1 && [...Array(x).keys()].slice(2).every(d => x % d)).length; return Q({ text: `Một hộp có ${n} thẻ đánh số từ 1 đến ${n}. Rút ngẫu nhiên một thẻ. Có bao nhiêu kết quả làm cho sự kiện “Số trên thẻ ${kind ? 'chia hết cho ' + k : 'là số nguyên tố'}” xảy ra?`, answer: cnt, wrongs: [cnt + 1, cnt - 1, n - cnt], keepMc: true, hint: kind ? `Đếm các bội của ${k} từ 1 đến ${n}.` : `Liệt kê các số nguyên tố không vượt quá ${n}.`, steps: [`Có <b>${cnt}</b> kết quả.`] }); } },
      { level: 3, name: 'So sánh khả năng qua thực nghiệm', fn() { const n = pick([20, 30, 40, 50]); const cols = ['Đỏ', 'Xanh', 'Vàng']; const a = R(3, n - 10), b = R(2, n - a - 2); const c = n - a - b; if (new Set([a, b, c]).size < 3) return this.fn(); const vals = [a, b, c]; const mx = vals.indexOf(Math.max(...vals)); return Q({ text: `Lấy bóng (có trả lại) ${n} lần từ một hộp có ba màu bóng: Đỏ ${a} lần, Xanh ${b} lần, Vàng ${c} lần. Theo xác suất thực nghiệm, màu nào có khả năng được lấy ra cao nhất? Xác suất thực nghiệm của màu đó là bao nhiêu?`, answer: `${cols[mx]} – ${fracStr(vals[mx], n)}`, options: cols.map((cl, i) => `${cl} – ${fracStr(vals[i], n)}`).concat(`${cols[mx]} – ${fracStr(n - vals[mx], n)}`), keepMc: true, hint: 'Màu xuất hiện nhiều lần nhất có xác suất thực nghiệm lớn nhất.', steps: [`${cols[mx]}: ${vals[mx]} : ${n} = <b>${fracStr(vals[mx], n)}</b>.`] }); } }
    ])
  }]);

  // bài nền tảng các chủ đề tách ra
  D.topic('g6_frac').prereqs = ['g6_gcd', 'g6_int'];
})(window.MA);
