/* =========================================================
 * grade3.js — KIẾN THỨC & BỘ CÂU HỎI TOÁN LỚP 3 (Chương trình GDPT 2018)
 * Phần 1: các chủ đề cốt lõi · Phần 2 (cuối file): chủ đề & dạng bài bổ sung
 * ========================================================= */
(function (MA) {
  'use strict';
  const { R, pick, Q, fmt, gcd, frac, fracHtml, fracStr, round } = MA.U;
  const V = MA.Vis;

  // ============================ LỚP 3 ============================
  MA.Data.addGrade({
    grade: 3, name: 'Lớp 3', color: '#2fa36b', emoji: '🐢', desc: 'Bảng nhân chia 6–9 · Nhân chia số có nhiều chữ số · Chia có dư · Gấp, giảm một số lần · Chu vi, diện tích', topics: [
      {
        id: 'g3_table', icon: '✖️', title: 'Bảng nhân, bảng chia 6, 7, 8, 9', tagline: 'Thuộc bảng – tính nhanh – tìm thành phần', prereqs: ['g2_muldiv'],
        summary: 'Hoàn thiện các bảng nhân, chia từ 2 đến 9. Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số đã biết.',
        rules: [
          { title: 'Mẹo nhớ bảng nhân 9', desc: 'Tổng hai chữ số của tích luôn bằng 9: 18, 27, 36, 45…', example: '9 × 7 = 63 (6 + 3 = 9)', tip: 'Chữ số hàng chục = thừa số kia trừ 1.' },
          { title: 'Tìm thừa số, số bị chia, số chia', desc: 'Thừa số = Tích : Thừa số kia. Số bị chia = Thương × Số chia. Số chia = Số bị chia : Thương.', example: 'x × 7 = 56 → x = 56 : 7 = 8', tip: 'Giống như tìm x lớp 2, nhưng với nhân chia.' }
        ],
        poem: ['Sáu, bảy, tám, chín chăm ôn,', 'Thuộc lòng bảng nhân chẳng còn khó khăn!'],
        pitfalls: [{ wrong: '7 × 8 = 54', right: '7 × 8 = 56', why: 'Mẹo: 5-6-7-8 → 56 = 7 × 8.' }],
        examples: [{ q: 'Tìm x: x × 6 = 48', steps: ['x là thừa số chưa biết.', 'x = 48 : 6', 'x = <b>8</b>'] }],
        gens: [
          { level: 1, name: 'Bảng nhân', fn() { const a = R(6, 9), b = R(2, 10); return Q({ text: `Tính: <b>${a} × ${b}</b>`, answer: a * b, wrongs: [a * b + a, a * b - a, a * b + 1], hint: `${a} được lấy ${b} lần.`, steps: [`${a} × ${b} = <b>${a * b}</b>.`] }); } },
          { level: 1, name: 'Bảng chia', fn() { const a = R(6, 9), b = R(2, 10); return Q({ text: `Tính: <b>${a * b} : ${a}</b>`, answer: b, hint: `${a} nhân mấy bằng ${a * b}?`, steps: [`${a} × ${b} = ${a * b} nên ${a * b} : ${a} = <b>${b}</b>.`] }); } },
          { level: 2, name: 'Tìm thừa số', fn() { const a = R(6, 9), x = R(2, 10); return Q({ text: `Tìm x: <b>x × ${a} = ${a * x}</b>`, answer: x, hint: 'Thừa số = Tích : Thừa số kia.', steps: [`x = ${a * x} : ${a}`, `x = <b>${x}</b>`] }); } },
          { level: 2, name: 'Toán đố nhân chia', fn() { const k = R(6, 9), n = R(3, 9); return Q({ text: `Mỗi túi có ${k} quả cam. ${n} túi như thế có bao nhiêu quả cam?`, answer: k * n, unit: 'quả', hint: 'Nhân số quả mỗi túi với số túi.', steps: [`${k} × ${n} = <b>${k * n}</b> (quả).`], solVisual: { type: 'array', rows: n, cols: k, icon: '🍊' } }); } },
          { level: 3, name: 'Biểu thức', fn() { const a = R(6, 9), b = R(2, 9), c = R(10, 50); return Q({ text: `Tính giá trị biểu thức: <b>${c} + ${a} × ${b}</b>`, answer: c + a * b, wrongs: [(c + a) * b, c + a + b, c * a + b], hint: 'Nhân chia trước, cộng trừ sau.', steps: [`${a} × ${b} = ${a * b}.`, `${c} + ${a * b} = <b>${c + a * b}</b>.`] }); } }
        ]
      },
      {
        id: 'g3_divrem', icon: '➗', title: 'Nhân, chia số có nhiều chữ số · Chia có dư', tagline: 'Đặt tính nhân – chia · Số dư bé hơn số chia', prereqs: ['g3_table'],
        summary: 'Nhân, chia số có hai, ba, bốn chữ số với số có một chữ số. Trong phép chia có dư, số dư luôn bé hơn số chia.',
        rules: [
          { title: 'Nhân với số có một chữ số', desc: 'Nhân lần lượt từ phải sang trái, nhớ sang hàng tiếp theo.', example: '127 × 3 = 381', tip: 'Đừng quên cộng số nhớ.', visual: { type: 'column', op: '×', a: 127, b: 3 } },
          { title: 'Chia cho số có một chữ số', desc: 'Chia lần lượt từ trái sang phải: chia – nhân – trừ – hạ.', example: '672 : 3 = 224', tip: 'Thử lại: Thương × Số chia + Số dư = Số bị chia.', visual: { type: 'division', a: 672, b: 3 } },
          { title: 'Chia có dư', desc: 'Số bị chia = Thương × Số chia + Số dư; Số dư < Số chia.', example: '29 : 4 = 7 (dư 1)', tip: 'Nếu số dư ≥ số chia là con đã chia sai!' }
        ],
        poem: ['Chia, nhân, trừ, hạ bốn bước,', 'Số dư bé hơn số chia mới được!'],
        pitfalls: [{ wrong: '29 : 4 = 6 (dư 5)', right: '29 : 4 = 7 (dư 1)', why: 'Số dư 5 lớn hơn số chia 4 → phải chia tiếp.' }],
        examples: [{ q: 'Đặt tính rồi tính: 845 : 5', steps: V.divisionSteps(845, 5), visual: { type: 'division', a: 845, b: 5 } }],
        gens: [
          { level: 1, name: 'Nhân số có 3 chữ số', fn() { const a = R(102, 333), b = R(2, 3); return Q({ text: `Đặt tính rồi tính: <b>${a} × ${b}</b>`, answer: a * b, hint: 'Nhân từ hàng đơn vị, nhớ sang hàng tiếp theo.', steps: V.columnSteps(a, b, '×'), solVisual: { type: 'column', op: '×', a, b } }); } },
          { level: 2, name: 'Chia hết', fn() { const b = R(2, 9), q = R(12, 199); return Q({ text: `Đặt tính rồi tính: <b>${b * q} : ${b}</b>`, answer: q, hint: 'Chia – nhân – trừ – hạ.', steps: V.divisionSteps(b * q, b), solVisual: { type: 'division', a: b * q, b } }); } },
          { level: 2, name: 'Số dư', fn() { const b = R(3, 9), q = R(3, 12), r = R(1, b - 1); return Q({ text: `Phép chia <b>${b * q + r} : ${b}</b> có số dư là:`, answer: r, wrongs: [b - r, r + b, 0].filter(x => x !== r), hint: `${b} × ${q} = ${b * q}.`, steps: [`${b * q + r} : ${b} = ${q} (dư ${r}), vì ${q} × ${b} + ${r} = ${b * q + r}.`] }); } },
          { level: 3, name: 'Số dư lớn nhất', fn() { const b = R(3, 9); return Q({ text: `Trong phép chia cho ${b}, số dư lớn nhất có thể là:`, answer: b - 1, wrongs: [b, b + 1, b - 2], hint: 'Số dư luôn bé hơn số chia.', steps: [`Số dư < ${b} nên lớn nhất là <b>${b - 1}</b>.`] }); } },
          { level: 3, name: 'Xếp xe', fn() { const b = pick([4, 5, 7]), n = b * R(3, 9) + R(1, b - 1); return Q({ text: `Có ${n} người cần đi xe, mỗi xe chở được ${b} người. Cần ít nhất bao nhiêu xe để chở hết?`, answer: Math.ceil(n / b), wrongs: [Math.floor(n / b), Math.ceil(n / b) + 1, n % b], unit: 'xe', hint: 'Chia có dư: những người còn dư vẫn cần thêm 1 xe!', steps: [`${n} : ${b} = ${Math.floor(n / b)} (dư ${n % b}).`, `Còn ${n % b} người nên cần thêm 1 xe: ${Math.floor(n / b)} + 1 = <b>${Math.ceil(n / b)}</b> xe.`] }); } }
        ]
      },
      {
        id: 'g3_times', icon: '🔁', title: 'Gấp lên, giảm đi một số lần', tagline: 'Gấp → nhân · Giảm → chia · Số lớn gấp mấy lần số bé', prereqs: ['g3_table'],
        summary: 'Muốn gấp một số lên nhiều lần, ta nhân số đó với số lần. Muốn giảm một số đi nhiều lần, ta chia số đó cho số lần.',
        rules: [
          { title: 'Gấp một số lên nhiều lần', desc: 'Lấy số đó nhân với số lần.', example: '6 gấp lên 4 lần: 6 × 4 = 24', tip: '“Gấp” khác “thêm”: 6 thêm 4 là 10.', visual: { type: 'bar', rows: [{ label: 'Bé', segs: [{ v: 6, inner: '6' }] }, { label: 'Lớn', segs: [{ v: 6, inner: '6' }, { v: 6, inner: '6' }, { v: 6, inner: '6' }, { v: 6, inner: '6' }] }], right: { text: '?', q: true } } },
          { title: 'Giảm một số đi nhiều lần', desc: 'Lấy số đó chia cho số lần.', example: '24 giảm 4 lần: 24 : 4 = 6', tip: '“Giảm đi 4 lần” khác “bớt đi 4”.' }
        ],
        poem: ['Gấp lên thì nhân cho mau,', 'Giảm đi thì chia, có đâu khó gì!'],
        pitfalls: [{ wrong: '5 gấp lên 3 lần = 8', right: '5 × 3 = 15', why: '“Gấp” là nhân, không phải cộng.' }],
        examples: [{ q: 'Mẹ 36 tuổi, tuổi con bằng tuổi mẹ giảm đi 4 lần. Con bao nhiêu tuổi?', steps: ['36 : 4 = <b>9</b> (tuổi).'] }],
        gens: [
          { level: 1, name: 'Gấp lên', fn() { const a = R(3, 12), k = R(2, 9); return Q({ text: `${a} gấp lên ${k} lần được:`, answer: a * k, wrongs: [a + k, a * k + a, a * (k - 1)], hint: 'Gấp lên → nhân.', steps: [`${a} × ${k} = <b>${a * k}</b>.`] }); } },
          { level: 1, name: 'Giảm đi', fn() { const a = R(3, 12), k = R(2, 9); return Q({ text: `${a * k} giảm đi ${k} lần được:`, answer: a, wrongs: [a * k - k, a + 1, a * k + k], hint: 'Giảm đi → chia.', steps: [`${a * k} : ${k} = <b>${a}</b>.`] }); } },
          { level: 2, name: 'Gấp mấy lần', fn() { const a = R(2, 9), k = R(2, 9); return Q({ text: `Số ${a * k} gấp mấy lần số ${a}?`, answer: k, wrongs: [a * k - a, k + 1, a], unit: 'lần', hint: 'Lấy số lớn chia cho số bé.', steps: [`${a * k} : ${a} = <b>${k}</b> (lần).`] }); } },
          { level: 3, name: 'Toán đố gấp', fn() { const a = R(5, 15), k = R(2, 5); return Q({ text: `Lan có ${a} nhãn vở. Số nhãn vở của Hùng gấp ${k} lần số nhãn vở của Lan. Hỏi cả hai bạn có bao nhiêu nhãn vở?`, answer: a + a * k, wrongs: [a * k, a + k, a * (k - 1)], unit: 'nhãn vở', hint: 'Bước 1: tìm số nhãn vở của Hùng.', steps: [`Hùng: ${a} × ${k} = ${a * k}.`, `Cả hai: ${a} + ${a * k} = <b>${a * (k + 1)}</b>.`], solVisual: { type: 'bar', rows: [{ label: 'Lan', segs: [{ v: a, inner: a }] }, { label: 'Hùng', segs: Array.from({ length: k }, () => ({ v: a, inner: a })) }], right: { text: '?', q: true } } }); } }
        ]
      },
      {
        id: 'g3_area', icon: '⬛', title: 'Chu vi, diện tích hình chữ nhật, hình vuông', tagline: 'cm² · Chu vi · Diện tích', prereqs: ['g2_geometry', 'g3_table'],
        summary: 'Xăng-ti-mét vuông (cm²) là diện tích hình vuông cạnh 1 cm. Chu vi HCN = (dài + rộng) × 2; diện tích HCN = dài × rộng.',
        rules: [
          { title: 'Diện tích hình chữ nhật', desc: 'Lấy chiều dài nhân với chiều rộng (cùng đơn vị đo).', formula: 'S = a × b', example: 'HCN 5 cm × 3 cm có S = 15 cm²', tip: 'Đếm số ô vuông 1 cm² bên trong.', visual: { type: 'grid', w: 5, h: 3 } },
          { title: 'Hình vuông', desc: 'Chu vi = cạnh × 4; Diện tích = cạnh × cạnh.', example: 'Cạnh 6 cm: C = 24 cm; S = 36 cm²', tip: 'Đơn vị chu vi là cm, diện tích là cm².' }
        ],
        poem: ['Chu vi cộng lại nhân hai,', 'Diện tích dài nhân rộng, chẳng sai bao giờ!'],
        pitfalls: [{ wrong: 'Diện tích ghi đơn vị cm', right: 'Diện tích ghi đơn vị cm²', why: 'Diện tích đo bằng ô vuông.' }],
        examples: [{ q: 'HCN dài 8 cm, rộng 5 cm. Tính chu vi và diện tích.', steps: ['C = (8 + 5) × 2 = 26 (cm).', 'S = 8 × 5 = 40 (cm²).'] }],
        gens: [
          { level: 1, name: 'Đếm ô vuông', fn() { const w = R(2, 8), h = R(2, 5); return Q({ text: 'Hình dưới đây có diện tích bao nhiêu xăng-ti-mét vuông? (mỗi ô là 1 cm²)', visual: { type: 'grid', w, h, caption: ' ' }, answer: w * h, unit: 'cm²', hint: 'Đếm số ô mỗi hàng rồi nhân với số hàng.', steps: [`${w} × ${h} = <b>${w * h}</b> (cm²).`] }); } },
          { level: 2, name: 'Chu vi HCN', fn() { const a = R(5, 20), b = R(2, a - 1); return Q({ text: `Hình chữ nhật dài ${a} cm, rộng ${b} cm. Chu vi là:`, answer: (a + b) * 2, wrongs: [a * b, a + b, a * 2 + b], unit: 'cm', hint: 'C = (dài + rộng) × 2.', steps: [`(${a} + ${b}) × 2 = <b>${(a + b) * 2}</b> (cm).`], visual: { type: 'shape', kind: 'rect', labels: { top: a + ' cm', left: b + ' cm' } } }); } },
          { level: 2, name: 'Diện tích hình vuông', fn() { const a = R(3, 12); return Q({ text: `Hình vuông cạnh ${a} cm có diện tích là:`, visual: { type: 'shape', kind: 'square', labels: { top: a + ' cm' } }, answer: a * a, wrongs: [a * 4, a * 2, a * a + a], unit: 'cm²', hint: 'S = cạnh × cạnh.', steps: [`${a} × ${a} = <b>${a * a}</b> (cm²).`] }); } },
          { level: 3, name: 'Biết chu vi tìm cạnh', fn() { const a = R(3, 15); return Q({ text: `Một hình vuông có chu vi ${a * 4} cm. Tính diện tích hình vuông đó.`, visual: MA.Vis.G.square(a, { label: '?', caption: `Chu vi: ${a * 4} cm` }), answer: a * a, wrongs: [a * 4, a, (a * 4) * (a * 4)], unit: 'cm²', hint: 'Tìm cạnh trước: cạnh = chu vi : 4.', steps: [`Cạnh: ${a * 4} : 4 = ${a} (cm).`, `Diện tích: ${a} × ${a} = <b>${a * a}</b> (cm²).`] }); } }
        ]
      }
    ]
  });

})(window.MA);

