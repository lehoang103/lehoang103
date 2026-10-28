/* =========================================================
 * grade6-lythuyet.js — ÔN LUYỆN LÝ THUYẾT TOÁN 6 THEO SGK (17/10/2026)
 * Bám sát mục lục SGK Toán 6 – Tập một, bộ "Kết nối tri thức với cuộc sống":
 *   Chương I   Tập hợp các số tự nhiên            (Bài 1 – 7)
 *   Chương II  Tính chia hết trong tập hợp số TN   (Bài 8 – 12)
 *   Chương III Số nguyên                           (Bài 13 – 17)
 *   Chương IV  Một số hình phẳng trong thực tiễn   (Bài 18 – 20)
 *   Chương V   Tính đối xứng của hình phẳng        (Bài 21 – 22)
 *   Hoạt động thực hành trải nghiệm
 *
 * Mỗi bài: Cần nhớ · Công thức · Thẻ hỏi – đáp · Câu Đúng/Sai · Trắc nghiệm lý thuyết.
 * File này:
 *   1. Đăng ký sách Tập một vào kho MA.Theory (js/data/theory-core.js).
 *   2. Thêm chủ đề mới g6_sym "Tính đối xứng của hình phẳng" (Chương V – trước đây chưa có).
 *   3. Thêm dạng bài "📘 Lý thuyết SGK" vào từng chủ đề lớp 6 tương ứng
 *      → câu hỏi lý thuyết xuất hiện cả trong Luyện tập, Kiểm tra, Ôn tập thông minh.
 * Nạp SAU grade6-more.js và TRƯỚC curriculum.js.
 * ========================================================= */
