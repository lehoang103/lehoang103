/* =========================================================
 * grade1.js — KIẾN THỨC & BỘ CÂU HỎI TOÁN LỚP 1 (Chương trình GDPT 2018)
 * 9 chủ đề · nhiều hình minh họa, câu ngắn, số nhỏ — phù hợp trẻ 6–7 tuổi
 * (Lớp 1 mặc định bật “Cô tự đọc đề”).
 * ========================================================= */
(function (MA) {
  'use strict';
  const { R, pick, Q, shuffle, readVi } = MA.U;

  const NAMES = ['Lan', 'Mai', 'Nam', 'Hà', 'An', 'Bình', 'Minh', 'Hoa', 'Tùng', 'Bi', 'Na', 'Tí'];
  const ITEMS = [
    { n: 'quả táo', u: 'quả', i: '🍎' }, { n: 'quả cam', u: 'quả', i: '🍊' }, { n: 'bông hoa', u: 'bông', i: '🌸' },
    { n: 'con cá', u: 'con', i: '🐟' }, { n: 'cái kẹo', u: 'cái', i: '🍬' }, { n: 'con gà', u: 'con', i: '🐥' },
    { n: 'quả bóng', u: 'quả', i: '⚽' }, { n: 'ngôi sao', u: 'ngôi', i: '⭐' }, { n: 'chiếc lá', u: 'chiếc', i: '🍀' }
  ];
  const cmp = (a, b) => a > b ? '>' : a < b ? '<' : '=';
  const SIGNS = ['>', '<', '='];
  const SHAPES = [
    { k: 'square', n: 'Hình vuông' }, { k: 'circle', n: 'Hình tròn' }, { k: 'tri', n: 'Hình tam giác' }, { k: 'rect', n: 'Hình chữ nhật' }
  ];
  const DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];

  const topics = [];

  // 1. CÁC SỐ TỪ 0 ĐẾN 10 ===============================================
  topics.push({
    id: 'g1_10', icon: '🔟', title: 'Các số từ 0 đến 10',
    tagline: 'Đếm · Đọc, viết số · So sánh · Nhiều hơn, ít hơn',
    summary: 'Đếm số đồ vật, đọc và viết các số từ 0 đến 10. So sánh hai số bằng dấu >, <, =.',
    prereqs: [],
    rules: [
      { title: 'Đếm đồ vật', desc: 'Chỉ tay vào từng đồ vật và đếm: một, hai, ba… Đồ vật cuối cùng đếm được ứng với số lượng.', example: '🍎🍎🍎 → có 3 quả táo.', tip: 'Đếm xong đồ vật nào thì đánh dấu để không đếm lại.', visual: { type: 'objects', groups: [{ icon: '🍎', count: 3, label: '3' }] } },
      { title: 'So sánh hai số', desc: 'Số đứng sau khi đếm thì lớn hơn. Dấu > đọc là “lớn hơn”, dấu < đọc là “bé hơn”, dấu = đọc là “bằng”.', example: '5 > 3 · 2 < 7 · 4 = 4', tip: 'Đầu nhọn của dấu > hoặc < luôn chỉ vào số bé hơn.' }
    ],
    poem: ['Một, hai, ba, bốn, năm,', 'Đếm xong nhớ chỉ từng phần;', 'Dấu nhọn quay về số bé,', 'Miệng to há về số gần lớn hơn!'],
    pitfalls: [
      { wrong: 'Đếm một đồ vật hai lần', right: 'Chỉ tay và đếm lần lượt từng đồ vật', why: 'Đánh dấu đồ vật đã đếm để không bị đếm lặp.' },
      { wrong: '3 > 5', right: '3 < 5', why: 'Khi đếm, số 3 đứng trước số 5 nên 3 bé hơn 5.' }
    ],
    examples: [
      { q: 'Có mấy con cá? 🐟🐟🐟🐟', steps: ['Đếm: một, hai, ba, bốn.', 'Có <b>4</b> con cá.'], visual: { type: 'objects', groups: [{ icon: '🐟', count: 4 }] } }
    ],
    gens: [
      { level: 1, name: 'Đếm đồ vật', fn() { const it = pick(ITEMS), n = R(1, 10); return Q({ text: `Có bao nhiêu ${it.n}?`, visual: { type: 'objects', groups: [{ icon: it.i, count: n }] }, answer: n, unit: it.u, hint: 'Chỉ tay và đếm lần lượt từng cái.', steps: [`Đếm: ${Array.from({ length: n }, (_, i) => readVi(i + 1)).join(', ')}.`, `Có <b>${n}</b> ${it.u}.`] }); } },
      { level: 1, name: 'So sánh số', fn() { const a = R(0, 10), b = R(0, 10); return Q({ text: `Chọn dấu thích hợp: <b>${a} ... ${b}</b>`, answer: cmp(a, b), options: SIGNS, shuffle: false, hint: 'Khi đếm, số nào đứng sau thì lớn hơn.', steps: [`${a} ${cmp(a, b)} ${b}.`], visual: { type: 'numberline', min: 0, max: 10, highlight: [a, b] } }); } },
      { level: 1, name: 'Đọc số', fn() { const n = R(0, 10); return Q({ text: `Số “<b>${readVi(n)}</b>” viết là:`, answer: n, options: shuffle([n, (n + 1) % 11, (n + 2) % 11, (n + 9) % 11]), hint: 'Đọc lại từng số từ 0 đến 10.', steps: [`“${readVi(n)}” viết là <b>${n}</b>.`] }); } },
      { level: 2, name: 'Nhiều hơn – ít hơn', fn() { const a = pick(ITEMS); let b = pick(ITEMS); while (b === a) b = pick(ITEMS); const x = R(2, 9), y = R(1, 9); if (x === y) return this.fn(); const more = R(0, 1); const ans = more ? (x > y ? a.n : b.n) : (x < y ? a.n : b.n); return Q({ text: `Loại nào <b>${more ? 'nhiều hơn' : 'ít hơn'}</b>?`, visual: { type: 'objects', groups: [{ icon: a.i, count: x, label: a.n }, { icon: b.i, count: y, label: b.n }] }, answer: ans, options: [a.n, b.n], shuffle: false, hint: 'Đếm từng loại rồi so sánh hai số.', steps: [`${a.n}: ${x}; ${b.n}: ${y}.`, `${x} ${cmp(x, y)} ${y} nên <b>${ans}</b> ${more ? 'nhiều hơn' : 'ít hơn'}.`] }); } },
      { level: 2, name: 'Số liền trước – liền sau', fn() { const n = R(1, 9), after = R(0, 1); const ans = after ? n + 1 : n - 1; return Q({ text: `Số liền ${after ? 'sau' : 'trước'} của <b>${n}</b> là số nào?`, answer: ans, visual: { type: 'numberline', min: 0, max: 10, highlight: [n], hide: [ans] }, hint: after ? 'Số liền sau thì đếm thêm 1.' : 'Số liền trước thì bớt đi 1.', steps: [`${n} ${after ? '+' : '−'} 1 = <b>${ans}</b>.`] }); } },
      { level: 3, name: 'Số lớn nhất – bé nhất', fn() { const arr = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 4); const big = R(0, 1); const ans = big ? Math.max(...arr) : Math.min(...arr); return Q({ text: `Trong các số <b>${arr.join(', ')}</b>, số ${big ? 'lớn nhất' : 'bé nhất'} là số nào?`, answer: ans, options: arr, keepMc: true, hint: 'Nghĩ xem số nào đứng sau cùng (hoặc đầu tiên) khi đếm.', steps: [`Xếp từ bé đến lớn: ${arr.slice().sort((x, y) => x - y).join(', ')}.`, `Số ${big ? 'lớn nhất' : 'bé nhất'} là <b>${ans}</b>.`] }); } },
      { level: 3, name: 'Tách số', fn() { const n = R(3, 10), a = R(1, n - 1); return Q({ text: `${n} gồm ${a} và mấy?`, answer: n - a, visual: { type: 'objects', groups: [{ icon: '🔵', count: a }, { icon: '🟠', count: n - a }] }, hint: `Đếm thêm từ ${a} đến ${n}.`, steps: [`${a} + ${n - a} = ${n}.`, `Vậy ${n} gồm ${a} và <b>${n - a}</b>.`] }); } }
    ]
  });

  // 2. CỘNG, TRỪ TRONG PHẠM VI 10 ======================================
  topics.push({
    id: 'g1_addsub10', icon: '➕', title: 'Phép cộng, phép trừ trong phạm vi 10',
    tagline: 'Thêm vào là cộng · Bớt đi là trừ',
    summary: 'Gộp hai nhóm hoặc thêm vào thì làm phép cộng. Bớt đi, cho đi thì làm phép trừ.',
    prereqs: ['g1_10'],
    rules: [
      { title: 'Phép cộng', desc: 'Có 3 quả, thêm 2 quả: 3 + 2 = 5.', formula: '3 + 2 = 5', example: '🍎🍎🍎 + 🍎🍎 = 5 quả', tip: 'Đổi chỗ hai số trong phép cộng, kết quả không đổi: 3 + 2 = 2 + 3.', visual: { type: 'objects', groups: [{ icon: '🍎', count: 3 }, { icon: '🍎', count: 2 }], op: '+' } },
      { title: 'Phép trừ', desc: 'Có 5 quả, ăn hết 2 quả: 5 − 2 = 3.', formula: '5 − 2 = 3', tip: 'Số nào trừ đi 0 cũng bằng chính nó. Số nào trừ đi chính nó thì bằng 0.' }
    ],
    poem: ['Thêm vào thì ta cộng,', 'Bớt đi thì ta trừ,', 'Đếm thêm, đếm bớt từ từ,', 'Ngón tay giúp sức, chẳng chừ chẳng sai!'],
    pitfalls: [{ wrong: '5 − 2 = 7', right: '5 − 2 = 3', why: 'Dấu − là bớt đi, kết quả phải nhỏ hơn 5.' }],
    examples: [{ q: 'Trên cành có 4 con chim, bay đến 3 con. Có tất cả mấy con?', steps: ['Bay đến là thêm vào → phép cộng.', '4 + 3 = <b>7</b> (con chim).'] }],
    gens: [
      { level: 1, name: 'Cộng trong phạm vi 10', fn() { const a = R(0, 9), b = R(0, 10 - a); return Q({ text: `<b>${a} + ${b} = ?</b>`, answer: a + b, visual: a + b ? { type: 'objects', groups: [{ icon: '🔴', count: a }, { icon: '🔵', count: b }], op: '+' } : null, hint: `Đếm thêm ${b} từ ${a}.`, steps: [`${a} + ${b} = <b>${a + b}</b>.`] }); } },
      { level: 1, name: 'Trừ trong phạm vi 10', fn() { const a = R(1, 10), b = R(0, a); return Q({ text: `<b>${a} − ${b} = ?</b>`, answer: a - b, hint: `Đếm lùi ${b} bước từ ${a}.`, steps: [`${a} − ${b} = <b>${a - b}</b>.`], solVisual: { type: 'numberline', min: 0, max: 10, jumps: b ? [{ from: a, to: a - b, label: '−' + b }] : [], highlight: [a - b] } }); } },
      { level: 2, name: 'Điền số còn thiếu', fn() { const s = R(3, 10), a = R(1, s - 1); const plus = R(0, 1); return plus ? Q({ text: `<b>${a} + ? = ${s}</b>`, answer: s - a, hint: `Đếm thêm từ ${a} đến ${s}.`, steps: [`${s} − ${a} = ${s - a}.`, `Vậy ${a} + <b>${s - a}</b> = ${s}.`] }) : Q({ text: `<b>${s} − ? = ${a}</b>`, answer: s - a, hint: `Đếm lùi từ ${s} về ${a}.`, steps: [`${s} − ${a} = ${s - a}.`, `Vậy ${s} − <b>${s - a}</b> = ${a}.`] }); } },
      { level: 2, name: 'So sánh phép tính', fn() { const a = R(0, 5), b = R(0, 5), c = R(1, 10); const v = a + b; return Q({ text: `Chọn dấu: <b>${a} + ${b} ... ${c}</b>`, answer: cmp(v, c), options: SIGNS, shuffle: false, hint: 'Tính phép cộng trước rồi so sánh.', steps: [`${a} + ${b} = ${v}.`, `${v} ${cmp(v, c)} ${c}.`] }); } },
      { level: 3, name: 'Tính liên tiếp', fn() { const a = R(1, 6), b = R(1, 10 - a), c = R(0, a + b); return Q({ text: `<b>${a} + ${b} − ${c} = ?</b>`, answer: a + b - c, hint: 'Tính lần lượt từ trái sang phải.', steps: [`${a} + ${b} = ${a + b}.`, `${a + b} − ${c} = <b>${a + b - c}</b>.`] }); } }
    ]
  });

  // 3. HÌNH PHẲNG & KHỐI =================================================
  topics.push({
    id: 'g1_shapes', icon: '🔷', title: 'Hình vuông, hình tròn, hình tam giác, hình chữ nhật',
    tagline: 'Nhận dạng hình · Đếm hình · Khối lập phương, khối hộp',
    summary: 'Nhận biết hình vuông, hình tròn, hình tam giác, hình chữ nhật; khối lập phương và khối hộp chữ nhật.',
    prereqs: ['g1_10'],
    rules: [
      { title: 'Nhận dạng hình', desc: 'Hình tam giác có 3 cạnh. Hình vuông có 4 cạnh dài bằng nhau. Hình chữ nhật có 4 cạnh, hai cạnh dài và hai cạnh ngắn. Hình tròn không có cạnh.', visual: [{ type: 'shape', kind: 'tri', title: 'Tam giác' }, { type: 'shape', kind: 'square', title: 'Vuông' }] },
      { title: 'Khối hình', desc: 'Con xúc xắc có dạng khối lập phương. Hộp bánh có dạng khối hộp chữ nhật.' }
    ],
    poem: ['Tam giác ba cạnh xinh xinh,', 'Hình vuông bốn cạnh bằng nhau rập rình,', 'Chữ nhật hai dài hai ngắn,', 'Hình tròn tròn trịa như vầng trăng rằm!'],
    pitfalls: [{ wrong: 'Hình chữ nhật là hình vuông', right: 'Hình vuông có 4 cạnh bằng nhau; hình chữ nhật có cạnh dài, cạnh ngắn', why: 'So sánh độ dài các cạnh.' }],
    examples: [{ q: 'Mặt đồng hồ treo tường có dạng hình gì?', steps: ['Mặt đồng hồ tròn.', 'Đáp án: <b>hình tròn</b>.'] }],
    gens: [
      { level: 1, name: 'Gọi tên hình', fn() { const s = pick(SHAPES); return Q({ text: 'Đây là hình gì?', visual: { type: 'shape', kind: s.k }, answer: s.n, options: SHAPES.map(x => x.n), hint: 'Đếm số cạnh của hình.', steps: [`Đây là <b>${s.n.toLowerCase()}</b>.`] }); } },
      { level: 1, name: 'Đồ vật có dạng hình gì', fn() { const T = pick([['Mặt chiếc đồng hồ treo tường', 'Hình tròn'], ['Viên gạch hoa vuông', 'Hình vuông'], ['Quyển sách', 'Hình chữ nhật'], ['Lá cờ đuôi nheo', 'Hình tam giác'], ['Bánh xe đạp', 'Hình tròn'], ['Bảng lớp học', 'Hình chữ nhật'], ['Miếng bánh chưng', 'Hình vuông'], ['Biển báo “Đường giao nhau”', 'Hình tam giác']]); return Q({ text: `${T[0]} có dạng hình gì?`, answer: T[1], options: SHAPES.map(x => x.n), hint: 'Hãy tưởng tượng nhìn thẳng vào đồ vật.', steps: [`<b>${T[1]}</b>.`] }); } },
      { level: 2, name: 'Số cạnh của hình', fn() {
        const SH = [['hình tam giác', 3, 'tri'], ['hình vuông', 4, 'square'], ['hình chữ nhật', 4, 'rect']];
        const T = pick(SH); const cap = (s) => s[0].toUpperCase() + s.slice(1); const kind = R(1, 4);
        if (kind === 1) return Q({ text: `${cap(T[0])} có mấy cạnh?`, visual: { type: 'shape', kind: T[2] }, answer: T[1], options: [2, 3, 4, 5], shuffle: false, keepMc: true, hint: 'Đếm các đoạn thẳng bao quanh hình.', steps: [`${cap(T[0])} có <b>${T[1]}</b> cạnh.`] });
        if (kind === 2) return Q({ text: `${cap(T[0])} có mấy đỉnh (góc)?`, visual: { type: 'shape', kind: T[2] }, answer: T[1], options: [2, 3, 4, 5], shuffle: false, keepMc: true, hint: 'Đỉnh là chỗ hai cạnh gặp nhau. Chỉ tay vào từng góc và đếm.', steps: [`${cap(T[0])} có ${T[1]} cạnh và cũng có <b>${T[1]}</b> đỉnh.`] });
        if (kind === 3) { const k = T[1] === 3 ? R(2, 3) : 2; const ans = k * T[1]; return Q({ text: `Hình dưới đây có ${k} ${T[0]}. Đếm tất cả các cạnh thì được bao nhiêu cạnh?`, visual: { type: 'shapes', items: Array(k).fill(0).map((_, i) => ({ k: T[2], c: ['#4a7bd8', '#f29f3d', '#2fa36b'][i] })), size: 60, gap: 22 }, answer: ans, wrongs: [ans - 1, ans + 1, T[1] + k], keepMc: true, hint: `Mỗi ${T[0]} có ${T[1]} cạnh. Đếm thêm cho từng hình.`, steps: [`${Array(k).fill(T[1]).join(' + ')} = <b>${ans}</b> cạnh.`] }); }
        const A = pick(SH); let B = pick(SH); while (B[1] === A[1]) B = pick(SH); const ans = A[1] + B[1];
        return Q({ text: `Hình dưới đây có một ${A[0]} và một ${B[0]}. Cả hai hình có tất cả bao nhiêu cạnh?`, visual: { type: 'shapes', items: [{ k: A[2], c: '#4a7bd8' }, { k: B[2], c: '#f29f3d' }], size: 60, gap: 26 }, answer: ans, wrongs: [ans - 1, ans + 1, 6], keepMc: true, hint: `${cap(A[0])} có ${A[1]} cạnh, ${B[0]} có ${B[1]} cạnh.`, steps: [`${A[1]} + ${B[1]} = <b>${ans}</b> cạnh.`] });
      } },
      { level: 2, name: 'Khối hình', fn() { const T = pick([['Con xúc xắc', 'Khối lập phương', '🎲'], ['Hộp sữa', 'Khối hộp chữ nhật', '🧃'], ['Khối rubik', 'Khối lập phương', ''], ['Viên gạch xây nhà', 'Khối hộp chữ nhật', '🧱'], ['Hộp bút', 'Khối hộp chữ nhật', '']]); return Q({ text: `${T[0]} có dạng khối gì?`, visual: { type: 'solids', object: T[2] || null, objectLabel: T[2] ? T[0] : '', items: [{ k: 'cube', label: 'Khối lập phương' }, { k: 'cuboid', label: 'Khối hộp chữ nhật' }] }, answer: T[1], options: ['Khối lập phương', 'Khối hộp chữ nhật'], shuffle: false, hint: 'Khối lập phương có các mặt đều là hình vuông. Khối hộp chữ nhật có mặt là hình chữ nhật.', steps: [`<b>${T[1]}</b>.`] }); } },
      { level: 3, name: 'Đếm hình', fn() { const E = [['square', 'hình vuông'], ['circle', 'hình tròn'], ['tri', 'hình tam giác']]; const s = pick(E); let o = pick(E); while (o === s) o = pick(E); const n = R(2, 7), m = R(2, 6); const COL = ['#4a7bd8', '#f29f3d', '#2fa36b', '#e35d9b', '#8e6cd8']; const items = shuffle(Array(n).fill(s[0]).concat(Array(m).fill(o[0]))).map(k => ({ k, z: pick([0.78, 0.9, 1]), c: pick(COL) })); return Q({ text: `Hình dưới đây có bao nhiêu <b>${s[1]}</b>?`, visual: { type: 'shapes', items, size: 40, perRow: 7 }, answer: n, hint: `Chỉ đếm ${s[1]}, bỏ qua ${o[1]}. Đếm từ trái sang phải để không sót.`, steps: [`Đếm được <b>${n}</b> ${s[1]}.`] }); } }
    ]
  });

  // 4. VỊ TRÍ, ĐỊNH HƯỚNG ================================================
  topics.push({
    id: 'g1_position', icon: '🧭', title: 'Vị trí: trên – dưới, trái – phải, trước – sau',
    tagline: 'Ở giữa · Bên trái · Bên phải · Thứ tự',
    summary: 'Xác định vị trí của đồ vật: bên trái, bên phải, ở giữa; đứng thứ mấy trong hàng.',
    prereqs: ['g1_10'],
    rules: [{ title: 'Bên trái – bên phải', desc: 'Tay cầm bút là tay phải (với đa số bạn). Đồ vật ở phía tay trái là bên trái.', example: '🍎🍊🍌: quả cam ở giữa, quả táo ở bên trái quả cam.', tip: 'Đọc hàng đồ vật từ trái sang phải như đọc chữ.' }],
    poem: ['Tay phải cầm bút viết bài,', 'Bên kia tay trái chẳng sai chút nào!'],
    pitfalls: [{ wrong: 'Đếm thứ tự từ bên phải', right: 'Đếm từ trái sang phải (trừ khi đề nói khác)', why: 'Ta đọc và đếm theo chiều từ trái sang phải.' }],
    examples: [{ q: '🐶🐱🐰: con gì ở giữa?', steps: ['Có 3 con, con đứng thứ hai là con mèo.', 'Đáp án: <b>con mèo</b>.'] }],
    gens: [
      { level: 1, name: 'Ở giữa', fn() { const A = shuffle([['🐶', 'con chó'], ['🐱', 'con mèo'], ['🐰', 'con thỏ'], ['🐸', 'con ếch'], ['🐵', 'con khỉ']]).slice(0, 3); return Q({ text: `${A.map(x => x[0]).join(' ')}<br>Con vật nào đứng <b>ở giữa</b>?`, answer: A[1][1], options: A.map(x => x[1]), hint: 'Ở giữa là đứng giữa hai bạn còn lại.', steps: [`Con đứng giữa là <b>${A[1][1]}</b>.`] }); } },
      { level: 2, name: 'Bên trái – bên phải', fn() { const A = shuffle([['🍎', 'quả táo'], ['🍊', 'quả cam'], ['🍌', 'quả chuối'], ['🍇', 'chùm nho'], ['🍉', 'quả dưa hấu']]).slice(0, 4); const i = R(1, 2), left = R(0, 1); const ans = left ? A[i - 1][1] : A[i + 1][1]; return Q({ text: `${A.map(x => x[0]).join(' ')}<br>Quả nào ở ngay <b>bên ${left ? 'trái' : 'phải'}</b> ${A[i][1]}?`, answer: ans, options: A.filter((x, k) => k !== i).map(x => x[1]), hint: 'Đọc hàng hình từ trái sang phải.', steps: [`Bên ${left ? 'trái' : 'phải'} ${A[i][1]} là <b>${ans}</b>.`] }); } },
      { level: 3, name: 'Đứng thứ mấy', fn() { const n = R(5, 9), k = R(2, n - 1); const it = pick(['🚗', '🐤', '⛵', '🎈']); const row = Array.from({ length: n }, (_, i) => i === k - 1 ? '⭐' : it).join(' '); return Q({ text: `${row}<br>Đếm từ trái sang, ngôi sao ⭐ đứng thứ mấy?`, answer: k, hint: 'Chỉ tay đếm từ bên trái: thứ nhất, thứ hai, …', steps: [`Ngôi sao đứng thứ <b>${k}</b>.`] }); } }
    ]
  });

  // 5. CÁC SỐ ĐẾN 100 ====================================================
  topics.push({
    id: 'g1_100', icon: '💯', title: 'Các số đến 100',
    tagline: 'Chục và đơn vị · Đọc, viết · So sánh',
    summary: '10 đơn vị = 1 chục. Số có hai chữ số gồm chục và đơn vị, ví dụ 35 gồm 3 chục và 5 đơn vị.',
    prereqs: ['g1_10'],
    rules: [
      { title: 'Chục và đơn vị', desc: 'Mỗi bó 10 que tính là 1 chục. Số 35 gồm 3 chục và 5 đơn vị.', formula: '35 = 30 + 5', visual: { type: 'blocks', n: 35 } },
      { title: 'So sánh số có hai chữ số', desc: 'So sánh hàng chục trước. Hàng chục bằng nhau thì so sánh hàng đơn vị.', example: '47 < 52 vì 4 chục < 5 chục; 63 > 61 vì 3 > 1.' }
    ],
    poem: ['Mười que bó lại một bó,', 'Một chục ghi nhớ, chẳng lo quên bài!'],
    pitfalls: [{ wrong: '“Năm mươi tư” viết là 504', right: 'Viết là 54', why: 'Số có hai chữ số chỉ có chữ số hàng chục và hàng đơn vị.' }],
    examples: [{ q: 'Số gồm 7 chục và 2 đơn vị là số nào?', steps: ['7 chục = 70.', '70 + 2 = <b>72</b>.'], visual: { type: 'blocks', n: 72 } }],
    gens: [
      { level: 1, name: 'Chục và đơn vị', fn() { const t = R(1, 9), u = R(0, 9); return Q({ text: `Số gồm <b>${t} chục và ${u} đơn vị</b> là:`, answer: t * 10 + u, wrongs: [u * 10 + t, t + u, t * 100 + u], hint: 'Viết chữ số hàng chục trước, rồi đến hàng đơn vị.', steps: [`${t} chục = ${t * 10}.`, `${t * 10} + ${u} = <b>${t * 10 + u}</b>.`], solVisual: { type: 'blocks', n: t * 10 + u } }); } },
      { level: 1, name: 'Đếm que tính', fn() { const n = R(11, 59); return Q({ text: 'Có tất cả bao nhiêu que tính? (mỗi bó có 10 que)', visual: { type: 'objects', groups: [{ icon: '🟧', count: Math.floor(n / 10), label: 'bó 10 que' }, { icon: '🟨', count: n % 10, label: 'que rời' }] }, answer: n, hint: 'Đếm số bó (chục) rồi đếm que rời (đơn vị).', steps: [`${Math.floor(n / 10)} bó = ${Math.floor(n / 10) * 10} que; thêm ${n % 10} que rời.`, `Có <b>${n}</b> que tính.`] }); } },
      { level: 2, name: 'So sánh số có hai chữ số', fn() { const a = R(10, 99); const b = pick([a + R(1, 9), a - R(1, 9), (a % 10) * 10 + Math.floor(a / 10), a]); if (b < 10 || b > 99) return this.fn(); return Q({ text: `Chọn dấu: <b>${a} ... ${b}</b>`, answer: cmp(a, b), options: SIGNS, shuffle: false, hint: 'So sánh hàng chục trước.', steps: [`${a} ${cmp(a, b)} ${b}.`] }); } },
      { level: 2, name: 'Đọc – viết số', fn() { const n = R(10, 99); return Q({ text: `Số “<b>${readVi(n)}</b>” viết là:`, answer: n, wrongs: [(n % 10) * 10 + Math.floor(n / 10), Math.floor(n / 10) * 100 + n % 10, n + 10], hint: 'Xác định chữ số hàng chục và hàng đơn vị.', steps: [`Viết là <b>${n}</b>.`] }); } },
      { level: 3, name: 'Số tròn chục', fn() { const n = R(11, 89); if (n % 10 === 0) return this.fn(); const up = R(0, 1); const ans = up ? Math.ceil(n / 10) * 10 : Math.floor(n / 10) * 10; return Q({ text: `Số tròn chục ${up ? 'liền sau' : 'liền trước'} số <b>${n}</b> là:`, answer: ans, hint: 'Số tròn chục có chữ số hàng đơn vị là 0: 10, 20, 30, …', steps: [`Các số tròn chục gần ${n}: ${Math.floor(n / 10) * 10} và ${Math.ceil(n / 10) * 10}.`, `Đáp án: <b>${ans}</b>.`] }); } }
    ]
  });

  // 6. CỘNG, TRỪ (KHÔNG NHỚ) TRONG PHẠM VI 100 ==========================
  topics.push({
    id: 'g1_addsub100', icon: '🧮', title: 'Cộng, trừ không nhớ trong phạm vi 100',
    tagline: 'Đặt tính · Cộng, trừ số tròn chục · Tính nhẩm',
    summary: 'Đặt tính thẳng cột: đơn vị thẳng đơn vị, chục thẳng chục. Tính từ phải sang trái.',
    prereqs: ['g1_addsub10', 'g1_100'],
    rules: [
      { title: 'Đặt tính rồi tính', desc: 'Viết các chữ số cùng hàng thẳng cột. Cộng (trừ) hàng đơn vị trước, rồi đến hàng chục.', example: '34 + 25: 4 + 5 = 9, 3 + 2 = 5 → 59.', visual: { type: 'column', op: '+', a: 34, b: 25 } },
      { title: 'Cộng, trừ số tròn chục', desc: '30 + 40: 3 chục + 4 chục = 7 chục = 70.', formula: '30 + 40 = 70' }
    ],
    poem: ['Đơn vị thẳng với đơn vị,', 'Chục thẳng với chục, tính đi từ phải!'],
    pitfalls: [{ wrong: 'Đặt 5 thẳng cột với chữ số 3 của 34', right: 'Đặt 5 thẳng cột với chữ số 4 (hàng đơn vị)', why: 'Các chữ số cùng hàng phải thẳng cột.' }],
    examples: [{ q: 'Tính 76 − 32.', steps: ['Đơn vị: 6 − 2 = 4.', 'Chục: 7 − 3 = 4.', '76 − 32 = <b>44</b>.'], visual: { type: 'column', op: '−', a: 76, b: 32 } }],
    gens: [
      { level: 1, name: 'Cộng, trừ số tròn chục', fn() { const a = R(1, 8) * 10, plus = R(0, 1); const b = plus ? R(1, 9 - a / 10) * 10 : R(1, a / 10) * 10; return Q({ text: `<b>${a} ${plus ? '+' : '−'} ${b} = ?</b>`, answer: plus ? a + b : a - b, hint: `${a / 10} chục ${plus ? '+' : '−'} ${b / 10} chục.`, steps: [`${a / 10} chục ${plus ? '+' : '−'} ${b / 10} chục = ${(plus ? a + b : a - b) / 10} chục = <b>${plus ? a + b : a - b}</b>.`] }); } },
      { level: 1, name: 'Cộng không nhớ', fn() { let a, b; do { a = R(10, 88); b = R(1, 89); } while ((a % 10) + (b % 10) > 9 || a + b > 99); return Q({ text: `Tính: <b>${a} + ${b}</b>`, answer: a + b, hint: 'Cộng hàng đơn vị trước rồi đến hàng chục.', steps: [`Đơn vị: ${a % 10} + ${b % 10} = ${(a + b) % 10}.`, `Chục: ${Math.floor(a / 10)} + ${Math.floor(b / 10)} = ${Math.floor((a + b) / 10)}.`, `Kết quả: <b>${a + b}</b>.`], solVisual: { type: 'column', op: '+', a, b } }); } },
      { level: 2, name: 'Trừ không nhớ', fn() { let a, b; do { a = R(20, 99); b = R(1, a - 1); } while ((a % 10) < (b % 10)); return Q({ text: `Tính: <b>${a} − ${b}</b>`, answer: a - b, hint: 'Trừ hàng đơn vị trước rồi đến hàng chục.', steps: [`Đơn vị: ${a % 10} − ${b % 10} = ${(a - b) % 10}.`, `Chục: ${Math.floor(a / 10)} − ${Math.floor(b / 10)} = ${Math.floor((a - b) / 10)}.`, `Kết quả: <b>${a - b}</b>.`], solVisual: { type: 'column', op: '−', a, b } }); } },
      { level: 3, name: 'Tìm số chưa biết', fn() { let a, b; do { a = R(10, 60); b = R(10, 39); } while ((a % 10) + (b % 10) > 9 || a + b > 99); const s = a + b; return Q({ text: `<b>${a} + ? = ${s}</b>`, answer: b, hint: `Lấy ${s} trừ đi ${a}.`, steps: [`${s} − ${a} = ${b}.`, `Số cần điền là <b>${b}</b>.`] }); } }
    ]
  });

  // 7. ĐỘ DÀI ============================================================
  topics.push({
    id: 'g1_length', icon: '📏', title: 'Độ dài · Đo độ dài · Xăng-ti-mét',
    tagline: 'Dài hơn, ngắn hơn · Đo bằng thước · cm',
    summary: 'So sánh độ dài: dài hơn, ngắn hơn, cao hơn, thấp hơn. Đo độ dài bằng thước có vạch chia xăng-ti-mét (cm).',
    prereqs: ['g1_10'],
    rules: [{ title: 'Đo bằng thước', desc: 'Đặt vạch 0 của thước trùng với một đầu của vật. Đầu kia của vật chỉ vạch số mấy thì vật dài bấy nhiêu xăng-ti-mét.', visual: { type: 'ruler', max: 10, from: 0, to: 6, label: '6 cm' } }],
    poem: ['Vạch không đặt thẳng đầu kia,', 'Đầu này chỉ số, đọc là xăng-ti!'],
    pitfalls: [{ wrong: 'Đặt vật bắt đầu từ vạch 1', right: 'Đặt vật bắt đầu từ vạch 0', why: 'Nếu bắt đầu ở vạch 1 thì phải trừ đi 1.' }],
    examples: [{ q: 'Bút chì dài từ vạch 0 đến vạch 8. Bút chì dài bao nhiêu xăng-ti-mét?', steps: ['Bắt đầu ở vạch 0, kết thúc ở vạch 8.', 'Bút chì dài <b>8 cm</b>.'], visual: { type: 'ruler', max: 10, from: 0, to: 8, label: '✏️' } }],
    gens: [
      { level: 1, name: 'Đọc thước đo', fn() { const n = R(2, 12); return Q({ text: 'Băng giấy dài bao nhiêu xăng-ti-mét?', visual: { type: 'ruler', max: 13, from: 0, to: n, label: '' }, answer: n, unit: 'cm', hint: 'Xem đầu bên phải của băng giấy chỉ vạch số mấy.', steps: [`Băng giấy dài <b>${n} cm</b>.`] }); } },
      { level: 2, name: 'Đo không từ vạch 0', fn() { const a = R(1, 5), n = R(2, 7); return Q({ text: `Băng giấy bắt đầu ở vạch ${a}. Băng giấy dài bao nhiêu xăng-ti-mét?`, visual: { type: 'ruler', max: 13, from: a, to: a + n, label: '' }, answer: n, unit: 'cm', hint: `Lấy vạch cuối trừ vạch đầu: ${a + n} − ${a}.`, steps: [`${a + n} − ${a} = <b>${n}</b> (cm).`] }); } },
      { level: 2, name: 'Dài hơn – ngắn hơn', fn() { const A = shuffle([['bút chì', R(8, 15)], ['cục tẩy', R(2, 5)], ['thước kẻ', R(16, 20)], ['que kem', R(6, 9)]]).slice(0, 2); const longer = R(0, 1); const ans = (A[0][1] > A[1][1]) === !!longer ? A[0][0] : A[1][0]; return Q({ text: `${A[0][0][0].toUpperCase() + A[0][0].slice(1)} dài ${A[0][1]} cm, ${A[1][0]} dài ${A[1][1]} cm. Vật nào <b>${longer ? 'dài hơn' : 'ngắn hơn'}</b>?`, answer: ans, options: [A[0][0], A[1][0]], shuffle: false, hint: 'So sánh hai số đo.', steps: [`${A[0][1]} ${cmp(A[0][1], A[1][1])} ${A[1][1]}.`, `<b>${ans}</b> ${longer ? 'dài hơn' : 'ngắn hơn'}.`] }); } },
      { level: 3, name: 'Cộng, trừ số đo', fn() { const a = R(10, 40), b = R(1, 9), plus = R(0, 1); return Q({ text: plus ? `Sợi dây đỏ dài ${a} cm, sợi dây xanh dài hơn sợi dây đỏ ${b} cm. Sợi dây xanh dài bao nhiêu xăng-ti-mét?` : `Thanh gỗ dài ${a} cm, cưa bớt ${b} cm. Thanh gỗ còn lại dài bao nhiêu xăng-ti-mét?`, answer: plus ? a + b : a - b, unit: 'cm', hint: plus ? '“Dài hơn” → phép cộng.' : '“Cưa bớt” → phép trừ.', steps: [`${a} ${plus ? '+' : '−'} ${b} = <b>${plus ? a + b : a - b}</b> (cm).`] }); } }
    ]
  });

  // 8. THỜI GIAN =========================================================
  topics.push({
    id: 'g1_time', icon: '⏰', title: 'Xem giờ đúng · Các ngày trong tuần',
    tagline: 'Kim ngắn chỉ giờ · Một tuần có 7 ngày',
    summary: 'Khi kim dài chỉ số 12, kim ngắn chỉ số mấy thì là mấy giờ. Một tuần lễ có 7 ngày: Thứ Hai đến Chủ nhật.',
    prereqs: ['g1_10'],
    rules: [
      { title: 'Xem giờ đúng', desc: 'Kim dài chỉ số 12, kim ngắn chỉ số 3 → 3 giờ.', visual: { type: 'clock', h: 3, m: 0 } },
      { title: 'Các ngày trong tuần', desc: 'Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ nhật.', tip: 'Hôm nay là Thứ Hai thì ngày mai là Thứ Ba.' }
    ],
    poem: ['Kim dài đứng ở số mười hai,', 'Kim ngắn chỉ số, giờ hay đọc liền!'],
    pitfalls: [{ wrong: 'Đọc giờ theo kim dài', right: 'Đọc giờ theo kim ngắn (kim giờ)', why: 'Kim ngắn chỉ giờ, kim dài chỉ phút.' }],
    examples: [{ q: 'Hôm nay là Thứ Năm. Ngày mai là thứ mấy?', steps: ['Sau Thứ Năm là Thứ Sáu.', 'Ngày mai là <b>Thứ Sáu</b>.'] }],
    gens: [
      { level: 1, name: 'Xem giờ đúng', fn() { const h = R(1, 12); return Q({ text: 'Đồng hồ chỉ mấy giờ?', visual: { type: 'clock', h, m: 0 }, answer: h, unit: 'giờ', hint: 'Kim dài chỉ số 12, xem kim ngắn chỉ số mấy.', steps: [`Kim ngắn chỉ số ${h} → <b>${h} giờ</b>.`] }); } },
      { level: 2, name: 'Ngày hôm sau, hôm trước', fn() { const i = R(0, 6), next = R(0, 1); const ans = DAYS[(i + (next ? 1 : 6)) % 7]; return Q({ text: `Hôm nay là <b>${DAYS[i]}</b>. ${next ? 'Ngày mai' : 'Hôm qua'} là thứ mấy?`, answer: ans, options: shuffle(DAYS.filter(d => d !== ans)).slice(0, 3), hint: 'Đọc lần lượt: Thứ Hai, Thứ Ba, …, Chủ nhật.', steps: [`${next ? 'Sau' : 'Trước'} ${DAYS[i]} là <b>${ans}</b>.`] }); } },
      { level: 3, name: 'Sau mấy giờ', fn() { const h = R(1, 8), k = R(1, 3); return Q({ text: `Bây giờ là ${h} giờ. Sau ${k} giờ nữa là mấy giờ?`, visual: { type: 'clock', h, m: 0 }, answer: h + k, unit: 'giờ', hint: `Đếm thêm ${k} từ ${h}.`, steps: [`${h} + ${k} = <b>${h + k}</b> (giờ).`] }); } }
    ]
  });

  // 9. GIẢI TOÁN CÓ LỜI VĂN ==============================================
  topics.push({
    id: 'g1_word', icon: '📖', title: 'Bài toán có lời văn',
    tagline: 'Thêm vào – gộp lại → cộng · Bớt đi – cho đi → trừ',
    summary: 'Đọc kĩ đề, tìm từ khóa: “thêm”, “tất cả” → phép cộng; “bớt”, “cho”, “còn lại” → phép trừ.',
    prereqs: ['g1_addsub10'],
    rules: [{ title: 'Tìm phép tính', desc: '“Có tất cả”, “thêm”, “mua thêm” → cộng. “Còn lại”, “cho bạn”, “ăn mất” → trừ.', tip: 'Đọc đề 2 lần và gạch chân từ khóa.' }],
    poem: ['Thêm vào, tất cả: phép cộng,', 'Bớt đi, còn lại: trừ xong là cười!'],
    pitfalls: [{ wrong: 'Có 8 cái kẹo, cho bạn 3 cái → 8 + 3', right: '8 − 3 = 5 (cái kẹo)', why: '“Cho bạn” là bớt đi → phép trừ.' }],
    examples: [{ q: 'Lan có 6 bông hoa, Lan hái thêm 3 bông. Lan có tất cả mấy bông hoa?', steps: ['“Hái thêm” → phép cộng.', '6 + 3 = <b>9</b> (bông hoa).'] }],
    gens: [
      { level: 1, name: 'Thêm vào', fn() { const it = pick(ITEMS), nm = pick(NAMES), a = R(1, 7), b = R(1, 10 - a); return Q({ text: `${nm} có ${a} ${it.n}, mẹ cho ${nm} thêm ${b} ${it.n}. ${nm} có tất cả bao nhiêu ${it.n}?`, answer: a + b, unit: it.u, visual: { type: 'objects', groups: [{ icon: it.i, count: a }, { icon: it.i, count: b }], op: '+' }, hint: '“Thêm” → phép cộng.', steps: [`${a} + ${b} = <b>${a + b}</b> (${it.u}).`] }); } },
      { level: 1, name: 'Bớt đi', fn() { const it = pick(ITEMS), nm = pick(NAMES), a = R(3, 10), b = R(1, a - 1); return Q({ text: `${nm} có ${a} ${it.n}, ${nm} cho bạn ${b} ${it.n}. ${nm} còn lại bao nhiêu ${it.n}?`, answer: a - b, unit: it.u, hint: '“Cho bạn”, “còn lại” → phép trừ.', steps: [`${a} − ${b} = <b>${a - b}</b> (${it.u}).`] }); } },
      { level: 2, name: 'Chọn phép tính', fn() { const it = pick(ITEMS), a = R(3, 9), b = R(1, a - 1), plus = R(0, 1); const right = plus ? `${a} + ${b}` : `${a} − ${b}`; return Q({ text: plus ? `Trong vườn có ${a} ${it.n}, mọc thêm ${b} ${it.n}. Phép tính nào tìm số ${it.n} có tất cả?` : `Trên bàn có ${a} ${it.n}, lấy đi ${b} ${it.n}. Phép tính nào tìm số ${it.n} còn lại?`, answer: right, options: [`${a} + ${b}`, `${a} − ${b}`, `${b} − ${a}`], shuffle: false, hint: plus ? '“Thêm” → cộng.' : '“Lấy đi” → trừ.', steps: [`Phép tính: <b>${right}</b>.`] }); } },
      { level: 3, name: 'Toán hai bước', fn() { const it = pick(ITEMS), a = R(3, 6), b = R(1, 3), c = R(1, a + b - 1); return Q({ text: `Trên cành có ${a} ${it.n}. Có thêm ${b} ${it.n}, sau đó rơi mất ${c} ${it.n}. Hỏi trên cành còn bao nhiêu ${it.n}?`, answer: a + b - c, unit: it.u, hint: 'Tính số có sau khi thêm, rồi trừ số bị rơi.', steps: [`${a} + ${b} = ${a + b}.`, `${a + b} − ${c} = <b>${a + b - c}</b> (${it.u}).`] }); } }
    ]
  });

  MA.Data.addGrade({ grade: 1, name: 'Lớp 1', color: '#e35d9b', emoji: '🐤', desc: 'Số đến 100 · Cộng trừ phạm vi 10 và không nhớ phạm vi 100 · Hình phẳng · Vị trí · Độ dài · Giờ đúng', topics });
})(window.MA);