/* ---------------------------------------------------------
 * PHẦN 2 — LỚP 3: CHỦ ĐỀ & DẠNG BÀI BỔ SUNG
 * --------------------------------------------------------- */
(function (MA) {
  'use strict';
  const { R, pick, Q, fmt, shuffle, frac, gcd } = MA.U;
  const V = MA.Vis;
  const X = (id, gens) => MA.Data.extend(id, gens);
  const cmp = (a, b) => a > b ? '>' : a < b ? '<' : '=';
  const SIGNS = ['>', '<', '='];
  const roman = (n) => { const m = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; m.forEach(([v, r]) => { while (n >= v) { s += r; n -= v; } }); return s; };
  const NAMES = ['Lan', 'Mai', 'Nam', 'Hà', 'An', 'Bình', 'Minh', 'Hoa', 'Tùng', 'Linh'];

  // ----- Bổ sung dạng bài cho 4 chủ đề cốt lõi -----
  X('g3_table', [
    { level: 1, name: 'Điền số bảng nhân', fn() { const a = R(6, 9), b = R(2, 10); return Q({ text: `Điền số: <b>${a} × ... = ${a * b}</b>`, answer: b, hint: `Nhẩm bảng nhân ${a}.`, steps: [`${a} × <b>${b}</b> = ${a * b}.`] }); } },
    { level: 1, name: 'Đếm thêm 6–9', fn() { const k = R(6, 9), s = R(1, 5); const arr = [0, 1, 2, 3].map(i => k * (s + i)); return Q({ text: `Điền số tiếp theo: <b>${arr.join(', ')}, …</b>`, answer: k * (s + 4), wrongs: [k * (s + 4) + 1, k * (s + 5), k * (s + 4) - 2], hint: `Đếm thêm ${k}.`, steps: [`${arr[3]} + ${k} = <b>${k * (s + 4)}</b>.`] }); } },
    { level: 2, name: 'So sánh tích', fn() { const a = R(6, 9), b = R(2, 10), c = R(6, 9), d = R(2, 10); return Q({ text: `Chọn dấu: <b>${a} × ${b} ... ${c} × ${d}</b>`, answer: cmp(a * b, c * d), options: SIGNS, shuffle: false, hint: 'Tính từng tích.', steps: [`${a * b} ${cmp(a * b, c * d)} ${c * d}.`] }); } },
    { level: 2, name: 'Chia đều (lời văn)', fn() { const k = R(6, 9), q = R(3, 9); return Q({ text: `Có ${k * q} quyển vở chia đều cho ${k} bạn. Mỗi bạn được mấy quyển?`, answer: q, unit: 'quyển', hint: 'Chia đều → phép chia.', steps: [`${k * q} : ${k} = <b>${q}</b> (quyển).`], solVisual: { type: 'array', rows: k, cols: q, icon: '📒', caption: `${k * q} : ${k} = ${q}` } }); } },
    { level: 3, name: 'Tìm số bị chia', fn() { const k = R(6, 9), q = R(2, 10); return Q({ text: `Tìm x: <b>x : ${k} = ${q}</b>`, answer: k * q, wrongs: [k + q, k * q + k, q], hint: 'Số bị chia = Thương × Số chia.', steps: [`x = ${q} × ${k} = <b>${k * q}</b>.`] }); } }
  ]);
  X('g3_divrem', [
    { level: 1, name: 'Nhân số có 2 chữ số', fn() { const a = R(12, 49), b = R(2, 6); return Q({ text: `Tính: <b>${a} × ${b}</b>`, answer: a * b, wrongs: [a * b - 10, a * b + 10, a + b], hint: 'Nhân hàng đơn vị trước, nhớ sang hàng chục.', steps: V.columnSteps(a, b, '×'), solVisual: { type: 'column', op: '×', a, b } }); } },
    { level: 2, name: 'Chia số 4 chữ số', fn() { const b = R(2, 9), q = R(1001, Math.floor(9999 / b)); return Q({ text: `Đặt tính rồi tính: <b>${fmt(b * q)} : ${b}</b>`, answer: q, hint: 'Chia lần lượt từ hàng nghìn.', steps: V.divisionSteps(b * q, b), solVisual: { type: 'division', a: b * q, b } }); } },
    { level: 2, name: 'Thương và số dư', fn() { const b = R(3, 9), q = R(10, 99), r = R(1, b - 1); const n = b * q + r; return Q({ text: `Tính: <b>${n} : ${b}</b> = ? (dư ?)`, answer: `${q} dư ${r}`, options: [`${q} dư ${r}`, `${q - 1} dư ${r + b}`, `${q + 1} dư ${r}`, `${q} dư ${b - r}`], hint: 'Số dư phải bé hơn số chia.', steps: V.divisionSteps(n, b), solVisual: { type: 'division', a: n, b } }); } },
    { level: 3, name: 'Tìm số bị chia có dư', fn() { const b = R(3, 9), q = R(5, 30), r = R(1, b - 1); return Q({ text: `Tìm số bị chia trong phép chia có số chia ${b}, thương ${q} và số dư ${r}.`, answer: b * q + r, wrongs: [b * q, b * q - r, b * q + r + b], hint: 'Số bị chia = Thương × Số chia + Số dư.', steps: [`${q} × ${b} + ${r} = <b>${b * q + r}</b>.`] }); } }
  ]);
  X('g3_times', [
    { level: 1, name: 'Một phần mấy', fn() { const k = R(2, 9), a = R(2, 10); return Q({ text: `Số bé ${a} bằng một phần mấy số lớn ${a * k}?`, answer: `1/${k}`, options: [`1/${k}`, `1/${k + 1}`, `1/${a}`, `${k}/1`], hint: 'Số lớn gấp mấy lần số bé thì số bé bằng một phần bấy nhiêu số lớn.', steps: [`${a * k} : ${a} = ${k} → số bé bằng <b>${frac(1, k)}</b> số lớn.`] }); } },
    { level: 2, name: 'Gấp lên (lời văn)', fn() { const a = R(4, 12), k = R(2, 6); return Q({ text: `Con hái được ${a} bông hoa. Mẹ hái được gấp ${k} lần số hoa của con. Mẹ hái được bao nhiêu bông?`, answer: a * k, wrongs: [a + k, a * (k + 1), a * k - a], unit: 'bông', hint: '“Gấp … lần” → nhân.', steps: [`${a} × ${k} = <b>${a * k}</b> (bông).`], solVisual: { type: 'bar', rows: [{ label: 'Con', segs: [{ v: a, inner: a }] }, { label: 'Mẹ', segs: Array.from({ length: k }, () => ({ v: a, inner: a })) }], right: { text: '?', q: true } } }); } },
    { level: 2, name: 'Giảm đi (lời văn)', fn() { const a = R(3, 12), k = R(2, 6); return Q({ text: `Một cửa hàng có ${a * k} kg gạo, sau một ngày số gạo giảm đi ${k} lần. Cửa hàng còn bao nhiêu ki-lô-gam gạo?`, answer: a, wrongs: [a * k - k, a + k, a * k], unit: 'kg', hint: '“Giảm đi … lần” → chia.', steps: [`${a * k} : ${k} = <b>${a}</b> (kg).`] }); } },
    { level: 3, name: 'Gấp rồi thêm', fn() { const a = R(3, 9), k = R(2, 5), b = R(5, 20); return Q({ text: `Lấy ${a} gấp lên ${k} lần rồi thêm ${b} thì được bao nhiêu?`, answer: a * k + b, wrongs: [(a + b) * k, a + k + b, a * (k + b)], hint: 'Làm lần lượt: gấp (nhân) trước, thêm (cộng) sau.', steps: [`${a} × ${k} = ${a * k}; ${a * k} + ${b} = <b>${a * k + b}</b>.`] }); } }
  ]);
  X('g3_area', [
    { level: 1, name: 'Chu vi hình vuông', fn() { const a = R(3, 25); return Q({ text: `Hình vuông cạnh ${a} cm. Chu vi là:`, answer: a * 4, wrongs: [a * a, a * 2, a + 4], unit: 'cm', hint: 'Chu vi hình vuông = cạnh × 4.', steps: [`${a} × 4 = <b>${a * 4}</b> (cm).`], visual: { type: 'shape', kind: 'square', labels: { top: a + ' cm' } } }); } },
    { level: 2, name: 'Diện tích HCN', fn() { const a = R(5, 15), b = R(2, a - 1); return Q({ text: `Hình chữ nhật dài ${a} cm, rộng ${b} cm. Diện tích là:`, answer: a * b, wrongs: [(a + b) * 2, a + b, a * b + a], unit: 'cm²', hint: 'Diện tích = dài × rộng.', steps: [`${a} × ${b} = <b>${a * b}</b> (cm²).`], visual: { type: 'shape', kind: 'rect', labels: { top: a + ' cm', left: b + ' cm' } } }); } },
    { level: 3, name: 'Ghép hai hình vuông', fn() { const a = R(2, 9); return Q({ text: `Ghép hai hình vuông cạnh ${a} cm thành một hình chữ nhật (như hình vẽ). Chu vi hình chữ nhật là:`, visual: { type: 'geo', P: { A: [0, 0], M: [1, 0], B: [2, 0], C: [2, 1], N: [1, 1], D: [0, 1] }, polys: [{ p: ['A', 'M', 'N', 'D'], fill: 'rgba(74,123,216,.14)' }, { p: ['M', 'B', 'C', 'N'], fill: 'rgba(242,159,61,.18)' }], lines: [{ a: 'A', b: 'M', t: a + ' cm', hide: true, side: 1 }, { a: 'D', b: 'A', t: a + ' cm', hide: true }], show: [], maxW: 240, maxH: 120 }, answer: a * 6, wrongs: [a * 8, a * 4, a * a * 2], unit: 'cm', hint: `Hình chữ nhật mới dài ${a} + ${a} = ${a * 2} cm, rộng ${a} cm.`, steps: [`Dài ${a * 2} cm, rộng ${a} cm.`, `(${a * 2} + ${a}) × 2 = <b>${a * 6}</b> (cm).`], solVisual: MA.Vis.G.rect(2 * a, a, { labels: { top: 2 * a + ' cm', left: a + ' cm' } }) }); } },
    { level: 3, name: 'Biết chu vi HCN', fn() { const b = R(2, 10), a = b + R(1, 10); return Q({ text: `Hình chữ nhật có chu vi ${(a + b) * 2} cm, chiều rộng ${b} cm. Tính chiều dài.`, visual: MA.Vis.G.rect(a, b, { labels: { top: '?', left: b + ' cm' }, caption: `Chu vi: ${(a + b) * 2} cm` }), answer: a, wrongs: [(a + b) * 2 - b, a + b, a - 1], unit: 'cm', hint: 'Nửa chu vi = dài + rộng.', steps: [`Nửa chu vi: ${(a + b) * 2} : 2 = ${a + b}.`, `Chiều dài: ${a + b} − ${b} = <b>${a}</b> (cm).`] }); } }
  ]);

  // ----- Chủ đề mới -----
  MA.Data.addTopics(3, [
    {
      id: 'g3_num', icon: '🔢', title: 'Các số đến 10 000 và 100 000', tagline: 'Hàng chục nghìn · So sánh · Làm tròn · Số La Mã', prereqs: ['g2_numbers'],
      summary: 'Số có năm chữ số gồm các hàng: chục nghìn, nghìn, trăm, chục, đơn vị. Làm tròn số đến hàng chục, trăm, nghìn. Đọc số La Mã từ I đến XX.',
      rules: [
        { title: 'Cấu tạo số', desc: 'Số 45 307 gồm 4 chục nghìn, 5 nghìn, 3 trăm, 0 chục, 7 đơn vị.', formula: '45 307 = 40 000 + 5 000 + 300 + 7', example: 'Đọc: bốn mươi lăm nghìn ba trăm linh bảy.', tip: 'Đọc theo từng lớp: nghìn rồi đến đơn vị.' },
        { title: 'Làm tròn số', desc: 'Làm tròn đến hàng nào thì xét chữ số ngay bên phải: < 5 thì giữ, ≥ 5 thì cộng thêm 1.', example: '3 476 ≈ 3 480 (đến hàng chục) ≈ 3 500 (đến hàng trăm)', tip: 'Dùng tia số để xem số gần hơn bên nào.', visual: { type: 'numberline', min: 3470, max: 3480, highlight: [3476] } },
        { title: 'Số La Mã', desc: 'I = 1, V = 5, X = 10. Chữ nhỏ đứng sau → cộng; đứng trước → trừ.', example: 'IV = 4, VI = 6, IX = 9, XI = 11, XIX = 19', tip: 'Đồng hồ treo tường thường dùng số La Mã!' }
      ],
      poem: ['Năm chữ số chớ có lo,', 'Chục nghìn đứng trước, đọc to rõ ràng!'],
      pitfalls: [{ wrong: '3 476 làm tròn đến hàng trăm là 3 400', right: '3 500 (vì chữ số hàng chục là 7 ≥ 5)', why: 'Phải xét chữ số ngay bên phải hàng làm tròn.' }],
      examples: [{ q: 'Làm tròn 8 352 đến hàng nghìn.', steps: ['Chữ số hàng trăm là 3 < 5.', 'Làm tròn xuống: <b>8 000</b>.'] }],
      gens: [
        { level: 1, name: 'Cấu tạo số 5 chữ số', fn() { const n = R(10000, 99999); const d = String(n).split('').map(Number); const ans = n; return Q({ text: `Số gồm ${d[0]} chục nghìn, ${d[1]} nghìn, ${d[2]} trăm, ${d[3]} chục, ${d[4]} đơn vị là:`, answer: ans, wrongs: [+[d[0], d[1], d[3], d[2], d[4]].join(''), d[0] * 1000 + d[1] * 100 + d[2] * 10 + d[3] + d[4], ans + 1000], hint: 'Viết lần lượt các chữ số từ hàng cao đến hàng thấp.', steps: [`<b>${fmt(ans)}</b>.`] }); } },
        { level: 1, name: 'So sánh số lớn', fn() { const a = R(1000, 99999), b = a + pick([-1000, -100, -1, 0, 1, 10, 9000]); return Q({ text: `Chọn dấu: <b>${fmt(a)} ... ${fmt(b)}</b>`, answer: cmp(a, b), options: SIGNS, shuffle: false, hint: 'Số nào nhiều chữ số hơn thì lớn hơn; bằng nhau thì so từ trái sang.', steps: [`${fmt(a)} ${cmp(a, b)} ${fmt(b)}.`] }); } },
        { level: 1, name: 'Đọc số La Mã', fn() { const n = R(1, 20); return Q({ text: `Số La Mã <b>${roman(n)}</b> đọc là:`, answer: n, wrongs: [n + 1, n - 1 || 3, n + 5], hint: 'I = 1, V = 5, X = 10.', steps: [`${roman(n)} = <b>${n}</b>.`] }); } },
        { level: 2, name: 'Làm tròn', fn() { const n = R(1000, 99999); const p = pick([10, 100, 1000]); const v = Math.round(n / p) * p; return Q({ text: `Làm tròn số <b>${fmt(n)}</b> đến hàng ${{ 10: 'chục', 100: 'trăm', 1000: 'nghìn' }[p]}.`, answer: v, wrongs: [v + p, v - p, Math.floor(n / p) * p === v ? v + 2 * p : Math.floor(n / p) * p], hint: 'Xét chữ số ngay bên phải hàng cần làm tròn.', steps: [`Kết quả: <b>${fmt(v)}</b>.`] }); } },
        { level: 2, name: 'Liền trước, liền sau', fn() { const n = pick([R(1000, 99998), R(1, 9) * 10000, R(10, 99) * 1000]); const after = R(0, 1); const ans = after ? n + 1 : n - 1; return Q({ text: `Số liền ${after ? 'sau' : 'trước'} của <b>${fmt(n)}</b> là:`, answer: ans, wrongs: [after ? n - 1 : n + 1, after ? n + 10 : n - 10, after ? n + 1000 : n - 1000], hint: `Liền ${after ? 'sau: thêm 1' : 'trước: bớt 1'}.`, steps: [`<b>${fmt(ans)}</b>.`] }); } },
        { level: 3, name: 'Số lớn nhất 5 chữ số', fn() { const ds = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 5); const big = R(0, 1); let s = ds.slice().sort((a, b) => big ? b - a : a - b); if (!big && s[0] === 0) { [s[0], s[1]] = [s[1], s[0]]; } return Q({ text: `Từ năm chữ số ${ds.join(', ')}, viết số ${big ? 'lớn' : 'bé'} nhất có năm chữ số khác nhau.`, answer: +s.join(''), hint: big ? 'Xếp giảm dần.' : 'Xếp tăng dần, nhưng chữ số đầu phải khác 0.', steps: [`<b>${fmt(+s.join(''))}</b>.`] }); } }
      ]
    },
    {
      id: 'g3_addsub', icon: '➕', title: 'Cộng, trừ trong phạm vi 100 000', tagline: 'Đặt tính · Tính nhẩm tròn nghìn · Tìm thành phần', prereqs: ['g2_1000', 'g3_num'],
      summary: 'Cộng, trừ các số có đến năm chữ số: đặt thẳng cột, tính từ phải sang trái, nhớ đúng.',
      rules: [
        { title: 'Đặt tính và tính', desc: 'Các chữ số cùng hàng thẳng cột với nhau.', example: '36 528 + 24 975 = 61 503', tip: 'Thử lại phép cộng bằng phép trừ.', visual: { type: 'column', op: '+', a: 36528, b: 24975 } },
        { title: 'Tính nhẩm số tròn nghìn', desc: 'Cộng, trừ số nghìn rồi viết thêm 3 chữ số 0.', example: '45 000 − 8 000 = 37 000', tip: '45 nghìn − 8 nghìn = 37 nghìn.' }
      ],
      poem: ['Thẳng hàng như những hàng cây,', 'Tính từ bên phải, nhớ ngay chớ quên!'],
      pitfalls: [{ wrong: '50 000 − 1 = 49 000', right: '50 000 − 1 = 49 999', why: 'Phải mượn liên tiếp qua nhiều hàng.' }],
      examples: [{ q: 'Đặt tính rồi tính: 72 305 − 18 467', steps: V.columnSteps(72305, 18467, '-'), visual: { type: 'column', op: '-', a: 72305, b: 18467 } }],
      gens: [
        { level: 1, name: 'Tròn nghìn', fn() { const a = R(10, 90), b = R(1, 9); const add = R(0, 1); return Q({ text: `Tính nhẩm: <b>${fmt(add ? a * 1000 : (a + b) * 1000)} ${add ? '+' : '−'} ${fmt(b * 1000)}</b>`, answer: add ? (a + b) * 1000 : a * 1000, hint: 'Tính theo số nghìn.', steps: [`= <b>${fmt(add ? (a + b) * 1000 : a * 1000)}</b>.`] }); } },
        { level: 1, name: 'Cộng số 4–5 chữ số', fn() { const a = R(1000, 60000), b = R(1000, 39999); return Q({ text: `Đặt tính rồi tính: <b>${fmt(a)} + ${fmt(b)}</b>`, answer: a + b, hint: 'Đặt thẳng cột, cộng từ phải sang trái.', steps: V.columnSteps(a, b, '+'), solVisual: { type: 'column', op: '+', a, b } }); } },
        { level: 2, name: 'Trừ số 4–5 chữ số', fn() { const a = R(20000, 99999), b = R(1000, a - 1000); return Q({ text: `Đặt tính rồi tính: <b>${fmt(a)} − ${fmt(b)}</b>`, answer: a - b, hint: 'Hàng nào không trừ được thì mượn 1 ở hàng bên trái.', steps: V.columnSteps(a, b, '-'), solVisual: { type: 'column', op: '-', a, b } }); } },
        { level: 2, name: 'Tìm x', fn() { const x = R(1000, 50000), a = R(1000, 40000); const t = R(0, 1); return t ? Q({ text: `Tìm x: <b>x + ${fmt(a)} = ${fmt(x + a)}</b>`, answer: x, hint: 'x = Tổng − Số hạng.', steps: [`x = ${fmt(x + a)} − ${fmt(a)} = <b>${fmt(x)}</b>.`] }) : Q({ text: `Tìm x: <b>x − ${fmt(a)} = ${fmt(x)}</b>`, answer: x + a, hint: 'x = Hiệu + Số trừ.', steps: [`x = ${fmt(x)} + ${fmt(a)} = <b>${fmt(x + a)}</b>.`] }); } },
        { level: 2, name: 'Lời văn', fn() { const a = R(10000, 50000), b = R(5000, 30000); return Q({ text: `Một nhà máy tháng đầu sản xuất ${fmt(a)} sản phẩm, tháng sau sản xuất nhiều hơn tháng đầu ${fmt(b)} sản phẩm. Cả hai tháng sản xuất được bao nhiêu sản phẩm?`, answer: 2 * a + b, wrongs: [a + b, 2 * a, 2 * (a + b)], unit: 'sản phẩm', hint: 'Tìm số sản phẩm tháng sau trước.', steps: [`Tháng sau: ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`, `Cả hai tháng: ${fmt(a)} + ${fmt(a + b)} = <b>${fmt(2 * a + b)}</b>.`] }); } },
        { level: 3, name: 'Mượn nhiều hàng', fn() { const a = R(1, 9) * 10000, b = R(1, 999); return Q({ text: `Tính: <b>${fmt(a)} − ${b}</b>`, answer: a - b, wrongs: [a - b - 1000, a - 1000 + b, a - b + 10], hint: 'Mượn liên tiếp từ hàng chục nghìn xuống.', steps: [`= <b>${fmt(a - b)}</b>.`] }); } }
      ]
    },
    {
      id: 'g3_expr', icon: '🧮', title: 'Biểu thức số – Tính giá trị biểu thức', tagline: 'Nhân chia trước, cộng trừ sau · Có ngoặc tính trong ngoặc trước', prereqs: ['g3_table'],
      summary: 'Biểu thức chỉ có + − (hoặc chỉ × :) thì tính từ trái sang phải. Có cả + − × : thì nhân chia trước. Có ngoặc ( ) thì tính trong ngoặc trước.',
      rules: [
        { title: 'Quy tắc 1', desc: 'Chỉ có cộng, trừ (hoặc chỉ có nhân, chia): tính từ trái sang phải.', example: '60 − 20 + 5 = 40 + 5 = 45', tip: 'Đừng tính 20 + 5 trước!' },
        { title: 'Quy tắc 2', desc: 'Có cộng trừ và nhân chia: nhân chia trước, cộng trừ sau.', example: '30 + 4 × 5 = 30 + 20 = 50', tip: '“Nhân chia trước – cộng trừ sau”.' },
        { title: 'Quy tắc 3', desc: 'Có dấu ngoặc: tính trong ngoặc trước.', example: '(30 + 4) × 5 = 34 × 5 = 170', tip: 'Dấu ngoặc là “ưu tiên số 1”.' }
      ],
      poem: ['Ngoặc tròn ưu tiên số một,', 'Nhân chia đứng trước, cộng trừ theo sau!'],
      pitfalls: [{ wrong: '30 + 4 × 5 = 34 × 5 = 170', right: '30 + 4 × 5 = 30 + 20 = 50', why: 'Phải nhân trước.' }],
      examples: [{ q: 'Tính: 81 : 9 + 6 × 7', steps: ['81 : 9 = 9; 6 × 7 = 42.', '9 + 42 = <b>51</b>.'] }],
      gens: [
        { level: 1, name: 'Cộng trừ trái sang phải', fn() { const a = R(40, 90), b = R(10, 30), c = R(5, 20); return Q({ text: `Tính giá trị biểu thức: <b>${a} − ${b} + ${c}</b>`, answer: a - b + c, wrongs: [a - b - c, a - (b + c), a + b + c].filter(x => x !== a - b + c), hint: 'Tính từ trái sang phải.', steps: [`${a} − ${b} = ${a - b}; ${a - b} + ${c} = <b>${a - b + c}</b>.`] }); } },
        { level: 1, name: 'Nhân trước cộng sau', fn() { const a = R(10, 60), b = R(2, 9), c = R(2, 9); return Q({ text: `Tính: <b>${a} + ${b} × ${c}</b>`, answer: a + b * c, wrongs: [(a + b) * c, a + b + c, a * b + c], hint: 'Nhân trước, cộng sau.', steps: [`${b} × ${c} = ${b * c}; ${a} + ${b * c} = <b>${a + b * c}</b>.`] }); } },
        { level: 2, name: 'Có ngoặc', fn() { const a = R(10, 40), b = R(2, 20), c = R(2, 5); return Q({ text: `Tính: <b>(${a} + ${b}) × ${c}</b>`, answer: (a + b) * c, wrongs: [a + b * c, a * c + b, (a + b) * c + c], hint: 'Tính trong ngoặc trước.', steps: [`${a} + ${b} = ${a + b}; ${a + b} × ${c} = <b>${(a + b) * c}</b>.`] }); } },
        { level: 2, name: 'Chia và nhân', fn() { const b = R(2, 9), q = R(2, 9), c = R(2, 9), d = R(2, 9); const v = q + c * d; return Q({ text: `Tính: <b>${b * q} : ${b} + ${c} × ${d}</b>`, answer: v, hint: 'Nhân chia trước, cộng sau.', steps: [`${b * q} : ${b} = ${q}; ${c} × ${d} = ${c * d}.`, `${q} + ${c * d} = <b>${v}</b>.`] }); } },
        { level: 3, name: 'So sánh hai biểu thức', fn() { const a = R(10, 30), b = R(2, 9), c = R(2, 6); const x = (a + b) * c, y = a + b * c; return Q({ text: `Chọn dấu: <b>(${a} + ${b}) × ${c} ... ${a} + ${b} × ${c}</b>`, answer: cmp(x, y), options: SIGNS, shuffle: false, hint: 'Tính giá trị từng biểu thức.', steps: [`Vế trái: ${x}; vế phải: ${y}.`, `${x} ${cmp(x, y)} ${y}.`] }); } },
        { level: 3, name: 'Lời văn hai bước', fn() { const p = R(3, 9), n = R(4, 9), extra = R(5, 20); return Q({ text: `Mỗi hộp có ${p} cái bánh. Mẹ mua ${n} hộp và thêm ${extra} cái bánh lẻ. Mẹ mua tất cả bao nhiêu cái bánh?`, answer: p * n + extra, wrongs: [(p + extra) * n, p + n + extra, p * (n + extra)], unit: 'cái', hint: 'Viết biểu thức: ' + p + ' × ' + n + ' + ' + extra + '.', steps: [`${p} × ${n} + ${extra} = ${p * n} + ${extra} = <b>${p * n + extra}</b> (cái).`] }); } }
      ]
    },
    {
      id: 'g3_measure', icon: '⏰', title: 'Đo lường: mm, g, ml, nhiệt độ, thời gian', tagline: 'Mi-li-mét · Gam · Mi-li-lít · Độ C · Xem giờ phút · Tháng năm', prereqs: ['g2_measure'],
      summary: '1 cm = 10 mm; 1 kg = 1 000 g; 1 l = 1 000 ml. Nhiệt độ đo bằng độ C (°C). Xem đồng hồ chính xác đến từng phút.',
      rules: [
        { title: 'Bảng đơn vị', desc: '1 cm = 10 mm; 1 m = 1 000 mm; 1 kg = 1 000 g; 1 l = 1 000 ml.', example: '3 kg = 3 000 g; 2 l = 2 000 ml', tip: 'Ki-lô nghĩa là “nghìn”: 1 ki-lô-gam = 1 nghìn gam.' },
        { title: 'Nhiệt độ', desc: 'Đọc vạch mà cột chất lỏng chạm tới.', example: 'Nhiệt độ cơ thể người khoảng 37°C.', tip: 'Nước đá tan ở 0°C, nước sôi ở 100°C.', visual: { type: 'thermo', t: 25, min: 0, max: 40 } },
        { title: 'Xem đồng hồ', desc: 'Kim phút chỉ mỗi vạch nhỏ = 1 phút, mỗi số = 5 phút.', example: 'Kim phút chỉ số 4 → 20 phút', tip: '8 giờ 45 phút còn gọi là 9 giờ kém 15 phút.', visual: { type: 'clock', h: 8, m: 45 } }
      ],
      poem: ['Ki-lô là gấp một nghìn,', 'Gam, mét, lít đổi thật tin chẳng nhầm!'],
      pitfalls: [{ wrong: '2 kg = 200 g', right: '2 kg = 2 000 g', why: '1 kg = 1 000 g.' }],
      examples: [{ q: 'Một hộp sữa 250 ml. 4 hộp như thế có bao nhiêu mi-li-lít? Đó là mấy lít?', steps: ['250 × 4 = 1 000 (ml).', '1 000 ml = <b>1 l</b>.'] }],
      gens: [
        { level: 1, name: 'Đổi đơn vị', fn() { const T = pick([['cm', 'mm', 10], ['kg', 'g', 1000], ['l', 'ml', 1000], ['m', 'mm', 1000], ['m', 'cm', 100]]); const n = R(2, 9); return Q({ text: `Điền số: <b>${n} ${T[0]} = ... ${T[1]}</b>`, answer: n * T[2], wrongs: [n * T[2] / 10, n * T[2] * 10, n + T[2]], unit: T[1], hint: `1 ${T[0]} = ${fmt(T[2])} ${T[1]}.`, steps: [`${n} × ${fmt(T[2])} = <b>${fmt(n * T[2])}</b> ${T[1]}.`] }); } },
        { level: 1, name: 'Đọc nhiệt kế', fn() { const t = R(1, 8) * 5; return Q({ text: 'Nhiệt kế chỉ bao nhiêu độ C?', visual: { type: 'thermo', t, min: 0, max: 45 }, answer: t, wrongs: [t + 5, t - 5 || 50, t + 10], unit: '°C', hint: 'Đọc vạch ở đỉnh cột màu đỏ.', steps: [`<b>${t}°C</b>.`] }); } },
        { level: 1, name: 'Xem giờ phút', fn() { const h = R(1, 12), m = R(1, 11) * 5; const t = (H, M) => `${H} giờ ${M} phút`; return Q({ text: 'Đồng hồ chỉ mấy giờ?', visual: { type: 'clock', h, m }, answer: t(h, m), options: [t(h, m), t(h, (m + 30) % 60 || 5), t(h % 12 + 1, m), t(m / 5, h * 5 % 60 || 10)], hint: 'Kim phút chỉ số nào thì nhân 5.', steps: [`Kim phút chỉ số ${m / 5} → ${m} phút. Kim giờ đã qua số ${h}.`, `<b>${t(h, m)}</b>.`] }); } },
        { level: 2, name: 'Giờ kém', fn() { const h = R(2, 12), k = pick([5, 10, 15, 20]); return Q({ text: `${h} giờ kém ${k} phút còn gọi là:`, answer: `${h - 1} giờ ${60 - k} phút`, options: [`${h - 1} giờ ${60 - k} phút`, `${h} giờ ${60 - k} phút`, `${h - 1} giờ ${k} phút`, `${h} giờ ${k} phút`], hint: `Còn ${k} phút nữa thì đến ${h} giờ.`, steps: [`60 − ${k} = ${60 - k} → <b>${h - 1} giờ ${60 - k} phút</b>.`], solVisual: { type: 'clock', h: h - 1, m: 60 - k } }); } },
        { level: 2, name: 'Gam và ki-lô-gam', fn() { const a = R(1, 9) * 100, b = R(1, 9) * 100; return Q({ text: `Gói kẹo nặng ${a} g, gói bánh nặng ${b} g. Cả hai gói nặng bao nhiêu gam?`, answer: a + b, unit: 'g', hint: 'Cộng khối lượng hai gói.', steps: [`${a} + ${b} = <b>${a + b}</b> (g)${a + b >= 1000 ? ` = ${fmt(a + b)} g (hơn 1 kg)` : ''}.`] }); } },
        { level: 2, name: 'Khoảng thời gian', fn() { const h = R(6, 15), m1 = R(0, 5) * 5, d = R(2, 9) * 5; return Q({ text: `Bạn Mai bắt đầu làm bài lúc ${h} giờ ${m1} phút và làm xong lúc ${h} giờ ${m1 + d} phút. Mai làm bài hết bao nhiêu phút?`, answer: d, unit: 'phút', hint: 'Lấy giờ kết thúc trừ giờ bắt đầu.', steps: [`${m1 + d} − ${m1} = <b>${d}</b> (phút).`] }); } },
        { level: 3, name: 'Năm nhuận, tháng', fn() { const T = pick([['Một năm có bao nhiêu tháng?', 12, [10, 11, 13]], ['Một năm thường có bao nhiêu ngày?', 365, [360, 366, 364]], ['Năm nhuận có bao nhiêu ngày?', 366, [365, 360, 367]], ['Tháng 2 năm nhuận có bao nhiêu ngày?', 29, [28, 30, 31]], ['Những tháng có 31 ngày trong một năm là bao nhiêu tháng?', 7, [6, 5, 8]]]); return Q({ text: T[0], answer: T[1], wrongs: T[2], hint: 'Đếm theo đốt ngón tay.', steps: [`<b>${T[1]}</b>.`] }); } }
      ]
    },
    {
      id: 'g3_frac', icon: '🍰', title: 'Làm quen với phân số: một phần hai, ba, …', tagline: '1/2 · 1/3 · … · 1/9 của một số', prereqs: ['g3_table'],
      summary: 'Chia hình (hoặc một số) thành n phần bằng nhau, lấy 1 phần: đó là 1/n. Muốn tìm 1/n của một số, lấy số đó chia cho n.',
      rules: [{ title: 'Tìm một phần mấy của một số', desc: 'Lấy số đó chia cho số phần.', formula: '1/n của a = a : n', example: '1/4 của 20 cái kẹo là 20 : 4 = 5 cái', tip: 'Vẽ sơ đồ chia đoạn thẳng thành n phần bằng nhau.', visual: { type: 'bar', rows: [{ label: '20', segs: [{ v: 5, inner: '5' }, { v: 5, inner: '', dashed: true }, { v: 5, inner: '', dashed: true }, { v: 5, inner: '', dashed: true }] }] } }, { title: 'Nhận biết 1/n trên hình', desc: 'Hình chia làm n phần BẰNG NHAU, tô 1 phần.', example: 'Hình tròn chia 3 phần bằng nhau, tô 1 phần → 1/3', tip: 'Các phần phải bằng nhau!', visual: { type: 'fraction', items: [{ n: 1, d: 3, label: '1/3' }] } }],
      poem: ['Một phần mấy, chia ra đều,', 'Lấy số chia số phần nhiều là xong!'],
      pitfalls: [{ wrong: '1/4 của 20 là 20 × 4 = 80', right: '20 : 4 = 5', why: 'Tìm một phần thì chia, không nhân.' }],
      examples: [{ q: 'Lớp có 32 bạn, 1/8 số bạn là đội viên đội văn nghệ. Đội văn nghệ có mấy bạn?', steps: ['32 : 8 = <b>4</b> (bạn).'] }],
      gens: [
        { level: 1, name: '1/n của một số', fn() { const n = R(2, 9), q = R(2, 10); return Q({ text: `${frac(1, n)} của ${n * q} là:`, answer: q, wrongs: [n * q * n, n * q - n, q + 1], hint: `Lấy ${n * q} chia cho ${n}.`, steps: [`${n * q} : ${n} = <b>${q}</b>.`] }); } },
        { level: 1, name: 'Hình đã tô', fn() { const n = R(2, 8); return Q({ text: 'Đã tô màu vào một phần mấy hình?', visual: { type: 'fraction', items: [{ n: 1, d: n, label: ' ' }], shape: pick(['circle', 'bar']) }, answer: `1/${n}`, options: [`1/${n}`, `1/${n + 1}`, `${n}/1`, `1/${n - 1 || 3}`].filter((x, i, a) => a.indexOf(x) === i), hint: 'Đếm số phần bằng nhau.', steps: [`Hình chia ${n} phần bằng nhau, tô 1 phần → <b>${frac(1, n)}</b>.`] }); } },
        { level: 2, name: 'Lời văn một phần', fn() { const n = R(2, 9), q = R(3, 9); return Q({ text: `Mẹ có ${n * q} quả táo, mẹ biếu bà ${frac(1, n)} số táo. Mẹ đã biếu bà bao nhiêu quả?`, answer: q, unit: 'quả', hint: `Tìm ${frac(1, n)} của ${n * q}.`, steps: [`${n * q} : ${n} = <b>${q}</b> (quả).`], solVisual: { type: 'bar', rows: [{ label: n * q + ' quả', segs: Array.from({ length: n }, (_, i) => ({ v: q, inner: i ? '' : '?', dashed: !!i })) }] } }); } },
        { level: 3, name: 'Còn lại bao nhiêu', fn() { const n = R(2, 6), q = R(3, 9); return Q({ text: `Cửa hàng có ${n * q} m vải, đã bán ${frac(1, n)} số vải. Cửa hàng còn lại bao nhiêu mét vải?`, answer: n * q - q, wrongs: [q, n * q, n * q - n], unit: 'm', hint: 'Tìm số đã bán trước, rồi lấy tổng trừ đi.', steps: [`Đã bán: ${n * q} : ${n} = ${q} (m).`, `Còn lại: ${n * q} − ${q} = <b>${n * q - q}</b> (m).`] }); } },
        { level: 3, name: 'Biết một phần tìm cả', fn() { const n = R(2, 9), q = R(3, 12); return Q({ text: `${frac(1, n)} số học sinh của lớp là ${q} bạn. Lớp có bao nhiêu học sinh?`, answer: n * q, wrongs: [q + n, q, n * q + q], unit: 'học sinh', hint: `Cả lớp gồm ${n} phần như thế.`, steps: [`${q} × ${n} = <b>${n * q}</b> (học sinh).`] }); } }
      ]
    },
    {
      id: 'g3_geo', icon: '📐', title: 'Hình học: góc vuông, trung điểm, hình tròn, khối', tagline: 'Góc vuông · Trung điểm · Tâm, bán kính, đường kính · Khối lập phương', prereqs: ['g2_geometry'],
      summary: 'Nhận biết góc vuông bằng ê-ke, trung điểm của đoạn thẳng, hình tròn (tâm, bán kính, đường kính), khối lập phương và khối hộp chữ nhật.',
      rules: [
        { title: 'Hình tròn', desc: 'Đường kính dài gấp 2 lần bán kính.', formula: 'Đường kính = Bán kính × 2', example: 'Bán kính 3 cm → đường kính 6 cm', tip: 'Dùng com-pa để vẽ hình tròn.', visual: { type: 'shape', kind: 'circle', labels: { r: 'bán kính' } } },
        { title: 'Trung điểm', desc: 'M là trung điểm của AB nếu M nằm giữa A, B và AM = MB.', example: 'AB = 8 cm → AM = 4 cm', tip: 'Gấp đôi đoạn thẳng để tìm trung điểm.' },
        { title: 'Khối lập phương', desc: 'Có 6 mặt là các hình vuông bằng nhau, 12 cạnh, 8 đỉnh.', example: 'Con xúc xắc có dạng khối lập phương.', tip: 'Khối hộp chữ nhật cũng có 6 mặt, 12 cạnh, 8 đỉnh.', visual: { type: 'cuboid', cube: true } }
      ],
      poem: ['Bán kính gấp đôi lên,', 'Đường kính hiện đến, nhớ bền nghe con!'],
      pitfalls: [{ wrong: 'Đường kính 10 cm → bán kính 20 cm', right: 'Bán kính = 10 : 2 = 5 cm', why: 'Bán kính là một nửa đường kính.' }],
      examples: [{ q: 'Khối lập phương có bao nhiêu mặt, cạnh, đỉnh?', steps: ['6 mặt, 12 cạnh, 8 đỉnh.'], visual: { type: 'cuboid', cube: true } }],
      gens: [
        { level: 1, name: 'Bán kính – đường kính', fn() { const r = R(2, 20); const q = R(0, 1); return Q({ text: q ? `Hình tròn tâm O có bán kính ${r} cm. Đường kính AB là:` : `Hình tròn tâm O có đường kính AB = ${2 * r} cm. Bán kính là:`, answer: q ? 2 * r : r, wrongs: q ? [r, r + 2, 4 * r] : [2 * r, 4 * r, r + 2], unit: 'cm', hint: 'Đường kính = bán kính × 2.', steps: [q ? `${r} × 2 = <b>${2 * r}</b> (cm).` : `${2 * r} : 2 = <b>${r}</b> (cm).`], visual: { type: 'shape', kind: 'circle', rLabel: q ? r + ' cm' : '?', dLabel: q ? '?' : 2 * r + ' cm' } }); } },
        { level: 1, name: 'Mặt, cạnh, đỉnh', fn() { const k = pick([['mặt', 6], ['cạnh', 12], ['đỉnh', 8]]); const s = pick(['khối lập phương', 'khối hộp chữ nhật']); return Q({ text: `Một ${s} có bao nhiêu ${k[0]}?`, visual: { type: 'cuboid', cube: s === 'khối lập phương' }, answer: k[1], wrongs: [6, 8, 12, 4].filter(x => x !== k[1]), hint: 'Đếm trên hình, kể cả các cạnh khuất (nét đứt).', steps: [`${s} có <b>${k[1]}</b> ${k[0]}.`] }); } },
        { level: 2, name: 'Trung điểm', fn() { const a = R(2, 15); return Q({ text: `M là trung điểm của đoạn thẳng AB (như hình). Biết AM = ${a} cm. Độ dài AB là:`, answer: 2 * a, wrongs: [a, a + 2, 3 * a], unit: 'cm', hint: 'AB = AM + MB và AM = MB.', steps: [`AB = ${a} × 2 = <b>${2 * a}</b> (cm).`], visual: MA.Vis.G.onLine([{ n: 'A', x: 0 }, { n: 'M', x: a }, { n: 'B', x: 2 * a }], { dims: [{ a: 'A', b: 'M', t: a + ' cm', row: 1 }, { a: 'A', b: 'B', t: '?', row: 2 }], ticks: [{ a: 'A', b: 'M' }, { a: 'M', b: 'B' }], dotCol: { M: '#e5534b' } }) }); } },
        { level: 2, name: 'Chu vi tam giác, tứ giác', fn() { const n = pick([3, 4]); const s = Array.from({ length: n }, () => R(3, 20)); const G = MA.Vis.G; let visual; if (Math.max(...s) > 3 * Math.min(...s)) return this.fn();
      if (n === 3) { const [a, b, c] = s; if (a + b <= c || a + c <= b || b + c <= a) return this.fn(); visual = G.triSSS(a, b, c, { noNames: true }); }
      else { visual = G.quad(s[0], s[1], s[2], s[3], { noNames: true }); if (!visual) return this.fn(); }
      return Q({ text: `Hình ${n === 3 ? 'tam giác' : 'tứ giác'} dưới đây có các cạnh ${s.join(' cm, ')} cm. Chu vi là:`, visual, answer: s.reduce((a, b) => a + b, 0), unit: 'cm', hint: 'Chu vi = tổng độ dài các cạnh.', steps: [`${s.join(' + ')} = <b>${s.reduce((a, b) => a + b, 0)}</b> (cm).`] }); } },
        { level: 3, name: 'Góc vuông của hình', fn() { const G = MA.Vis.G; const T = pick([['hình vuông', 4, G.square(1, { label: '', marks: false })], ['hình chữ nhật', 4, G.rect(1.7, 1, { marks: false })], ['hình tam giác vuông', 1, G.rightTri(1, 1.5, { noMark: true, noNames: true, labels: { AB: '', AC: '' } })], ['hình tròn', 0, { type: 'geo', P: { O: [0, 0] }, circles: [{ c: 'O', r: 1 }], show: [], maxW: 120, maxH: 120 }], ['hình tam giác đều', 0, { type: 'shape', kind: 'eqtri' }], ['tờ giấy A4', 4, G.rect(1, 1.41, { marks: false, maxH: 150 })], ['mặt bàn hình chữ nhật', 4, G.rect(2, 1.1, { marks: false })], ['viên gạch lát nền hình vuông', 4, G.square(1, { label: '', marks: false })]]); return Q({ text: `Hình dưới đây là ${T[0]}. Hình đó có bao nhiêu góc vuông?`, visual: T[2], answer: T[1], wrongs: [0, 1, 2, 3, 4].filter(x => x !== T[1]), hint: 'Dùng ê-ke kiểm tra từng góc.', steps: [`${T[0][0].toUpperCase() + T[0].slice(1)} có <b>${T[1]}</b> góc vuông.`] }); } },
        { level: 3, name: 'Hình tròn trong hình vuông', fn() { const r = R(2, 10); return Q({ text: `Một hình tròn bán kính ${r} cm nằm vừa khít trong một hình vuông (như hình vẽ). Chu vi hình vuông là:`, visual: { type: 'geo', P: { _A: [-1, -1], _B: [1, -1], _C: [1, 1], _D: [-1, 1], O: [0, 0], _R: [1, 0] }, polys: [{ p: ['_A', '_B', '_C', '_D'], fill: 'rgba(74,123,216,.08)' }], circles: [{ c: 'O', r: 1, fill: 'rgba(242,159,61,.18)', stroke: '#f29f3d' }], lines: [{ a: 'O', b: '_R', col: '#e5534b', w: 2, t: r + ' cm', side: 1 }], dots: ['O'], show: ['O'], lp: { O: 'sw' }, maxW: 150, maxH: 150 }, answer: 8 * r, wrongs: [4 * r, 2 * r, 16 * r], unit: 'cm', hint: 'Cạnh hình vuông bằng đường kính hình tròn.', steps: [`Cạnh = đường kính = ${r} × 2 = ${2 * r} (cm).`, `Chu vi = ${2 * r} × 4 = <b>${8 * r}</b> (cm).`] }); } }
      ]
    },
    {
      id: 'g3_logic', icon: '🧠', title: 'Toán tư duy & nâng cao lớp 3', tagline: 'Dãy số · Tính ngược · Tuổi gấp · Đếm hình · Suy luận', prereqs: ['g2_logic', 'g3_times'],
      summary: 'Các dạng toán phát triển tư duy thường gặp trong Toán tuổi thơ, Kangaroo, Violympic lớp 3.',
      rules: [
        { title: 'Tính ngược với nhân, chia', desc: 'Đi ngược từ kết quả: nhân đổi thành chia, chia đổi thành nhân, cộng ↔ trừ.', example: 'Một số nhân 3 rồi cộng 5 được 26 → (26 − 5) : 3 = 7', tip: 'Làm ngược theo đúng thứ tự từ cuối lên.', visual: { type: 'chain', items: ['?', '×3', 21, '+5', 26], back: [26, '−5', 21, ':3', 7] } },
        { title: 'Bài toán tuổi gấp', desc: 'Hiệu số tuổi không đổi theo thời gian.', example: 'Mẹ 32 tuổi, con 8 tuổi: mẹ gấp 4 lần tuổi con.', tip: 'Dùng sơ đồ đoạn thẳng.' }
      ],
      poem: ['Gặp bài khó, bình tĩnh nào,', 'Vẽ sơ đồ ra, thế nào cũng xong!'],
      pitfalls: [{ wrong: 'Tính ngược nhưng giữ nguyên phép tính', right: 'Phải đổi phép tính ngược lại', why: 'Ngược của × là :, ngược của + là −.' }],
      examples: [{ q: 'Một số chia cho 4 rồi trừ 3 được 6. Tìm số đó.', steps: ['6 + 3 = 9.', '9 × 4 = <b>36</b>.'] }],
      gens: [
        { level: 2, name: 'Dãy nhân', fn() { const k = R(2, 3), s = R(1, 4); const arr = [s, s * k, s * k * k, s * k ** 3]; return Q({ text: `Tìm số tiếp theo: <b>${arr.join(', ')}, …</b>`, answer: s * k ** 4, wrongs: [arr[3] + (arr[3] - arr[2]), s * k ** 4 + k, arr[3] * 2 === s * k ** 4 ? arr[3] * 3 : arr[3] * 2], hint: 'Mỗi số gấp số trước bao nhiêu lần?', steps: [`Mỗi số gấp ${k} lần số trước.`, `${arr[3]} × ${k} = <b>${s * k ** 4}</b>.`] }); } },
        { level: 3, name: 'Tính ngược × :', fn() { const x = R(3, 15), k = R(2, 9), a = R(2, 20); const r = x * k + a; return Q({ text: `Tìm một số, biết rằng lấy số đó nhân với ${k} rồi cộng ${a} thì được ${r}.`, answer: x, wrongs: [(r + a) / k === Math.floor((r + a) / k) ? (r + a) / k : x + 2, r - a, x + 1], hint: 'Đi ngược: trừ trước rồi chia.', steps: [`${r} − ${a} = ${r - a}.`, `${r - a} : ${k} = <b>${x}</b>.`], solVisual: { type: 'chain', items: ['?', '×' + k, r - a, '+' + a, r], back: [r, '−' + a, r - a, ':' + k, x] } }); } },
        { level: 3, name: 'Tuổi gấp', fn() { const c = R(4, 10), k = R(3, 5); const m = c * k; return Q({ text: `Năm nay con ${c} tuổi, tuổi mẹ gấp ${k} lần tuổi con. Hỏi mẹ hơn con bao nhiêu tuổi?`, answer: m - c, wrongs: [m, m + c, k], unit: 'tuổi', hint: 'Tìm tuổi mẹ trước.', steps: [`Mẹ: ${c} × ${k} = ${m} (tuổi).`, `Mẹ hơn con: ${m} − ${c} = <b>${m - c}</b> (tuổi).`] }); } },
        { level: 3, name: 'Đếm hình vuông', fn() {
          const sq = R(0, 1); const m = R(2, 4), n = sq ? m : R(m + 1, 5);
          const parts = []; let ans = 0; for (let k = 1; k <= Math.min(m, n); k++) { const c = (m - k + 1) * (n - k + 1); ans += c; parts.push(`${k}×${k}: ${c}`); }
          return Q({ text: sq ? `Hình vuông dưới đây được chia thành ${m} × ${m} ô vuông nhỏ bằng nhau. Trong hình có tất cả bao nhiêu hình vuông?` : `Hình chữ nhật dưới đây được chia thành ${m} hàng, ${n} cột ô vuông nhỏ bằng nhau. Trong hình có tất cả bao nhiêu hình vuông?`,
            visual: { type: 'grid', w: n, h: m, fill: 0, caption: `Lưới ${m} × ${n}` }, answer: ans, wrongs: [m * n, m * n + 1, ans + 2, ans - 1], unit: 'hình', hint: 'Đếm riêng hình vuông 1×1, 2×2, 3×3… rồi cộng lại.',
            steps: [parts.join('; ') + '.', `Tổng: <b>${ans}</b> hình vuông.`] });
        } },
        { level: 3, name: 'Số chân gà – chó', fn() { const g = R(2, 8), d = R(2, 8); return Q({ text: `Vừa gà vừa chó có ${g + d} con, đếm được ${2 * g + 4 * d} cái chân. Hỏi có bao nhiêu con chó?`, answer: d, wrongs: [g, d + 1, (2 * g + 4 * d) / 4 === Math.floor((2 * g + 4 * d) / 4) && (2 * g + 4 * d) / 4 !== d ? (2 * g + 4 * d) / 4 : d + 2], unit: 'con', hint: 'Giả sử tất cả đều là gà, rồi xem thừa bao nhiêu chân.', steps: [`Nếu tất cả là gà: ${g + d} × 2 = ${2 * (g + d)} chân.`, `Thừa ra: ${2 * g + 4 * d} − ${2 * (g + d)} = ${2 * d} chân; mỗi chó hơn gà 2 chân.`, `Số chó: ${2 * d} : 2 = <b>${d}</b> (con).`] }); } },
        { level: 3, name: 'Cưa gỗ', fn() { const n = R(3, 9), t = R(2, 6); return Q({ text: `Một khúc gỗ được cưa thành ${n} đoạn. Mỗi lần cưa mất ${t} phút. Hỏi cưa xong hết bao nhiêu phút?`, answer: (n - 1) * t, wrongs: [n * t, (n + 1) * t, n + t], unit: 'phút', hint: `Cưa thành ${n} đoạn chỉ cần ${n - 1} lần cưa.`, steps: [`Số lần cưa: ${n} − 1 = ${n - 1}.`, `Thời gian: ${n - 1} × ${t} = <b>${(n - 1) * t}</b> (phút).`] }); } }
      ]
    }
  ]);
  MA.Data.arrange(3, ['g3_num', 'g3_addsub', 'g3_table', 'g3_expr', 'g3_divrem', 'g3_times', 'g3_frac', 'g3_measure', 'g3_area', 'g3_geo', 'g3_logic'], 'Số đến 100 000 · Bảng nhân chia · Biểu thức · Nhân chia có dư · Gấp, giảm · Một phần mấy · Đo lường · Chu vi, diện tích · Hình học · Tư duy');
})(window.MA);