(function (MA) {
  'use strict';
  const { R, pick, Q, shuffle, frac } = MA.U;
  const P = (a, n) => `${a}<sup>${n}</sup>`;
  const OV = (s) => `<span class="ov">${s}</span>`;
  
  const Theory = MA.Theory;   // kho chung: js/data/theory-core.js

  // =====================================================================
  // 2. HÌNH MINH HỌA: TRỤC / TÂM ĐỐI XỨNG  ({ type: 'sym', shape, axes, center })
  // =====================================================================
  const SH = {
    eqtri: { pts: [[150, 18], [235, 165], [65, 165]], c: [150, 116], ax: [90, 30, 150], ctr: false, fill: 'rgba(46,163,107,.16)' },
    square: { pts: [[85, 25], [215, 25], [215, 155], [85, 155]], c: [150, 90], ax: [0, 90, 45, 135], ctr: true, fill: 'rgba(74,123,216,.14)' },
    rect: { pts: [[55, 42], [245, 42], [245, 138], [55, 138]], c: [150, 90], ax: [0, 90], ctr: true, fill: 'rgba(74,123,216,.14)' },
    rhombus: { pts: [[150, 12], [235, 90], [150, 168], [65, 90]], c: [150, 90], ax: [0, 90], ctr: true, fill: 'rgba(227,93,155,.14)' },
    para: { pts: [[105, 40], [255, 40], [195, 140], [45, 140]], c: [150, 90], ax: [], ctr: true, fill: 'rgba(242,159,61,.18)' },
    trap: { pts: [[105, 40], [195, 40], [250, 140], [50, 140]], c: [150, 90], ax: [90], ctr: false, fill: 'rgba(34,164,181,.16)' },
    hexagon: { pts: [0, 60, 120, 180, 240, 300].map(a => [150 + 78 * Math.cos(a * Math.PI / 180), 90 + 78 * Math.sin(a * Math.PI / 180)]), c: [150, 90], ax: [0, 30, 60, 90, 120, 150], ctr: true, fill: 'rgba(142,108,216,.16)' },
    circle: { r: 74, c: [150, 90], ax: [0, 45, 90, 135], ctr: true, fill: 'rgba(74,123,216,.12)' }
  };
  const symSvg = (v) => {
    const C = MA.Vis.C, s = SH[v.shape] || SH.square; const [cx, cy] = s.c; let out = '';
    out += s.r ? `<circle cx="${cx}" cy="${cy}" r="${s.r}" fill="${s.fill}" stroke="${C.ink}" stroke-width="2.5"/>`
      : `<polygon points="${s.pts.map(p => p.map(x => x.toFixed(1)).join(',')).join(' ')}" fill="${s.fill}" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
    if (v.axes) s.ax.forEach(a => { const r = a * Math.PI / 180, L = 105, dx = L * Math.cos(r), dy = -L * Math.sin(r);
      out += `<line x1="${(cx - dx).toFixed(1)}" y1="${(cy - dy).toFixed(1)}" x2="${(cx + dx).toFixed(1)}" y2="${(cy + dy).toFixed(1)}" stroke="${C.red}" stroke-width="2" stroke-dasharray="6 5"/>`; });
    if (v.center && s.ctr) out += `<circle cx="${cx}" cy="${cy}" r="5" fill="${C.blue}" stroke="#fff" stroke-width="1.5"/><text x="${cx + 9}" y="${cy - 9}" font-size="15" font-weight="800" fill="${C.blue}">O</text>`;
    return `<svg class="vis-svg" viewBox="0 0 300 180" width="100%" style="max-width:300px" role="img" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  };
  if (MA.Vis && MA.Vis.add) {
    MA.Vis.add('sym', symSvg);
    // dãy hình nhỏ có tên (đếm hình có trục / tâm đối xứng)
    MA.Vis.add('symrow', (v) => `<div class="symrow" style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px">${v.items.map(it => `<div style="width:112px">${symSvg({ shape: it.shape })}<div style="font-size:12.5px;font-weight:700">${it.label}</div></div>`).join('')}</div>`);
  }

  // =====================================================================
  // 3. CHỦ ĐỀ MỚI: TÍNH ĐỐI XỨNG CỦA HÌNH PHẲNG (Chương V – Bài 21, 22)
  // =====================================================================
  const SHAPES = [
    // [tên, kiểu hình, số trục đối xứng (−1 = vô số), có tâm đối xứng]
    ['Tam giác đều', 'eqtri', 3, false],
    ['Hình vuông', 'square', 4, true],
    ['Hình chữ nhật', 'rect', 2, true],
    ['Hình thoi', 'rhombus', 2, true],
    ['Hình bình hành', 'para', 0, true],
    ['Hình thang cân', 'trap', 1, false],
    ['Lục giác đều', 'hexagon', 6, true],
    ['Hình tròn', 'circle', -1, true]
  ];
  const axTxt = (n) => n < 0 ? 'Vô số' : n === 0 ? 'Không có' : String(n);
  // chữ in hoa (kiểu chữ in thông thường, như SGK)
  const L_AXIS = 'AHIMOTUVWXY'.split('').concat('BCDEK'.split('')), L_NOAXIS = 'FGJLNPQRSZ'.split('');
  const L_CTR = 'HINOSXZ'.split(''), L_NOCTR = 'ABCDEFGJKLMPQRTUVWY'.split('');
  const big = (c) => `<b class="th-letter">${c}</b>`;

  MA.Data.addTopics(6, [{
    id: 'g6_sym', icon: '🦋', title: 'Tính đối xứng của hình phẳng',
    tagline: 'Hình có trục đối xứng · Hình có tâm đối xứng · Đối xứng trong tự nhiên',
    summary: 'Nhận biết hình có trục đối xứng (gấp đôi theo một đường thẳng thì hai nửa trùng khít) và hình có tâm đối xứng (quay nửa vòng quanh một điểm thì trùng với chính nó); tìm trục, tâm đối xứng của các hình đã học, chữ cái và hình trong tự nhiên.',
    prereqs: ['g6_shapes'],
    rules: [
      { title: 'Hình có trục đối xứng', desc: 'Hình có trục đối xứng d nếu khi gấp hình theo đường thẳng d thì hai nửa của hình chồng khít lên nhau. Đường thẳng d gọi là <b>trục đối xứng</b> của hình.', example: 'Tam giác đều: 3 trục · Hình vuông: 4 trục · Hình chữ nhật: 2 trục · Hình thoi: 2 trục (hai đường chéo) · Hình thang cân: 1 trục · Lục giác đều: 6 trục · Hình tròn: vô số trục (mọi đường kính).', tip: 'Hình bình hành (không phải chữ nhật, không phải thoi) <b>không có</b> trục đối xứng. Đường chéo hình chữ nhật <b>không phải</b> trục đối xứng!', visual: [{ type: 'sym', shape: 'eqtri', axes: true }, { type: 'sym', shape: 'hexagon', axes: true }] },
      { title: 'Hình có tâm đối xứng', desc: 'Hình có tâm đối xứng O nếu khi quay hình nửa vòng (180°) quanh điểm O thì hình thu được trùng với chính nó. Điểm O gọi là <b>tâm đối xứng</b> của hình.', example: 'Hình chữ nhật, hình vuông, hình thoi, hình bình hành: tâm là giao điểm hai đường chéo. Lục giác đều, hình tròn: tâm của hình.', tip: 'Tam giác đều và hình thang cân <b>không có</b> tâm đối xứng.', visual: [{ type: 'sym', shape: 'para', center: true }, { type: 'sym', shape: 'rect', center: true }] },
      { title: 'Vừa có trục, vừa có tâm', desc: 'Hình vuông, hình chữ nhật, hình thoi, lục giác đều, hình tròn vừa có trục đối xứng vừa có tâm đối xứng.', example: 'Chữ H, I, O, X vừa có trục vừa có tâm đối xứng. Chữ N, S, Z chỉ có tâm đối xứng. Chữ A, M, T, U chỉ có trục đối xứng.', tip: 'Thử “quay ngược” trang giấy: chữ nào vẫn đọc như cũ thì có tâm đối xứng.', visual: { type: 'sym', shape: 'square', axes: true, center: true } }
    ],
    poem: ['Gấp đôi trùng khít – có trục,', 'Quay nửa vòng y nguyên – có tâm!', 'Bình hành có tâm, không trục,', 'Thang cân một trục, tâm thì không.'],
    pitfalls: [
      { wrong: 'Hình chữ nhật có 4 trục đối xứng (kể cả hai đường chéo)', right: 'Hình chữ nhật chỉ có 2 trục: hai đường thẳng đi qua trung điểm các cạnh đối', why: 'Gấp theo đường chéo, hai nửa hình chữ nhật không trùng khít.' },
      { wrong: 'Hình bình hành có trục đối xứng', right: 'Hình bình hành có tâm đối xứng, không có trục đối xứng', why: 'Tâm là giao điểm hai đường chéo; gấp theo đường nào cũng không trùng khít.' },
      { wrong: 'Hình có tâm đối xứng thì cũng có trục đối xứng', right: 'Không nhất thiết: hình bình hành, chữ N, chữ S có tâm nhưng không có trục', why: 'Trục và tâm đối xứng là hai tính chất khác nhau.' }
    ],
    examples: [
      { q: 'Hình thoi có mấy trục đối xứng? Có tâm đối xứng không?', visual: { type: 'sym', shape: 'rhombus', axes: true, center: true }, steps: ['Gấp theo mỗi đường chéo, hai nửa hình thoi trùng khít → hai đường chéo là <b>2 trục</b> đối xứng.', 'Quay nửa vòng quanh giao điểm O của hai đường chéo, hình thoi trùng với chính nó → O là <b>tâm đối xứng</b>.'] },
      { q: 'Trong các chữ cái H, A, N, T, chữ nào có tâm đối xứng?', steps: ['Quay nửa vòng: H → H, N → N; còn A, T bị lộn ngược.', 'Chữ có tâm đối xứng: <b>H và N</b>.'] }
    ],
    gens: [
      { level: 1, name: 'Số trục đối xứng', fn() { const [n, k, ax] = pick(SHAPES); const ans = axTxt(ax); return Q({ text: `<b>${n}</b> có bao nhiêu trục đối xứng?`, visual: { type: 'sym', shape: k }, answer: ans, options: shuffle(['0', '1', '2', '3', '4', '6', 'Vô số'].filter(x => x !== ans && !(ans === 'Không có' && x === '0'))).slice(0, 3).concat(ans), keepMc: true, hint: 'Tìm các đường thẳng mà gấp theo đó hai nửa hình trùng khít.', steps: [`${n} có <b>${ans === 'Không có' ? 'không có' : ans}</b> trục đối xứng.`], solVisual: { type: 'sym', shape: k, axes: true } }); } },
      { level: 1, name: 'Hình có tâm đối xứng', fn() { const has = R(0, 1); const yes = SHAPES.filter(s => s[3]).map(s => s[0]), no = ['Tam giác đều', 'Hình thang cân', 'Tam giác vuông', 'Ngũ giác đều', 'Tam giác cân']; const ans = pick(has ? yes : no); const wr = shuffle(has ? no : yes).slice(0, 3); return Q({ text: `Hình nào sau đây <b>${has ? 'có' : 'không có'}</b> tâm đối xứng?`, answer: ans, options: [ans].concat(wr), keepMc: true, hint: 'Quay hình nửa vòng quanh một điểm: hình trùng với chính nó → có tâm đối xứng.', steps: [`<b>${ans}</b> ${has ? 'có' : 'không có'} tâm đối xứng.`] }); } },
      { level: 1, name: 'Chữ cái đối xứng', fn() { const kind = R(0, 2); let ans, wr, what;
        if (kind === 0) { ans = pick(L_AXIS); wr = shuffle(L_NOAXIS).slice(0, 3); what = 'có trục đối xứng'; }
        else if (kind === 1) { ans = pick(L_CTR); wr = shuffle(L_NOCTR).slice(0, 3); what = 'có tâm đối xứng'; }
        else { ans = pick(['H', 'I', 'O', 'X']); wr = shuffle(['N', 'S', 'Z', 'A', 'M', 'T', 'U', 'E', 'F', 'L']).slice(0, 3); what = 'vừa có trục đối xứng, vừa có tâm đối xứng'; }
        return Q({ text: `Chữ cái in hoa nào sau đây <b>${what}</b>?`, answer: ans, options: [ans].concat(wr), keepMc: true, hint: kind === 1 ? 'Xoay ngược trang giấy: chữ vẫn y nguyên → có tâm đối xứng.' : 'Thử gấp chữ theo đường dọc hoặc đường ngang ở giữa.', steps: [`Chữ <b>${ans}</b> ${what}.`] }); } },
      { level: 2, name: 'Hình theo số trục', fn() { const pool = SHAPES.filter(s => s[2] !== 2); const [n, k, ax] = pick(pool); const wr = shuffle(SHAPES.filter(s => s[2] !== ax).map(s => s[0])).slice(0, 3); return Q({ text: ax < 0 ? 'Hình nào sau đây có <b>vô số</b> trục đối xứng?' : ax === 0 ? 'Hình nào sau đây <b>không có</b> trục đối xứng nhưng có tâm đối xứng?' : `Hình nào sau đây có <b>đúng ${ax}</b> trục đối xứng?`, answer: n, options: [n].concat(wr), keepMc: true, hint: 'Nhớ: tam giác đều 3 · vuông 4 · chữ nhật 2 · thoi 2 · thang cân 1 · lục giác đều 6 · tròn vô số · bình hành 0.', steps: [`<b>${n}</b> có ${axTxt(ax).toLowerCase()} trục đối xứng.`], solVisual: { type: 'sym', shape: k, axes: true, center: true } }); } },
      { level: 2, name: 'Đối xứng tâm trên trục số', fn() { const m = R(-4, 4), a = m + (R(0, 1) ? 1 : -1) * R(1, 5); const b = 2 * m - a; return Q({ text: `Trên trục số, điểm A biểu diễn số <b>${MA.U.fmt(a)}</b>. Điểm B đối xứng với A qua điểm O biểu diễn số <b>${MA.U.fmt(m)}</b> (O là trung điểm của AB). B biểu diễn số nào?`, visual: { type: 'numberline', min: Math.min(a, b) - 1, max: Math.max(a, b) + 1, step: 1, points: [{ v: a, label: 'A' }, { v: m, label: 'O' }] }, answer: b, wrongs: [-a, a, b + 1, b - 1].filter(x => x !== b), mcOpts: { positive: false }, keepMc: true, hint: 'B cách O đúng bằng A cách O, nhưng nằm ở phía bên kia.', steps: [`A cách O: ${Math.abs(a - m)} đơn vị về bên ${a < m ? 'trái' : 'phải'}.`, `B cách O ${Math.abs(a - m)} đơn vị về bên ${a < m ? 'phải' : 'trái'} → B = <b>${MA.U.fmt(b)}</b>.`] }); } },
      { level: 2, name: 'Đếm hình có trục, có tâm', fn() { const ls = shuffle(SHAPES).slice(0, 5); const kind = R(0, 1); const cnt = ls.filter(s => kind ? s[3] : s[2] !== 0).length; return Q({ text: `Trong các hình dưới đây: ${ls.map(s => s[0].toLowerCase()).join(', ')}. Có bao nhiêu hình <b>có ${kind ? 'tâm' : 'trục'} đối xứng</b>?`, visual: { type: 'symrow', items: ls.map(s => ({ shape: s[1], label: s[0] })) }, answer: cnt, wrongs: shuffle([0, 1, 2, 3, 4, 5].filter(x => x !== cnt)), keepMc: true, hint: kind ? 'Tam giác đều, hình thang cân không có tâm đối xứng.' : 'Chỉ hình bình hành (trong các hình đã học) không có trục đối xứng.', steps: [ls.map(s => `${s[0]}: ${kind ? (s[3] ? 'có' : 'không') : (s[2] !== 0 ? 'có' : 'không')}`).join('; ') + '.', `Có <b>${cnt}</b> hình.`] }); } },
      { level: 3, name: 'Đa giác đều n cạnh', fn() { const n = R(5, 12); const q = R(0, 1); const visual = MA.Vis.G.regular(n, { maxW: 150, maxH: 150, caption: `Đa giác đều ${n} cạnh` }); if (q) return Q({ text: `Đa giác đều ${n} cạnh ở hình dưới (${n} cạnh bằng nhau, ${n} góc bằng nhau) có bao nhiêu trục đối xứng?`, visual, answer: n, wrongs: [n / 2 === Math.floor(n / 2) ? n / 2 : n - 1, 2 * n, n + 1], keepMc: true, hint: 'Tam giác đều 3 cạnh → 3 trục; hình vuông 4 cạnh → 4 trục; lục giác đều 6 cạnh → 6 trục.', steps: ['Đa giác đều n cạnh có đúng n trục đối xứng.', `Đa giác đều ${n} cạnh có <b>${n}</b> trục đối xứng.`] });
        return Q({ text: `Đa giác đều ${n} cạnh ở hình dưới có tâm đối xứng không?`, visual, answer: n % 2 ? 'Không' : 'Có', options: ['Có', 'Không'], shuffle: false, keepMc: true, hint: 'Tam giác đều (3 cạnh) không có tâm; hình vuông (4), lục giác đều (6) có tâm. Để ý số cạnh chẵn hay lẻ.', steps: [`Đa giác đều có số cạnh chẵn thì có tâm đối xứng, số cạnh lẻ thì không.`, `${n} là số ${n % 2 ? 'lẻ' : 'chẵn'} → <b>${n % 2 ? 'Không' : 'Có'}</b>.`] }); } },
      { level: 3, name: 'Trục đối xứng và độ dài', fn() { const G = MA.Vis.G; const kind = R(0, 1); if (kind) { const a = R(3, 15) * 2, b = Math.max(2, Math.round(a * (R(45, 70) / 100))); const g = G.rect(a, b, { names: ['A', 'B', 'C', 'D'], labels: { top: a + ' cm' }, marks: false }); g.P.M = [a / 2, 0]; g.P._N = [a / 2, b]; g.P._d = [a / 2, b]; g.lines.push({ a: 'M', b: '_N', dash: true, col: '#e5534b', w: 2, ext: [16, 16] }); g.dots = ['M']; g.show = ['A', 'B', 'C', 'D', 'M', '_d']; g.names = { _d: 'd' }; g.lp = { M: 'n', _d: [0.5, 1.6] }; g.lines.forEach(l => { if (l.t === a + ' cm') { l.side = -1; l.off = 22; } }); g.nameCol = { _d: '#e5534b', M: '#e5534b' }; return Q({ text: `Hình chữ nhật ABCD có AB = ${a} cm. Đường thẳng d là trục đối xứng của hình chữ nhật và cắt AB tại M (như hình). Tính AM.`, visual: g, answer: a / 2, wrongs: [a, a * 2, a / 2 + 1], unit: 'cm', keepMc: true, hint: 'Trục đối xứng cắt cạnh AB tại trung điểm của AB.', steps: [`d là trục đối xứng nên M là trung điểm AB.`, `AM = ${a} : 2 = <b>${a / 2}</b> (cm).`] }); }
        const d = R(3, 12) * 2; const g = G.para(2.2, 1.1, { names: ['A', 'B', 'C', 'D'] }); g.P.O = [(g.P.A[0] + g.P.C[0]) / 2, (g.P.A[1] + g.P.C[1]) / 2]; g.lines.push({ a: 'A', b: 'C', col: '#e5534b', w: 2, t: d + ' cm', side: 1 }, { a: 'B', b: 'D', col: '#8792a6', w: 1.5, dash: true }); g.dots = ['O']; g.show = ['A', 'B', 'C', 'D', 'O']; g.lp = { O: 's' }; return Q({ text: `Hình bình hành ABCD có tâm đối xứng O và đường chéo AC = ${d} cm (như hình). Tính OA.`, visual: g, answer: d / 2, wrongs: [d, d * 2, d / 2 + 2], unit: 'cm', keepMc: true, hint: 'Tâm đối xứng của hình bình hành là trung điểm của mỗi đường chéo.', steps: ['O là giao điểm hai đường chéo, cũng là trung điểm của AC.', `OA = ${d} : 2 = <b>${d / 2}</b> (cm).`] }); } }
    ]
  }]);

  // =====================================================================
  // 4. NỘI DUNG LÝ THUYẾT THEO TỪNG BÀI (SGK Toán 6 – Tập một, KNTT)
  //    tf: [khẳng định, đúng?, giải thích] · mc: [câu hỏi, đáp án đúng, [3 phương án sai], giải thích]
  // =====================================================================
  Theory.add({
    grade: 6, vol: 1, short: 'Tập một, ', book: 'Toán 6 – Tập một', series: 'Kết nối tri thức với cuộc sống', icon: '📘',
    chapters: [
      // ------------------------------------------------------------------
      {
        id: 'c1', title: 'Tập hợp các số tự nhiên', color: '#d9534f',
        map: ['Tập hợp: kí hiệu ∈, ∉; hai cách mô tả; ℕ và ℕ*', 'Cách ghi số: hệ thập phân, giá trị theo vị trí, số La Mã', 'Thứ tự: so sánh, tia số, số liền trước – liền sau', 'Bốn phép tính và các tính chất', 'Lũy thừa: aⁿ, nhân – chia hai lũy thừa cùng cơ số', 'Thứ tự thực hiện phép tính'],
        practice: [['Luyện tập chung', 20, 'g6b5'], ['Luyện tập chung', 27, 'g6b7'], ['Bài tập cuối chương I', 28]],
        lessons: [
          {
            id: 'g6b1', no: 1, title: 'Tập hợp', page: 5, topic: 'g6_sets',
            key: ['Tập hợp gồm các <b>phần tử</b>; đặt tên tập hợp bằng chữ cái in hoa: A, B, C…', '<b>a ∈ A</b>: a thuộc A (a là phần tử của A). <b>b ∉ A</b>: b không thuộc A.', 'Hai cách mô tả tập hợp: <b>liệt kê</b> các phần tử, hoặc <b>chỉ ra tính chất đặc trưng</b> của các phần tử.', 'Phần tử viết trong dấu ngoặc nhọn { }, cách nhau bởi dấu “;”. Mỗi phần tử chỉ liệt kê <b>một lần</b>, thứ tự tùy ý.', 'ℕ = {0; 1; 2; 3; …} là tập hợp các số tự nhiên; ℕ* = {1; 2; 3; …} là tập hợp các số tự nhiên khác 0.'],
            f: ['A = {0; 1; 2; 3} = {x ∈ ℕ | x < 4}'],
            cards: [['Có mấy cách mô tả một tập hợp?', 'Hai cách: liệt kê các phần tử; chỉ ra tính chất đặc trưng của các phần tử.'], ['Kí hiệu “∈” đọc là gì?', '“thuộc” – hoặc “là phần tử của”.'], ['ℕ và ℕ* khác nhau ở đâu?', 'ℕ* không có số 0.'], ['Tập hợp các chữ cái trong từ “TOÁN” viết thế nào?', '{T; O; A; N} – mỗi chữ cái viết một lần.']],
            tf: [['Khi liệt kê, mỗi phần tử của tập hợp chỉ được viết một lần.', true], ['Khi liệt kê, các phần tử phải viết theo thứ tự tăng dần.', false, 'Thứ tự liệt kê là tùy ý.'], ['0 ∈ ℕ*', false, 'ℕ* là tập hợp các số tự nhiên khác 0.'], ['Tập hợp {a; b; c} có 3 phần tử.', true], ['Các phần tử của một tập hợp được viết trong dấu ngoặc tròn ( ).', false, 'Dùng dấu ngoặc nhọn { }.'], ['0 ∈ ℕ', true]],
            mc: [['Cách viết nào diễn tả “5 không thuộc tập hợp A”?', '5 ∉ A', ['5 ∈ A', 'A ∉ 5', '5 = A']], ['Tập hợp M = {x ∈ ℕ | x < 4} viết bằng cách liệt kê là:', '{0; 1; 2; 3}', ['{1; 2; 3}', '{0; 1; 2; 3; 4}', '{1; 2; 3; 4}'], 'ℕ bắt đầu từ 0; “x < 4” không lấy số 4.'], ['Tập hợp các chữ cái trong cụm từ “NHA TRANG” có bao nhiêu phần tử?', '6', ['8', '7', '5'], 'Mỗi chữ cái chỉ viết một lần: {N; H; A; T; R; G}.']]
          },
          {
            id: 'g6b2', no: 2, title: 'Cách ghi số tự nhiên', page: 9, topic: 'g6_sets',
            key: ['Hệ thập phân dùng <b>10 chữ số</b>: 0; 1; 2; …; 9 để ghi mọi số tự nhiên.', 'Cứ <b>10 đơn vị</b> ở một hàng thì bằng <b>1 đơn vị</b> ở hàng liền trước (cao hơn).', 'Giá trị của mỗi chữ số phụ thuộc vào <b>vị trí</b> của nó trong số.', `Số ${OV('abc')} (a ≠ 0) = a × 100 + b × 10 + c.`, 'Số La Mã: I = 1, V = 5, X = 10. Ghép các thành phần: IV = 4, IX = 9; mỗi chữ I, X không lặp quá 3 lần liền nhau (XXX = 30).'],
            f: [`${OV('ab')} = a × 10 + b`, `${OV('abc')} = a × 100 + b × 10 + c`],
            cards: [['Hệ thập phân dùng bao nhiêu chữ số?', '10 chữ số: 0, 1, 2, …, 9.'], ['Trong số 3.535, hai chữ số 5 có giá trị như nhau không?', 'Không: chữ số 5 hàng trăm có giá trị 500, chữ số 5 hàng đơn vị có giá trị 5.'], ['XIV là số nào?', '14 (X = 10, IV = 4).'], ['Viết 29 bằng số La Mã.', 'XXIX (XX = 20, IX = 9).']],
            tf: [['Trong số 3.535, hai chữ số 5 có giá trị bằng nhau.', false, 'Chữ số 5 hàng trăm có giá trị 500, hàng đơn vị có giá trị 5.'], ['10 đơn vị của một hàng bằng 1 đơn vị của hàng liền trước nó.', true], ['Số La Mã IIII biểu diễn số 4.', false, 'Số 4 viết là IV.'], ['XIX = 19', true], ['Chữ số hàng trăm của số 2.025 là 2.', false, 'Chữ số hàng trăm là 0.'], [`${OV('ab')} = a + b`, false, `${OV('ab')} = a × 10 + b.`]],
            mc: [['Giá trị của chữ số 7 trong số 47.352 là:', '7.000', ['7', '700', '70.000']], ['Số La Mã XXIV biểu diễn số:', '24', ['26', '14', '16']], ['Số tự nhiên nhỏ nhất có bốn chữ số khác nhau là:', '1.023', ['1.000', '1.234', '1.203']], ['Số 18 viết bằng số La Mã là:', 'XVIII', ['XIIX', 'VVVIII', 'XIIIIIIII']]]
          },
          {
            id: 'g6b3', no: 3, title: 'Thứ tự trong tập hợp các số tự nhiên', page: 13, topic: 'g6_sets',
            key: ['Với hai số tự nhiên a ≠ b: hoặc a < b, hoặc a > b. Trên tia số, a < b thì điểm a nằm <b>bên trái</b> điểm b.', 'a ≤ b nghĩa là a < b <b>hoặc</b> a = b; a ≥ b nghĩa là a > b hoặc a = b.', 'Tính chất bắc cầu: a < b và b < c thì a < c.', 'Mỗi số tự nhiên có đúng một <b>số liền sau</b>; mỗi số tự nhiên <b>khác 0</b> có đúng một <b>số liền trước</b>. Hai số tự nhiên liên tiếp hơn kém nhau 1 đơn vị.', 'Số 0 là số tự nhiên nhỏ nhất; <b>không có</b> số tự nhiên lớn nhất – tập hợp ℕ có vô số phần tử.'],
            cards: [['Số 0 có số liền trước trong ℕ không?', 'Không. Số 0 là số tự nhiên nhỏ nhất.'], ['Có số tự nhiên lớn nhất không?', 'Không – thêm 1 vào số nào cũng được số lớn hơn.'], ['“x ≤ 5” nghĩa là gì?', 'x < 5 hoặc x = 5.'], ['Trên tia số, số nhỏ hơn nằm ở đâu?', 'Bên trái số lớn hơn.']],
            tf: [['Số 0 có số liền trước là một số tự nhiên.', false, 'Số 0 là số tự nhiên nhỏ nhất.'], ['Không có số tự nhiên lớn nhất.', true], ['Hai số tự nhiên liên tiếp hơn kém nhau 1 đơn vị.', true], ['Nếu a < b và b < 10 thì a < 10.', true, 'Tính chất bắc cầu.'], ['x ≤ 5 nghĩa là x < 5.', false, 'x ≤ 5 nghĩa là x < 5 hoặc x = 5.'], ['Trên tia số nằm ngang, điểm biểu diễn số lớn hơn nằm bên trái.', false, 'Số lớn hơn nằm bên phải.']],
            mc: [['Số liền sau của 999 là:', '1.000', ['998', '9.910', '1.001']], ['Có bao nhiêu số tự nhiên x thỏa mãn 7 ≤ x < 12?', '5', ['4', '6', '3'], 'x ∈ {7; 8; 9; 10; 11}.'], ['Số liền trước của số tự nhiên a (a ≠ 0) là:', 'a − 1', ['a + 1', 'a', '1 − a']]]
          },
          {
            id: 'g6b4', no: 4, title: 'Phép cộng và phép trừ số tự nhiên', page: 15, topic: 'g6_power',
            key: ['a + b = c: a, b là <b>số hạng</b>, c là <b>tổng</b>.', 'Tính chất phép cộng: <b>giao hoán</b> a + b = b + a; <b>kết hợp</b> (a + b) + c = a + (b + c); cộng với 0: a + 0 = 0 + a = a.', 'a − b = c: a là <b>số bị trừ</b>, b là <b>số trừ</b>, c là <b>hiệu</b>. Trong ℕ, phép trừ chỉ thực hiện được khi a ≥ b.', 'Tìm số hạng chưa biết: lấy tổng trừ số hạng đã biết. Tìm số bị trừ: lấy hiệu cộng số trừ. Tìm số trừ: lấy số bị trừ trừ hiệu.'],
            f: ['a + b = b + a', '(a + b) + c = a + (b + c)', 'a − b = c ⇒ a = c + b'],
            cards: [['Tính chất (a + b) + c = a + (b + c) gọi là gì?', 'Tính chất kết hợp của phép cộng.'], ['Khi nào phép trừ a − b thực hiện được trong ℕ?', 'Khi a ≥ b.'], ['x − 25 = 40. Tìm x bằng cách nào?', 'Số bị trừ = hiệu + số trừ: x = 40 + 25 = 65.']],
            tf: [['Phép trừ 5 − 8 thực hiện được trong tập hợp ℕ.', false, 'Trong ℕ cần số bị trừ ≥ số trừ.'], ['a + 0 = a với mọi số tự nhiên a.', true], ['(a + b) + c = a + (b + c) là tính chất giao hoán.', false, 'Đó là tính chất kết hợp.'], ['Muốn tìm số bị trừ, ta lấy hiệu cộng với số trừ.', true], ['Muốn tìm một số hạng, ta lấy tổng cộng với số hạng kia.', false, 'Lấy tổng trừ đi số hạng kia.']],
            mc: [['Tính nhanh 46 + 17 + 54 nên dùng tính chất nào?', 'Giao hoán và kết hợp', ['Phân phối', 'Cộng với số 0', 'Không tính nhanh được'], '(46 + 54) + 17 = 100 + 17 = 117.'], ['Tìm x, biết x − 25 = 40.', '65', ['15', '55', '75']], ['Tìm x, biết 120 − x = 45.', '75', ['165', '85', '65']]]
          },
          {
            id: 'g6b5', no: 5, title: 'Phép nhân và phép chia số tự nhiên', page: 17, topic: 'g6_power',
            key: ['a × b = c (viết a · b hoặc ab): a, b là <b>thừa số</b>, c là <b>tích</b>.', 'Tính chất phép nhân: <b>giao hoán</b> ab = ba; <b>kết hợp</b> (ab)c = a(bc); nhân với 1: a · 1 = a; <b>phân phối</b> đối với phép cộng và phép trừ: a(b + c) = ab + ac; a(b − c) = ab − ac.', 'Phép chia hết: a = b · q (b ≠ 0) – a là số bị chia, b là số chia, q là thương.', 'Phép chia có dư: a = b · q + r với <b>0 < r < b</b> (r là số dư). Nếu r = 0 thì a chia hết cho b.', '<b>Không có phép chia cho 0.</b>'],
            f: ['a(b + c) = ab + ac', 'a = b · q + r  (0 ≤ r < b)'],
            cards: [['Số dư trong phép chia cho 7 có thể là những số nào?', '0; 1; 2; 3; 4; 5; 6 (luôn nhỏ hơn 7).'], ['a(b + c) = ab + ac là tính chất gì?', 'Tính chất phân phối của phép nhân đối với phép cộng.'], ['Số bị chia bằng gì trong phép chia có dư?', 'Số chia × thương + số dư.'], ['Tính nhanh 25 · 37 · 4.', '(25 · 4) · 37 = 100 · 37 = 3.700.']],
            tf: [['Số dư trong phép chia cho 7 có thể bằng 7.', false, 'Số dư luôn nhỏ hơn số chia.'], ['a · 0 = 0 với mọi số tự nhiên a.', true], ['a(b + c) = ab + ac là tính chất phân phối của phép nhân đối với phép cộng.', true], ['Có thể chia một số tự nhiên cho 0.', false, 'Không có phép chia cho 0.'], ['Trong phép chia có dư, số dư luôn nhỏ hơn số chia.', true]],
            mc: [['Trong phép chia một số tự nhiên cho 6, số dư có thể là:', '0; 1; 2; 3; 4; 5', ['1; 2; 3; 4; 5; 6', '0; 1; 2; 3; 4; 5; 6', '1; 2; 3']], ['Phép chia có số chia 9, thương 12, số dư 5. Số bị chia là:', '113', ['108', '103', '117'], '9 · 12 + 5 = 113.'], ['Tính nhanh 25 · 37 · 4.', '3.700', ['925', '370', '37.000']]]
          },
          {
            id: 'g6b6', no: 6, title: 'Lũy thừa với số mũ tự nhiên', page: 22, topic: 'g6_power',
            key: [`${P('a', 'n')} = a · a · … · a (n thừa số a, n ≠ 0). a là <b>cơ số</b>, n là <b>số mũ</b>; đọc là “a mũ n”.`, `${P('a', 2)}: a bình phương; ${P('a', 3)}: a lập phương. Quy ước ${P('a', 1)} = a.`, `Nhân hai lũy thừa cùng cơ số: giữ nguyên cơ số, <b>cộng</b> các số mũ: ${P('a', 'm')} · ${P('a', 'n')} = ${P('a', 'm + n')}.`, `Chia hai lũy thừa cùng cơ số (a ≠ 0, m ≥ n): giữ nguyên cơ số, <b>trừ</b> các số mũ: ${P('a', 'm')} : ${P('a', 'n')} = ${P('a', 'm − n')}. Quy ước ${P('a', 0)} = 1 (a ≠ 0).`, `${P(10, 'n')} = 1 và n chữ số 0. Số bằng bình phương của một số tự nhiên gọi là <b>số chính phương</b> (0; 1; 4; 9; 16; …).`],
            f: [`${P('a', 'm')} · ${P('a', 'n')} = ${P('a', 'm + n')}`, `${P('a', 'm')} : ${P('a', 'n')} = ${P('a', 'm − n')} (a ≠ 0; m ≥ n)`, `${P('a', 0)} = 1 (a ≠ 0)`],
            cards: [[`Trong ${P(7, 4)}, số nào là cơ số, số nào là số mũ?`, '7 là cơ số, 4 là số mũ.'], ['Nhân hai lũy thừa cùng cơ số làm thế nào?', 'Giữ nguyên cơ số, cộng các số mũ.'], [`${P(5, 0)} bằng bao nhiêu?`, '1 (quy ước a⁰ = 1 với a ≠ 0).'], ['Số chính phương là gì?', 'Số bằng bình phương của một số tự nhiên: 0, 1, 4, 9, 16, 25, …']],
            tf: [[`${P(2, 3)} = 6`, false, `${P(2, 3)} = 2 · 2 · 2 = 8.`], [`${P(5, 0)} = 1`, true], [`${P(3, 2)} · ${P(3, 4)} = ${P(3, 8)}`, false, `Cộng số mũ: ${P(3, 6)}.`], [`${P('a', 5)} : ${P('a', 2)} = ${P('a', 3)} (a ≠ 0)`, true], [`${P(10, 4)} = 10.000`, true], [`Trong lũy thừa ${P(7, 4)}, số 7 là số mũ.`, false, '7 là cơ số, 4 là số mũ.']],
            mc: [['Viết gọn tích 5 · 5 · 5 · 5 dưới dạng lũy thừa:', P(5, 4), [P(4, 5), '5 · 4', '20']], [`Kết quả của ${P(2, 7)} : ${P(2, 3)} dưới dạng lũy thừa là:`, P(2, 4), [P(2, 10), P(2, 21), P(1, 4)]], ['Số nào sau đây là số chính phương?', '49', ['50', '27', '18']], [`${P(3, 3)} bằng:`, '27', ['9', '6', '81']]]
          },
          {
            id: 'g6b7', no: 7, title: 'Thứ tự thực hiện các phép tính', page: 25, topic: 'g6_power',
            key: ['Biểu thức <b>không có dấu ngoặc</b>: chỉ có cộng, trừ (hoặc chỉ có nhân, chia) → làm từ <b>trái sang phải</b>.', 'Có cả các phép tính: <b>Lũy thừa → Nhân, chia → Cộng, trừ</b>.', 'Biểu thức <b>có dấu ngoặc</b>: làm trong ngoặc tròn ( ) → ngoặc vuông [ ] → ngoặc nhọn { }.'],
            f: ['Lũy thừa → Nhân, chia → Cộng, trừ', '( ) → [ ] → { }'],
            cards: [['Biểu thức có lũy thừa, nhân, cộng: làm gì trước?', 'Lũy thừa, rồi nhân chia, cuối cùng cộng trừ.'], ['24 : 4 · 2 = ?', '12 (chỉ có nhân chia → trái sang phải: 6 · 2).'], ['Thứ tự làm các dấu ngoặc?', '( ) → [ ] → { }.']],
            tf: [['Trong biểu thức không có dấu ngoặc, ta thực hiện phép cộng trước phép nhân.', false, 'Nhân, chia trước; cộng, trừ sau.'], ['Biểu thức chỉ có phép cộng và phép trừ thì thực hiện từ trái sang phải.', true], ['Thứ tự thực hiện với các dấu ngoặc là ( ) → [ ] → { }.', true], ['2 + 3 · 4 = 20', false, '2 + 12 = 14.'], ['24 : 4 · 2 = 3', false, 'Làm từ trái sang phải: 6 · 2 = 12.']],
            mc: [[`Giá trị của 3 · ${P(2, 2)} là:`, '12', ['36', '7', '10']], ['Thứ tự đúng khi tính biểu thức không có dấu ngoặc là:', 'Lũy thừa → Nhân, chia → Cộng, trừ', ['Nhân, chia → Lũy thừa → Cộng, trừ', 'Cộng, trừ → Nhân, chia → Lũy thừa', 'Từ trái sang phải, không phân biệt phép tính']], ['Giá trị của 20 − [30 − (5 − 1)²] là:', '6', ['−6', '26', '14'], '(5 − 1)² = 16; 30 − 16 = 14; 20 − 14 = 6.']]
          }
        ]
      },
      // ------------------------------------------------------------------
      {
        id: 'c2', title: 'Tính chia hết trong tập hợp các số tự nhiên', color: '#e08a2e',
        map: ['Quan hệ chia hết: ước, bội; tính chất chia hết của một tổng', 'Dấu hiệu chia hết cho 2, 5, 3, 9', 'Số nguyên tố, hợp số; phân tích ra thừa số nguyên tố', 'ƯC, ƯCLN – rút gọn phân số về tối giản', 'BC, BCNN – quy đồng mẫu các phân số'],
        practice: [['Luyện tập chung', 43, 'g6b10'], ['Luyện tập chung', 54, 'g6b12'], ['Bài tập cuối chương II', 56]],
        lessons: [
          {
            id: 'g6b8', no: 8, title: 'Quan hệ chia hết và tính chất', page: 29, topic: 'g6_divis',
            key: ['a <b>chia hết</b> cho b (b ≠ 0) nếu có số tự nhiên q sao cho a = b · q. Kí hiệu <b>a ⋮ b</b>.', 'Khi a ⋮ b: a là <b>bội</b> của b, b là <b>ước</b> của a. Kí hiệu Ư(a) – tập hợp các ước của a; B(b) – tập hợp các bội của b.', 'Tìm ước của a (a > 1): chia a lần lượt cho 1; 2; …; a – số nào chia hết thì là ước. Tìm bội của b (b ≠ 0): nhân b lần lượt với 0; 1; 2; 3; …', 'Tính chất 1: a ⋮ m và b ⋮ m thì (a + b) ⋮ m và (a − b) ⋮ m.', 'Tính chất 2: a <b>không</b> chia hết cho m, b ⋮ m thì (a + b) và (a − b) <b>không</b> chia hết cho m.', 'Số 0 là bội của mọi số tự nhiên khác 0; số 1 là ước của mọi số tự nhiên.'],
            f: ['a ⋮ m và b ⋮ m ⇒ (a + b) ⋮ m'],
            cards: [['a ⋮ b thì a là gì của b?', 'a là bội của b, b là ước của a.'], ['Cách tìm các bội của 7?', 'Nhân 7 lần lượt với 0, 1, 2, 3, … : B(7) = {0; 7; 14; 21; …}.'], ['Ư(12) gồm những số nào?', '{1; 2; 3; 4; 6; 12}.'], ['Tập hợp các bội của một số khác 0 có bao nhiêu phần tử?', 'Vô số phần tử.']],
            tf: [['Số 0 là bội của mọi số tự nhiên khác 0.', true], ['Số 1 là ước của mọi số tự nhiên.', true], ['Nếu a ⋮ 5 và b ⋮ 5 thì (a + b) ⋮ 5.', true], ['Nếu a và b đều không chia hết cho 3 thì a + b không chia hết cho 3.', false, 'Ví dụ: 1 + 2 = 3 chia hết cho 3.'], ['Tập hợp các bội của một số khác 0 có hữu hạn phần tử.', false, 'Có vô số bội.'], ['Ư(12) có 6 phần tử.', true, 'Ư(12) = {1; 2; 3; 4; 6; 12}.']],
            mc: [['Tổng nào sau đây chia hết cho 6?', '18 + 42', ['18 + 13', '25 + 36', '40 + 12'], '18 ⋮ 6 và 42 ⋮ 6.'], ['Ư(15) là:', '{1; 3; 5; 15}', ['{3; 5}', '{0; 15; 30; 45}', '{1; 15}']], ['Không tính, cho biết tổng 35 + 49 + 13 có chia hết cho 7 không?', 'Không, vì 13 không chia hết cho 7', ['Có, vì 35 và 49 chia hết cho 7', 'Có, vì tổng là số lẻ', 'Không, vì 35 không chia hết cho 7']]]
          },
          {
            id: 'g6b9', no: 9, title: 'Dấu hiệu chia hết', page: 34, topic: 'g6_divis',
            key: ['Chia hết cho <b>2</b>: chữ số tận cùng là 0; 2; 4; 6; 8 (số chẵn).', 'Chia hết cho <b>5</b>: chữ số tận cùng là 0 hoặc 5.', 'Chia hết cho <b>9</b>: tổng các chữ số chia hết cho 9.', 'Chia hết cho <b>3</b>: tổng các chữ số chia hết cho 3.', 'Chỉ những số đó mới chia hết. Số chia hết cho cả 2 và 5 có chữ số tận cùng là 0. Số chia hết cho 9 thì chia hết cho 3 (điều ngược lại không đúng).'],
            cards: [['Dấu hiệu chia hết cho 3 và cho 9 dựa vào đâu?', 'Tổng các chữ số.'], ['Dấu hiệu chia hết cho 2 và cho 5 dựa vào đâu?', 'Chữ số tận cùng.'], ['Số chia hết cho cả 2 và 5 có tận cùng là gì?', 'Chữ số 0.'], ['Số chia hết cho 3 có chắc chắn chia hết cho 9 không?', 'Không. Ví dụ 12 ⋮ 3 nhưng 12 không chia hết cho 9.']],
            tf: [['Số có chữ số tận cùng là 4 thì chia hết cho 4.', false, 'Ví dụ 14 không chia hết cho 4.'], ['Số chia hết cho 9 thì chia hết cho 3.', true], ['Số chia hết cho 3 thì chia hết cho 9.', false, 'Ví dụ 12.'], ['Số có chữ số tận cùng là 0 thì chia hết cho cả 2 và 5.', true], ['Số 2.025 chia hết cho 9.', true, '2 + 0 + 2 + 5 = 9.'], ['Số 1.236 chia hết cho 5.', false, 'Tận cùng là 6.']],
            mc: [['Số nào sau đây chia hết cho cả 3 và 5?', '135', ['125', '133', '153']], ['Dấu hiệu chia hết cho 9 dựa vào:', 'Tổng các chữ số', ['Chữ số tận cùng', 'Hai chữ số tận cùng', 'Chữ số đầu tiên']], ['Số nào sau đây chia hết cho 2 nhưng không chia hết cho 5?', '348', ['350', '345', '343']]]
          },
          {
            id: 'g6b10', no: 10, title: 'Số nguyên tố', page: 38, topic: 'g6_divis',
            key: ['<b>Số nguyên tố</b>: số tự nhiên lớn hơn 1, chỉ có hai ước là 1 và chính nó.', '<b>Hợp số</b>: số tự nhiên lớn hơn 1, có nhiều hơn hai ước.', 'Số 0 và số 1 <b>không</b> là số nguyên tố, cũng <b>không</b> là hợp số. Số 2 là số nguyên tố nhỏ nhất và là số nguyên tố chẵn duy nhất.', 'Các số nguyên tố nhỏ hơn 30: 2; 3; 5; 7; 11; 13; 17; 19; 23; 29.', '<b>Phân tích ra thừa số nguyên tố</b>: viết số đó dưới dạng tích các thừa số nguyên tố (dùng sơ đồ cây hoặc sơ đồ cột); viết gọn bằng lũy thừa, các thừa số xếp từ nhỏ đến lớn. Mọi cách phân tích đều cho cùng một kết quả.'],
            f: [`60 = ${P(2, 2)} · 3 · 5`, `72 = ${P(2, 3)} · ${P(3, 2)}`],
            vis: { type: 'factorTree', n: 60 },
            cards: [['Số 1 có phải số nguyên tố không?', 'Không. Số 1 chỉ có một ước.'], ['Số nguyên tố chẵn duy nhất?', 'Số 2.'], ['Phân tích 12 ra thừa số nguyên tố.', `12 = ${P(2, 2)} · 3.`], ['Có bao nhiêu số nguyên tố nhỏ hơn 20?', '8 số: 2, 3, 5, 7, 11, 13, 17, 19.']],
            tf: [['Số 1 là số nguyên tố.', false, 'Số nguyên tố phải lớn hơn 1.'], ['Mọi số nguyên tố đều là số lẻ.', false, 'Số 2 là số nguyên tố chẵn.'], ['Số 0 là hợp số.', false, '0 và 1 không là số nguyên tố, không là hợp số.'], ['51 là số nguyên tố.', false, '51 = 3 · 17.'], ['Mỗi hợp số đều phân tích được ra thừa số nguyên tố.', true], [`60 = ${P(2, 2)} · 3 · 5`, true]],
            mc: [['Phân tích 72 ra thừa số nguyên tố được:', `${P(2, 3)} · ${P(3, 2)}`, [`${P(2, 2)} · ${P(3, 3)}`, '8 · 9', '2 · 36']], ['Số nguyên tố chẵn duy nhất là:', '2', ['0', '4', 'Không có']], ['Có bao nhiêu số nguyên tố nhỏ hơn 20?', '8', ['7', '9', '10']], ['Số nào sau đây là hợp số?', '91', ['89', '97', '83'], '91 = 7 · 13.']]
          },
          {
            id: 'g6b11', no: 11, title: 'Ước chung. Ước chung lớn nhất', page: 44, topic: 'g6_gcd',
            key: ['<b>Ước chung</b> của hai hay nhiều số là ước của tất cả các số đó. Kí hiệu ƯC(a, b).', '<b>Ước chung lớn nhất</b> ƯCLN(a, b) là số lớn nhất trong tập hợp ƯC(a, b). Mọi ước chung đều là ước của ƯCLN.', 'Tìm ƯCLN bằng phân tích ra thừa số nguyên tố: ① phân tích mỗi số; ② chọn các thừa số nguyên tố <b>chung</b>; ③ lập tích, mỗi thừa số lấy với số mũ <b>nhỏ nhất</b>.', 'Nếu a ⋮ b thì ƯCLN(a, b) = b. ƯCLN(a, 1) = 1.', 'Hai số có ƯCLN bằng 1 gọi là hai số <b>nguyên tố cùng nhau</b>.', `Phân số ${frac('a', 'b')} là <b>tối giản</b> nếu ƯCLN(a, b) = 1. Rút gọn về tối giản: chia cả tử và mẫu cho ƯCLN của chúng.`],
            f: ['ƯCLN: thừa số chung, số mũ nhỏ nhất', 'ƯC(a, b) = Ư(ƯCLN(a, b))'],
            cards: [['Tìm ƯCLN ta chọn thừa số nào, số mũ thế nào?', 'Thừa số nguyên tố chung, mỗi thừa số lấy số mũ nhỏ nhất.'], ['Hai số nguyên tố cùng nhau là gì?', 'Hai số có ƯCLN bằng 1 (ví dụ 8 và 9).'], ['ƯCLN(24, 8) = ?', '8, vì 24 chia hết cho 8.'], ['Phân số tối giản là gì?', 'Phân số có ƯCLN của tử và mẫu bằng 1.']],
            tf: [['Hai số nguyên tố cùng nhau thì cả hai đều là số nguyên tố.', false, 'Ví dụ 8 và 9 nguyên tố cùng nhau nhưng đều là hợp số.'], ['Mọi ước chung của a và b đều là ước của ƯCLN(a, b).', true], ['Khi tìm ƯCLN, ta lấy các thừa số chung với số mũ lớn nhất.', false, 'Lấy số mũ nhỏ nhất.'], ['ƯCLN(24, 8) = 8', true], [`Phân số ${frac(15, 21)} là phân số tối giản.`, false, 'ƯCLN(15, 21) = 3.']],
            mc: [['ƯCLN(18, 30) bằng:', '6', ['3', '90', '2']], ['Phân số nào sau đây là phân số tối giản?', frac(8, 15), [frac(6, 9), frac(10, 25), frac(14, 21)]], ['Bài toán “chia đều nhiều nhất thành bao nhiêu nhóm” thường cần tìm:', 'ƯCLN', ['BCNN', 'Tích hai số', 'Hiệu hai số']]]
          },
          {
            id: 'g6b12', no: 12, title: 'Bội chung. Bội chung nhỏ nhất', page: 49, topic: 'g6_gcd',
            key: ['<b>Bội chung</b> của hai hay nhiều số là bội của tất cả các số đó. Kí hiệu BC(a, b).', '<b>Bội chung nhỏ nhất</b> BCNN(a, b) là số nhỏ nhất <b>khác 0</b> trong tập hợp BC(a, b). Mọi bội chung đều là bội của BCNN.', 'Tìm BCNN bằng phân tích ra thừa số nguyên tố: ① phân tích mỗi số; ② chọn các thừa số nguyên tố <b>chung và riêng</b>; ③ lập tích, mỗi thừa số lấy với số mũ <b>lớn nhất</b>.', 'Nếu a ⋮ b thì BCNN(a, b) = a. Nếu a, b nguyên tố cùng nhau thì BCNN(a, b) = a · b.', 'Quy đồng mẫu các phân số: lấy <b>mẫu chung</b> là BCNN của các mẫu (mẫu chung nhỏ nhất).'],
            f: ['BCNN: thừa số chung và riêng, số mũ lớn nhất', 'BC(a, b) = B(BCNN(a, b))'],
            cards: [['Tìm BCNN ta chọn thừa số nào, số mũ thế nào?', 'Thừa số nguyên tố chung và riêng, mỗi thừa số lấy số mũ lớn nhất.'], ['BCNN(4, 6) = ?', '12.'], ['Khi nào BCNN(a, b) = a · b?', 'Khi a và b nguyên tố cùng nhau.'], ['Bài toán “sau ít nhất bao lâu lại cùng…” cần tìm gì?', 'BCNN.']],
            tf: [['BCNN(4, 6) = 24', false, 'BCNN(4, 6) = 12.'], ['Nếu a và b nguyên tố cùng nhau thì BCNN(a, b) = a · b.', true], ['Số 0 là BCNN của mọi cặp số.', false, 'BCNN là bội chung nhỏ nhất khác 0.'], ['Mọi bội chung của a và b đều là bội của BCNN(a, b).', true], ['Khi tìm BCNN, ta chọn các thừa số nguyên tố chung và riêng, mỗi thừa số lấy số mũ lớn nhất.', true]],
            mc: [['BCNN(12, 18) bằng:', '36', ['6', '216', '72']], ['Bài toán “Sau ít nhất bao nhiêu ngày các bạn lại cùng trực nhật?” cần tìm:', 'BCNN', ['ƯCLN', 'Tổng các số', 'Hiệu các số']], [`Mẫu chung nhỏ nhất của ${frac(1, 6)} và ${frac(1, 8)} là:`, '24', ['48', '14', '2']]]
          }
        ]
      },
      // ------------------------------------------------------------------
      {
        id: 'c3', title: 'Số nguyên', color: '#2e8bd1',
        map: ['Số nguyên âm, tập hợp ℤ, trục số, số đối, so sánh', 'Cộng, trừ số nguyên: cùng dấu – khác dấu; a − b = a + (−b)', 'Quy tắc dấu ngoặc', 'Nhân số nguyên: cùng dấu “+”, khác dấu “−”', 'Phép chia hết; ước và bội của số nguyên'],
        practice: [['Luyện tập chung', 69, 'g6b15'], ['Luyện tập chung', 75, 'g6b17'], ['Bài tập cuối chương III', 76]],
        lessons: [
          {
            id: 'g6b13', no: 13, title: 'Tập hợp các số nguyên', page: 57, topic: 'g6_int',
            key: ['Số nguyên âm: −1; −2; −3; … (đọc “âm 1”, “trừ 1”). Dùng cho nhiệt độ dưới 0 °C, độ cao dưới mực nước biển, số tiền nợ…', 'ℤ = {…; −3; −2; −1; 0; 1; 2; 3; …}. Số 0 <b>không</b> phải số nguyên âm, cũng <b>không</b> phải số nguyên dương.', 'Trục số: điểm gốc 0, chiều dương từ trái sang phải; số nguyên âm nằm bên trái điểm 0.', 'Hai số nằm cách đều điểm 0, ở hai phía là hai <b>số đối</b> nhau: số đối của a là −a; số đối của 0 là 0.', 'So sánh: trên trục số nằm ngang, a < b khi điểm a nằm bên trái điểm b. Số nguyên âm < 0 < số nguyên dương. Với a, b là số tự nhiên: a < b thì −a > −b.'],
            vis: { type: 'numberline', min: -5, max: 5, step: 1, points: [{ v: -3, label: '−3' }, { v: 3, label: '3' }] },
            cards: [['Số 0 là số nguyên dương hay âm?', 'Không dương, cũng không âm.'], ['Số đối của −7?', '7.'], ['So sánh −5 và −3.', '−5 < −3 (−5 nằm bên trái −3).'], ['Số nguyên âm lớn nhất?', '−1.']],
            tf: [['Số 0 là số nguyên dương.', false], ['Mọi số nguyên âm đều nhỏ hơn 0.', true], ['−5 > −3', false, '−5 nằm bên trái −3 trên trục số.'], ['Số đối của −7 là 7.', true], ['Mọi số tự nhiên đều là số nguyên.', true], ['−2 ∈ ℕ', false, '−2 ∈ ℤ nhưng −2 ∉ ℕ.']],
            mc: [['Số nguyên âm lớn nhất là:', '−1', ['0', '−9', 'Không có']], ['Nhiệt độ 5 độ dưới 0 °C được viết là:', '−5 °C', ['5 °C', '+5 °C', '0,5 °C']], ['Sắp xếp tăng dần: −3; 2; −7; 0', '−7; −3; 0; 2', ['−3; −7; 0; 2', '2; 0; −3; −7', '0; −3; −7; 2']]]
          },
          {
            id: 'g6b14', no: 14, title: 'Phép cộng và phép trừ số nguyên', page: 62, topic: 'g6_int',
            key: ['Cộng hai số nguyên <b>âm</b>: cộng hai số đối của chúng rồi đặt dấu “−” trước kết quả: (−3) + (−5) = −8.', 'Cộng hai số nguyên <b>khác dấu</b>: hai số đối nhau thì tổng bằng 0; không đối nhau: lấy “phần số tự nhiên” lớn trừ nhỏ, đặt dấu của số có phần số tự nhiên lớn hơn: (−12) + 7 = −5.', 'Tính chất phép cộng số nguyên: giao hoán, kết hợp, cộng với 0, cộng với số đối: a + (−a) = 0.', 'Phép trừ: <b>a − b = a + (−b)</b> – trừ đi một số là cộng với số đối của nó. Phép trừ trong ℤ <b>luôn</b> thực hiện được.'],
            f: ['a + (−a) = 0', 'a − b = a + (−b)'],
            cards: [['(−3) + (−5) = ?', '−8.'], ['(−12) + 7 = ?', '−5 (12 − 7 = 5, mang dấu của −12).'], ['Muốn trừ số nguyên a cho b ta làm gì?', 'Cộng a với số đối của b: a − b = a + (−b).'], ['5 − 9 = ?', '5 + (−9) = −4.']],
            tf: [['Tổng của hai số nguyên âm là một số nguyên âm.', true], ['Tổng của hai số nguyên khác dấu luôn là số dương.', false, 'Ví dụ (−12) + 7 = −5.'], ['a − b = a + (−b)', true], ['(−8) + 8 = 16', false, 'Hai số đối nhau có tổng bằng 0.'], ['Trong tập hợp số nguyên, phép trừ luôn thực hiện được.', true], ['(−5) + (−3) = −2', false, '(−5) + (−3) = −8.']],
            mc: [['(−12) + 7 =', '−5', ['5', '−19', '19']], ['5 − 9 =', '−4', ['4', '14', '−14']], ['(−6) − (−10) =', '4', ['−16', '16', '−4'], '(−6) + 10 = 4.']]
          },
          {
            id: 'g6b15', no: 15, title: 'Quy tắc dấu ngoặc', page: 67, topic: 'g6_int',
            key: ['Bỏ dấu ngoặc có dấu <b>“+”</b> đằng trước: <b>giữ nguyên</b> dấu các số hạng trong ngoặc.', 'Bỏ dấu ngoặc có dấu <b>“−”</b> đằng trước: <b>đổi dấu tất cả</b> các số hạng trong ngoặc (“+” thành “−”, “−” thành “+”).', 'Ngược lại, khi đưa các số hạng vào trong ngoặc có dấu “−” đằng trước thì phải đổi dấu các số hạng đó.', 'Trong một tổng, có thể đổi chỗ các số hạng (kèm theo dấu) và nhóm chúng tùy ý để tính nhanh.'],
            f: ['a + (b − c) = a + b − c', 'a − (b − c + d) = a − b + c − d'],
            cards: [['Bỏ ngoặc có dấu “−” phía trước làm gì?', 'Đổi dấu tất cả số hạng trong ngoặc.'], ['−(a − b + c) = ?', '−a + b − c.'], ['Tính nhanh (35 − 17) − (35 + 3).', '35 − 17 − 35 − 3 = −20.']],
            tf: [['−(a − b + c) = −a + b − c', true], ['−(5 − 3) = −5 − 3', false, '−(5 − 3) = −5 + 3.'], ['Bỏ ngoặc có dấu “+” đằng trước thì giữ nguyên dấu các số hạng trong ngoặc.', true], ['a − (b + c) = a − b + c', false, 'a − (b + c) = a − b − c.'], ['Khi đưa số hạng vào ngoặc có dấu “−” đằng trước, phải đổi dấu các số hạng đó.', true]],
            mc: [['Bỏ ngoặc: 12 − (4 − 9 + 6) bằng:', '12 − 4 + 9 − 6', ['12 − 4 − 9 + 6', '12 + 4 − 9 + 6', '12 + 4 + 9 − 6']], ['Tính nhanh: (35 − 17) − (35 + 3)', '−20', ['20', '−14', '56']], ['Tính nhanh: (−27) + 15 − (−27) + 85', '100', ['46', '−100', '154']]]
          },
          {
            id: 'g6b16', no: 16, title: 'Phép nhân số nguyên', page: 70, topic: 'g6_int',
            key: ['Tích hai số nguyên <b>cùng dấu</b> là số <b>dương</b>: (−3) · (−4) = 12.', 'Tích hai số nguyên <b>khác dấu</b> là số <b>âm</b>: (−5) · 6 = −30.', 'a · 0 = 0 · a = 0.', 'Tính chất: giao hoán, kết hợp, nhân với 1, phân phối của phép nhân đối với phép cộng và phép trừ: a(b ± c) = ab ± ac.', 'Tích nhiều số khác 0: số thừa số âm <b>chẵn</b> → tích dương; <b>lẻ</b> → tích âm.'],
            f: ['(−) · (−) = (+)', '(−) · (+) = (−)', 'a(b − c) = ab − ac'],
            cards: [['(−3) · (−4) = ?', '12 (cùng dấu → dương).'], ['Tích của 3 số nguyên âm mang dấu gì?', 'Âm (số thừa số âm là lẻ).'], ['(−7) · 0 = ?', '0.']],
            tf: [['(−3) · (−4) = −12', false, 'Cùng dấu → tích dương: 12.'], ['Tích hai số nguyên khác dấu là số nguyên âm.', true], ['Tích của ba số nguyên âm là số dương.', false, 'Có 3 thừa số âm (lẻ) → tích âm.'], ['a · (b − c) = ab − ac với mọi số nguyên a, b, c.', true], ['(−7) · 0 = −7', false, 'Mọi số nhân với 0 đều bằng 0.']],
            mc: [['(−5) · 6 =', '−30', ['30', '1', '−11']], ['Tích (−2) · (−3) · (−5) · 4 mang dấu:', 'Âm', ['Dương', 'Bằng 0', 'Không xác định được']], ['Tính nhanh: (−25) · 17 · 4', '−1.700', ['1.700', '−170', '−425']]]
          },
          {
            id: 'g6b17', no: 17, title: 'Phép chia hết. Ước và bội của một số nguyên', page: 73, topic: 'g6_int',
            key: ['Chia hai số nguyên (phép chia hết): <b>cùng dấu</b> → thương dương; <b>khác dấu</b> → thương âm. (−18) : (−3) = 6; (−56) : 7 = −8.', 'a chia hết cho b (b ≠ 0) nếu có số nguyên q sao cho a = b · q. Khi đó a là <b>bội</b> của b, b là <b>ước</b> của a.', 'Nếu a là bội của b thì −a cũng là bội của b. Nếu b là ước của a thì −b cũng là ước của a.', 'Ví dụ: các ước của 6 là ±1; ±2; ±3; ±6 (8 ước).'],
            cards: [['(−18) : (−3) = ?', '6.'], ['Các ước nguyên của 5?', '−5; −1; 1; 5.'], ['Số 6 có bao nhiêu ước nguyên?', '8 ước: ±1, ±2, ±3, ±6.']],
            tf: [['Số 6 có 8 ước nguyên.', true, '±1; ±2; ±3; ±6.'], ['(−20) : 5 = 4', false, 'Khác dấu → thương âm: −4.'], ['Nếu b là ước của a thì −b cũng là ước của a.', true], ['(−18) : (−3) = 6', true], ['Các ước nguyên của 5 chỉ là 1 và 5.', false, 'Còn −1 và −5.']],
            mc: [['Các ước nguyên của 4 là:', '−4; −2; −1; 1; 2; 4', ['1; 2; 4', '−4; −2; 2; 4', '0; 1; 2; 4']], ['(−56) : 7 =', '−8', ['8', '−49', '−63']], ['Số nào sau đây là bội của −6?', '−24', ['−20', '9', '15']]]
          }
        ]
      },
      // ------------------------------------------------------------------
      {
        id: 'c4', title: 'Một số hình phẳng trong thực tiễn', color: '#2fa36b',
        map: ['Tam giác đều, hình vuông, lục giác đều: cạnh, góc, đường chéo', 'Hình chữ nhật, hình thoi, hình bình hành, hình thang cân', 'Chu vi, diện tích các tứ giác đã học'],
        practice: [['Luyện tập chung', 95, 'g6b20'], ['Bài tập cuối chương IV', 97]],
        lessons: [
          {
            id: 'g6b18', no: 18, title: 'Hình tam giác đều. Hình vuông. Hình lục giác đều', page: 77, topic: 'g6_shapes',
            key: ['<b>Tam giác đều</b>: ba cạnh bằng nhau, ba góc bằng nhau (mỗi góc bằng 60°).', '<b>Hình vuông</b>: bốn cạnh bằng nhau, bốn góc vuông; hai cạnh đối song song; hai đường chéo bằng nhau.', '<b>Lục giác đều</b>: sáu cạnh bằng nhau, sáu góc bằng nhau (mỗi góc 120°); ba đường chéo chính bằng nhau (dài gấp đôi cạnh).', 'Lục giác đều được ghép từ <b>6 tam giác đều</b> chung một đỉnh.', 'Vẽ tam giác đều bằng thước và compa; vẽ hình vuông bằng thước thẳng và ê ke.'],
            vis: [{ type: 'shape', kind: 'eqtri' }, { type: 'shape', kind: 'hexagon', split: true }],
            cards: [['Mỗi góc của tam giác đều bằng bao nhiêu độ?', '60°.'], ['Lục giác đều có mấy đường chéo chính?', '3 đường chéo chính, bằng nhau.'], ['Lục giác đều ghép từ mấy tam giác đều?', '6 tam giác đều.'], ['Hai đường chéo hình vuông có đặc điểm gì?', 'Bằng nhau (và vuông góc với nhau).']],
            tf: [['Tam giác đều có ba góc bằng nhau, mỗi góc bằng 60°.', true], ['Hình vuông có hai đường chéo bằng nhau.', true], ['Lục giác đều có 6 đường chéo chính.', false, 'Có 3 đường chéo chính.'], ['Mỗi góc của lục giác đều bằng 120°.', true], ['Hình vuông có bốn góc bằng nhau và mỗi góc bằng 60°.', false, 'Mỗi góc là góc vuông (90°).']],
            mc: [['Lục giác đều được ghép từ bao nhiêu tam giác đều?', '6', ['3', '4', '8']], ['Đường chéo chính của lục giác đều cạnh 4 cm dài:', '8 cm', ['4 cm', '12 cm', '6 cm']], ['Dụng cụ thường dùng để vẽ tam giác đều là:', 'Thước thẳng và compa', ['Chỉ thước thẳng', 'Thước đo góc và ê ke', 'Chỉ compa']]]
          },
          {
            id: 'g6b19', no: 19, title: 'Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân', page: 83, topic: 'g6_shapes',
            key: ['<b>Hình chữ nhật</b>: bốn góc vuông; các cạnh đối song song và bằng nhau; hai đường chéo bằng nhau.', '<b>Hình thoi</b>: bốn cạnh bằng nhau; các cạnh đối song song; các góc đối bằng nhau; hai đường chéo <b>vuông góc</b> với nhau.', '<b>Hình bình hành</b>: các cạnh đối song song và bằng nhau; các góc đối bằng nhau; hai đường chéo cắt nhau tại <b>trung điểm</b> của mỗi đường.', '<b>Hình thang cân</b>: hai cạnh đáy song song; hai cạnh bên bằng nhau; hai đường chéo bằng nhau; hai góc kề một đáy bằng nhau.'],
            vis: [{ type: 'shape', kind: 'rhombus', diag: ['d₁', 'd₂'] }, { type: 'shape', kind: 'trap' }],
            cards: [['Hình nào có hai đường chéo vuông góc?', 'Hình thoi (và hình vuông).'], ['Hai đường chéo hình bình hành có tính chất gì?', 'Cắt nhau tại trung điểm của mỗi đường.'], ['Hình thang cân có những yếu tố nào bằng nhau?', 'Hai cạnh bên, hai đường chéo, hai góc kề một đáy.'], ['Hình chữ nhật có mấy góc vuông?', 'Bốn góc vuông.']],
            tf: [['Hình thoi có hai đường chéo vuông góc với nhau.', true], ['Hình bình hành có hai đường chéo bằng nhau.', false, 'Hai đường chéo cắt nhau tại trung điểm mỗi đường (không nhất thiết bằng nhau).'], ['Hình thang cân có hai cạnh bên bằng nhau.', true], ['Hai đường chéo của hình bình hành cắt nhau tại trung điểm của mỗi đường.', true], ['Hình chữ nhật có bốn cạnh bằng nhau.', false, 'Chỉ các cạnh đối bằng nhau.'], ['Hình thang cân có hai đường chéo bằng nhau.', true]],
            mc: [['Hình nào sau đây có hai đường chéo vuông góc với nhau?', 'Hình thoi', ['Hình chữ nhật', 'Hình bình hành', 'Hình thang cân']], ['Hình nào sau đây có bốn góc vuông?', 'Hình chữ nhật', ['Hình thoi', 'Hình bình hành', 'Hình thang cân']], ['Hình nào có hai cạnh đáy song song và hai cạnh bên bằng nhau?', 'Hình thang cân', ['Hình thoi', 'Hình chữ nhật', 'Tam giác đều']]]
          },
          {
            id: 'g6b20', no: 20, title: 'Chu vi và diện tích của một số tứ giác đã học', page: 90, topic: 'g6_shapes',
            key: ['<b>Hình vuông</b> cạnh a: C = 4a; S = a².', '<b>Hình chữ nhật</b> chiều dài a, chiều rộng b: C = 2(a + b); S = a · b.', '<b>Hình thang</b> (hình thang cân) đáy a, b, chiều cao h: S = (a + b) · h : 2; chu vi = tổng độ dài bốn cạnh.', '<b>Hình bình hành</b> cạnh a, b, chiều cao h ứng với cạnh a: C = 2(a + b); S = a · h.', '<b>Hình thoi</b> cạnh a, hai đường chéo m, n: C = 4a; S = m · n : 2.', 'Các kích thước phải cùng đơn vị đo trước khi tính.'],
            f: ['S vuông = a²', 'S chữ nhật = a · b', 'S thang = (a + b) · h : 2', 'S bình hành = a · h', 'S thoi = m · n : 2'],
            cards: [['Diện tích hình thoi tính thế nào?', 'Nửa tích hai đường chéo: S = m · n : 2.'], ['Diện tích hình bình hành tính thế nào?', 'Cạnh đáy nhân chiều cao tương ứng: S = a · h.'], ['Diện tích hình thang tính thế nào?', 'Tổng hai đáy nhân chiều cao rồi chia 2.'], ['Chu vi hình chữ nhật?', 'C = 2(a + b).']],
            tf: [['Diện tích hình thoi bằng tích hai đường chéo.', false, 'Bằng nửa tích hai đường chéo.'], ['Diện tích hình bình hành bằng cạnh đáy nhân chiều cao tương ứng.', true], ['Chu vi hình chữ nhật bằng (a + b) · 2.', true], ['Hình vuông cạnh 5 cm có diện tích 20 cm².', false, 'S = 5 · 5 = 25 cm².'], ['Diện tích hình thang bằng (a + b) · h : 2.', true]],
            mc: [['Hình thoi có hai đường chéo 6 cm và 10 cm. Diện tích là:', '30 cm²', ['60 cm²', '16 cm²', '32 cm²']], ['Hình thang cân có hai đáy 4 m, 8 m, chiều cao 3 m. Diện tích là:', '18 m²', ['36 m²', '15 m²', '24 m²']], ['Hình chữ nhật dài 8 cm, rộng 5 cm có chu vi là:', '26 cm', ['40 cm', '13 cm', '80 cm']]]
          }
        ]
      },
      // ------------------------------------------------------------------
      {
        id: 'c5', title: 'Tính đối xứng của hình phẳng trong tự nhiên', color: '#8e6cd8',
        map: ['Hình có trục đối xứng: gấp đôi trùng khít', 'Hình có tâm đối xứng: quay nửa vòng trùng chính nó', 'Đối xứng trong tự nhiên, kiến trúc, chữ cái'],
        practice: [['Luyện tập chung', 108, 'g6b22'], ['Bài tập cuối chương V']],
        lessons: [
          {
            id: 'g6b21', no: 21, title: 'Hình có trục đối xứng', page: 98, topic: 'g6_sym',
            key: ['Hình có <b>trục đối xứng</b> d nếu khi gấp hình theo đường thẳng d thì hai nửa của hình chồng khít lên nhau.', 'Số trục đối xứng: tam giác đều <b>3</b>; hình vuông <b>4</b>; hình chữ nhật <b>2</b> (đi qua trung điểm hai cạnh đối); hình thoi <b>2</b> (hai đường chéo); hình thang cân <b>1</b> (đi qua trung điểm hai đáy); lục giác đều <b>6</b>; hình tròn: <b>vô số</b> (mọi đường kính).', 'Hình bình hành (không phải hình chữ nhật, hình thoi) <b>không có</b> trục đối xứng.', 'Trong tự nhiên: con bướm, chiếc lá, bông hoa… thường có trục đối xứng.'],
            vis: [{ type: 'sym', shape: 'square', axes: true }, { type: 'sym', shape: 'trap', axes: true }],
            cards: [['Hình chữ nhật có mấy trục đối xứng?', '2 – không tính hai đường chéo.'], ['Trục đối xứng của hình thoi là gì?', 'Hai đường chéo.'], ['Hình nào có vô số trục đối xứng?', 'Hình tròn.'], ['Hình thang cân có mấy trục đối xứng?', '1 – đường thẳng đi qua trung điểm hai đáy.']],
            tf: [['Hình chữ nhật có 4 trục đối xứng.', false, 'Có 2 trục đối xứng.'], ['Đường chéo của hình thoi là trục đối xứng của nó.', true], ['Hình bình hành (không phải hình chữ nhật, hình thoi) không có trục đối xứng.', true], ['Hình thang cân có 1 trục đối xứng.', true], ['Đường chéo của hình chữ nhật là trục đối xứng của nó.', false], ['Hình tròn có vô số trục đối xứng.', true]],
            mc: [['Tam giác đều có bao nhiêu trục đối xứng?', '3', ['1', '0', '6']], ['Lục giác đều có bao nhiêu trục đối xứng?', '6', ['3', '4', '12']], ['Chữ cái in hoa nào sau đây có trục đối xứng?', 'A', ['N', 'S', 'Z']]]
          },
          {
            id: 'g6b22', no: 22, title: 'Hình có tâm đối xứng', page: 103, topic: 'g6_sym',
            key: ['Hình có <b>tâm đối xứng</b> O nếu khi quay hình nửa vòng (180°) quanh điểm O thì hình thu được trùng với chính nó.', 'Hình chữ nhật, hình vuông, hình thoi, hình bình hành: tâm đối xứng là <b>giao điểm hai đường chéo</b>.', 'Lục giác đều, hình tròn: tâm đối xứng là tâm của hình.', 'Tam giác đều, hình thang cân <b>không có</b> tâm đối xứng.', 'Có hình chỉ có tâm (hình bình hành, chữ N, S, Z), có hình chỉ có trục (tam giác đều, thang cân, chữ A, T), có hình có cả hai (hình vuông, chữ nhật, thoi, lục giác đều, tròn; chữ H, I, O, X).'],
            vis: [{ type: 'sym', shape: 'para', center: true }, { type: 'sym', shape: 'hexagon', center: true }],
            cards: [['Tâm đối xứng của hình bình hành ở đâu?', 'Giao điểm hai đường chéo.'], ['Tam giác đều có tâm đối xứng không?', 'Không.'], ['Hình nào có tâm nhưng không có trục đối xứng?', 'Hình bình hành.'], ['Chữ N có trục hay tâm đối xứng?', 'Chỉ có tâm đối xứng.']],
            tf: [['Tam giác đều có tâm đối xứng.', false], ['Giao điểm hai đường chéo của hình bình hành là tâm đối xứng của nó.', true], ['Hình thang cân có tâm đối xứng.', false], ['Quay một hình có tâm đối xứng nửa vòng quanh tâm thì được hình trùng với chính nó.', true], ['Hình nào có tâm đối xứng thì cũng có trục đối xứng.', false, 'Hình bình hành có tâm nhưng không có trục.']],
            mc: [['Hình nào sau đây có tâm đối xứng nhưng không có trục đối xứng?', 'Hình bình hành', ['Hình thang cân', 'Tam giác đều', 'Hình vuông']], ['Chữ cái in hoa nào sau đây có tâm đối xứng?', 'N', ['A', 'T', 'V']], ['Tâm đối xứng của hình chữ nhật là:', 'Giao điểm hai đường chéo', ['Trung điểm một cạnh', 'Một đỉnh của hình', 'Không có tâm đối xứng']]]
          }
        ]
      }
    ],
    extra: {
      title: 'Hoạt động thực hành trải nghiệm',
      items: [
        ['💌', 'Tấm thiệp và phòng học của em', 111, 'Vận dụng hình có trục, tâm đối xứng để trang trí tấm thiệp; đo đạc, tính chu vi, diện tích phòng học.', 'g6_sym'],
        ['🖥️', 'Vẽ hình đơn giản với phần mềm GeoGebra', 113, 'Vẽ tam giác đều, hình vuông, lục giác đều, hình chữ nhật… bằng phần mềm và kiểm tra tính chất của hình.', 'g6_shapes'],
        ['🧮', 'Sử dụng máy tính cầm tay', 119, 'Tính nhanh lũy thừa, biểu thức nhiều phép tính; kiểm tra kết quả phân tích ra thừa số nguyên tố, ƯCLN, BCNN.', 'g6_gcd']
      ]
    }
  });

  // (dạng bài “📘 Lý thuyết SGK” cho từng chủ đề được theory-core.js tự thêm khi add)
})(window.MA);
